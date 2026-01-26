<script lang="ts" setup>
import type { Sortable } from '@vben-core/composables';

import type { SystemTaskApi } from '#/api/dev';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { useSortable } from '@vben-core/composables';

import { faker } from '@faker-js/faker';
import { Card, message } from 'ant-design-vue';
import dayjs from 'dayjs';

interface DataItem {
  title: string;
  icon: string;
  children: SystemTaskApi.SystemTask[];
}

// 待办事项数据
const data = reactive<Array<DataItem>>([
  {
    title: '无状态',
    icon: 'icon-[lucide--badge]',
    children: [
      {
        taskId: faker.string.uuid(),
        taskTitle:
          '你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001你好我好0001',
        taskStatus: '0',
        taskNum: '',
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: '医生端',
        version: '1.0.0',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
      {
        taskId: faker.string.uuid(),
        taskTitle: '你好我好0005',
        taskStatus: '0',
        taskNum: '',
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: '患者端',
        version: '1.0.0',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
      {
        taskId: faker.string.uuid(),
        taskTitle: '你好我好0002',
        taskStatus: '0',
        taskNum: '',
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: '管理端',
        version: '1.0.0',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
    ],
  },
  {
    title: '进行中',
    icon: 'icon-[lucide--badge-percent]',
    children: [
      {
        taskId: faker.string.uuid(),
        taskTitle: '你好我好0003',
        taskStatus: '0',
        taskNum: '',
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: 'EXE',
        version: '1.0.0',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
    ],
  },
  {
    title: '已完成',
    icon: 'icon-[lucide--badge-check]',
    children: [
      {
        taskId: faker.string.uuid(),
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: '平台端',
        version: '1.0.0',
        taskTitle: '你好我好0004',
        taskStatus: '0',
        taskNum: '',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
      {
        taskId: faker.string.uuid(),
        taskType: '0',
        planHours: 10,
        actualHours: 10,
        storyTitle: '添加一个字段xxxxxxx',
        module: '药店',
        version: '1.0.1',
        taskTitle: '你好我好0004',
        taskStatus: '0',
        taskNum: '',
        userName: '刘哈哈',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      },
    ],
  },
]);

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
    const fromList = data.find((item) => item.title === fromContainer);
    const toList = data.find((item) => item.title === toContainer);
    if (!fromList || !toList) {
      return;
    }

    // 从源列表中查找并移除任务（使用ID查找）
    const taskIndexById = fromList.children.findIndex(
      (task) => task.taskId === taskId,
    );
    const task = fromList.children.splice(
      taskIndexById,
      1,
    )[0] as SystemTaskApi.SystemTask;
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

const addTask = async () => {
  if (!addParams.value.taskTitle) {
    message.error('请输入任务标题');
    return;
  }
  if (!addParams.value.endDate) {
    message.error('请输入截止时间');
    return;
  }
  if (!addParams.value.userName) {
    message.error('请输入执行人');
    return;
  }

  const newTask: SystemTaskApi.SystemTask = {
    taskId: faker.string.uuid(),
    ...addParams.value,
  };
  data[0]?.children.push(newTask);
  addParams.value.taskTitle = '';
};
onMounted(() => {
  // 初始化排序
  initSortable();
});

const addParams = ref<SystemTaskApi.SystemTask>({});

const changeTaskTitle = (e: string) => {
  console.log(e);
};
</script>

<template>
  <Page>
    <Card>
      <div class="text-center">
        <a-input-group compact style="width: 100%" size="large">
          <a-select
            v-model:value="addParams.taskType"
            style="width: 110px"
            placeholder="任务类别"
          >
            <a-select-option value="开发">开发</a-select-option>
            <a-select-option value="优化">优化</a-select-option>
            <a-select-option value="修复">修复</a-select-option>
            <a-select-option value="会议">会议</a-select-option>
          </a-select>

          <a-select
            v-model:value="addParams.userName"
            style="width: 110px"
            placeholder="执行人"
          >
            <a-select-option value="开发">开发</a-select-option>
            <a-select-option value="优化">优化</a-select-option>
            <a-select-option value="修复">修复</a-select-option>
            <a-select-option value="会议">会议</a-select-option>
          </a-select>
          <a-date-picker
            v-model:value="addParams.endDate"
            placeholder="截止时间"
            size="large"
          />
          <a-select
            v-model:value="addParams.storyId"
            placeholder="请选择需求"
            :dropdown-match-select-width="false"
            style="width: 150px"
          >
            <a-select-option value="Option2-1">Option2-1</a-select-option>
            <a-select-option value="Option2-2">Option2-2</a-select-option>
          </a-select>
          <a-input-search
            style="width: 50%"
            v-model:value="addParams.taskTitle"
            placeholder="请输入任务标题,回车键添加"
            @keyup.enter="addTask"
            size="large"
          >
            <template #enterButton>
              <a-button type="primary" @click="addTask">
                <span class="icon-[fluent--arrow-enter-24-regular]"> </span>
                添加
              </a-button>
            </template>
          </a-input-search>
        </a-input-group>
      </div>

      <br />
      <a-list :grid="{ gutter: 0, column: 3 }" :data-source="data">
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
                class="sort-container min-h-[500px]"
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
                          <a-tag color="blue"> {{ taskInfo.module }} </a-tag>
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
                          <a-avatar
                            :size="30"
                            src="https://picsum.photos/30/30"
                          >
                            <template #icon><UserOutlined /></template>
                          </a-avatar>
                        </div>
                        <div class="right">
                          <div class="flex items-center">
                            <a-tooltip>
                              <template #title>
                                {{
                                  dayjs(taskInfo.startDate).format('YYYY-MM-DD')
                                }}
                                至
                                {{
                                  dayjs(taskInfo.endDate).format('YYYY-MM-DD')
                                }}
                                工时:{{ taskInfo.actualHours }}小时
                              </template>
                              <span class="flex items-center">
                                {{ dayjs(taskInfo.endDate).format('MM月DD号') }}
                                {{ taskInfo.actualHours || 0 }}
                                <span class="icon-[lucide--hourglass]"></span>
                              </span>
                            </a-tooltip>
                          </div>
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
    </Card>
  </Page>
</template>

<style scoped></style>
