import { requestClient } from '#/api/request';

export namespace MedicalRegistrationFeeApi {
  export type PeriodStatus = 'current' | 'expired' | 'future';

  export interface RegistrationFeeRule {
    createDate?: string;
    departmentCode: string;
    departmentId: string;
    departmentName: string;
    doctorId: string;
    doctorName: string;
    doctorNo: string;
    effectiveDate: string;
    expiryDate?: null | string;
    feeAmount: string;
    feeRuleId: string;
    periodStatus: PeriodStatus;
    registrationType: string;
    remark?: null | string;
    updateDate?: string;
    version: number;
  }

  export interface CreateRegistrationFeeRule {
    departmentId: string;
    doctorId: string;
    effectiveDate: string;
    expiryDate?: null | string;
    feeAmount: string;
    registrationType: string;
    remark?: null | string;
  }

  export interface AdjustRegistrationFeeRule {
    effectiveDate: string;
    feeAmount: string;
    remark?: null | string;
  }

  export interface RegistrationFeeRuleListParams {
    departmentId?: string;
    doctorId?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
    periodStatus?: PeriodStatus;
    registrationType?: string;
    sorts?: string;
  }
}

export function getRegistrationFeeRuleListApi(
  params: MedicalRegistrationFeeApi.RegistrationFeeRuleListParams,
) {
  return requestClient.get<{
    items: MedicalRegistrationFeeApi.RegistrationFeeRule[];
    total: number;
  }>('/medical/registrationFeeRules', { params });
}

export function createRegistrationFeeRuleApi(
  data: MedicalRegistrationFeeApi.CreateRegistrationFeeRule,
) {
  return requestClient.post('/medical/registrationFeeRules', data);
}

export function adjustRegistrationFeeRuleApi(
  feeRuleId: string,
  data: MedicalRegistrationFeeApi.AdjustRegistrationFeeRule,
) {
  return requestClient.post(
    `/medical/registrationFeeRules/${feeRuleId}/adjustments`,
    data,
  );
}
