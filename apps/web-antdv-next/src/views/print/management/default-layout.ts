import type { PrintElementData, TableCell } from '@worm-vue3-print/canvas';

import type { TemplateData } from '#/api/print';

/**
 * 采购入库单默认版式（worm-vue3-print TemplateData）。
 * 内容区宽度 = A4 宽 210 - 左右边距 20 = 190mm；坐标单位 mm。
 */

const detailTableColumns = [
  { field: 'items.lineNo', title: '行号', width: 14 },
  { field: 'items.skuCode', title: 'SKU编码', width: 26 },
  { field: 'items.productName', title: '产品名称', width: 38 },
  { field: 'items.specName', title: '规格', width: 22 },
  { field: 'items.batchNo', title: '批号', width: 28 },
  { field: 'items.expiryDate', title: '有效期至', width: 24 },
  { field: 'items.quantity', title: '数量', width: 16 },
  { field: 'items.amount', title: '金额', width: 22 },
] as const;

function textElement(
  id: string,
  formatter: string,
  options: Partial<PrintElementData['options']> = {},
): PrintElementData {
  return {
    id,
    options: {
      fontSize: 10,
      height: 6,
      left: 0,
      textAlign: 'left',
      top: 0,
      verticalAlign: 'middle',
      width: 190,
      ...options,
      formatter,
    },
    printElementType: { title: '文本', type: 'text' },
  };
}

function tableCell(
  id: string,
  formatter: string,
  extra: Partial<TableCell> = {},
): TableCell {
  return {
    borders: {
      bottom: { color: '#333333', style: 'solid', width: 0.5 },
      left: { color: '#333333', style: 'solid', width: 0.5 },
      right: { color: '#333333', style: 'solid', width: 0.5 },
      top: { color: '#333333', style: 'solid', width: 0.5 },
    },
    formatter,
    id,
    ...extra,
  };
}

export function createDefaultPrintTemplate(): TemplateData {
  return {
    firstPageOverlay: { elements: [], height: 0 },
    footer: {
      elements: [
        textElement('pi-footer-print-time', '打印时间：{system.printTime}', {
          width: 80,
        }),
        textElement('pi-footer-page', '第 {pageIndex} 页 / 共 {totalPages} 页', {
          left: 120,
          textAlign: 'right',
          width: 70,
        }),
      ],
      height: 8,
    },
    header: {
      elements: [
        textElement('pi-title', '采购入库单', {
          fontSize: 16,
          fontWeight: 'bold',
          height: 9,
          letterSpacing: 2,
          textAlign: 'center',
        }),
        textElement('pi-header-inbound-no', '入库单号：{header.inboundNo}', {
          top: 10,
          width: 120,
        }),
      ],
      height: 18,
    },
    margins: { bottom: 10, left: 10, right: 10, top: 10 },
    orientation: 'portrait',
    paperSize: 'A4',
    unit: 'mm',
    watermark: {},
    elements: [
      textElement('pi-info-inbound-date', '入库日期：{header.inboundDate}', {
        left: 100,
        width: 90,
      }),
      textElement('pi-info-supplier', '供应商：{header.supplierName}', {
        top: 6,
        width: 95,
      }),
      textElement('pi-info-warehouse', '入库仓库：{header.warehouseName}', {
        left: 100,
        top: 6,
        width: 90,
      }),
      textElement('pi-info-remark', '备注：{header.remark}', { top: 12 }),
      {
        id: 'pi-detail-table',
        options: {
          dataSource: 'items',
          height: 32,
          left: 0,
          tableColWidths: detailTableColumns.map((column) => column.width),
          tableDefaultFontSize: 10,
          tableDefaultPadding: 1,
          tablePagination: { enabled: true },
          tableRows: [
            {
              cells: detailTableColumns.map((column, index) =>
                tableCell(`pi-th-${index}`, column.title, {
                  align: 'center',
                  fontWeight: 'bold',
                }),
              ),
              height: 8,
              id: 'pi-th-row',
              repeatOnPage: true,
              type: 'header',
            },
            {
              cells: detailTableColumns.map((column, index) =>
                tableCell(
                  `pi-td-${index}`,
                  index === 7
                    ? `{MONEY(${column.field})}`
                    : `{${column.field}}`,
                ),
              ),
              height: 8,
              id: 'pi-td-row',
              type: 'data',
            },
            {
              cells: [
                tableCell('pi-tf-0', '合计', { colspan: 6, align: 'right' }),
                // colspan=6 消耗前 6 列，需补 5 个被合并占位格使 cells 长度恒等于列数
                ...Array.from({ length: 5 }, (_, index) =>
                  tableCell(`pi-tf-merged-${index}`, '', {
                    colspan: 1,
                    merged: true,
                    rowspan: 1,
                  }),
                ),
                tableCell('pi-tf-6', '{COUNT(items.lineNo)}', {
                  align: 'right',
                }),
                tableCell('pi-tf-7', '{MONEY(SUM(items.amount))}', {
                  align: 'right',
                }),
              ],
              height: 8,
              id: 'pi-tf-row',
              type: 'summary',
            },
          ],
          tableMode: 'dynamic',
          top: 20,
          width: 190,
        },
        printElementType: { title: '表格', type: 'table' },
      },
      textElement(
        'pi-signature',
        '制单：____________    收货：____________    复核：____________',
        { top: 60 },
      ),
    ],
  };
}
