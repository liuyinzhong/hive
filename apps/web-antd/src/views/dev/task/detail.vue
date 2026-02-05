<script lang="ts" setup>
import { computed } from 'vue';
import { useTabs } from '@vben/hooks';
import { Page } from '@vben/common-ui';
import { useRoute } from 'vue-router';
import TaskDetail from './components/task-detail.vue';
import { Card } from 'ant-design-vue';

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
  <Page autoContentHeight>
    <Card>
      <TaskDetail :taskNum="taskNum" :showBtn="true" />
    </Card>
  </Page>
</template>
