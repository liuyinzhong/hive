<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseClassificationApi } from '#/api/base';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { confirm, Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Empty, message, Segmented } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteClassificationNodeApi,
  deleteClassificationSystemApi,
  getClassificationNodeTreeApi,
  getClassificationSystemListApi,
} from '#/api/base';
import { $t } from '#/locales';

import {
  useClassificationNodeColumns,
  useClassificationNodeSearchSchema,
} from './node/data';
import NodeFormModal from './node/form-modal.vue';
import SystemFormDrawer from './system/form-drawer.vue';

const { hasAccessByCodes } = useAccess();

/** 体系列表 */
const systems = ref<BaseClassificationApi.ClassificationSystem[]>([]);
/** 当前选中的体系ID */
const selectedSystemId = ref<string>('');
/** 当前选中的体系对象 */
const selectedSystem = computed(() =>
  systems.value.find(
    (s) => s.classificationSystemId === selectedSystemId.value,
  ),
);

/** Segmented 选项（label + value） */
const systemSegmentOptions = computed(() =>
  systems.value.map((s) => ({
    label: s.systemName,
    value: s.classificationSystemId,
  })),
);

/** 体系表单抽屉 */
const [SystemDrawer, systemDrawerApi] = useVbenDrawer({
  connectedComponent: SystemFormDrawer,
  destroyOnClose: true,
});

/** 节点表单弹窗 */
const [NodeModal, nodeModalApi] = useVbenModal({
  connectedComponent: NodeFormModal,
  destroyOnClose: true,
});

/** 节点树表 */
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useClassificationNodeSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridOptions: {
    columns: useClassificationNodeColumns(),
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues) => {
          if (!selectedSystem.value) return [];
          return getClassificationNodeTreeApi({
            ...formValues,
            systemCode: selectedSystem.value.systemCode,
          });
        },
      },
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'classificationNodeId',
      transform: false,
    },
  } as VxeTableGridOptions<BaseClassificationApi.ClassificationNode>,
});

/** 加载全量体系列表，默认选中第一个 */
async function loadSystems(preserveSelectedId?: string) {
  systems.value = await getClassificationSystemListApi();
  if (
    preserveSelectedId &&
    systems.value.some((s) => s.classificationSystemId === preserveSelectedId)
  ) {
    selectedSystemId.value = preserveSelectedId;
    return;
  }
  selectedSystemId.value =
    systems.value.length > 0 ? systems.value[0]!.classificationSystemId : '';
}

/** 选中体系变化时重新加载节点树 */
watch(selectedSystemId, async (newId) => {
  if (!newId) return;
  await nextTick();
  gridApi.query();
});

onMounted(() => loadSystems());

/** 按 ID 查找体系名称 */
function getSystemName(id: string) {
  return (
    systems.value.find((s) => s.classificationSystemId === id)?.systemName ?? ''
  );
}

/** 新增体系 */
function openCreateSystem() {
  systemDrawerApi.setData({}).open();
}

/** 编辑体系 */
function openEditSystem(id: string) {
  const system = systems.value.find((s) => s.classificationSystemId === id);
  if (!system) return;
  systemDrawerApi
    .setData({
      classificationSystemId: system.classificationSystemId,
      rowVersion: system.rowVersion,
    })
    .open();
}

/** 删除体系（二次确认） */
function removeSystem(id: string) {
  const system = systems.value.find((s) => s.classificationSystemId === id);
  if (!system) return;
  confirm({
    beforeClose({ isConfirm }) {
      if (!isConfirm) return;
      return deleteClassificationSystemApi(system.classificationSystemId)
        .then(() => loadSystems())
        .then(() => {
          message.success($t('base.classification.deleteSuccess'));
          return true;
        });
    },
    content: $t('base.classification.systemDeleteConfirm', [
      system.systemName,
    ]),
    icon: 'question',
  }).catch(() => {
    // 用户取消，无需处理
  });
}

/** 体系操作成功后重新加载 */
async function onSystemSuccess() {
  await loadSystems(selectedSystemId.value);
}

/** 新增根节点 */
function openCreateNode() {
  if (!selectedSystem.value) return;
  nodeModalApi
    .setData({
      systemCode: selectedSystem.value.systemCode,
      classificationSystemId: selectedSystem.value.classificationSystemId,
    })
    .open();
}

/** 新增子节点 */
function openCreateChildNode(row: BaseClassificationApi.ClassificationNode) {
  nodeModalApi
    .setData({
      systemCode: selectedSystem.value?.systemCode,
      classificationSystemId: row.classificationSystemId,
      parentId: row.classificationNodeId,
    })
    .open();
}

/** 编辑节点 */
function openEditNode(row: BaseClassificationApi.ClassificationNode) {
  nodeModalApi
    .setData({
      systemCode: selectedSystem.value?.systemCode,
      ...row,
    })
    .open();
}

/** 删除节点 */
async function removeNode(row: BaseClassificationApi.ClassificationNode) {
  await deleteClassificationNodeApi(row.classificationNodeId);
  message.success($t('base.classification.deleteSuccess'));
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <SystemDrawer @success="onSystemSuccess" />
    <NodeModal @success="gridApi.query()" />

    <div class="flex h-full gap-2">
      <!-- 左侧：分类体系 -->
      <div class="bg-card flex w-[280px] shrink-0 flex-col rounded-md">
        <div class="border-b p-3">
          <div class="mb-2 text-sm font-medium">
            {{ $t('base.classification.systemTitle') }}
          </div>
          <Button
            v-if="hasAccessByCodes(['base:classificationSystem:create'])"
            type="primary"
            block
            @click="openCreateSystem"
          >
            <Plus class="size-4" />
            {{ $t('base.classification.systemCreate') }}
          </Button>
        </div>
        <div class="flex-1 overflow-auto p-2">
          <Segmented
            v-if="systems.length > 0"
            v-model:value="selectedSystemId"
            :options="systemSegmentOptions"
            block
            class="classification-system-segmented"
          >
            <template #labelRender="{ value }">
              <div class="group flex w-full items-center justify-between gap-2">
                <span class="flex-1 truncate">{{ getSystemName(value) }}</span>
                <div
                  v-if="
                    hasAccessByCodes([
                      'base:classificationSystem:update',
                      'base:classificationSystem:delete',
                    ])
                  "
                  class="flex items-center"
                  @click.stop
                >
                  <Button
                    v-if="
                      hasAccessByCodes(['base:classificationSystem:update'])
                    "
                    size="small"
                    type="text"
                    @click="openEditSystem(value)"
                  >
                    {{ $t('common.edit') }}
                  </Button>
                  <Button
                    v-if="
                      hasAccessByCodes(['base:classificationSystem:delete'])
                    "
                    size="small"
                    type="text"
                    danger
                    @click="removeSystem(value)"
                  >
                    {{ $t('common.delete') }}
                  </Button>
                </div>
              </div>
            </template>
          </Segmented>
          <Empty v-else :description="$t('base.classification.systemEmpty')" />
        </div>
      </div>

      <!-- 右侧：分类节点树表 -->
      <div class="bg-card flex-1 rounded-md">
        <Grid
          :table-title="
            selectedSystem
              ? $t('base.classification.nodeListWithTitle', [
                  selectedSystem.systemName,
                ])
              : $t('base.classification.selectSystemFirst')
          "
        >
          <template #toolbar-tools>
            <Button
              v-if="
                selectedSystem &&
                hasAccessByCodes(['base:classificationNode:create'])
              "
              type="primary"
              @click="openCreateNode"
            >
              <Plus class="size-5" />
              {{ $t('base.classification.nodeCreate') }}
            </Button>
          </template>
          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  auth: 'base:classificationNode:create',
                  icon: 'lucide:plus',
                  text: $t('base.classification.createChild'),
                  onClick: () => openCreateChildNode(row),
                },
                {
                  auth: 'base:classificationNode:update',
                  icon: 'lucide:edit',
                  text: $t('common.edit'),
                  onClick: () => openEditNode(row),
                },
              ]"
              :dropdown-actions="[
                {
                  auth: 'base:classificationNode:delete',
                  danger: true,
                  disabled: Boolean(row.children?.length),
                  icon: 'lucide:trash-2',
                  text: $t('common.delete'),
                  popConfirm: {
                    title: $t('base.classification.deleteConfirm', [
                      row.nodeName,
                    ]),
                    confirm: () => removeNode(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

<style scoped>
/* Segmented 垂直排列 */
.classification-system-segmented :deep(.ant-segmented-group) {
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.classification-system-segmented :deep(.ant-segmented-item) {
  justify-content: stretch;
  width: 100%;
}
</style>
