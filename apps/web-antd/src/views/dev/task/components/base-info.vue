<script lang="ts" setup>
import UserAvatar from '#/components/UserAvatar/index.vue';
import { type DevTaskApi } from '#/api/dev';
import DictTag from '#/components/DictTag/index.vue';
/**
 * 基本信息组件
 * @property {Object} taskInfo - 任务信息对象
 */
const props = defineProps({
  taskInfo: {
    type: Object as () => DevTaskApi.DevTaskFace,
    required: true,
  },
});
</script>
<template>
  <a-descriptions :column="1" bordered size="small">
    <a-descriptions-item label="任务编号">
      <a-tag>#{{ taskInfo.taskNum || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联版本">
      <a-tag>{{ taskInfo.version || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="关联项目">
      {{ taskInfo.projectTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="关联模块">
      {{ taskInfo.moduleTitle || '-' }}
    </a-descriptions-item>
    <a-descriptions-item label="任务状态">
      <DictTag dictType="TASK_STATUS" :value="taskInfo.taskStatus" />
    </a-descriptions-item>
    <a-descriptions-item label="任务类型">
      <DictTag dictType="TASK_TYPE" :value="taskInfo.taskType" />
    </a-descriptions-item>
    <a-descriptions-item label="执行人">
      <UserAvatar :avatar="taskInfo.avatar" :name="taskInfo.realName" />
    </a-descriptions-item>
    <a-descriptions-item label="开始时间">
      <a-tag>{{ taskInfo.startDate || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="结束时间">
      <a-tag>{{ taskInfo.endDate || '-' }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="进度">
      <a-tag>{{ taskInfo.percent || '-' }}%</a-tag>
    </a-descriptions-item>
  </a-descriptions>
</template>
