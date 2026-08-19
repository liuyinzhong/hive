import { SystemMenuMessageApi } from '#/api/system';

import { computed, ref, watch } from 'vue';

import { useAccessStore } from '@vben/stores';

import { defineStore } from 'pinia';

import {
  getMenuMessageUnreadSummaryApi,
  markMenuMessageReadApi,
  openMenuMessageStreamApi,
} from '#/api/system';

const reconnectDelay = 2000;

export const useMenuMessageStore = defineStore('menu-message', () => {
  const accessStore = useAccessStore();
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
        menu.badge = childrenTotal > 99 ? '99+' : String(childrenTotal);
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
