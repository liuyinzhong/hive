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
