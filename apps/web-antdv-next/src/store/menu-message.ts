import {
  SystemMenuMessageApi,
  getMenuMessageUnreadSummaryApi,
  markMenuMessageReadApi,
  openMenuMessageStreamApi,
} from '#/api/system';

import { computed, ref, watch } from 'vue';

import { useAccessStore } from '@vben/stores';
import { usePreferences } from '@vben/preferences';

import { defineStore } from 'pinia';

const reconnectDelay = 2000;

/** 新消息提示音静态资源路径，位于 public/sounds/ 下 */
const MESSAGE_SOUND_URL = '/sounds/sound.mp3';

export const useMenuMessageStore = defineStore('menu-message', () => {
  const accessStore = useAccessStore();
  const { customPreferences } = usePreferences();
  const summaries = ref<SystemMenuMessageApi.UnreadSummary[]>([]);
  const downloadTaskRevision = ref(0);
  const running = ref(false);
  const readingPaths = new Set<string>();
  const originalBadges = new WeakMap<
    object,
    { badge?: string; badgeType?: 'dot' | 'normal'; badgeVariants?: string }
  >();

  let abortController: AbortController | null = null;
  let streamBuffer = '';
  let lifecycleId = 0;
  /** 新消息提示音单例，避免每次事件重复创建 Audio 对象 */
  let audioInstance: HTMLAudioElement | null = null;

  /**
   * 播放新消息提示音
   *
   * 触发条件：收到 unreadSummary 事件即触发，不判断未读总数是否增加。
   * 并发处理：新事件打断前一次播放，从头播放（currentTime 重置为 0）。
   * 受偏好开关 enableNewUnreadSummary 控制；浏览器自动播放策略阻止时静默处理。
   */
  function playMessageSound() {
    if (!customPreferences.enableNewUnreadSummary) {
      return;
    }
    if (!audioInstance) {
      audioInstance = new Audio(MESSAGE_SOUND_URL);
    }
    // 重置到开头播放，符合"来一次响一次"语义，新事件打断前一次
    audioInstance.currentTime = 0;
    audioInstance.play().catch(() => {
      // 浏览器自动播放策略可能拒绝（用户未与页面交互过），静默处理
    });
  }

  const unreadCountByPath = computed(() => {
    const result = new Map<string, number>();
    for (const summary of summaries.value) {
      if (summary.menuPath) {
        result.set(summary.menuPath, summary.unreadCount);
      }
    }
    return result;
  });

  watch(
    () => accessStore.accessMenus,
    () => syncMenuBadges(),
    { immediate: true },
  );

  async function start() {
    if (running.value) {
      return;
    }
    const currentLifecycleId = ++lifecycleId;
    running.value = true;
    await loadSummary(currentLifecycleId);
    if (running.value && currentLifecycleId === lifecycleId) {
      void consumeStream(currentLifecycleId);
    }
  }

  function stop() {
    lifecycleId += 1;
    running.value = false;
    abortController?.abort();
    abortController = null;
    streamBuffer = '';
    summaries.value = [];
    downloadTaskRevision.value = 0;
    readingPaths.clear();
    // 暂停正在播放的提示音，避免登出或重置后继续响铃
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }
    syncMenuBadges();
  }

  function $reset() {
    stop();
  }

  async function loadSummary(currentLifecycleId = lifecycleId) {
    try {
      const nextSummaries = await getMenuMessageUnreadSummaryApi();
      if (running.value && currentLifecycleId === lifecycleId) {
        summaries.value = nextSummaries;
        syncMenuBadges();
      }
    } catch {
      // SSE 重连会再次拉取，首次加载失败不阻塞菜单渲染。
    }
  }

  async function markMenuRead(path: string) {
    if (readingPaths.has(path)) {
      return;
    }

    const target = summaries.value.find((summary) => summary.menuPath === path);
    const menu = accessStore.getMenuByPath(path);
    if (!target || target.unreadCount <= 0 || !menu || menu.children?.length) {
      return;
    }

    readingPaths.add(path);
    const currentLifecycleId = lifecycleId;
    try {
      await markMenuMessageReadApi({ menuId: target.menuId });
      if (currentLifecycleId !== lifecycleId) {
        return;
      }
      summaries.value = summaries.value.filter(
        (summary) => summary.menuPath !== path,
      );
      syncMenuBadges();
    } finally {
      if (currentLifecycleId === lifecycleId) {
        readingPaths.delete(path);
      }
    }
  }

  async function consumeStream(currentLifecycleId: number) {
    while (running.value && currentLifecycleId === lifecycleId) {
      const controller = new AbortController();
      abortController = controller;
      streamBuffer = '';

      try {
        await openMenuMessageStreamApi(controller.signal, (chunk) =>
          handleStreamChunk(chunk, currentLifecycleId),
        );
      } catch {
        // 连接失败时通过完整汇总校准，再重新建立 SSE。
      }

      if (!running.value || currentLifecycleId !== lifecycleId) {
        break;
      }

      await loadSummary(currentLifecycleId);
      await delay(reconnectDelay);
    }
  }

  function handleStreamChunk(chunk: string, currentLifecycleId: number) {
    if (!running.value || currentLifecycleId !== lifecycleId) {
      return;
    }
    streamBuffer += chunk;
    const blocks = streamBuffer.split(/\r?\n\r?\n/);
    streamBuffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const eventName = block
        .split(/\r?\n/)
        .find((line) => line.startsWith('event:'))
        ?.slice('event:'.length)
        .trim();
      const data = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice('data:'.length).trim())
        .join('\n');
      if (!data) {
        continue;
      }

      try {
        if (eventName === SystemMenuMessageApi.EventName.UnreadSummary) {
          summaries.value = JSON.parse(data);
          syncMenuBadges();
          // 收到未读汇总事件即播放提示音，受偏好开关控制
          playMessageSound();
        } else if (
          eventName === SystemMenuMessageApi.EventName.DownloadTaskChanged
        ) {
          downloadTaskRevision.value += 1;
        }
      } catch {
        // 不应用格式错误的推送，下一次完整汇总会自动校准。
      }
    }
  }

  function syncMenuBadges() {
    applyMenuBadges(accessStore.accessMenus, unreadCountByPath.value);
  }

  function applyMenuBadges(
    menus: typeof accessStore.accessMenus,
    counts: Map<string, number>,
  ): number {
    let total = 0;
    for (const menu of menus) {
      if (!originalBadges.has(menu)) {
        originalBadges.set(menu, {
          badge: menu.badge,
          badgeType: menu.badgeType,
          badgeVariants: menu.badgeVariants,
        });
      }

      const childrenTotal = menu.children?.length
        ? applyMenuBadges(menu.children, counts)
        : (counts.get(menu.path) ?? 0);
      total += childrenTotal;

      if (childrenTotal > 0) {
        // menu.badge = childrenTotal > 99 ? '99+' : String(childrenTotal);
        menu.badge = String(childrenTotal);
        menu.badgeType = 'normal';
        menu.badgeVariants = 'destructive';
      } else {
        const original = originalBadges.get(menu);
        menu.badge = original?.badge;
        menu.badgeType = original?.badgeType;
        menu.badgeVariants = original?.badgeVariants;
      }
    }
    return total;
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
  }

  return {
    $reset,
    downloadTaskRevision,
    markMenuRead,
    start,
    stop,
  };
});
