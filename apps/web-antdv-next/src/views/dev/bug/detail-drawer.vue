<script lang="ts" setup>
import type { DevBugApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';

import CopyButton from '#/components/CopyButton/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import BugDetail from './components/bug-detail.vue';
defineOptions({
  name: 'BugDetailDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange: (open: boolean) => {
    if (open) {
      bugInfo.value = DrawerApi.getData();
    }
  },
});

const bugInfo = ref<DevBugApi.DevBugFace>({});

const bugLink = computed(
  () => `${location.origin}/dev/bug/detail/${bugInfo.value.bugNum}`,
);
const newTab = () => {
  window.open(bugLink.value);
};

const submit = () => {
  DrawerApi.lock();
  setTimeout(() => {
    const _params = {
      businessId: bugInfo.value.bugId,
      businessType: 20,
      changeBehavior: 20,
      changeRichText: bugInfo.value.changeRichText || '',
    };
    DrawerApi.unlock();
    DrawerApi.close();
  }, 1000);
};
</script>
<template>
  <Drawer title="缺陷详情" class="w-[45%]">
    <BugDetail :bug-num="bugInfo.bugNum" :show-btn="false" />
    <template #prepend-footer>
      <a-space size="small">
        <CopyButton :text="bugLink" type="dashed" />
        <a-button @click="newTab" type="dashed">
          <a-flex align="center" :gap="5">
            <span class="icon-[lucide--app-window] size-4"></span>
            <span>新窗口</span>
          </a-flex>
        </a-button>
      </a-space>
    </template>
  </Drawer>
</template>
