import { requestClient } from '#/api/request';

export namespace SystemMenuMessageApi {
  /**
   * SSE 事件名枚举
   *
   * 事件名作为后端业务规则正文，登记在后端 business-docs/system/message-push.md；
   * 前端只引用常量，避免散落字符串字面量。
   */
  export const EventName = {
    /** 完整未读汇总覆盖事件：以服务端完整数组覆盖本地汇总并重新计算全部菜单角标 */
    UnreadSummary: 'unreadSummary',
    /** 下载任务变化事件：仅递增下载任务修订号，由下载中心监听后重新查询列表 */
    DownloadTaskChanged: 'downloadTaskChanged',
  } as const;

  export type EventName =
    (typeof EventName)[keyof typeof EventName];

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
