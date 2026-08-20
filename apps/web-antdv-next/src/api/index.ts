export * from './auth';
export * from './base';
export * from './dev';
export * from './erp';
export * from './examples';
export * from './product';
export * from './print';
export * from './statistics';
export * from './system';

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
