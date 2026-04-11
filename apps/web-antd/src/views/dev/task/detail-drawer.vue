<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { VbenTiptap } from '@vben/plugins/tiptap';

import CopyButton from '#/components/CopyButton/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';

import TaskDetail from './components/task-detail.vue';
defineOptions({
  name: 'StoryTrackDrawer',
});

const [Drawer, DrawerApi] = useVbenDrawer({
  showCancelButton: false,
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

const submit = () => {
  DrawerApi.lock();
  setTimeout(() => {
    const _params = {
      businessId: taskInfo.value.taskId,
      businessType: 10,
      changeBehavior: 20,
      changeRichText: taskInfo.value.changeRichText || '',
    };
    DrawerApi.unlock();
    DrawerApi.close();
  }, 1000);
};
</script>
<template>
  <Drawer title="任务详情" class="w-[45%]">
    <template #extra>
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
    <TaskDetail :task-num="taskInfo.taskNum" :show-btn="false" />
    <template #prepend-footer>
      <div class="w-full">
        <a-flex align="start" :gap="5" class="w-full mb-2">
          <UserAvatar />
          <VbenTiptap
            v-model="taskInfo.changeRichText"
            :toolbar="false"
            placeholder="请输入内容"
            class="w-full"
            :min-height="100"
          />
        </a-flex>
        <div class="w-full flex justify-end">
          <a-button type="primary" @click="submit">提交</a-button>
        </div>
      </div>
    </template>
  </Drawer>
</template>
