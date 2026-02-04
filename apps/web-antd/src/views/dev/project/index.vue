<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import ProjectSelect from '#/components/dev/ProjectSelect/index.vue';
import BugTable from '#/views/dev/bug/list.vue';
import StoryTable from '#/views/dev/story/list.vue';
import TaskTable from '#/views/dev/task/list.vue';
import { Card } from 'ant-design-vue';
// 跳转路由
const router = useRouter();

const queryParams = reactive({
  projectId: '',
  versionId: '',
  moduleId: '',
  tableType: 'story',
});

// #region 项目切换
const changeProject = (val: string) => {
  console.log(queryParams);
};
// #endregion 项目切换

// #region 切换需求/bug/任务的tab时触发
const tableTypeList = ref([
  {
    value: 'story',
    payload: {
      label: '需求',
      icon: 'icon-[lucide--film]',
      badge: 10,
    },
  },
  {
    value: 'task',
    payload: {
      label: '任务',
      icon: 'icon-[lucide--list-todo]',
      badge: 0,
    },
  },
  {
    value: 'bug',
    payload: {
      label: 'BUG',
      icon: 'icon-[lucide--bug]',
      badge: 0,
    },
  },
]);
const changeTableType = (val: string) => {
  console.log(`切换tab:${val}`);
};
// #endregion 切换tab

// #region 切换模块分类
const changeModule = (val: any) => {
  console.log(queryParams.moduleId);
};
const moduleList = ref([
  {
    label: '所有',
    value: '',
  },
  {
    value: '585af62b-0628-4d7a-8c9b-7bac152dcc78',
    label: '医生端',
  },
  {
    value: '489de45a-3aa8-4aaf-85fe-824aad7b0afa',
    label: '患者端',
  },
  {
    value: 'dc50e86b-a40e-46ec-8ebc-ea5cf2318e6a',
    label: 'EXE端',
  },
  {
    value: 'cea424e2-eb42-40f3-bba7-09a3298d32b7',
    label: '平台Web端',
  },
  {
    value: '8b178b51-ffc6-4a2d-86b1-f93dd817f925',
    label: '商户Web端',
  },
  {
    value: 'd810aefa-9836-46ed-ba78-eb2dfc716ac0',
    label: '药店端',
  },
]);
// #endregion 切换模块分类
</script>

<template>
  <Page auto-content-height>
    <Card>
      <div class="flex justify-between">
        <div>
          <a-form :model="queryParams" layout="inline">
            <a-form-item label="项目" label-width="80px">
              <ProjectSelect
                v-model:project-id="queryParams.projectId"
                v-model:version-id="queryParams.versionId"
                @change="changeProject"
                :show-add-project="true"
                :show-add-version="true"
                style="width: 200px"
              />
            </a-form-item>
            <a-form-item label="模块" label-width="80px">
              <a-select
                style="width: 200px; margin-left: 10px"
                v-model:value="queryParams.moduleId"
                :options="moduleList"
                @change="changeModule"
              />
            </a-form-item>
          </a-form>
        </div>
        <div style="width: 500px">
          <a-segmented
            v-model:value="queryParams.tableType"
            :options="tableTypeList"
            size="large"
            block
            @change="changeTableType"
          >
            <template #label="{ payload, value }">
              <a-flex
                :gap="5"
                align="center"
                :class="{ 'text-primary': queryParams.tableType === value }"
              >
                <span :class="payload.icon" style="font-size: 20px"> </span>
                <span>
                  {{ payload.label }}
                  <span style="margin-left: 2px">({{ payload.badge }})</span>
                </span>
              </a-flex>
            </template>
          </a-segmented>
        </div>
      </div>
      <!-- <JsonViewer v-model:value="queryParams" /> -->
      <StoryTable v-if="queryParams.tableType === 'story'" />
      <TaskTable v-if="queryParams.tableType === 'task'" />
      <BugTable v-if="queryParams.tableType === 'bug'" />
    </Card>
  </Page>
</template>
