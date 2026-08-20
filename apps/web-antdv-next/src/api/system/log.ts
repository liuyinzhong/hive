import { requestClient } from '#/api/request';

import type { ExportRequest } from '#/utils';

export namespace SystemLogApi {
  export interface PageResult<T> {
    items: T[];
    total: number;
  }

  export interface BaseLogQuery {
    endDate?: string;
    page: number;
    pageSize: number;
    sorts?: string;
    startDate?: string;
    status?: 0 | 1;
    username?: string;
  }

  export interface OperationLogQuery extends BaseLogQuery {
    requestMethod?: string;
    requestUrl?: string;
  }

  export interface LoginLogQuery extends BaseLogQuery {
    eventType?: 'login' | 'logout';
    ip?: string;
  }

  export interface LoginLogExportRequest extends ExportRequest {
    endDate?: string;
    eventType?: 'login' | 'logout';
    ip?: string;
    sorts?: string;
    startDate?: string;
    status?: 0 | 1;
    username?: string;
  }

  export interface OperationLog {
    createDate: string;
    durationMs: number;
    httpStatus: number;
    ip: string;
    logId: string;
    realName: string;
    requestMethod: string;
    requestUrl: string;
    status: 0 | 1;
    username: string;
  }

  export interface OperationLogDetail extends OperationLog {
    contentType: string;
    queryParams: string;
    queryTruncated: boolean;
    requestBody: string;
    requestTruncated: boolean;
    responseBody: string;
    responseTruncated: boolean;
    userAgent: string;
    userId: string;
  }

  export interface LoginLog {
    createDate: string;
    durationMs: number;
    eventType: 'login' | 'logout';
    httpStatus: number;
    ip: string;
    logId: string;
    status: 0 | 1;
    userAgent: string;
    username: string;
  }

  export interface LoginLogDetail extends LoginLog {
    contentType: string;
    responseBody: string;
    responseTruncated: boolean;
    userId: string;
  }
}

export function getOperationLogsApi(params: SystemLogApi.OperationLogQuery) {
  return requestClient.get<SystemLogApi.PageResult<SystemLogApi.OperationLog>>(
    '/system/operationLogs',
    { params },
  );
}

export function getOperationLogDetailApi(logId: string) {
  return requestClient.get<SystemLogApi.OperationLogDetail>(
    `/system/operationLogs/${logId}`,
  );
}

export function getLoginLogsApi(params: SystemLogApi.LoginLogQuery) {
  return requestClient.get<SystemLogApi.PageResult<SystemLogApi.LoginLog>>(
    '/system/loginLogs',
    { params },
  );
}

export function createLoginLogExportApi(
  data: SystemLogApi.LoginLogExportRequest,
) {
  return requestClient.post<{ id: string }>('/system/loginLogs/exports', data);
}

export function getLoginLogDetailApi(logId: string) {
  return requestClient.get<SystemLogApi.LoginLogDetail>(
    `/system/loginLogs/${logId}`,
  );
}
