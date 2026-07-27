import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace BaseEnterpriseApi {
  export type EnterpriseStatus = 0 | 1;

  export type EnterpriseType =
    | 'ENTERPRISE'
    | 'INDIVIDUAL'
    | 'MEDICAL_ORG'
    | 'OTHER'
    | 'PUBLIC_INSTITUTION';

  export type EnterpriseRoleType =
    | 'CUSTOMER'
    | 'DEALER'
    | 'DISTRIBUTOR'
    | 'FILER'
    | 'IMPORT_AGENT'
    | 'MAH'
    | 'MANUFACTURER'
    | 'REGISTRANT'
    | 'SUPPLIER';

  export interface Enterprise {
    address?: null | string;
    contactName?: null | string;
    contactPhone?: null | string;
    createDate?: null | string;
    enterpriseCode: string;
    enterpriseId: string;
    enterpriseName: string;
    enterpriseType: EnterpriseType;
    remark?: null | string;
    roles: EnterpriseRoleType[];
    rowVersion: number;
    shortName?: null | string;
    status: EnterpriseStatus;
    unifiedCreditCode?: null | string;
    updateDate?: null | string;
  }

  export type SaveEnterprise = Partial<Enterprise> & {
    enterpriseName: string;
    enterpriseType: EnterpriseType;
    expectedRowVersion?: number;
    roles: EnterpriseRoleType[];
    status: EnterpriseStatus;
  };

  export interface UpdateEnterpriseStatus {
    expectedRowVersion: number;
    status: EnterpriseStatus;
  }

  export interface EnterpriseOption {
    enterpriseCode: string;
    enterpriseId: string;
    enterpriseName: string;
    enterpriseType: EnterpriseType;
    roles: EnterpriseRoleType[];
    shortName?: null | string;
  }
}

export function getEnterpriseListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: BaseEnterpriseApi.Enterprise[];
    total: number;
  }>('/base/enterprises', { params });
}

export function getEnterpriseDetailApi(enterpriseId: string) {
  return requestClient.get<BaseEnterpriseApi.Enterprise>(
    `/base/enterprises/${enterpriseId}`,
  );
}

export function createEnterpriseApi(data: BaseEnterpriseApi.SaveEnterprise) {
  const newData = objectOmit(data, [
    'createDate',
    'enterpriseCode',
    'enterpriseId',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.post<BaseEnterpriseApi.Enterprise>(
    '/base/enterprises',
    newData,
  );
}

export function updateEnterpriseApi(
  enterpriseId: string,
  data: BaseEnterpriseApi.SaveEnterprise,
) {
  const newData = objectOmit(data, [
    'createDate',
    'enterpriseCode',
    'enterpriseId',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.put<BaseEnterpriseApi.Enterprise>(
    `/base/enterprises/${enterpriseId}`,
    newData,
  );
}

export function updateEnterpriseStatusApi(
  enterpriseId: string,
  data: BaseEnterpriseApi.UpdateEnterpriseStatus,
) {
  return requestClient.put<BaseEnterpriseApi.Enterprise>(
    `/base/enterprises/${enterpriseId}/status`,
    data,
  );
}

export function getEnterpriseOptionsApi(params: Recordable<unknown> = {}) {
  return requestClient.get<BaseEnterpriseApi.EnterpriseOption[]>(
    '/base/enterprises/options',
    { params },
  );
}
