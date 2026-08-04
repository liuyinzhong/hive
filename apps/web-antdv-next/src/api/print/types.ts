export type PrintDocumentType = 'PURCHASE_INBOUND';

export type PrintTemplateStatus = 'DRAFT' | 'PUBLISHED';

export interface PrintPageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PrintPageSettings {
  size: 'A4';
  orientation: 'landscape' | 'portrait';
  margin: PrintPageMargins;
}

export interface PrintElementStyle {
  color: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  textAlign: 'center' | 'left' | 'right';
  border: string;
}

export type PrintElementKind =
  | 'field'
  | 'image'
  | 'line'
  | 'signature'
  | 'text';

export interface PrintLayoutElement {
  id: string;
  kind: PrintElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fieldPath: string;
  imageUrl: string;
  style: PrintElementStyle;
}

export interface PrintSection {
  height: number;
  elements: PrintLayoutElement[];
}

export interface PrintTableColumn {
  id: string;
  fieldPath: string;
  title: string;
  width: number;
  format: string;
}

export interface PrintDetailTable {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  columns: PrintTableColumn[];
}

export interface PrintBodySection {
  height: number;
  table: null | PrintDetailTable;
}

export interface PrintLayoutSections {
  pageHeader: PrintSection;
  documentHeader: PrintSection;
  body: PrintBodySection;
  documentFooter: PrintSection;
  pageFooter: PrintSection;
}

export interface PrintLayout {
  version: 1;
  page: PrintPageSettings;
  sections: PrintLayoutSections;
}

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
  draftLayout: PrintLayout;
  publishedLayout: PrintLayout | null;
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
}

export interface PrintDocumentBundle {
  data: PrintDocumentData;
  template: PrintTemplateDetail;
}

export interface CreatePrintTemplateRequest {
  documentType: PrintDocumentType;
  draftLayout: PrintLayout;
  templateName: string;
}

export interface UpdatePrintTemplateRequest {
  draftLayout: PrintLayout;
  rowVersion: number;
  templateName: string;
}
