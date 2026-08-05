import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MedicalPatientApi {
  export interface Patient {
    address?: null | string;
    birthDate: string;
    createDate?: string;
    emergencyContactName?: null | string;
    emergencyContactPhone?: null | string;
    emergencyContactRelation?: null | string;
    gender: string;
    idNumber: string;
    idType: string;
    name: string;
    patientId: string;
    patientNo: string;
    phone: string;
    remark?: null | string;
    status: 0 | 1;
    updateDate?: string;
  }

  export type SavePatient = Omit<
    Patient,
    'createDate' | 'patientId' | 'patientNo' | 'status' | 'updateDate'
  >;
}

export function getPatientListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: MedicalPatientApi.Patient[];
    total: number;
  }>('/medical/patients', { params });
}

export function getPatientDetailApi(patientId: string) {
  return requestClient.get<MedicalPatientApi.Patient>(
    `/medical/patients/${patientId}`,
  );
}

export function createPatientApi(data: MedicalPatientApi.SavePatient) {
  return requestClient.post('/medical/patients', data);
}

export function updatePatientApi(
  patientId: string,
  data: MedicalPatientApi.SavePatient,
) {
  return requestClient.put(`/medical/patients/${patientId}`, data);
}

export function updatePatientStatusApi(patientId: string, status: 0 | 1) {
  return requestClient.put(`/medical/patients/${patientId}/status`, { status });
}
