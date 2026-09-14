import type { TemplateData } from '@worm-vue3-print/canvas';

/**
 * 打印模板版式协议：直接复用 worm-vue3-print 的 TemplateData，
 * 后端只做边界校验并原样存储（draft_layout/published_layout longtext）。
 */
export type { TemplateData };

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
  draftLayout: TemplateData;
  publishedLayout: TemplateData | null;
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
  draftLayout: TemplateData;
  templateName: string;
}

export interface UpdatePrintTemplateRequest {
  draftLayout: TemplateData;
  rowVersion: number;
  templateName: string;
}
