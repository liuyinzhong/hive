import type {
  MultiPageTemplateData,
  TemplateData,
} from '@worm-vue3-print/canvas';

/**
 * 打印模板版式协议：直接复用 worm-vue3-print 的 TemplateData，
 * 后端只做边界校验并原样存储（draft_layout/published_layout longtext）。
 * 1.3.0 起设计器支持多页面模板：单页输出裸 TemplateData，≥2 页输出 wrapper。
 */
export type { MultiPageTemplateData, TemplateData };

/** 版式载体：单页为裸 TemplateData，多页为 { version, pages } wrapper */
export type PrintTemplateLayout = MultiPageTemplateData | TemplateData;

export type PrintDocumentType = 'PURCHASE_INBOUND';

export type PrintTemplateStatus = 'DRAFT' | 'PUBLISHED';

export interface PrintTemplateListItem {
  createDate?: null | string;
  documentType: PrintDocumentType;
  hasDraft: boolean;
  hasPublished: boolean;
  rowVersion: number;
  status: PrintTemplateStatus;
  templateId: string;
  templateName: string;
  updateDate?: null | string;
}

export interface PrintTemplateDetail extends PrintTemplateListItem {
  draftLayout: PrintTemplateLayout;
  publishedLayout: PrintTemplateLayout | null;
}

export interface PrintFieldDefinition {
  dataType: string;
  example: string;
  label: string;
  path: string;
  scope: 'header' | 'item' | 'summary' | 'system';
}

export interface PrintFieldGroup {
  code: string;
  fields: PrintFieldDefinition[];
  name: string;
}

export interface PrintTemplateMetadata {
  documentTypes: Array<{ code: PrintDocumentType; name: string }>;
  fieldGroups: PrintFieldGroup[];
}

export interface PrintDocumentData {
  documentType: PrintDocumentType;
  header: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  schemaVersion: number;
  summary: Record<string, unknown>;
  system: Record<string, unknown>;
}

export interface PrintDocumentBundle {
  data: PrintDocumentData;
  template: PrintTemplateDetail;
}

export interface CreatePrintTemplateRequest {
  documentType: PrintDocumentType;
  draftLayout: PrintTemplateLayout;
  templateName: string;
}

export interface UpdatePrintTemplateRequest {
  draftLayout: PrintTemplateLayout;
  rowVersion: number;
  templateName: string;
}
