<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { ref } from 'vue';

import DictTag from '#/components/DictTag/index.vue';

/**
 * 基本信息组件
 * @property {String} storyId - 需求id
 */
const props = defineProps({
  taskList: {
    type: [String],
    required: true,
  },
});
</script>
<template>
  <div>
    <a-list
      item-layout="horizontal"
      bordered
      :data-source="props.taskList"
      size="small"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a :href="`/dev/task/detail/${item.taskNum}`">
                {{ item.taskTitle }}
              </a>
            </template>

            <template #description>
              <DictTag dict-type="TASK_STATUS" :value="item.taskStatus" />
              <DictTag dict-type="TASK_TYPE" :value="item.taskType" />
              <a-tag>{{ item.percent }}%</a-tag>
              <a-tag>{{ item.endDate }}</a-tag>
            </template>

            <template #avatar>
              <a-avatar :src="item.avatar" />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
