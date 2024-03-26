import { Button, Input, Space, Tag } from 'antd';
import { useDate, useMoney } from '@/settings';
import { useRef, useState } from 'react';

import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { tagColor } from '@/utils/statusTagColor';
import useLanguage from '@/locale/useLanguage';

// import Highlighter from 'react-highlight-words';

export default function Invoice() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'invoice';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name,total',
  };

  // const searchConfig = {
  //   entity: 'total',
  //   displayLabels: ['total'],
  //   searchFields: 'total,name',
  // };
  const deleteModalLabels = ['number', 'client.name'];
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={`${selectedKeys[0] || ''}`}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const dataTableColumns = [
    {
      title: translate('INV. No.'),
      dataIndex: 'number',
      defaultSortOrder: 'descend',
      key: 'number',
      ...getColumnSearchProps('number'),
      sorter: (a, b) => a.number - b.number,
      render: (invNo) => {
        var invNo = invNo.toString();
        if (invNo.includes('INV-')) {
          return <span>{invNo}</span>;
        } else {
          // Get the current date and time
          var prefix = 'INV-';
          var now = new Date();
          // Extract date components
          var year = now.getFullYear().toString().slice(-2); // Get last 2 digits of the year
          var month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
          var day = now.getDate().toString().padStart(2, '0');

          // Generate a random number (optional)
          var randomNumber = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0'); // 3-digit random number

          // Combine components to form the invoice number
          var invoiceNumber = prefix + year + month + day + randomNumber;
          return <span>{invoiceNumber}</span>;
        }
      },
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
      key: 'name',
      sorter: (a, b) => a.number - b.number,
      filters: [
        {
          text: 'AstraZeneca',
          value: 'AstraZeneca',
        },
        {
          text: 'Gem Drugs',
          value: 'Gem Drugs',
        },
      ],
      onFilter: (value, record) => record.address.indexOf(value) === 0,
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      sorter: (a, b) => a.date - b.date,
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Due Date'),
      dataIndex: 'expiredDate',
      sorter: (a, b) => a.expiredDate - b.expiredDate,
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Discount'),
      dataIndex: 'discount',
      sorter: (a, b) => a.discount - b.discount,
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({ amount: total, currency_code: record.currency });
      },
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.total - b.total,
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({ amount: total, currency_code: record.currency });
      },
    },
    {
      title: translate('paid'),
      dataIndex: 'credit',
      sorter: (a, b) => a.total - b.total,
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      sorter: (a, b) => a.status - b.status,
      render: (status) => {
        let tagStatus = tagColor(status);

        return (
          <Tag color={tagStatus.color}>
            {/* {tagStatus.icon + ' '} */}
            {status && translate(tagStatus.label)}
          </Tag>
        );
      },
    },
    {
      title: translate('Document Type'),
      dataIndex: 'documentType',
      sorter: (a, b) => a.documentType - b.documentType,
      render: (documentType) => {
        let tagStatus = tagColor(documentType);

        return (
          <Tag color={tagStatus.color}>
            {/* {tagStatus.icon + ' '} */}
            {documentType && translate(tagStatus.label)}
          </Tag>
        );
      },
    },
    {
      title: translate('Payment'),
      dataIndex: 'paymentStatus',
      sorter: (a, b) => a.paymentStatus - b.paymentStatus,
      filters: [
        {
          text: 'Unpaid',
          value: 'Unpaid',
        },
        {
          text: 'Partially',
          value: 'Partially',
        },
      ],
      onFilter: (value, record) => record.address.indexOf(value) === 0,
      render: (paymentStatus) => {
        let tagStatus = tagColor(paymentStatus);

        return (
          <Tag color={tagStatus.color}>
            {/* {tagStatus.icon + ' '} */}
            {paymentStatus && translate(paymentStatus)}
          </Tag>
        );
      },
    },
    {
      title: translate('Created By'),
      dataIndex: ['createdBy', 'name'],
      sorter: (a, b) => a.paymentStatus - b.paymentStatus,
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('invoice'),
    DATATABLE_TITLE: translate('Upload Invoices'),
    ADD_NEW_ENTITY: translate('Upload Multiple Invoices'),
    ENTITY_NAME: translate('invoice'),
    RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <InvoiceDataTableModule config={config} />;
}
