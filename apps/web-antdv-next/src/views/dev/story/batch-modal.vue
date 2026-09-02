<script lang="ts" setup>
import type { DevStoryApi } from '#/api/dev';

import { useVbenModal, VbenButton, VbenButtonGroup } from '@vben/common-ui';

import * as VTable from '@visactor/vtable';
import { message } from 'antdv-next';

import { getModulesListApi, getVersionsListApi } from '#/api/dev';
import { createStorysApi } from '#/api/dev/story';
import { getLocalDictList, getLocalDictText } from '#/dicts';
import { InputEditor, SelectEditor } from '#/vtable';

defineOptions({
  name: 'StoryBatchFormModel',
});

const emit = defineEmits<{
  success: [];
}>();

const { DROPDOWN_MENU_CLICK } = VTable.ListTable.EVENT_TYPE;

let ListTableApi: VTable.ListTable;

/** 列表查询项目,所有行继承,不在表格中展示 */
let inheritedProjectId = '';

/** 新增行预填:项目继承列表查询,状态/类型/优先级默认 0 */
const createDefaultRow = (): Partial<DevStoryApi.DevStoryFace> => ({
  projectId: inheritedProjectId,
  storyStatus: '0',
  storyType: '0',
  storyLevel: '0',
  storyStatusTitle: getLocalDictText('STORY_STATUS', '0'),
  storyTypeTitle: getLocalDictText('STORY_TYPE', '0'),
  storyLevelTitle: getLocalDictText('STORY_LEVEL', '0'),
});

const addRow = (installIndex?: number) => {
  ListTableApi.addRecord(createDefaultRow(), installIndex);
};

const columns: VTable.ColumnsDefine = [
  {
    field: 'version',
    title: '迭代版本',
    width: 'auto',
    editor: new SelectEditor({
      api: (e: any) =>
        getVersionsListApi({
          projectId: e.projectId || '',
          page: 1,
          pageSize: 100,
        }),
      labelField: 'version',
      valueField: 'versionId',
      resultField: 'items',
      change: (rowData: DevStoryApi.DevStoryFace, e: any) => {
        rowData.versionId = e.versionId || '';
      },
    }),
  },
  {
    field: 'moduleTitle',
    title: '关联模块',
    width: 'auto',
    editor: new SelectEditor({
      api: (e: any) => getModulesListApi({ projectId: e.projectId || '' }),
      labelField: 'moduleTitle',
      valueField: 'moduleId',
      resultField: '',
      change: (rowData: DevStoryApi.DevStoryFace, e: any) => {
        rowData.moduleId = e.moduleId || '';
      },
    }),
  },
  {
    field: 'storyTitle',
    title: '需求标题',
    width: 300,
    editor: new InputEditor(),
  },
  {
    field: 'storyStatusTitle',
    title: '需求状态',
    width: 'auto',
    editor: new SelectEditor({
      options: getLocalDictList('STORY_STATUS'),
      labelField: 'label',
      valueField: 'value',
      change: (rowData: DevStoryApi.DevStoryFace, e: any) => {
        rowData.storyStatus = e.value ?? '';
        rowData.storyStatusTitle = e.label ?? '';
      },
    }),
  },
  {
    field: 'storyTypeTitle',
    title: '需求类型',
    width: 'auto',
    editor: new SelectEditor({
      options: getLocalDictList('STORY_TYPE'),
      change: (rowData: DevStoryApi.DevStoryFace, e: any) => {
        rowData.storyType = e.value ?? '';
        rowData.storyTypeTitle = e.label ?? '';
      },
    }),
  },
  {
    field: 'storyLevelTitle',
    title: '优先级',
    width: 'auto',
    editor: new SelectEditor({
      options: getLocalDictList('STORY_LEVEL'),
      change: (rowData: DevStoryApi.DevStoryFace, e: any) => {
        rowData.storyLevel = e.value ?? '';
        rowData.storyLevelTitle = e.label ?? '';
      },
    }),
  },
];

const initTable = () => {
  ListTableApi = new VTable.ListTable(
    document.querySelector('#tableContainer') as HTMLDivElement,
    {
      records: [],
      columns,
      menu: {
        contextMenuItems: ['复制', '粘贴', '清空单元格', '删除行', '新增行'],
      },
      widthMode: 'standard',
      allowFrozenColCount: 0,
      frozenColCount: 0,
      autoWrapText: true,
      hover: {
        highlightMode: 'cross',
      },
      overscrollBehavior: 'none',
      keyboardOptions: {
        /* 开启这个配置的话，如果当前是在编辑中的单元格，方向键可以移动到下个单元格并进入编辑状态，而不是编辑文本内字符串的光标移动 。 */
        moveEditCellOnArrowKeys: true,
        /* 开启快捷键复制，与浏览器的快捷键一致。 */
        copySelected: true,
        /* 开启快捷键粘贴，与浏览器的快捷键一致。粘贴生效仅针对配置了 editor 的单元格 */
        pasteValueToCell: true,
      },
      editor: '', // 配置一个空的编辑器，以遍能粘贴到单元格中
    },
  );

  for (let i = 0; i < 10; i++) {
    addRow();
  }

  ListTableApi.on(DROPDOWN_MENU_CLICK, (params) => {
    switch (params.menuKey) {
      case '删除行': {
        ListTableApi.deleteRecords([params.row - 1]);
        break;
      }
      case '复制': {
        message.error('未实现,请使用Ctrl+C');
        break;
      }
      case '新增行': {
        addRow(params.row);
        break;
      }
      case '清空单元格': {
        /* 获取已选中的单元格信息 */
        const _list: any = ListTableApi.getSelectedCellInfos();
        _list.forEach((cells: any[]) => {
          cells.forEach((item: any) => {
            const data = ListTableApi.getRecordByCell(item.col, item.row);
            ListTableApi.changeCellValue(item.col, item.row, '');
            const editor: any = ListTableApi.getEditor(item.col, item.row);
            editor && editor.changeCallback && editor.changeCallback(data, {});
          });
        });

        break;
      }
      case '粘贴': {
        message.error('未实现,请使用Ctrl+V');
        break;
      }
    }
  });
};

/**
 * 校验并收集行数据:完全空行跳过,部分填写行校验必填(标题/版本/模块)
 */
function collectRows() {
  const records = (ListTableApi.records ?? []) as DevStoryApi.DevStoryFace[];
  const rows: Record<string, any>[] = [];
  for (let i = 0; i < records.length; i++) {
    const row = records[i]!;
    const isEmpty = !row.storyTitle && !row.versionId && !row.moduleId;
    if (isEmpty) continue;

    const missing: string[] = [];
    if (!row.versionId) missing.push('迭代版本');
    if (!row.moduleId) missing.push('关联模块');
    if (!row.storyTitle) missing.push('需求标题');
    if (missing.length > 0) {
      return { error: `第${i + 1}行缺少：${missing.join('、')}` };
    }
    rows.push({
      storyTitle: row.storyTitle,
      storyStatus: row.storyStatus || '0',
      storyType: row.storyType || '0',
      storyLevel: row.storyLevel || '0',
      source: '0',
      projectId: inheritedProjectId,
      versionId: row.versionId,
      moduleId: row.moduleId,
    });
  }
  return { rows };
}

const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data: any = modalApi.getData();
      inheritedProjectId = data?.projectId || '';
    }
  },
  onOpened() {
    initTable();
  },
  async onConfirm() {
    const { rows, error } = collectRows();
    if (error) {
      message.warning(error);
      return;
    }
    if (!rows || rows.length === 0) {
      message.warning('请至少填写一条需求');
      return;
    }
    modalApi.lock();
    try {
      await createStorysApi(rows);
      message.success('批量创建成功');
      modalApi.close();
      emit('success');
    } catch {
      // 错误由请求拦截器处理
    } finally {
      modalApi.unlock();
    }
  },
});
</script>
<template>
  <Modal class="w-[900px]">
    <div class="h-[600px] w-full">
      <div
        id="tableContainer"
        class="h-full w-full"
        style="position: relative"
      ></div>
    </div>

    <template #center-footer>
      <VbenButtonGroup v-bind="{ gap: 10 }" :border="true">
        <VbenButton @click="addRow()"> 添加行 </VbenButton>
      </VbenButtonGroup>
    </template>
  </Modal>
</template>

<style scoped>
/* Add your styles here */
</style>
