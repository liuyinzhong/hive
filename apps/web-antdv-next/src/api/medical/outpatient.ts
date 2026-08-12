import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MedicalOutpatientApi {
  export type QueueStatus = 0 | 10 | 15 | 20 | 30;
  export type PrescriptionStatus = 0 | 10 | 20 | 30 | 40;
  export type Frequency =
    | 'BID'
    | 'PRN'
    | 'Q12H'
    | 'Q8H'
    | 'QAM'
    | 'QD'
    | 'QID'
    | 'QN'
    | 'QOD'
    | 'QW'
    | 'SOS'
    | 'STAT'
    | 'TID';

  export interface WorkbenchQueue {
    callCount: number;
    checkInTime: string;
    endTime: string;
    patientName: string;
    patientNo: string;
    patientPhone: string;
    queueId: string;
    queueSequence: number;
    queueStatus: QueueStatus;
    recordId?: null | string;
    registrationId: string;
    registrationNo: string;
    startTime: string;
  }

  export interface WorkbenchSchedule {
    departmentId: string;
    departmentName: string;
    endTime: string;
    queues: WorkbenchQueue[];
    registrationType: string;
    scheduleDate: string;
    scheduleId: string;
    startTime: string;
  }

  export interface Workbench {
    doctorId: string;
    doctorName: string;
    doctorNo: string;
    schedules: WorkbenchSchedule[];
  }

  export interface OutpatientDiagnosis {
    diagnosisId: string;
    icdCode: string;
    icdName: string;
    isPrimary: 0 | 1;
    recordDiagnosisId: string;
    sort: number;
  }

  export interface SaveOutpatientDiagnosis {
    diagnosisId: string;
    isPrimary: 0 | 1;
    sort: number;
  }

  export interface PrescriptionItem {
    allowSplit: 0 | 1;
    approvalNo: string;
    courseDays: number;
    dispenseQuantity: string;
    dispenseUnit: string;
    dosageForm?: null | string;
    doseUnit: string;
    enterpriseName: string;
    frequency: Frequency;
    itemId: string;
    medicationRoute: string;
    minUnitName: string;
    packConversion: number;
    packageSpecName: string;
    packageUnitName: string;
    prescriptionId: string;
    productName: string;
    remark?: null | string;
    singleDose: string;
    skuCode: string;
    skuId: string;
    sort: number;
    specName: string;
    totalMinQuantity: string;
    usageInstructions?: null | string;
  }

  export interface SavePrescriptionItem {
    courseDays: number;
    frequency: Frequency;
    medicationRoute: string;
    remark?: null | string;
    singleDose: string;
    skuId: string;
    sort: number;
    totalMinQuantity?: null | string;
    usageInstructions?: null | string;
  }

  export interface PrescriptionSubmission {
    allergyHistory?: null | string;
    prescriptionId: string;
    reviewOpinion?: null | string;
    reviewedAt?: null | string;
    reviewerId?: null | string;
    submissionId: string;
    submissionStatus: 0 | 10 | 20 | 30;
    submittedAt: string;
    submittedBy: string;
    version: number;
  }

  export interface Prescription {
    createDate?: string;
    currentVersion: number;
    departmentName: string;
    doctorId: string;
    doctorName: string;
    items: PrescriptionItem[];
    latestSubmission?: null | PrescriptionSubmission;
    patientId: string;
    patientName: string;
    patientNo: string;
    prescriptionId: string;
    prescriptionNo: string;
    prescriptionType: 10;
    recordId: string;
    registrationId: string;
    registrationNo: string;
    remark?: null | string;
    status: PrescriptionStatus;
    submissionDiagnoses: Array<{
      diagnosisId: string;
      icdCode: string;
      icdName: string;
      isPrimary: 0 | 1;
      sort: number;
      submissionDiagnosisId: string;
      submissionId: string;
    }>;
    submissionItems: Array<
      Omit<PrescriptionItem, 'itemId' | 'prescriptionId'> & {
        submissionId: string;
        submissionItemId: string;
      }
    >;
    updateDate?: string;
  }

  export interface SavePrescription {
    items: SavePrescriptionItem[];
    prescriptionType: 10;
    remark?: null | string;
  }

  export interface OutpatientRecord {
    allergyHistory?: null | string;
    auxiliaryExamination?: null | string;
    chiefComplaint?: null | string;
    departmentId: string;
    departmentName: string;
    diagnoses: OutpatientDiagnosis[];
    diastolicPressure?: null | number;
    doctorId: string;
    doctorName: string;
    endDate?: null | string;
    familyHistory?: null | string;
    followUpAdvice?: null | string;
    height?: null | string;
    informant?: null | string;
    maritalReproductive?: null | string;
    medicalAdvice?: null | string;
    menstrualHistory?: null | string;
    pastHistory?: null | string;
    patientBirthDate: string;
    patientGender: string;
    patientId: string;
    patientName: string;
    patientNo: string;
    patientPhone: string;
    personalHistory?: null | string;
    physicalExamination?: null | string;
    prescriptions: Prescription[];
    presentIllness?: null | string;
    pulse?: null | number;
    queueId: string;
    queueSequence: number;
    queueStatus: QueueStatus;
    recordId: string;
    registrationId: string;
    registrationNo: string;
    remark?: null | string;
    respiratoryRate?: null | number;
    specialistExamination?: null | string;
    startDate: string;
    systolicPressure?: null | number;
    temperature?: null | string;
    treatmentPlan?: null | string;
    visitType?: 0 | 10 | null;
    weight?: null | string;
  }

  export type SaveOutpatientRecord = Omit<
    OutpatientRecord,
    | 'departmentId'
    | 'departmentName'
    | 'diagnoses'
    | 'doctorId'
    | 'doctorName'
    | 'endDate'
    | 'patientBirthDate'
    | 'patientGender'
    | 'patientId'
    | 'patientName'
    | 'patientNo'
    | 'patientPhone'
    | 'prescriptions'
    | 'queueId'
    | 'queueSequence'
    | 'queueStatus'
    | 'recordId'
    | 'registrationId'
    | 'registrationNo'
    | 'startDate'
  > & { diagnoses: SaveOutpatientDiagnosis[] };
}

function normalizePrescription(
  value: MedicalOutpatientApi.Prescription,
): MedicalOutpatientApi.Prescription {
  return {
    ...value,
    items: Array.isArray(value.items) ? value.items : [],
    submissionDiagnoses: Array.isArray(value.submissionDiagnoses)
      ? value.submissionDiagnoses
      : [],
    submissionItems: Array.isArray(value.submissionItems)
      ? value.submissionItems
      : [],
  };
}

function normalizeOutpatientRecord(
  value: MedicalOutpatientApi.OutpatientRecord,
): MedicalOutpatientApi.OutpatientRecord {
  return {
    ...value,
    diagnoses: Array.isArray(value.diagnoses) ? value.diagnoses : [],
    prescriptions: Array.isArray(value.prescriptions)
      ? value.prescriptions.map(normalizePrescription)
      : [],
  };
}

/** 获取当前医生的今日工作台。 */
export async function getDoctorWorkbenchApi() {
  const data = await requestClient.get<MedicalOutpatientApi.Workbench>(
    '/medical/doctorWorkbench',
  );
  return {
    ...data,
    schedules: Array.isArray(data.schedules)
      ? data.schedules.map((item) => ({
          ...item,
          queues: Array.isArray(item.queues) ? item.queues : [],
        }))
      : [],
  };
}

/** 按签到序号叫下一位。 */
export function callNextPatientApi(scheduleId: string) {
  return requestClient.post(
    `/medical/doctorWorkbench/schedules/${scheduleId}/callNext`,
  );
}

function queueAction(queueId: string, action: string) {
  return requestClient.post(
    `/medical/doctorWorkbench/queues/${queueId}/${action}`,
  );
}

export const repeatCallPatientApi = (queueId: string) =>
  queueAction(queueId, 'repeatCall');
export const passPatientApi = (queueId: string) =>
  queueAction(queueId, 'pass');
export const recallPatientApi = (queueId: string) =>
  queueAction(queueId, 'recall');

/** 开始接诊并返回新建或已存在的门诊病历。 */
export async function startConsultationApi(queueId: string) {
  const data = await requestClient.post<MedicalOutpatientApi.OutpatientRecord>(
    `/medical/doctorWorkbench/queues/${queueId}/start`,
  );
  return normalizeOutpatientRecord(data);
}

export async function getOutpatientRecordApi(recordId: string) {
  const data = await requestClient.get<MedicalOutpatientApi.OutpatientRecord>(
    `/medical/outpatientRecords/${recordId}`,
  );
  return normalizeOutpatientRecord(data);
}

export async function saveOutpatientRecordApi(
  recordId: string,
  data: MedicalOutpatientApi.SaveOutpatientRecord,
) {
  const record = await requestClient.put<MedicalOutpatientApi.OutpatientRecord>(
    `/medical/outpatientRecords/${recordId}`,
    data,
  );
  return normalizeOutpatientRecord(record);
}

export async function completeOutpatientRecordApi(recordId: string) {
  const data = await requestClient.post<MedicalOutpatientApi.OutpatientRecord>(
    `/medical/outpatientRecords/${recordId}/complete`,
  );
  return normalizeOutpatientRecord(data);
}

export async function getOutpatientHistoryApi(recordId: string) {
  const data = await requestClient.get<MedicalOutpatientApi.OutpatientRecord[]>(
    `/medical/outpatientRecords/${recordId}/history`,
  );
  return Array.isArray(data) ? data.map(normalizeOutpatientRecord) : [];
}

export async function createPrescriptionApi(
  recordId: string,
  data: MedicalOutpatientApi.SavePrescription,
) {
  const prescription = await requestClient.post<MedicalOutpatientApi.Prescription>(
    `/medical/outpatientRecords/${recordId}/prescriptions`,
    data,
  );
  return normalizePrescription(prescription);
}

export async function getPrescriptionApi(prescriptionId: string) {
  const data = await requestClient.get<MedicalOutpatientApi.Prescription>(
    `/medical/prescriptions/${prescriptionId}`,
  );
  return normalizePrescription(data);
}

export async function updatePrescriptionApi(
  prescriptionId: string,
  data: MedicalOutpatientApi.SavePrescription,
) {
  const prescription = await requestClient.put<MedicalOutpatientApi.Prescription>(
    `/medical/prescriptions/${prescriptionId}`,
    data,
  );
  return normalizePrescription(prescription);
}

async function prescriptionAction(prescriptionId: string, action: string) {
  const data = await requestClient.post<MedicalOutpatientApi.Prescription>(
    `/medical/prescriptions/${prescriptionId}/${action}`,
  );
  return normalizePrescription(data);
}

export const submitPrescriptionApi = (prescriptionId: string) =>
  prescriptionAction(prescriptionId, 'submit');
export const withdrawPrescriptionApi = (prescriptionId: string) =>
  prescriptionAction(prescriptionId, 'withdraw');
export const voidPrescriptionApi = (prescriptionId: string) =>
  prescriptionAction(prescriptionId, 'void');

export async function getPrescriptionReviewListApi(params: Recordable<unknown>) {
  const data = await requestClient.get<{
    items: MedicalOutpatientApi.Prescription[];
    total: number;
  }>('/medical/prescriptionReviews', { params });
  return {
    ...data,
    items: Array.isArray(data.items)
      ? data.items.map(normalizePrescription)
      : [],
  };
}

export async function getPrescriptionReviewDetailApi(prescriptionId: string) {
  const data = await requestClient.get<MedicalOutpatientApi.Prescription>(
    `/medical/prescriptionReviews/${prescriptionId}`,
  );
  return normalizePrescription(data);
}

export async function reviewPrescriptionApi(
  prescriptionId: string,
  data: { approved: 0 | 1; opinion?: null | string },
) {
  const prescription = await requestClient.post<MedicalOutpatientApi.Prescription>(
    `/medical/prescriptionReviews/${prescriptionId}/review`,
    data,
  );
  return normalizePrescription(prescription);
}
