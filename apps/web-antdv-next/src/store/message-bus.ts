import type { SystemDownloadApi, SystemMenuMessageApi } from '#/api/system';

import { useEventBus } from '@vueuse/core';

/**
 * 消息推送事件总线
 *
 * 与 Store 的分工：Store 只持有状态（未读汇总、最近消息），一次性动作一律
 * 通过总线广播，消费方自行订阅，Store 不认识任何消费方。此前跨组件的信号
 * 靠 `bellPulse` / `downloadTaskRevision` 两个自增计数表达，本质是用响应式
 * 状态模拟事件，消费方只能 watch 一个并不关心其数值的计数器。
 *
 * 实现基于 @vueuse/core 的 useEventBus：模块级 Map 按 key 共享，同一 key
 * 多次调用拿到同一条总线；on 在所属作用域销毁时自动解绑，emit 不依赖组件
 * 上下文，因此 Store 内可以直接派发。
 *
 * 注意：总线事件是瞬时的，迟到订阅者收不到订阅前已派发的事件。需要"至少
 * 感知一次"的消费方要自行查询接口兜底（下载中心就是这样做的）。
 *
 * 依赖方向：本模块对 api 层只有类型依赖（import type 编译后被完全擦除，不
 * 产生运行时引用）。消息 Store 依赖本模块，而 Store 又被 api 层依赖
 * （#/api/request 的拦截器要用 authStore），一旦本模块在运行时反向引用
 * api 层就会成环：求值顺序一变，模块常量尚未初始化就被访问，表现为
 * "Cannot access 'X' before initialization"。因此这里只做类型校验，不做值引用。
 */

/** 后端 SSE 事件名的联合类型 */
type BackendEventName =
  (typeof SystemMenuMessageApi.EventName)[keyof typeof SystemMenuMessageApi.EventName];

/**
 * 总线事件名
 *
 * 透传后端的两项用字面量书写，由 `satisfies` 在编译期证明它们仍属于后端 SSE
 * 事件名集合：后端改名或前端拼错都会让类型检查失败，不会出现两套各写各的
 * 字符串。`unreadSummary` 不进总线，它是权威状态覆盖，由 Store 内部消化为
 * 汇总与角标。
 */
export const MessageBusEventName = {
  /** 下载任务变化：透传后端 downloadTaskChanged，消费方自行重新查询列表 */
  DownloadTaskChanged: 'downloadTaskChanged',
  /** 强制退出：透传后端 forceLogout，事件体为空 */
  ForceLogout: 'forceLogout',
  /** 新未读到货：未读总数增加时派发，与提示音同一触发时机 */
  NewUnreadArrived: 'newUnreadArrived',
} as const satisfies {
  DownloadTaskChanged: BackendEventName;
  ForceLogout: BackendEventName;
  NewUnreadArrived: string;
};

/** 新未读到货的载荷 */
export interface NewUnreadArrivedPayload {
  /** 相对本地上一次汇总新增的未读条数 */
  delta: number;
  /** 本次推送后的未读总数 */
  total: number;
}

/** 事件名到载荷类型的映射；void 表示该事件不携带数据 */
export type MessageBusEvents = {
  /** 事件体解析失败时为 undefined，此时消费方仍应刷新列表 */
  [MessageBusEventName.DownloadTaskChanged]:
    | SystemDownloadApi.TaskChangedEvent
    | undefined;
  [MessageBusEventName.ForceLogout]: void;
  [MessageBusEventName.NewUnreadArrived]: NewUnreadArrivedPayload;
};

function createBus<K extends keyof MessageBusEvents>(name: K) {
  return useEventBus<MessageBusEvents[K]>(name);
}

export const messageBus = {
  downloadTaskChanged: createBus(MessageBusEventName.DownloadTaskChanged),
  forceLogout: createBus(MessageBusEventName.ForceLogout),
  newUnreadArrived: createBus(MessageBusEventName.NewUnreadArrived),
};
