<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DevModuleApi, DevProjectApi } from '#/api/dev';

import { onMounted, ref } from 'vue';

import { EllipsisText, Page, useVbenModal } from '@vben/common-ui';
import { Card, CardGrid, Button, Space, Tag, Row, Col } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  getModulesListApi,
  getProjectsListApi,
  deleteModuleApi,
} from '#/api/dev';

import addFormModal from './add-modal.vue';
import addModuleModal from './add-moduleModal.vue';
import { useColumns } from './data';

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
    columns: useColumns(),
    proxyConfig: {
      autoLoad: false,
      ajax: {
        // eslint-disable-next-line unused-imports/no-unused-vars
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getModulesListApi({
            projectId: activeProjectId.value,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevModuleApi.DevModuleFace>,
  gridEvents: {
    rowDragstart: (e: any) => {},
    /* rowDragend: ({ _oldRow, _index }: any) => {
      console.log(
        '排序后' + oldRow.moduleTitle + '在' + _index.newIndex + '位',
      );
    }, */
  },
});
// #endregion

const items = ref<DevProjectApi.DevProjectFace[]>([]);

onMounted(async () => {
  init();
});

let activeProjectId = ref<any>('');

const setActiveProjectId = (id: string) => {
  activeProjectId.value = id;
  gridApi.query();
};

// #region 弹窗

const [AddProjectModal, AddProjectModalApi] = useVbenModal({
  title: '新增项目',
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

async function init() {
  const res = await getProjectsListApi();
  items.value = res || [];
  if (items.value.length > 0) {
    activeProjectId.value = items.value[0]?.projectId || '';
  }
  gridApi.query();
}

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

async function deleteModule(id: string) {
  await deleteModuleApi([id]);
  gridApi.query();
}

function openAddModuleModal(row: any) {
  AddModuleModalApi.setData(row).open();
}
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Row :gutter="24">
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="16">
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <span class="ml-2 text-lg font-medium">项目</span>
              <Button type="primary" @click="createProject"> 创建项目 </Button>
            </div>
          </template>

          <CardGrid v-for="item in items" :key="item.projectId">
            <div
              class="cursor-pointer"
              @click="setActiveProjectId(item.projectId)"
            >
              <div class="flex items-center">
                <Avatar
                  :size="45"
                  :src="item.projectLogo"
                  style="min-width: 45px"
                />
                <span class="ml-4 text-lg font-medium">
                  {{ item.projectTitle }}
                </span>
              </div>
              <div class="mt-4">
                <EllipsisText :max-width="500" :line="2" tooltip-when-ellipsis>
                  {{ item.description }}
                </EllipsisText>
              </div>
              <div class="flex justify-between">
                <span>
                  <Badge
                    v-if="item.projectId === activeProjectId"
                    status="processing"
                  />
                </span>
                <span @click.stop="">
                  <Space warp>
                    <Button type="dashed" size="small"> 统计 </Button>
                    <Button
                      type="dashed"
                      size="small"
                      @click="editProject(item)"
                    >
                      编辑
                    </Button>
                  </Space>
                </span>
              </div>
            </div>
          </CardGrid>
        </Card>
      </Col>
      <Col :xs="24" :sm="24" :md="24" :lg="24" :xl="8">
        <Card title="模块">
          <template #extra>
            <Button
              type="primary"
              @click="openAddModuleModal({ projectId: activeProjectId })"
            >
              添加
            </Button>
          </template>
          <Grid>
            <template #action="{ row }">
              <VbenTableAction
                :actions="[
                  {
                    text: '编辑',
                    icon: 'lucide:edit',
                    onClick: () => openAddModuleModal(row),
                  },
                ]"
                :dropdown-actions="[
                  {
                    text: '删除',
                    icon: 'lucide:trash-2',
                    danger: true,
                    popConfirm: {
                      title: $t('ui.actionMessage.deleteConfirm', [
                        row.moduleTitle,
                      ]),
                      confirm: () => deleteModule(row.moduleId),
                    },
                  },
                ]"
                align="center"
              />
            </template>
          </Grid>
        </Card>
      </Col>
    </Row>
    <AddProjectModal @success="init" />
    <AddModuleModal @success="gridApi.query" />
  </Page>
</template>
