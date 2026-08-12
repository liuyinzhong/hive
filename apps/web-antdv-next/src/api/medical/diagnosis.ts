import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MedicalDiagnosisApi {
  export interface Diagnosis {
    createDate?: string;
    diagnosisId: string;
    icdCode: string;
    icdName: string;
    namePinyin?: null | string;
    remark?: null | string;
    sort: number;
    status: 0 | 1;
    updateDate?: string;
  }

  export type SaveDiagnosis = Pick<
    Diagnosis,
    'icdCode' | 'icdName' | 'namePinyin' | 'remark' | 'sort' | 'status'
  >;
}

/** 分页查询疾病诊断档案。 */
export function getDiagnosisListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: MedicalDiagnosisApi.Diagnosis[];
    total: number;
  }>('/medical/diagnoses', { params });
}

/** 查询启用的疾病诊断选项。 */
export function getWorkbenchDiagnosisOptionsApi(
  params: Recordable<unknown> = {},
) {
  return requestClient.get<MedicalDiagnosisApi.Diagnosis[]>(
    '/medical/doctorWorkbench/diagnosisOptions',
    { params },
  );
}

/** 获取疾病诊断档案详情。 */
export function getDiagnosisDetailApi(diagnosisId: string) {
  return requestClient.get<MedicalDiagnosisApi.Diagnosis>(
    `/medical/diagnoses/${diagnosisId}`,
  );
}

/** 新增疾病诊断档案。 */
export function createDiagnosisApi(data: MedicalDiagnosisApi.SaveDiagnosis) {
  return requestClient.post('/medical/diagnoses', data);
}

/** 修改疾病诊断档案。 */
export function updateDiagnosisApi(
  diagnosisId: string,
  data: MedicalDiagnosisApi.SaveDiagnosis,
) {
  return requestClient.put(`/medical/diagnoses/${diagnosisId}`, data);
}

/** 启用或停用疾病诊断档案。 */
export function updateDiagnosisStatusApi(
  diagnosisId: string,
  status: 0 | 1,
) {
  return requestClient.put(`/medical/diagnoses/${diagnosisId}/status`, {
    status,
  });
}

/** 删除疾病诊断档案。 */
export function deleteDiagnosisApi(diagnosisId: string) {
  return requestClient.delete(`/medical/diagnoses/${diagnosisId}`);
}
