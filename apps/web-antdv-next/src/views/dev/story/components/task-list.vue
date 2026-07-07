<script lang="ts" setup>
import DictTag from '#/components/DictTag/index.vue';
import { Avatar, Tag, Empty } from 'antdv-next';

/**
 * 任务列表组件
 * @property {Array} taskList - 任务列表数据
 */
const props = defineProps({
  taskList: {
    type: Array<any>,
    default: () => [],
  },
});
</script>
<template>
  <div>
    <Empty v-if="!props.taskList || props.taskList.length === 0" />
    <div v-else class="task-list">
      <div
        v-for="item in props.taskList"
        :key="item.taskId"
        class="task-list-item"
      >
        <div class="task-list-item-avatar">
          <Avatar :src="item.avatar" />
        </div>
        <div class="task-list-item-content">
          <div class="task-list-item-title">
            <a target="_blank" :href="`/dev/task/detail/${item.taskNum}`">
              {{ item.taskTitle }}
            </a>
          </div>
          <div class="task-list-item-desc">
            <DictTag dict-type="TASK_STATUS" :value="item.taskStatus" />
            <DictTag dict-type="TASK_TYPE" :value="item.taskType" />
            <Tag>{{ item.percent }}%</Tag>
            <Tag>{{ item.endDate }}</Tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-list-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.task-list-item-avatar {
  flex-shrink: 0;
}

.task-list-item-content {
  flex: 1;
  min-width: 0;
}

.task-list-item-title {
  margin-bottom: 6px;
  font-weight: 500;
}

.task-list-item-desc {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
