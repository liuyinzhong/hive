<script lang="ts" setup>
import type { Sortable } from '@vben-core/composables';

import { getTaskList, type DevTaskApi } from '#/api/dev';

import { onMounted, reactive, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { useSortable } from '@vben-core/composables';

import { Card, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import addTaskModal from '#/views/dev/task/add-modal.vue';

interface DataItem {
  title: string;
  icon: string;
  taskStatus: number;
  children: DevTaskApi.DevTaskFace[];
}

// 待办事项数据
const taskDataList = reactive<Array<DataItem>>([
  {
    title: '待执行',
    icon: 'icon-[lucide--badge]',
    taskStatus: 0,
    children: [],
  },
  {
    title: '执行中',
    icon: 'icon-[lucide--badge-percent]',
    taskStatus: 10,
    children: [],
  },
  {
    title: '已完成',
    icon: 'icon-[lucide--badge-check]',
    taskStatus: 99,
    children: [],
  },
]);

onMounted(() => {
  // 初始化排序
  initSortable();
  getTaskList({}).then(({ items }) => {
    taskDataList.forEach((taskInfo) => {
      taskInfo.children = items.filter(
        (item) => item.taskStatus == taskInfo.taskStatus,
      );
    });
  });
});

// 排序选项
const sortableOptions: Sortable.Options = {
  group: {
    name: 'taskTodoList',
    // 我们设置为true，确保可以正常移动元素
    pull: true,
    put: true,
  },
  sort: true,
  // 拖动时的动画时间（毫秒）
  animation: 300,
  // 拖动延迟（毫秒）
  delay: 150,
  // 只在触摸设备上延迟
  delayOnTouchOnly: true,
  // 过滤不可拖动的元素
  filter: '.empty-component',
  // 当尝试拖动被过滤的元素时触发
  onFilter: (evt) => {
    // 阻止默认行为，确保被过滤的元素不会被拖动
    evt.preventDefault();
  },
  // 拖动结束时的回调
  onEnd: async (event) => {
    // 获取源容器和目标容器
    const fromContainer = event.from.dataset.container;
    const toContainer = event.to.dataset.container;

    // 从元素中获取任务ID
    const taskId = event.item.dataset.id || '';

    // 确保ID有效
    if (!taskId) {
      return;
    }

    console.log('从列表拖动到列表:', fromContainer, '->', toContainer);
    console.log('拖动的任务ID:', taskId);

    // 如果源列表和目标列表相同，不做处理
    if (fromContainer === toContainer) {
      return;
    }
    // 查找源列表和目标列表
    const fromList = taskDataList.find((item) => item.title === fromContainer);
    const toList = taskDataList.find((item) => item.title === toContainer);
    if (!fromList || !toList) {
      return;
    }

    // 从源列表中查找并移除任务（使用ID查找）
    const taskIndexById = fromList.children.findIndex(
      (task: DevTaskApi.DevTaskFace) => task.taskId === taskId,
    );
    const task = fromList.children.splice(
      taskIndexById,
      1,
    )[0] as DevTaskApi.DevTaskFace;
    toList.children.push(task);
    event.item.remove();
  },
};

// 为每个列表创建ref
const sortContainers = ref<(any | HTMLDivElement)[]>([]);
/**
 * 初始化所有列表的排序功能
 */
async function initSortable() {
  for (const container of sortContainers.value) {
    if (container) {
      const { initializeSortable } = useSortable(container, sortableOptions);
      await initializeSortable();
    }
  }
}

const changeTaskTitle = (e: string) => {
  console.log(e);
};

// #region 任务添加弹窗
const [AddTaskModal, AddTaskModalApi] = useVbenModal({
  title: '添加任务',
  connectedComponent: addTaskModal,
  destroyOnClose: true,
});

function onCreate() {
  AddTaskModalApi.setData(null).open();
}
// #endregion
</script>

<template>
  <Page :autoContentHeight="true">
    <a-button @click="onCreate" type="primary">添加任务</a-button>
    <br />
    <br />
    <a-list :grid="{ gutter: 0, column: 3 }" :data-source="taskDataList">
      <template #renderItem="{ item, index }">
        <a-list-item>
          <Card size="small" :body-style="{ padding: 0 }">
            <template #title>
              <a-flex>
                <span :class="item.icon" style="font-size: 20px"></span>
                <span class="ml-2">{{ item.title }}</span>
              </a-flex>
            </template>
            <div
              class="sort-container h-[650px] overflow-auto"
              :data-container="item.title"
              :ref="(el) => (sortContainers[index] = el)"
            >
              <template v-if="item.children.length > 0">
                <div
                  v-for="taskInfo in item.children"
                  :key="taskInfo.taskId"
                  :data-id="taskInfo.taskId"
                  :data-parent-index="index"
                  class="border-b p-3"
                >
                  <div class="cursor-pointer">
                    <div class="top flex items-center justify-between">
                      <div class="left">
                        <a-tag color="blue">
                          {{ taskInfo.moduleTitle }}
                        </a-tag>
                        <a-tag color="green">
                          {{ taskInfo.taskType }}
                        </a-tag>
                      </div>
                      <div class="right">
                        <a-tag color="blue"> #{{ taskInfo.taskNum }} </a-tag>
                        <a-tag color="green">
                          {{ taskInfo.version }}
                        </a-tag>
                      </div>
                    </div>

                    <div class="title line2 py-2">
                      <a-typography-paragraph
                        style="margin-bottom: 0"
                        :ellipsis="{
                          rows: 3,
                        }"
                        :editable="{
                          onChange: (e: string) => (taskInfo.taskTitle = e),
                          onEnd: () => changeTaskTitle(taskInfo),
                        }"
                        :content="taskInfo.taskTitle"
                      />

                      <!-- <EllipsisText :line="3" expand :tooltip="false">
                          {{ taskInfo.taskTitle }}
                        </EllipsisText> -->
                    </div>

                    <div class="bottom flex items-center justify-between">
                      <div class="left">
                        <a-avatar :size="30" :src="taskInfo.avatar"></a-avatar>
                      </div>
                      <div class="right">
                        <span class="flex items-center">
                          {{ dayjs(taskInfo.endDate).format('MM月DD号') }}
                          {{ taskInfo.actualHours || 0 }}h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="h-[100px]"></div>
                <a-empty class="empty-component" />
              </template>
            </div>
          </Card>
        </a-list-item>
      </template>
    </a-list>

    <AddTaskModal />
  </Page>
</template>

<style scoped></style>
