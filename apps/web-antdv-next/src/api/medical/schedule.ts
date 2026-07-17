import { requestClient } from '#/api/request';

export namespace MedicalScheduleApi {
  export type ScheduleStatus = 0 | 1 | 2 | 3;
  export type TaskStatus = 0 | 1 | 2 | 3;
  export type TaskType = 'generate' | 'publish';

  export interface SlotQuota {
    quota: number;
    startTime: string;
  }

  export interface ScheduleSlot extends SlotQuota {
    bookedQuota: number;
    bookingStatus: string;
    canBook: boolean;
    endTime: string;
    remainingQuota: number;
    slotId: string;
  }

  export interface ScheduleTemplate {
    createDate?: string;
    defaultSlotQuota: number;
    departmentCode: string;
    departmentId: string;
    departmentName: string;
    doctorId: string;
    doctorName: string;
    doctorNo: string;
    effectiveDate: string;
    endTime: string;
    expiryDate?: null | string;
    registrationType: string;
    remark?: null | string;
    slotQuotaConfig: SlotQuota[];
    startTime: string;
    status: 0 | 1;
    templateId: string;
    templateName: string;
    totalQuota: number;
    updateDate?: string;
    weekday: number;
  }

  export interface SaveScheduleTemplate {
    defaultSlotQuota: number;
    departmentId: string;
    doctorId: string;
    effectiveDate: string;
    endTime: string;
    expiryDate?: null | string;
    registrationType: string;
    remark?: null | string;
    slotQuotaConfig: SlotQuota[];
    startTime: string;
    status: 0 | 1;
    templateName: string;
    weekday: number;
  }

  export type CreateScheduleTemplate = Omit<SaveScheduleTemplate, 'weekday'> & {
    weekdays: number[];
  };

  export interface Schedule {
    bookedQuota: number;
    createDate?: string;
    defaultSlotQuota: number;
    departmentCode: string;
    departmentId: string;
    departmentName: string;
    doctorId: string;
    doctorName: string;
    doctorNo: string;
    endTime: string;
    feeAmount?: null | string;
    feeRuleId?: null | string;
    feeRuleVersion?: null | number;
    feeSnapshotStatus: 'fixed' | 'pending';
    finishedAt?: null | string;
    generationBatchId?: null | string;
    publishedAt?: null | string;
    registrationType: string;
    remainingQuota: number;
    remark?: null | string;
    scheduleDate: string;
    scheduleId: string;
    slots: ScheduleSlot[];
    startTime: string;
    status: ScheduleStatus;
    stopReason?: null | string;
    stoppedAt?: null | string;
    templateId?: null | string;
    totalQuota: number;
    updateDate?: string;
  }

  export interface SaveSchedule {
    defaultSlotQuota: number;
    departmentId: string;
    doctorId: string;
    endTime: string;
    registrationType: string;
    remark?: null | string;
    scheduleDate: string;
    slotQuotaConfig: SlotQuota[];
    startTime: string;
  }

  export interface GenerateSchedules {
    endDate: string;
    idempotencyKey: string;
    startDate: string;
    templateIds: string[];
  }

  export interface GenerateResult {
    batchId: string;
    generatedCount: number;
    idempotent: boolean;
    scheduleIds: string[];
    skippedCount: number;
  }

  export interface AutoTaskFailure {
    doctorId: string;
    doctorName: string;
    reason: string;
  }

  export interface AutoTask {
    executedAt: string;
    failureDoctorCount: number;
    failures: AutoTaskFailure[];
    status: TaskStatus;
    successDoctorCount: number;
    targetWeekEnd: string;
    targetWeekStart: string;
    taskId: string;
    taskType: TaskType;
  }
}

export function getScheduleTemplateListApi(params: Record<string, unknown>) {
  return requestClient.get<{
    items: MedicalScheduleApi.ScheduleTemplate[];
    total: number;
  }>('/medical/scheduleTemplates', { params });
}

export function createScheduleTemplateApi(
  data: MedicalScheduleApi.CreateScheduleTemplate,
) {
  return requestClient.post('/medical/scheduleTemplates', data);
}

export function updateScheduleTemplateApi(
  templateId: string,
  data: MedicalScheduleApi.SaveScheduleTemplate,
) {
  return requestClient.put(`/medical/scheduleTemplates/${templateId}`, data);
}

export function updateScheduleTemplateStatusApi(
  templateId: string,
  status: 0 | 1,
) {
  return requestClient.put(`/medical/scheduleTemplates/${templateId}/status`, {
    status,
  });
}

export function deleteScheduleTemplateApi(templateId: string) {
  return requestClient.delete(`/medical/scheduleTemplates/${templateId}`);
}

export function getScheduleListApi(params: Record<string, unknown>) {
  return requestClient.get<{
    items: MedicalScheduleApi.Schedule[];
    total: number;
  }>('/medical/schedules', { params });
}

export function createScheduleApi(data: MedicalScheduleApi.SaveSchedule) {
  return requestClient.post('/medical/schedules', data);
}

export function updateScheduleApi(
  scheduleId: string,
  data: MedicalScheduleApi.SaveSchedule,
) {
  return requestClient.put(`/medical/schedules/${scheduleId}`, data);
}

export function deleteDraftSchedulesApi(scheduleIds: string[]) {
  return requestClient.delete('/medical/schedules', { data: scheduleIds });
}

export function generateSchedulesApi(
  data: MedicalScheduleApi.GenerateSchedules,
) {
  return requestClient.post<MedicalScheduleApi.GenerateResult>(
    '/medical/schedules/generate',
    data,
  );
}

export function publishSchedulesApi(scheduleIds: string[]) {
  return requestClient.post('/medical/schedules/publish', { scheduleIds });
}

export function stopScheduleApi(scheduleId: string, reason: string) {
  return requestClient.put(`/medical/schedules/${scheduleId}/stop`, { reason });
}

export function getScheduleAutoTaskListApi(params: Record<string, unknown>) {
  return requestClient.get<{
    items: MedicalScheduleApi.AutoTask[];
    total: number;
  }>('/medical/scheduleTasks', { params });
}
