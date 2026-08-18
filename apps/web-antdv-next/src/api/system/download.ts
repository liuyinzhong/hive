import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemDownloadApi {
  export type TaskStatus = 'failed' | 'pending' | 'running' | 'succeeded';

  export interface DownloadTask {
    completedDate?: null | string;
    createDate: string;
    errorMessage?: null | string;
    expireDate?: null | string;
    fileName?: null | string;
    fileSize: number;
    id: string;
    processedRows: number;
    progress: number;
    sourceModule: string;
    status: TaskStatus;
    taskName: string;
    totalRows: number;
    updateDate: string;
  }

  export interface TaskChangedEvent {
    id: string;
    processedRows: number;
    progress: number;
    status: TaskStatus;
    totalRows: number;
  }
}

export function getDownloadTaskListApi(params: Recordable<unknown>) {
  return requestClient.get<{
    items: SystemDownloadApi.DownloadTask[];
    total: number;
  }>('/system/downloads', { params });
}

export function downloadTaskFileApi(id: string) {
  return requestClient.download<Blob>(`/system/downloads/${id}/file`);
}

/**
 * 获取下载任务的预览链接。
 * 后端校验任务属于当前登录用户、状态为成功且文件未过期后，签发 5 分钟有效的 JWT token，
 * 返回相对路径（如 `/api/public/downloads/preview/<token>`），由前端拼接完整 URL 后传给 kkFileView。
 */
export function getDownloadTaskPreviewUrlApi(id: string) {
  return requestClient.get<{ previewUrl: string }>(
    `/system/downloads/${id}/preview-url`,
  );
}
