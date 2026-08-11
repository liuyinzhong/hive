import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 医疗挂号管理接口类型。
 */
export namespace MedicalRegistrationApi {
  /** 挂号方式：0-现场挂号，10-预约挂号。 */
  export type RegistrationMethod = 0 | 10;

  /**
   * 挂号单状态：
   * 0-待支付，10-已支付，30-已签到，50-已完成，60-已取消，
   * 70-爽约，80-发起退款，90-退款中，100-退款完成。
   */
  export type RegistrationStatus = 0 | 10 | 30 | 50 | 60 | 70 | 80 | 90 | 100;

  /** 候诊状态：0-候诊中，30-已完成。 */
  export type VisitQueueStatus = 0 | 30;

  /** 挂号单日志。 */
  export interface LifecycleRecord {
    /** 变更前状态；创建挂号单时为空。 */
    fromStatus?: null | RegistrationStatus;
    /** 挂号单日志ID。 */
    lifecycleId: string;
    /** 操作时间，格式为 YYYY-MM-DD HH:mm:ss。 */
    operatedAt: string;
    /** 操作人用户ID。 */
    operatorId?: null | string;
    /** 操作人显示名称。 */
    operatorName?: null | string;
    /** 取消或发起退款等业务原因。 */
    reason?: null | string;
    /** 退款金额；发起退款时为挂号费用快照金额。 */
    refundAmount?: null | string;
    /** 变更后状态。 */
    toStatus: RegistrationStatus;
  }

  /** 挂号单签到后生成的候诊信息。 */
  export interface VisitQueue {
    /** 累计叫号次数；当前阶段固定从0开始。 */
    callCount: number;
    /** 候诊记录创建时间，即签到排号时间。 */
    createDate: string;
    /** 创建人系统用户ID。 */
    creatorId?: null | string;
    /** 候诊记录ID。 */
    queueId: string;
    /** 同一实际排班内的签到序号。 */
    queueSequence: number;
    /** 当前候诊状态。 */
    queueStatus: VisitQueueStatus;
  }

  /** 挂号单详情。 */
  export interface Registration {
    /** 创建时间，格式为 YYYY-MM-DD HH:mm:ss。 */
    createDate?: string;
    /** 创建人用户ID。 */
    creatorId?: null | string;
    /** 出诊科室ID。 */
    departmentId: string;
    /** 出诊科室名称快照。 */
    departmentName: string;
    /** 医生ID。 */
    doctorId: string;
    /** 医生姓名快照。 */
    doctorName: string;
    /** 号源结束时间。 */
    endTime: string;
    /** 挂号费用金额快照。 */
    feeAmount: string;
    /** 挂号费用规则ID快照。 */
    feeRuleId?: null | string;
    /** 挂号费用规则版本快照。 */
    feeRuleVersion?: null | number;
    /** 按操作时间升序排列的挂号单日志。 */
    lifecycleRecords: LifecycleRecord[];
    /** 患者出生日期快照，格式为 YYYY-MM-DD。 */
    patientBirthDate: string;
    /** 患者性别字典值快照。 */
    patientGender: string;
    /** 患者ID。 */
    patientId: string;
    /** 患者证件号码快照；是否脱敏由后端权限决定。 */
    patientIdNumber: string;
    /** 患者证件类型字典值快照。 */
    patientIdType: string;
    /** 患者姓名快照；是否脱敏由后端权限决定。 */
    patientName: string;
    /** 患者编号快照。 */
    patientNo: string;
    /** 患者手机号快照；是否脱敏由后端权限决定。 */
    patientPhone: string;
    /** 挂号单ID。 */
    registrationId: string;
    /** 未签到时为空，签到后返回候诊信息。 */
    queueInfo?: null | VisitQueue;
    /** 挂号方式。 */
    registrationMethod: RegistrationMethod;
    /** 挂号单编号。 */
    registrationNo: string;
    /** 挂号类型字典值快照。 */
    registrationType: string;
    /** 挂号类型名称快照。 */
    registrationTypeName: string;
    /** 创建挂号单时填写的备注。 */
    remark?: null | string;
    /** 就诊日期，格式为 YYYY-MM-DD。 */
    scheduleDate: string;
    /** 排班ID。 */
    scheduleId: string;
    /** 号源时段ID。 */
    slotId: string;
    /** 号源开始时间。 */
    startTime: string;
    /** 当前挂号状态。 */
    status: RegistrationStatus;
    /** 最后更新时间，格式为 YYYY-MM-DD HH:mm:ss。 */
    updateDate?: string;
  }

  /** 签到成功后的挂号单详情，候诊信息必定存在。 */
  export interface CheckInRegistrationResponse extends Registration {
    queueInfo: VisitQueue;
  }

  /** 创建挂号单请求。 */
  export interface CreateRegistration {
    /** 已启用的患者ID。 */
    patientId: string;
    /** 挂号方式。 */
    registrationMethod: RegistrationMethod;
    /** 可选备注，最多512个字符。 */
    remark?: null | string;
    /** 可预约的具体号源时段ID。 */
    slotId: string;
  }
}

/**
 * 分页查询挂号单。
 *
 * 支持挂号单号、患者关键字、就诊日期范围、科室、医生、挂号类型、
 * 挂号方式、状态和排序条件。
 *
 * @param params 分页参数及查询条件。
 * @returns 挂号单分页结果。
 */
export function getRegistrationListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: MedicalRegistrationApi.Registration[];
    total: number;
  }>('/medical/registrations', { params });
}

/**
 * 获取挂号单详情及完整挂号单日志。
 *
 * @param registrationId 挂号单ID。
 * @returns 挂号单详情。
 */
export function getRegistrationDetailApi(registrationId: string) {
  return requestClient.get<MedicalRegistrationApi.Registration>(
    `/medical/registrations/${registrationId}`,
  );
}

/**
 * 创建挂号单并占用对应号源。
 *
 * @param data 创建挂号单请求。
 * @returns 创建后的挂号单详情。
 */
export function createRegistrationApi(
  data: MedicalRegistrationApi.CreateRegistration,
) {
  return requestClient.post<MedicalRegistrationApi.Registration>(
    '/medical/registrations',
    data,
  );
}

/**
 * 调用无需请求体的挂号状态动作。
 *
 * @param registrationId 挂号单ID。
 * @param action 后端动作路径片段。
 * @returns 更新后的挂号单详情。
 */
function registrationAction<
  T extends MedicalRegistrationApi.Registration =
    MedicalRegistrationApi.Registration,
>(registrationId: string, action: string) {
  return requestClient.post<T>(
    `/medical/registrations/${registrationId}/${action}`,
  );
}

/**
 * 调用需要填写业务原因的挂号状态动作。
 *
 * @param registrationId 挂号单ID。
 * @param action 后端动作路径片段。
 * @param reason 业务原因。
 * @returns 更新后的挂号单详情。
 */
function registrationReasonAction(
  registrationId: string,
  action: string,
  reason: string,
) {
  return requestClient.post<MedicalRegistrationApi.Registration>(
    `/medical/registrations/${registrationId}/${action}`,
    { reason },
  );
}

/**
 * 确认挂号单已支付。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const confirmRegistrationPaymentApi = (id: string) =>
  registrationAction(id, 'confirmPayment');

/**
 * 取消待支付挂号单并释放号源。
 *
 * @param id 挂号单ID。
 * @param reason 取消原因。
 * @returns 更新后的挂号单详情。
 */
export const cancelRegistrationApi = (id: string, reason: string) =>
  registrationReasonAction(id, 'cancel', reason);

/**
 * 将已支付挂号单推进为已签到。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const checkInRegistrationApi = (id: string) =>
  registrationAction<MedicalRegistrationApi.CheckInRegistrationResponse>(
    id,
    'checkIn',
  );

/**
 * 将已签到挂号单推进为已完成。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const completeRegistrationApi = (id: string) =>
  registrationAction(id, 'complete');

/**
 * 将号源已结束且未签到的已支付挂号单标记为爽约。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const markRegistrationNoShowApi = (id: string) =>
  registrationAction(id, 'noShow');

/**
 * 为已支付挂号单发起全额退款。
 *
 * @param id 挂号单ID。
 * @param reason 退款原因。
 * @returns 更新后的挂号单详情。
 */
export const startRegistrationRefundApi = (id: string, reason: string) =>
  registrationReasonAction(id, 'refundStart', reason);

/**
 * 将已发起退款的挂号单推进为退款中。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const processRegistrationRefundApi = (id: string) =>
  registrationAction(id, 'refundProcess');

/**
 * 完成挂号单退款并释放号源。
 *
 * @param id 挂号单ID。
 * @returns 更新后的挂号单详情。
 */
export const completeRegistrationRefundApi = (id: string) =>
  registrationAction(id, 'refundComplete');
