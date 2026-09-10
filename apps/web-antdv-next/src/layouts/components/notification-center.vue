<script lang="ts" setup>
import type { SystemMenuMessageApi } from '#/api/system';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Bell, CircleCheckBig, MailCheck } from '@vben/icons';

import { Popover, Tooltip, Avatar } from 'antdv-next';

import dayjs from 'dayjs';

import { $t } from '#/locales';
import { useMenuMessageStore } from '#/store';

defineOptions({ name: 'NotificationCenter' });

const open = ref(false);
const router = useRouter();
const menuMessageStore = useMenuMessageStore();

function handleOpenChange(visible: boolean) {
  open.value = visible;
  // 列表是瞬时视图:每次打开弹层时拉取最近消息,打开期间不实时刷新
  if (visible) {
    void menuMessageStore.fetchRecentMessages();
  }
}

function handleMarkRead(item: SystemMenuMessageApi.MenuMessageItem) {
  void menuMessageStore.readMessageItem(item.id);
}

function handleReadAll() {
  void menuMessageStore.readAllMessages();
}

/**
 * 点击消息项与进入菜单是同一已读口径:先整组已读再跳转归属菜单。
 * 菜单路径为空(来源菜单已删除)时不可跳转,只能通过按钮逐条已读。
 */
function handleItemClick(item: SystemMenuMessageApi.MenuMessageItem) {
  if (!item.menuPath) {
    return;
  }
  open.value = false;
  void menuMessageStore.markMenuRead(item.menuPath);
  router.push(item.menuPath);
}
</script>

<template>
  <Popover
    :open="open"
    :styles="{ container: { padding: 0 } }"
    placement="bottomRight"
    trigger="click"
    @open-change="handleOpenChange"
  >
    <template #content>
      <div class="relative w-110">
        <div class="flex items-center justify-between p-4 py-3">
          <div class="text-foreground">
            {{ $t('system.notice.title') }}
          </div>
          <Tooltip :title="$t('system.notice.markAllRead')">
            <button
              class="flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="menuMessageStore.totalUnreadCount <= 0"
              type="button"
              @click="handleReadAll"
            >
              <MailCheck class="size-4" />
            </button>
          </Tooltip>
        </div>

        <div
          v-if="menuMessageStore.recentMessages.length > 0"
          class="max-h-90 w-full overflow-y-auto"
        >
          <ul class="flex w-full flex-col">
            <li
              v-for="item in menuMessageStore.recentMessages"
              :key="item.id"
              class="relative flex w-full cursor-pointer items-start gap-5 border-t border-border p-3 hover:bg-accent"
              @click="handleItemClick(item)"
            >
              <span
                v-if="!item.readAt"
                class="absolute top-2 right-2 size-2 rounded-sm bg-primary"
              ></span>

              <Avatar :src="item.avatar" style="width: 50px; height: 50px">
                系统
              </Avatar>

              <div class="flex min-w-0 flex-col gap-1 leading-none">
                <p
                  class="truncate text-sm font-semibold"
                  :class="{ 'opacity-60': item.readAt }"
                >
                  {{ item.title }}
                </p>
                <p class="my-1 line-clamp-2 text-xs text-muted-foreground">
                  {{ item.content }}
                </p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ $t(item.menuName) }} ·
                  {{ dayjs(item.createDate).format('MM-DD HH:mm') }}
                </p>
              </div>

              <div
                v-if="!item.readAt"
                class="absolute top-1/2 right-3 flex -translate-y-1/2 flex-row gap-1"
              >
                <Tooltip :title="$t('system.notice.markRead')">
                  <button
                    class="flex size-6 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-accent"
                    type="button"
                    @click.stop="handleMarkRead(item)"
                  >
                    <CircleCheckBig class="size-4" />
                  </button>
                </Tooltip>
              </div>
            </li>
          </ul>
        </div>

        <div
          v-else
          class="flex min-h-37.5 w-full items-center justify-center text-muted-foreground"
        >
          {{ $t('system.notice.empty') }}
        </div>

        <div
          v-if="menuMessageStore.recentMessages.length > 0"
          class="flex items-center border-t border-border px-4 py-3"
        >
          <span class="text-xs text-muted-foreground">
            {{ $t('system.notice.listHint') }}
          </span>
        </div>
      </div>
    </template>

    <div class="mr-2 flex h-full items-center">
      <button
        class="bell-button relative flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-accent"
        type="button"
      >
        <span
          v-if="menuMessageStore.totalUnreadCount > 0"
          class="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary"
        ></span>
        <Bell class="size-4" />
      </button>
    </div>
  </Popover>
</template>

<style scoped>
.bell-button {
  &:hover {
    svg {
      animation: bell-ring 1s both;
    }
  }
}

@keyframes bell-ring {
  0%,
  100% {
    transform-origin: top;
  }

  15% {
    transform: rotateZ(10deg);
  }

  30% {
    transform: rotateZ(-10deg);
  }

  45% {
    transform: rotateZ(5deg);
  }

  60% {
    transform: rotateZ(-5deg);
  }

  75% {
    transform: rotateZ(2deg);
  }
}
</style>
