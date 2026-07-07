<script lang="ts" setup>
import type { DevStoryApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';

import CopyButton from '#/components/CopyButton/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import StoryDetail from './components/story-detail.vue';
import { Button, Flex, Space } from 'antdv-next';

defineOptions({
  name: 'StoryTrackDrawer',
});

/**
 * 抽屉实例
 */
const [Drawer, DrawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange: (open: boolean) => {
    if (open) {
      storyInfo.value = DrawerApi.getData();
    }
  },
});

/**
 * 当前打开的需求信息
 */
const storyInfo = ref<DevStoryApi.DevStoryFace>({
  storyId: '',
});

const storyLink = computed(
  () => `${location.origin}/dev/story/detail/${storyInfo.value.storyNum}`,
);

const newTab = () => {
  window.open(storyLink.value);
};
</script>
<template>
  <Drawer title="需求详情" class="w-[45%]">
    <StoryDetail :story-num="storyInfo.storyNum" :show-btn="false" />
    <template #prepend-footer>
      <Space size="small">
        <CopyButton :text="storyLink" type="dashed" />
        <Button @click="newTab" type="dashed">
          <Flex align="center" :gap="5">
            <span class="icon-[lucide--app-window] size-4"></span>
            <span>新窗口</span>
          </Flex>
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
