<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import DictTag from '#/components/DictTag/index.vue';
import UserAvatar from '#/components/UserAvatar/index.vue';
import { Descriptions, DescriptionsItem, Tag } from 'antdv-next';
/**
 * 基本信息组件
 * @property {Object} taskInfo - 任务信息对象
 */
// eslint-disable-next-line unused-imports/no-unused-vars
const props = defineProps({
  taskInfo: {
    type: Object as () => DevTaskApi.DevTaskFace,
    required: true,
  },
});
</script>
<template>
  <Descriptions :column="1" bordered size="small">
    <DescriptionsItem label="任务编号">
      <Tag>#{{ taskInfo.taskNum || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联版本">
      <Tag>{{ taskInfo.version || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="关联项目">
      {{ taskInfo.projectTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="关联模块">
      {{ taskInfo.moduleTitle || '-' }}
    </DescriptionsItem>
    <DescriptionsItem label="任务状态">
      <DictTag dict-type="TASK_STATUS" :value="taskInfo.taskStatus" />
    </DescriptionsItem>
    <DescriptionsItem label="任务类型">
      <DictTag dict-type="TASK_TYPE" :value="taskInfo.taskType" />
    </DescriptionsItem>
    <DescriptionsItem label="执行人">
      <UserAvatar :avatar="taskInfo.avatar" :name="taskInfo.realName" />
    </DescriptionsItem>
    <DescriptionsItem label="开始时间">
      <Tag>{{ taskInfo.startDate || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="结束时间">
      <Tag>{{ taskInfo.endDate || '-' }}</Tag>
    </DescriptionsItem>
    <DescriptionsItem label="进度">
      <Tag>{{ taskInfo.percent || '-' }}%</Tag>
    </DescriptionsItem>
  </Descriptions>
</template>
