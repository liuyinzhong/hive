<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import StoryDetail from './components/story-detail.vue';

defineOptions({
  name: 'StoryTrackDrawer',
});

/**
 * 抽屉实例
 */
const [Drawer, DrawerApi] = useVbenDrawer({
  onOpenChange: (open: boolean) => {
    if (open) {
      let data = DrawerApi.getData();
      currentStoryNum.value = data.storyNum;
    }
  },
});

/**
 * 当前打开的需求编号
 */
const currentStoryNum = ref(0);
</script>
<template>
  <Drawer title="需求详情" class="w-[45%]">
    <StoryDetail :storyNum="currentStoryNum" />
  </Drawer>
</template>
