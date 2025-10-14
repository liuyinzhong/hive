<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { LucideSettings, LucidePencilLine, LucideEllipsis } from '@vben/icons';

import { useRouter } from 'vue-router';

import {
  useVbenDrawer,
  useVbenModal,
  VbenCountToAnimator,
  Page,
  JsonViewer,
} from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictList } from '#/dicts';
import { getExampleTableApi } from '../mock-api2';
import { ref, reactive, nextTick, defineComponent } from 'vue';
import ProjectSelect from '#/components/dev/ProjectSelect/index.vue';
// 跳转路由
const router = useRouter();

const queryParams = reactive({
  projectId: '',
  versionId: '',
  moduleId: '',
  moduleIds: [],
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
  console.log('切换tab:' + val);
};
// #endregion 切换tab

// #region 切换模块分类
const changeModule = (val: any) => {
  nextTick(() => {
    queryParams.moduleId = val.key;
    console.log('切换模块:', val, queryParams.moduleId);
  });
};
const moduleList = ref([
  {
    key: '',
    label: '所有',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
  },
  {
    key: '585af62b-0628-4d7a-8c9b-7bac152dcc78',
    label: '医生端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
  {
    key: '489de45a-3aa8-4aaf-85fe-824aad7b0afa',
    label: '患者端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
  {
    key: 'dc50e86b-a40e-46ec-8ebc-ea5cf2318e6a',
    label: 'EXE端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
  {
    key: 'cea424e2-eb42-40f3-bba7-09a3298d32b7',
    label: '平台Web端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
  {
    key: '8b178b51-ffc6-4a2d-86b1-f93dd817f925',
    label: '商户Web端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
  {
    key: 'd810aefa-9836-46ed-ba78-eb2dfc716ac0',
    label: '药店端',
    projectId: '4d8fbc89-e807-416c-bd02-dc8148c650ac',
    sort: 0,
  },
]);
// #endregion 切换模块分类
</script>

<template>
  <Page auto-content-height>
    <div class="h-full w-full bg-white p-2">
      <a-row :gutter="20">
        <a-col :sm="10" :md="10" :lg="10" :xl="4">
          <ProjectSelect
            v-model:projectId="queryParams.projectId"
            v-model:versionId="queryParams.versionId"
            @change="changeProject"
          />
          <a-menu
            v-model:selectedKeys="queryParams.moduleIds"
            mode="vertical"
            :items="moduleList"
            @click="changeModule"
          />
        </a-col>
        <a-col :sm="14" :md="14" :lg="14" :xl="20">
          <div>
            <div style="width: 500px; margin: 0 auto">
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
                      <span style="margin-left: 2px"
                        >({{ payload.badge }})</span
                      >
                    </span>
                  </a-flex>
                </template>
              </a-segmented>
            </div>
          </div>

          <JsonViewer :value="queryParams" />
        </a-col>
      </a-row>
    </div>
  </Page>
</template>
