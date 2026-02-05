<script lang="ts" setup>
import { ref } from 'vue';
import { type DevTaskApi } from '#/api/dev';
import { useVbenDrawer } from '@vben/common-ui';
import TaskDetail from './components/task-detail.vue';

defineOptions({
  name: 'StoryTrackDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  cancelText: '关闭',
  confirmText: '新窗口',
  onOpenChange: (open: boolean) => {
    if (open) {
      taskInfo.value = DrawerApi.getData();
    }
  },
  onConfirm: () => {
    window.open(`/dev/task/detail/${taskInfo.value.taskNum}`);
  },
});

const taskInfo = ref<DevTaskApi.DevTaskFace>({
  taskId: '',
  pid: '',
  taskTitle: undefined,
  taskNum: 0,
});
</script>
<template>
  <Drawer title="任务详情" class="w-[45%]">
    <TaskDetail :taskNum="taskInfo.taskNum" :showBtn="false" />
  </Drawer>
</template>
