import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MedicalDepartmentApi {
  export interface Department {
    children: Department[];
    createDate?: string;
    departmentCode: string;
    departmentId: string;
    departmentName: string;
    pid?: null | string;
    remark?: null | string;
    sort: number;
    status: 0 | 1;
    updateDate?: string;
  }

  export type SaveDepartment = Omit<
    Department,
    'children' | 'createDate' | 'departmentId' | 'updateDate'
  >;
}

export function getMedicalDepartmentTreeApi(params?: Recordable<unknown>) {
  return requestClient.get<MedicalDepartmentApi.Department[]>(
    '/medical/departments',
    { params },
  );
}

export function getAllMedicalDepartmentsApi() {
  return requestClient.get<MedicalDepartmentApi.Department[]>(
    '/medical/departments/all',
  );
}

export function createMedicalDepartmentApi(
  data: MedicalDepartmentApi.SaveDepartment,
) {
  return requestClient.post('/medical/departments', data);
}

export function updateMedicalDepartmentApi(
  departmentId: string,
  data: MedicalDepartmentApi.SaveDepartment,
) {
  return requestClient.put(`/medical/departments/${departmentId}`, data);
}

export function updateMedicalDepartmentStatusApi(
  departmentId: string,
  status: 0 | 1,
) {
  return requestClient.put(`/medical/departments/${departmentId}/status`, {
    status,
  });
}

export function deleteMedicalDepartmentsApi(departmentIds: string[]) {
  return requestClient.delete('/medical/departments', { data: departmentIds });
}
