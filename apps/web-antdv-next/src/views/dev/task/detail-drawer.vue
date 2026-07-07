<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import CopyButton from '#/components/CopyButton/index.vue';

import TaskDetail from './components/task-detail.vue';
import { Space, Button, Flex } from 'antdv-next';
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
      <Space size="small">
        <CopyButton :text="taskLink" type="dashed" />
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
