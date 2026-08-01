import { requestClient } from '#/api/request';

export namespace SystemMenuMessageApi {
  export interface UnreadSummary {
    menuId: string;
    menuPath: string;
    unreadCount: number;
  }

  export interface CreateDemoMessageRequest {
    count: number;
    menuId: string;
    userIds: string[];
  }

  export interface ReadMessageRequest {
    menuId: string;
  }
}

export function getMenuMessageUnreadSummaryApi() {
  return requestClient.get<SystemMenuMessageApi.UnreadSummary[]>(
    '/system/messages/unreadSummary',
  );
}

export function createMenuMessageDemoApi(
  data: SystemMenuMessageApi.CreateDemoMessageRequest,
) {
  return requestClient.post('/system/messages/demo', data);
}

export function markMenuMessageReadApi(
  data: SystemMenuMessageApi.ReadMessageRequest,
) {
  return requestClient.post('/system/messages/read', data);
}

export function openMenuMessageStreamApi(
  signal: AbortSignal,
  onMessage: (message: string) => void,
) {
  return requestClient.requestSSE('/system/messages/stream', undefined, {
    onMessage,
    signal,
  });
}
