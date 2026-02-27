<script lang="ts" setup>
import addFormModal from './add-modal.vue';
import addModuleModal from './add-moduleModal.vue';
import { EllipsisText } from '@vben/common-ui';
import { Page, useVbenModal } from '@vben/common-ui';
import { onMounted, reactive, ref, h } from 'vue';
import { useColumns } from './data';
import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';
import {
  type DevModuleApi,
  type DevProjectApi,
  getProjectsList,
  getModulesList,
} from '#/api/dev';
import type { Recordable } from '@vben/types';

// #region 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  showSearchForm: false,
  formOptions: {},
  gridOptions: {
    pagerConfig: {
      enabled: false,
    },
    rowConfig: {
      drag: true,
    },
    toolbarConfig: {
      enabled: false,
    },
    height: 600,
    columns: useColumns(onActionClick),
    proxyConfig: {
      autoLoad: false,
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getModulesList({
            projectId: activeProjectId.value,
          });
        },
      },
    },
  } as any,
  gridEvents: {
    rowDragstart: (e: any) => {},
    rowDragend: ({ oldRow, _index }: any) => {
      console.log(
        '排序后' + oldRow.moduleTitle + '在' + _index.newIndex + '位',
      );
    },
  },
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<DevModuleApi.DevModuleFace>) {
  switch (code) {
    case 'delete': {
      break;
    }
    case 'edit': {
      openAddModuleModal(row);
      break;
    }
  }
}
//#endregion

const items = ref<DevProjectApi.DevProjectFace[]>([]);

onMounted(async () => {
  const res = await getProjectsList();
  items.value = res || [];
  if (items.value.length > 0) {
    activeProjectId.value = items.value[0]?.projectId || '';
    gridApi.query();
  }
});

let activeProjectId = ref<any>('');

const setActiveProjectId = (id: string) => {
  activeProjectId.value = id;
  gridApi.query();
};

//#region 弹窗

const [AddProjectModal, AddProjectModalApi] = useVbenModal({
  title: '新增项目',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

function createProject() {
  AddProjectModalApi.open();
}

function editProject(row: any) {
  AddProjectModalApi.setData(row).open();
}

const [AddModuleModal, AddModuleModalApi] = useVbenModal({
  title: '新增模块',
  connectedComponent: addModuleModal,
  destroyOnClose: true,
});

function openAddModuleModal(row: any) {
  AddModuleModalApi.setData(row).open();
}
//#endregion
</script>

<template>
  <Page auto-content-height>
    <a-row :gutter="24">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="16">
        <a-card>
          <template #title>
            <div class="flex items-center justify-between">
              <span class="ml-2 text-lg font-medium">项目</span>
              <a-button type="primary" @click="createProject">
                创建项目
              </a-button>
            </div>
          </template>

          <a-card-grid v-for="item in items" :key="item.projectId">
            <div
              class="cursor-pointer"
              @click="setActiveProjectId(item.projectId)"
            >
              <div class="flex items-center">
                <a-avatar
                  :size="45"
                  :src="item.projectLogo"
                  style="min-width: 45px"
                >
                </a-avatar>
                <span class="ml-4 text-lg font-medium">
                  {{ item.projectTitle }}
                </span>
              </div>
              <div class="mt-4">
                <EllipsisText :max-width="500" :line="2" tooltipWhenEllipsis>
                  {{ item.description }}
                </EllipsisText>
              </div>
              <div class="flex justify-between">
                <span>
                  <a-badge
                    v-if="item.projectId === activeProjectId"
                    status="processing"
                  />
                </span>
                <span @click.stop="">
                  <a-space warp>
                    <a-button type="dashed" size="small"> 统计 </a-button>
                    <a-button
                      type="dashed"
                      size="small"
                      @click="editProject(item)"
                    >
                      编辑
                    </a-button>
                  </a-space>
                </span>
              </div>
            </div>
          </a-card-grid>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8">
        <a-card title="模块">
          <template #extra>
            <a-button
              type="primary"
              @click="openAddModuleModal({ projectId: activeProjectId.value })"
            >
              添加
            </a-button>
          </template>
          <Grid />
        </a-card>
      </a-col>
    </a-row>
    <AddProjectModal />
    <AddModuleModal />
  </Page>
</template>
