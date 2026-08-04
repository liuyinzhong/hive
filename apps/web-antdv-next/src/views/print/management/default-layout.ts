import type {
  PrintLayout,
  PrintLayoutElement,
  PrintElementStyle,
} from '#/api/print';

const normalStyle = (): PrintElementStyle => ({
  color: '#1f2937',
  fontSize: 3.5,
  fontWeight: 'normal',
  lineHeight: 1.35,
  textAlign: 'left',
  border: 'none',
});

function element(
  value: Partial<PrintLayoutElement> & Pick<PrintLayoutElement, 'id' | 'kind'>,
): PrintLayoutElement {
  return {
    fieldPath: '',
    height: 7,
    imageUrl: '',
    style: normalStyle(),
    text: '',
    width: 40,
    x: 0,
    y: 0,
    ...value,
  };
}

export function createDefaultPrintLayout(): PrintLayout {
  return {
    version: 1,
    page: {
      margin: { bottom: 10, left: 10, right: 10, top: 10 },
      orientation: 'portrait',
      size: 'A4',
    },
    sections: {
      pageHeader: {
        height: 22,
        elements: [
          element({
            id: 'page-header-title',
            kind: 'text',
            style: {
              ...normalStyle(),
              fontSize: 6,
              fontWeight: 'bold',
              textAlign: 'center',
            },
            text: '采购入库单',
            width: 190,
            x: 0,
            y: 1,
          }),
          element({
            id: 'page-header-inbound-no',
            kind: 'field',
            fieldPath: 'header.inboundNo',
            text: '入库单号：',
            width: 190,
            x: 0,
            y: 10,
          }),
        ],
      },
      documentHeader: {
        height: 28,
        elements: [
          element({
            id: 'document-header-inbound-date',
            kind: 'field',
            fieldPath: 'header.inboundDate',
            text: '入库日期：',
            width: 90,
            x: 100,
            y: 3,
          }),
          element({
            id: 'document-header-supplier',
            kind: 'field',
            fieldPath: 'header.supplierName',
            text: '供应商：',
            width: 90,
            x: 0,
            y: 12,
          }),
          element({
            id: 'document-header-warehouse',
            kind: 'field',
            fieldPath: 'header.warehouseName',
            text: '入库仓库：',
            width: 90,
            x: 100,
            y: 12,
          }),
          element({
            id: 'document-header-remark',
            kind: 'field',
            fieldPath: 'header.remark',
            text: '备注：',
            width: 190,
            x: 0,
            y: 21,
          }),
        ],
      },
      body: {
        height: 189,
        table: {
          columns: [
            tableColumn('line-no', 'items.lineNo', '行号', 12),
            tableColumn('sku-code', 'items.skuCode', 'SKU编码', 25),
            tableColumn('product-name', 'items.productName', '产品名称', 35),
            tableColumn('spec-name', 'items.specName', '规格', 25),
            tableColumn('batch-no', 'items.batchNo', '批号', 28),
            tableColumn('expiry-date', 'items.expiryDate', '有效期至', 25),
            tableColumn('quantity', 'items.quantity', '数量', 15, 'number'),
            tableColumn('amount', 'items.amount', '金额', 25, 'currency'),
          ],
          height: 189,
          id: 'detail-table',
          width: 190,
          x: 0,
          y: 0,
        },
      },
      documentFooter: {
        height: 28,
        elements: [
          element({
            id: 'document-footer-line-count',
            kind: 'field',
            fieldPath: 'summary.lineCount',
            text: '合计行数：',
            width: 60,
            x: 0,
            y: 4,
          }),
          element({
            id: 'document-footer-total-amount',
            kind: 'field',
            fieldPath: 'summary.totalAmount',
            text: '合计金额：',
            width: 70,
            x: 70,
            y: 4,
          }),
          element({
            id: 'document-footer-signature',
            kind: 'signature',
            text: '制单：________________    收货：________________    复核：________________',
            width: 190,
            x: 0,
            y: 16,
          }),
        ],
      },
      pageFooter: {
        height: 10,
        elements: [
          element({
            id: 'page-footer-number',
            kind: 'field',
            fieldPath: 'system.pageNumber',
            style: { ...normalStyle(), textAlign: 'right' },
            text: '第',
            width: 50,
            x: 140,
            y: 1,
          }),
        ],
      },
    },
  };
}

function tableColumn(
  id: string,
  fieldPath: string,
  title: string,
  width: number,
  format = 'text',
) {
  return { fieldPath, format, id, title, width };
}
