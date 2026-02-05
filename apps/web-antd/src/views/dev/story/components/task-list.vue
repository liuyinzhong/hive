<script lang="ts" setup>
import { taskListByStoryId, type DevTaskApi } from '#/api/dev';
import DictTag from '#/components/DictTag/index.vue';
import { ref } from 'vue';

/**
 * 基本信息组件
 * @property {String} storyId - 需求id
 */
const props = defineProps({
  storyId: {
    type: [String],
    required: true,
  },
});

//#region 获取任务列表
const taskList = ref<DevTaskApi.DevTaskFace[]>([]);
taskListByStoryId({
  storyId: props.storyId,
}).then((res: DevTaskApi.DevTaskFace[]) => {
  taskList.value = res || [];
});
//#endregion
</script>
<template>
  <div>
    <a-list
      item-layout="horizontal"
      bordered
      :data-source="taskList"
      size="small"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a :href="'/dev/task/detail/' + item.taskNum">
                {{ item.taskTitle }}
              </a>
            </template>

            <template #description>
              <DictTag dictType="TASK_STATUS" :value="item.taskStatus" />
              <DictTag dictType="TASK_TYPE" :value="item.taskType" />
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
