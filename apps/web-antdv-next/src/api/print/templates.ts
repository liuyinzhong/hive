import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type {
  CreatePrintTemplateRequest,
  PrintTemplateDetail,
  PrintTemplateMetadata,
  PrintTemplateListItem,
  UpdatePrintTemplateRequest,
} from './types';

export function getPrintTemplateListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: PrintTemplateListItem[];
    total: number;
  }>('/printTemplates', { params });
}

export function getPrintTemplateMetadataApi() {
  return requestClient.get<PrintTemplateMetadata>('/printTemplates/metadata');
}

export function getPrintTemplateDetailApi(templateId: string) {
  return requestClient.get<PrintTemplateDetail>(
    `/printTemplates/${templateId}`,
  );
}

export function createPrintTemplateApi(data: CreatePrintTemplateRequest) {
  return requestClient.post<PrintTemplateDetail>('/printTemplates', data);
}

export function updatePrintTemplateApi(
  templateId: string,
  data: UpdatePrintTemplateRequest,
) {
  return requestClient.put<PrintTemplateDetail>(
    `/printTemplates/${templateId}`,
    data,
  );
}

export function publishPrintTemplateApi(
  templateId: string,
  rowVersion: number,
) {
  return requestClient.post<PrintTemplateDetail>(
    `/printTemplates/${templateId}/publish`,
    { rowVersion },
  );
}

export function deletePrintTemplateApi(templateId: string) {
  return requestClient.delete(`/printTemplates/${templateId}`);
}
