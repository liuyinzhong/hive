<script lang="ts" setup>
import type { SystemDictApi } from '#/api/system';

import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { useSortable } from '@vben-core/composables';
import type { Sortable } from '@vben-core/composables';

import { getLocalDictList } from '#/dicts';
import { getUserListAllApi } from '#/api/system';

/**
 * 节点数据结构
 */
interface NodeItem {
  approval: boolean;
  businessType: string;
  label: string;
  nodeType: number;
  remark: string;
  sort: number;
  userId: string;
  value: string;
}

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 字典类型 */
  dictType: {
    type: String,
    required: true,
  },
  /** 业务类型 */
  businessType: {
    type: String,
    required: true,
  },
  /** v-model 绑定的节点数据 */
  modelValue: {
    type: Array as () => NodeItem[],
    default: () => [],
  },
});

/**
 * 组件事件定义
 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: NodeItem[]): void;
}>();

const selectedPanelRef = ref<HTMLElement | null>(null);
const alternativePanelRef = ref<HTMLElement | null>(null);

let selectedSortable: Sortable | null = null;
let alternativeSortable: Sortable | null = null;

/**
 * 负责人列表数据（组件内缓存，避免每个节点重复请求）
 */
const userList = ref<{ label: string; value: string }[]>([]);

/** 加载负责人列表 */
async function loadUserList() {
  try {
    const res = await getUserListAllApi();
    userList.value = (res || []).map((user: any) => ({
      label: user.realName || user.username || '',
      value: user.userId,
    }));
  } catch {
    userList.value = [];
  }
}

/**
 * 全部字典数据
 */
const allDictItems = computed<SystemDictApi.SystemDictFace[]>(() =>
  getLocalDictList(props.dictType),
);

/**
 * 已选节点数据
 */
const selectedNodes = ref<NodeItem[]>([]);

/**
 * 备选节点数据：字典中未被选中的节点
 */
const alternativeNodes = computed<SystemDictApi.SystemDictFace[]>(() => {
  const selectedValues = new Set(selectedNodes.value.map((n) => n.value));
  return allDictItems.value.filter(
    (item) => !selectedValues.has(String(item.value || ' ')),
  );
});

/**
 * 初始化已选节点数据
 */
function initSelectedNodes() {
  if (props.modelValue.length > 0) {
    selectedNodes.value = [...props.modelValue];
  } else {
    selectedNodes.value = allDictItems.value.map((item, index) => ({
      approval: false,
      businessType: props.businessType,
      label: item.label || '',
      nodeType: getNodeTypeByIndex(index, allDictItems.value.length),
      remark: item.remark || '',
      sort: index,
      userId: userList.value[0]?.value || '',
      value: String(item.value),
    }));
  }
}

/**
 * 根据索引计算节点类型
 * @param index 节点索引
 * @param total 节点总数
 * @returns 节点类型：0-开始节点、1-普通节点、2-审批节点、3-结束节点
 */
function getNodeTypeByIndex(index: number, total: number): number {
  if (index === 0) return 0;
  if (index === total - 1) return 3;
  return 1;
}

/**
 * 重新计算所有节点的 sort 和 nodeType
 * @description 根据节点位置和审批状态计算：首个为0、末尾为3、审批中为2、其余为1
 */
function recalculateNodes() {
  selectedNodes.value = selectedNodes.value.map((node, index, arr) => ({
    ...node,
    nodeType:
      index === 0 ? 0 : index === arr.length - 1 ? 3 : node.approval ? 2 : 1,
    sort: index,
  }));
}

/**
 * 触发 v-model 更新
 */
function emitUpdate() {
  recalculateNodes();
  emit(
    'update:modelValue',
    selectedNodes.value.map((node) => ({
      ...node,
      businessType: props.businessType,
    })),
  );
}

/**
 * 从字典项创建节点
 * @param dictItem 字典数据项
 * @returns 新节点
 */
function createNodeFromDict(dictItem: SystemDictApi.SystemDictFace): NodeItem {
  return {
    approval: false,
    businessType: props.businessType,
    label: dictItem.label || '',
    nodeType: 1,
    remark: dictItem.remark || '',
    sort: 0,
    userId: '',
    value: String(dictItem.value),
  };
}

/**
 * 删除指定索引的已选节点
 * @param index 节点索引
 */
function removeNode(index: number) {
  selectedNodes.value.splice(index, 1);
  emitUpdate();
  reinitSelectedSortable();
}

/**
 * 初始化已选节点面板的拖拽排序
 */
async function initSelectedSortable() {
  if (!selectedPanelRef.value) return;

  if (selectedSortable) {
    // 防御性判断：如果实例绑定的 DOM 元素还在，才进行销毁
    if ((selectedSortable as any).el) {
      selectedSortable.destroy();
    }
    selectedSortable = null; // 销毁后记得清空引用
  }

  const { initializeSortable } = useSortable(selectedPanelRef.value, {
    animation: 200,
    group: {
      name: 'nodeSteps',
      pull: true,
      put: true,
    },
    handle: '.drag-handle',
    onAdd: handleAddFromAlternative,
    onEnd: handleSelectedReorder,
  });

  selectedSortable = await initializeSortable();
}

/**
 * 重新初始化已选节点面板的排序
 */
async function reinitSelectedSortable() {
  await nextTick();
  await initSelectedSortable();
}

/**
 * 初始化备选节点面板的拖拽
 */
async function initAlternativeSortable() {
  if (!alternativePanelRef.value) return;
  if (alternativeSortable) {
    alternativeSortable?.destroy();
  }

  const { initializeSortable } = useSortable(alternativePanelRef.value, {
    animation: 200,
    group: {
      name: 'nodeSteps',
      pull: true,
      put: false,
    },
    sort: false,
  });

  alternativeSortable = await initializeSortable();
}

/**
 * 处理从备选面板拖入的节点
 * @param evt SortableJS 事件对象
 */
function handleAddFromAlternative(evt: any) {
  const value = evt.item?.dataset?.value;
  const newIndex = evt.newIndex;

  if (evt.item && evt.item.parentNode) {
    evt.item.parentNode.removeChild(evt.item);
  }

  if (value !== undefined) {
    const dictItem = allDictItems.value.find(
      (d) => String(d.value) === String(value),
    );
    if (dictItem) {
      const newNode = createNodeFromDict(dictItem);
      selectedNodes.value.splice(newIndex, 0, newNode);
      emitUpdate();
      nextTick(() => {
        initSelectedSortable();
      });
    }
  }
}

/**
 * 处理已选节点内部的排序变更
 * @param evt SortableJS 事件对象
 */
function handleSelectedReorder(evt: any) {
  const { oldIndex, newIndex } = evt;
  if (
    oldIndex !== undefined &&
    newIndex !== undefined &&
    oldIndex !== newIndex
  ) {
    const movedItem = selectedNodes.value.splice(oldIndex, 1)[0];
    selectedNodes.value.splice(newIndex, 0, movedItem as NodeItem);
    emitUpdate();
  }
}

/**
 * 更新节点负责人
 * @param index 节点索引
 * @param userId 新的负责人 ID
 */
function onUserChange(index: number, userId: string) {
  (selectedNodes.value[index] as NodeItem).userId = userId;
  emitUpdate();
}

/**
 * 更新节点审批状态
 * @param index 节点索引
 * @param checked 是否勾选审批
 */
function onApprovalChange(index: number, checked: boolean) {
  (selectedNodes.value[index] as NodeItem).approval = checked;
  emitUpdate();
}

/**
 * 监听 modelValue 外部变化，同步内部状态
 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal.length > 0) {
      selectedNodes.value = [...newVal];
      reinitSelectedSortable();
    }
  },
  { deep: true },
);

onMounted(async () => {
  await loadUserList();
  initSelectedNodes();
  emitUpdate();
  await nextTick();
  await initSelectedSortable();
  await initAlternativeSortable();
});

const activeKey = ref(['selected', 'alternative']);
</script>

<template>
  <a-collapse
    expand-icon-position="end"
    v-model:activeKey="activeKey"
    size="small"
  >
    <a-collapse-panel
      key="selected"
      :header="'已选节点' + '(' + selectedNodes.length + ')'"
    >
      <div ref="selectedPanelRef" class="flex flex-col gap-1">
        <div
          v-for="(item, index) in selectedNodes"
          :key="item.value"
          class="group relative flex items-center gap-2 rounded border-dashed border-1 border-gray-200 px-2 py-1.5 hover:border-blue-300"
        >
          <!-- 1号区域：排序序号（拖拽手柄） -->
          <div
            class="drag-handle flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 active:cursor-grabbing"
          >
            {{ index + 1 }}
          </div>

          <!-- 2号区域：中部信息区 -->
          <div class="flex flex-1 flex-col gap-1">
            <!-- 上层：标题 + tooltip -->
            <a-tooltip :title="item.remark || item.label">
              <span class="text-m font-bold">{{ item.label }}</span>
            </a-tooltip>
            <div class="flex gap-2">
              <a-tooltip title="审批节点">
                <a-checkbox
                  :checked="item.approval"
                  @change="
                    (e: any) => onApprovalChange(index, e.target.checked)
                  "
                >
                </a-checkbox>
              </a-tooltip>
              <a-select
                :value="item.userId || undefined"
                :options="userList"
                :allow-clear="true"
                placeholder="请选择负责人"
                size="small"
                style="flex: 1"
                show-search
                option-filter-prop="label"
                @change="(val: string) => onUserChange(index, val)"
              />
            </div>
          </div>

          <!-- 3号区域：删除按钮（悬浮时显示） -->
          <div
            class="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-red-500 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
            @click="removeNode(index)"
          >
            <span class="icon-[lucide--trash-2] text-sm"></span>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div
          v-if="selectedNodes.length === 0"
          class="py-4 text-center text-xs text-gray-400"
        >
          暂未选择节点，请从备选节点中拖拽添加
        </div>
      </div>
    </a-collapse-panel>

    <a-collapse-panel
      key="alternative"
      :header="'备选节点' + '(' + alternativeNodes.length + ')'"
    >
      <div ref="alternativePanelRef" class="flex flex-wrap gap-1.5">
        <a-tag
          v-for="item in alternativeNodes"
          :key="item.value"
          :data-value="item.value"
          class="cursor-grab active:cursor-grabbing"
          color="blue"
        >
          {{ item.label }}
        </a-tag>

        <div
          v-if="alternativeNodes.length === 0"
          class="py-2 text-center text-xs text-gray-400"
        >
          所有节点已添加
        </div>
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>
