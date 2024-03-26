import { Button, Dropdown, Form, Select, Table, Upload } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FilePdfOutlined,
  OrderedListOutlined,
  PlusOutlined,
  RedoOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { PageHeader } from '@ant-design/pro-layout';
import UploadImg from '../ProfileModule/components/UploadImg';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { generate as uniqueId } from 'shortid';
import { useErpContext } from '@/context/erp';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

function AddNewItem({ config }) {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity } = config;

  const handleClick = () => {
    navigate(`/${entity.toLowerCase()}/create`);
  };

  return (
    <Button onClick={handleClick} type="primary" icon={<PlusOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  );
}

export default function DataTable({ config, extra = [] }) {
  console.log('config', config);
  const translate = useLanguage();
  let { entity, dataTableColumns, disableAdd = false, searchConfig } = config;

  const { DATATABLE_TITLE } = config;
  const { title } = config;
  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;

  const [fileList, setFileList] = useState([]);

  // const items = [
  //   {
  //     label: translate('Show'),
  //     key: 'read',
  //     icon: <EyeOutlined />,
  //   },
  //   {
  //     label: translate('Edit'),
  //     key: 'edit',
  //     icon: <EditOutlined />,
  //   },
  //   {
  //     label: translate('Download'),
  //     key: 'download',
  //     icon: <FilePdfOutlined />,
  //   },
  //   ...extra,
  //   {
  //     type: 'divider',
  //   },

  //   {
  //     label: translate('Delete'),
  //     key: 'delete',
  //     icon: <DeleteOutlined />,
  //   },
  // ];

  const [items, setItems] = useState([]);

  const navigate = useNavigate();

  const handleRead = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${entity}/read/${record._id}`);
  };
  const handleEdit = (record) => {
    const data = { ...record };
    dispatch(erp.currentAction({ actionType: 'update', data }));
    navigate(`/${entity}/update/${record._id}`);
  };
  const handleDownload = (record) => {
    window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
  };

  const handleDelete = (record) => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  const handleRecordPayment = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/invoice/pay/${record._id}`);
  };
  const updateItems = (record) => {
    debugger;
    const items = [
      {
        label: translate('Show'),
        key: 'read',
        icon: <EyeOutlined />,
      },
      {
        label: translate('Edit'),
        key: 'edit',
        icon: <EditOutlined />,
      },
      {
        label: translate('Download'),
        key: 'download',
        icon: <FilePdfOutlined />,
      },
      ...extra,
      {
        type: 'divider',
      },
      {
        label: translate('Delete'),
        key: 'delete',
        icon: <DeleteOutlined />,
      },
    ];
    if (record.paymentStatus === 'paid') {
      var newItems = items.map((item, i) => {
        if (i === 3) {
          return { ...item, disabled: true };
        } else return item;
      });
      setItems(newItems);
    } else if (record.paymentStatus === 'unpaid') {
      var newItems = items.map((item, i) => {
        if (i === 3) {
          return { ...item, danger: true };
        } else return item;
      });
      setItems(newItems);
    } else {
      setItems(items);
    }
  };

  dataTableColumns = [
    ...dataTableColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                switch (key) {
                  case 'read':
                    handleRead(record);
                    break;
                  case 'edit':
                    handleEdit(record);
                    break;
                  case 'download':
                    handleDownload(record);
                    break;
                  case 'delete':
                    handleDelete(record);
                    break;
                  case 'recordPayment':
                    handleRecordPayment(record);
                    break;
                  default:
                    break;
                }
                // else if (key === '2')handleCloseTask
              },
            }}
            trigger={['click']}
          >
            <EllipsisOutlined
              style={{ cursor: 'pointer', fontSize: '24px' }}
              onClick={() => updateItems(record)}
            />
          </Dropdown>
        );
      },
    },
  ];

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination) => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };

    if (title == 'unpaid') dispatch(erp.unPaidlist({ entity, options }));
    else dispatch(erp.list({ entity, options }));
  };

  const dispatcher = () => {
    if (title == 'unpaid') dispatch(erp.unPaidlist({ entity }));
    else dispatch(erp.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, []);

  const filterTable = (value) => {
    const options = { equal: value, filter: searchConfig?.entity };
    if (title == 'unpaid') dispatch(erp.unPaidlist({ entity, options }));
    else dispatch(erp.list({ entity, options }));
  };

  // Conditional rendering based on DATATABLE_TITLE
  const renderPageHeaderExtra = () => {
    if (DATATABLE_TITLE === 'Upload Invoices') {
      return null; // Return null to not render any extra components
    } else {
      return (
        <>
          <AutoCompleteAsync
            key={`${uniqueId()}`}
            entity={searchConfig?.entity}
            displayLabels={['name']}
            searchFields={'name'}
            onChange={filterTable}
          />
          <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>
          {!disableAdd && <AddNewItem config={config} key={`${uniqueId()}`} />}
        </>
      );
    }
  };

  const renderUploadInvoicesView = () => {
    // beforeUpload={beforeUpload}

    const handleFileChange = (info) => {
      setFileList(info.fileList);
    };

    const handleShowInvoicesList = (e) => {
      e.stopPropagation(); // Stop the event propagation
      navigate('/invoice');
    };

    return (
      <div
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Form>
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Search to Select"
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').includes(input)}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={[
              {
                value: '1',
                label: 'Invoice',
              },
              {
                value: '2',
                label: 'Credit Memo',
              },
              {
                value: '3',
                label: 'Debit Memo',
              },
            ]}
          />
          <Form.Item
            name="file"
            label={translate('Upload File')}
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload onChange={handleFileChange}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
        {fileList.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Button type="primary" icon={<OrderedListOutlined />} onClick={handleShowInvoicesList}>
              View your uploaded Invoices
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title={DATATABLE_TITLE}
        ghost={true}
        extra={
          renderPageHeaderExtra()
          //   [
          //   <AutoCompleteAsync
          //     key={`${uniqueId()}`}
          //     entity={searchConfig?.entity}
          //     displayLabels={['name']}
          //     searchFields={'name'}
          //     onChange={filterTable}
          //     // redirectLabel={'Add New Client'}
          //     // withRedirect
          //     // urlToRedirect={'/customer'}
          //   />,
          //   <Button onClick={handelDataTableLoad} key={`${uniqueId()}`} icon={<RedoOutlined />}>
          //     {translate('Refresh')}
          //   </Button>,

          // !disableAdd && <AddNewItem config={config} key={`${uniqueId()}`} />,
          // ]
        }
        style={{
          padding: '20px 0px',
        }}
      />

      {DATATABLE_TITLE === 'Upload Invoices' ? (
        renderUploadInvoicesView()
      ) : (
        <Table
          columns={dataTableColumns}
          rowKey={(item) => item._id}
          dataSource={dataSource}
          pagination={pagination}
          loading={listIsLoading}
          onChange={handelDataTableLoad}
          scroll={{ x: true }}
        />
      )}
      {/* <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
      /> */}
    </>
  );
}
