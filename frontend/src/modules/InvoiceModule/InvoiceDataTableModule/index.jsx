import { CreditCardOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';

export default function InvoiceDataTableModule({ config }) {
  console.log('config', config);
  const translate = useLanguage();
  return (
    <ErpLayout>
      <ErpPanel
        config={config}
        extra={[
          {
            label: translate('Record Payment'),
            key: 'recordPayment',
            icon: <CreditCardOutlined />,
          },
          {
            label: translate('Record Credit Memo'),
            key: '',
            icon: <CreditCardOutlined />,
          },
        ]}
      ></ErpPanel>
    </ErpLayout>
  );
}
