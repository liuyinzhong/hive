import type {
  PrintDocumentData,
  PrintLayout,
  PrintLayoutElement,
  PrintTableColumn,
} from '#/api/print';

export function getPrintPageSize(layout: PrintLayout) {
  return layout.page.orientation === 'landscape'
    ? { height: 210, width: 297 }
    : { height: 297, width: 210 };
}

export function getPrintPathValue(
  path: string,
  data: PrintDocumentData,
  item: null | Record<string, unknown>,
  pageNumber: number,
  totalPages: number,
): unknown {
  const [scope, ...segments] = path.split('.');
  if (scope === 'system') {
    const systemValues: Record<string, unknown> = {
      pageNumber,
      printTime: formatPrintTime(new Date()),
      totalPages,
    };
    return segments.reduce<unknown>(
      (value, key) => getObjectValue(value, key),
      systemValues,
    );
  }

  const source =
    scope === 'items' ? item : scope === 'header' ? data.header : data.summary;
  return segments.reduce<unknown>(
    (value, key) => getObjectValue(value, key),
    source,
  );
}

export function formatPrintValue(value: unknown, format = 'text'): string {
  if (value === null || value === undefined) return '';
  if (format === 'currency') {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : String(value);
  }
  if (format === 'number') {
    const number = Number(value);
    return Number.isFinite(number) ? String(number) : String(value);
  }
  return String(value);
}

export function getElementText(
  element: PrintLayoutElement,
  data: PrintDocumentData,
  pageNumber: number,
  totalPages: number,
): string {
  if (element.kind !== 'field') return element.text;
  const value = getPrintPathValue(
    element.fieldPath,
    data,
    null,
    pageNumber,
    totalPages,
  );
  const label = element.text || '';
  return `${label}${formatPrintValue(value)}`;
}

export function getTableCellText(
  column: PrintTableColumn,
  item: Record<string, unknown>,
  data: PrintDocumentData,
  pageNumber: number,
  totalPages: number,
): string {
  return formatPrintValue(
    getPrintPathValue(column.fieldPath, data, item, pageNumber, totalPages),
    column.format,
  );
}

export function estimatePrintRowWeight(item: Record<string, unknown>): number {
  const textLength = Object.values(item).reduce<number>((total, value) => {
    if (value === null || value === undefined) return total;
    return total + String(value).length;
  }, 0);
  return Math.max(1, Math.ceil(textLength / 80));
}

export function splitPrintItems(items: Array<Record<string, unknown>>) {
  const pages: Array<Array<Record<string, unknown>>> = [];
  let current: Array<Record<string, unknown>> = [];
  let weight = 0;
  for (const item of items) {
    const itemWeight = estimatePrintRowWeight(item);
    if (current.length > 0 && weight + itemWeight > 20) {
      pages.push(current);
      current = [];
      weight = 0;
    }
    current.push(item);
    weight += itemWeight;
  }
  if (current.length > 0 || pages.length === 0) pages.push(current);
  return pages;
}

export function elementStyle(element: PrintLayoutElement) {
  return {
    border: element.style.border === 'none' ? undefined : element.style.border,
    color: element.style.color,
    fontSize: `${element.style.fontSize}mm`,
    fontWeight: element.style.fontWeight,
    height: `${element.height}mm`,
    left: `${element.x}mm`,
    lineHeight: element.style.lineHeight,
    textAlign: element.style.textAlign,
    top: `${element.y}mm`,
    width: `${element.width}mm`,
  };
}

function getObjectValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') return undefined;
  return (value as Record<string, unknown>)[key];
}

function formatPrintTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}
