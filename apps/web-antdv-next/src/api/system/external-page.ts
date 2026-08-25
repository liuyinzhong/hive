import { requestClient } from '#/api/request';

export namespace ExternalPageApi {
  export interface ExternalPage {
    createDate?: string;
    creatorId?: null | string;
    creatorName?: null | string;
    id: string;
    name: string;
    path: string;
    status: 0 | 1;
    title: string;
    updateDate?: string;
  }

  export interface ExternalPageListParams {
    name?: string;
    page?: number;
    pageSize?: number;
    path?: string;
    status?: 0 | 1;
    title?: string;
  }

  export interface SaveExternalPage {
    name: string;
    path: string;
    status?: 0 | 1;
    title: string;
  }

  export interface ExternalPageListResult {
    items: ExternalPage[];
    total: number;
  }

  export interface PublicExternalPage {
    name: string;
    path: string;
  }
}

export function getExternalPageListApi(
  params: ExternalPageApi.ExternalPageListParams,
) {
  return requestClient.get<ExternalPageApi.ExternalPageListResult>(
    '/system/externalPages',
    { params },
  );
}

export function getExternalPageDetailApi(id: string) {
  return requestClient.get<ExternalPageApi.ExternalPage>(
    `/system/externalPages/${id}`,
  );
}

export function createExternalPageApi(data: ExternalPageApi.SaveExternalPage) {
  return requestClient.post('/system/externalPages', data);
}

export function updateExternalPageApi(
  id: string,
  data: Pick<ExternalPageApi.SaveExternalPage, 'path' | 'title'>,
) {
  return requestClient.put(`/system/externalPages/${id}`, data);
}

export function updateExternalPageStatusApi(id: string, status: 0 | 1) {
  return requestClient.put(`/system/externalPages/${id}/status`, { status });
}

export function deleteExternalPagesApi(ids: string[]) {
  return requestClient.delete('/system/externalPages', { data: { ids } });
}

/** 获取外部页面详情 */
export function getPublicExternalPageApi(name: string) {
  return requestClient.get<ExternalPageApi.PublicExternalPage>(
    `/public/externalPages/${encodeURIComponent(name)}`,
  );
}
