<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import StoryDetail from './components/story-detail.vue';
import { type DevStoryApi } from '#/api/dev';
import CopyButton from '#/components/CopyButton/index.vue';

defineOptions({
  name: 'StoryTrackDrawer',
});

/**
 * 抽屉实例
 */
const [Drawer, DrawerApi] = useVbenDrawer({
  confirmText: '新窗口',
  onOpenChange: (open: boolean) => {
    if (open) {
      storyInfo.value = DrawerApi.getData();
    }
  },
  onConfirm: () => {
    window.open(storyLink.value);
  },
});

/**
 * 当前打开的需求信息
 */
const storyInfo = ref<DevStoryApi.DevStoryFace>({});

const storyLink = computed(
  () => location.origin + `/dev/story/detail/${storyInfo.value.storyNum}`,
);
</script>
<template>
  <Drawer title="需求详情" class="w-[45%]">
    <StoryDetail :storyNum="storyInfo.storyNum" :showBtn="false" />
    <template #prepend-footer>
      <CopyButton :text="storyLink" type="dashed" />
    </template>
  </Drawer>
</template>
