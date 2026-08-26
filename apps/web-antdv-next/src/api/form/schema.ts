import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type {
  FormSchemaLayout,
  PersistentFormSchema,
} from '#/utils/form-schema';

export namespace FormSchemaApi {
  export interface FormSchemaRecord {
    category?: null | string;
    createDate?: null | string;
    creatorId?: null | string;
    creatorName?: null | string;
    formSchemaId: string;
    layout: FormSchemaLayout;
    schema: PersistentFormSchema[];
    schemaKey: string;
    schemaName: string;
    remark?: null | string;
    status: string;
    updateDate?: null | string;
  }

  export interface FormSchemaPayload {
    category?: null | string;
    layout: FormSchemaLayout;
    remark?: null | string;
    schema: PersistentFormSchema[];
    schemaName: string;
    status?: string;
  }
}

export function getFormSchemaListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: FormSchemaApi.FormSchemaRecord[];
    total: number;
  }>('/form/schemas', { params, paramsSerializer: 'comma' });
}

export function getAllFormSchemasApi(params?: Recordable<unknown>) {
  return requestClient.get<FormSchemaApi.FormSchemaRecord[]>(
    '/form/schemas/all',
    { params },
  );
}

export function getFormSchemaDetailApi(formSchemaId: string) {
  return requestClient.get<FormSchemaApi.FormSchemaRecord>(
    `/form/schemas/${formSchemaId}`,
  );
}

export function createFormSchemaApi(data: FormSchemaApi.FormSchemaPayload) {
  return requestClient.post('/form/schemas', data);
}

export function updateFormSchemaApi(
  formSchemaId: string,
  data: FormSchemaApi.FormSchemaPayload,
) {
  return requestClient.put(`/form/schemas/${formSchemaId}`, data);
}

export function deleteFormSchemasApi(formSchemaIds: string[]) {
  return requestClient.delete('/form/schemas', { data: formSchemaIds });
}
