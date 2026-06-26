<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import CopyButton from '#/components/CopyButton/index.vue';

import TaskDetail from './components/task-detail.vue';
defineOptions({
  name: 'StoryTrackDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  showConfirmButton: false,
  onOpenChange: (open: boolean) => {
    if (open) {
      taskInfo.value = DrawerApi.getData();
    }
  },
});

const taskInfo = ref<DevTaskApi.DevTaskFace>({});

const taskLink = computed(
  () => `${location.origin}/dev/task/detail/${taskInfo.value.taskNum}`,
);

const newTab = () => {
  window.open(taskLink.value);
};
</script>
<template>
  <Drawer title="任务详情" class="w-[45%]">
    <TaskDetail :task-num="taskInfo.taskNum" :show-btn="false" />
    <template #prepend-footer>
      <a-space size="small">
        <CopyButton :text="taskLink" type="dashed" />
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
