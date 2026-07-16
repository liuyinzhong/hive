import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MedicalDoctorApi {
  export interface DoctorDepartment {
    appointmentEnabled: 0 | 1;
    departmentCode: string;
    departmentId: string;
    departmentName: string;
    departmentPosition?: null | string;
    doctorDepartmentId: string;
    isPrimary: 0 | 1;
    status: 0 | 1;
  }

  export interface Doctor {
    administrativePosition?: null | string;
    appointmentEnabled: 0 | 1;
    avatar?: null | string;
    birthDate?: null | string;
    createDate?: string;
    defaultVisitMinutes: number;
    departureDate?: null | string;
    departmentIds: string[];
    departmentNames: string[];
    departments: DoctorDepartment[];
    doctorId: string;
    doctorNo: string;
    email?: null | string;
    employmentDate?: null | string;
    employmentType: string;
    expertise?: null | string;
    gender?: null | string;
    introduction?: null | string;
    name: string;
    namePinyin?: null | string;
    onlineConsultation: 0 | 1;
    phone?: null | string;
    practiceStartDate?: null | string;
    primaryDepartmentId?: null | string;
    primaryDepartmentName?: null | string;
    professionalTitle: string;
    profileVisible: 0 | 1;
    remark?: null | string;
    sort: number;
    status: 0 | 1;
    updateDate?: string;
    userId?: null | string;
    userName?: null | string;
  }

  export type SaveDoctor = Omit<
    Doctor,
    | 'createDate'
    | 'departmentNames'
    | 'departments'
    | 'doctorId'
    | 'primaryDepartmentName'
    | 'updateDate'
    | 'userName'
  > & {
    primaryDepartmentId: string;
  };

  export interface DoctorOption {
    doctorId: string;
    doctorNo: string;
    name: string;
    primaryDepartmentId?: null | string;
    primaryDepartmentName?: null | string;
    professionalTitle: string;
  }
}

export function getDoctorListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: MedicalDoctorApi.Doctor[];
    total: number;
  }>('/medical/doctors', { params });
}

export function getAllDoctorsApi() {
  return requestClient.get<MedicalDoctorApi.DoctorOption[]>(
    '/medical/doctors/all',
  );
}

export function getDoctorDetailApi(doctorId: string) {
  return requestClient.get<MedicalDoctorApi.Doctor>(
    `/medical/doctors/${doctorId}`,
  );
}

export function createDoctorApi(data: MedicalDoctorApi.SaveDoctor) {
  return requestClient.post('/medical/doctors', data);
}

export function updateDoctorApi(
  doctorId: string,
  data: MedicalDoctorApi.SaveDoctor,
) {
  return requestClient.put(`/medical/doctors/${doctorId}`, data);
}

export function updateDoctorStatusApi(doctorId: string, status: 0 | 1) {
  return requestClient.put(`/medical/doctors/${doctorId}/status`, { status });
}

export function deleteDoctorsApi(doctorIds: string[]) {
  return requestClient.delete('/medical/doctors', { data: doctorIds });
}
