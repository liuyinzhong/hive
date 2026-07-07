<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { ref } from 'vue';

import DictTag from '#/components/DictTag/index.vue';
import { List, ListItem, ListItemMeta, Tag, Avatar } from 'antdv-next';

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
    <List
      item-layout="horizontal"
      bordered
      :data-source="props.taskList"
      size="small"
    >
      <template #renderItem="{ item }">
        <ListItem>
          <ListItemMeta>
            <template #title>
              <a target="_blank" :href="`/dev/task/detail/${item.taskNum}`">
                {{ item.taskTitle }}
              </a>
            </template>

            <template #description>
              <DictTag dict-type="TASK_STATUS" :value="item.taskStatus" />
              <DictTag dict-type="TASK_TYPE" :value="item.taskType" />
              <Tag>{{ item.percent }}%</Tag>
              <Tag>{{ item.endDate }}</Tag>
            </template>

            <template #avatar>
              <Avatar :src="item.avatar" />
            </template>
          </ListItemMeta>
        </ListItem>
      </template>
    </List>
  </div>
</template>
