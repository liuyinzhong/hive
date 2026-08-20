/** VxeTable 相关工具函数 */
/** VxeTable 相关工具函数 */
/** VxeTable 相关工具函数 */

/**
 * 导出列定义
 */
export interface ExportColumn {
  /** 列字段名 */
  field: string;
  /** 列标题 */
  title: string;
  /** 列宽度 */
  width: number;
}

export interface ExportRequest {
  /** 排序字段 */
  sorts?: string;
  /** 导出的列 */
  columns?: ExportColumn[];
  /** 导出的文件名 */
  filename?: string;
  /** 导出的sheet名 */
  sheetName?: string;
  /** 是否包含表头 */
  isHeader?: boolean;
  /** 是否包含标题 */
  isTitle?: boolean;
  /** 是否原始数据 */
  original?: boolean;
}

/**
 * @description 格式化排序参数
 * @param sorts 排序数组
 * @returns 格式化后的排序字符串 avatar,desc;username,desc
 */
export function formatVxeTableSorts(sorts: any[]) {
  return sorts.map((a: any) => `${a.field},${a.order}`).join(';');
}

/**
 * @description 格式化选中列参数
 * @param columns 列数组
 * @returns 格式化后的选中列参数数组
 */
export function formatVxeTableColumns(columns: any[]): ExportColumn[] {
  return columns
    .filter((a: any) => a.checked)
    .map((a: any) => ({
      field: a.field,
      title: a.title,
      width: a.width,
    }));
}

/**
 * @description 格式化导出参数
 * @param exportOptions 导出参数
 * @returns 格式化后的导出参数
 */
export function formatVxeTableExportOptions(exportOptions: any): ExportRequest {
  return {
    columns: formatVxeTableColumns(exportOptions.options.columns),
    sorts: formatVxeTableSorts(exportOptions.$grid.getSortColumns()),
    filename: exportOptions.options.filename,
    sheetName: exportOptions.options.sheetName,
    isHeader: exportOptions.options.isHeader,
    isTitle: exportOptions.options.isTitle,
    original: exportOptions.options.original,
  };
}
