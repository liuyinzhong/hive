<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Card } from 'ant-design-vue';

import TaskDetail from './components/task-detail.vue';

defineOptions({
  name: 'TaskDetail',
});

const route = useRoute();

const { setTabTitle } = useTabs();

const taskNum: any = computed(() => {
  return route.params?.taskNum ?? '-1';
});
setTabTitle(`任务详情 #${taskNum.value}`);
</script>
<template>
  <Page auto-content-height>
    <Card>
      <TaskDetail :task-num="taskNum" :show-btn="true" />
    </Card>
  </Page>
</template>
