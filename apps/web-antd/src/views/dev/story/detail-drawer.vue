<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import StoryDetail from './components/story-detail.vue';
import { type DevStoryApi } from '#/api/dev';

defineOptions({
  name: 'StoryTrackDrawer',
});

/**
 * 抽屉实例
 */
const [Drawer, DrawerApi] = useVbenDrawer({
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
  pid: '',
  storyTitle: undefined,
  storyNum: 0,
});
</script>
<template>
  <Drawer title="需求详情" class="w-[45%]">
    <StoryDetail :storyNum="storyInfo.storyNum" />
  </Drawer>
</template>
