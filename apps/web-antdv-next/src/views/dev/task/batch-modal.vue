<script lang="ts" setup>
import type { DevTaskApi } from '#/api/dev';

import { useVbenModal } from '@vben/common-ui';

import * as VTable from '@visactor/vtable';
import dayjs from 'dayjs';
import { Button, message } from 'antdv-next';

import { getProjectUsersApi } from '#/api/dev';
import { getStoryListApi } from '#/api/dev/story';
import { createTasksApi } from '#/api/dev/task';
import { getLocalDictList, getLocalDictText } from '#/dicts';
import { DateEditor, InputEditor, NumberEditor, SelectEditor } from '#/vtable';

defineOptions({
  name: 'TaskBatchFormModel',
});

const emit = defineEmits<{
  success: [];
}>();

const { DROPDOWN_MENU_CLICK } = VTable.ListTable.EVENT_TYPE;

let ListTableApi: VTable.ListTable;

/** 列表查询项目,所有行继承,不在表格中展示 */
let inheritedProjectId = '';

/** 新增行预填:项目继承列表查询,类型/状态默认 0,工时默认 1,开始为当天 00:00:00、结束为当天 23:59:59 */
const createDefaultRow = (): Partial<DevTaskApi.DevTaskFace> => {
  const today = dayjs().format('YYYY-MM-DD');
  return {
    projectId: inheritedProjectId,
    planHours: 1,
    startDate: `${today} 00:00:00`,
    endDate: `${today} 23:59:59`,
    taskType: '0',
    taskStatus: '0',
    taskTypeTitle: getLocalDictText('TASK_TYPE', '0'),
    taskStatusTitle: getLocalDictText('TASK_STATUS', '0'),
  };
};

const addRow = (installIndex?: number) => {
  ListTableApi.addRecord(createDefaultRow(), installIndex);
};

const columns: VTable.ColumnsDefine = [
  {
    field: 'storyTitle',
    title: '关联需求',
    width: 220,
    editor: new SelectEditor({
      api: (e: any) =>
        getStoryListApi({
          projectId: e.projectId || '',
          page: 1,
          pageSize: 100,
        }),
      labelField: 'storyTitle',
      valueField: 'storyId',
      resultField: 'items',
      change: (rowData: DevTaskApi.DevTaskFace, e: any) => {
        rowData.storyId = e.storyId || '';
        rowData.storyTitle = e.storyTitle || '';
      },
    }),
  },
  {
    field: 'taskTitle',
    title: '任务标题',
    width: 220,
    editor: new InputEditor(),
  },
  {
    field: 'userName',
    title: '执行人',
    width: 110,
    editor: new SelectEditor({
      api: (e: any) => getProjectUsersApi(e.projectId || ''),
      labelField: 'realName',
      valueField: 'userId',
      change: (rowData: DevTaskApi.DevTaskFace, e: any) => {
        rowData.userId = e.userId || '';
        rowData.userName = e.realName || '';
      },
    }),
  },
  {
    field: 'planHours',
    title: '计划工时',
    width: 100,
    editor: new NumberEditor({ min: 0.1, precision: 2 }),
  },
  {
    field: 'startDate',
    title: '开始时间',
    width: 130,
    // 显示为日期,写值为当天 00:00:00
    editor: new DateEditor({
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    }),
  },
  {
    field: 'endDate',
    title: '结束时间',
    width: 130,
    // 显示为日期,写值为当天 23:59:59
    editor: new DateEditor({
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      time: '23:59:59',
    }),
  },
  {
    field: 'taskTypeTitle',
    title: '任务类型',
    width: 'auto',
    editor: new SelectEditor({
      options: getLocalDictList('TASK_TYPE'),
      labelField: 'label',
      valueField: 'value',
      change: (rowData: DevTaskApi.DevTaskFace, e: any) => {
        rowData.taskType = e.value ?? '';
        rowData.taskTypeTitle = e.label ?? '';
      },
    }),
  },
  {
    field: 'taskStatusTitle',
    title: '任务状态',
    width: 'auto',
    editor: new SelectEditor({
      options: getLocalDictList('TASK_STATUS'),
      labelField: 'label',
      valueField: 'value',
      change: (rowData: DevTaskApi.DevTaskFace, e: any) => {
        rowData.taskStatus = e.value ?? '';
        rowData.taskStatusTitle = e.label ?? '';
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
      allowFrozenColCount: 2,
      frozenColCount: 2,
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
 * 校验并收集行数据:完全空行跳过,部分填写行校验必填(标题/执行人/工时/起止时间)
 */
function collectRows() {
  const records = (ListTableApi.records ?? []) as DevTaskApi.DevTaskFace[];
  const rows: Record<string, any>[] = [];
  for (let i = 0; i < records.length; i++) {
    const row = records[i]!;
    const isEmpty = !row.taskTitle && !row.userId && !row.storyId;
    if (isEmpty) continue;

    const missing: string[] = [];
    if (!row.taskTitle) missing.push('任务标题');
    if (!row.userId) missing.push('执行人');
    const planHours = Number(row.planHours);
    if (!row.planHours || Number.isNaN(planHours)) missing.push('计划工时');
    if (!row.startDate) missing.push('开始时间');
    if (!row.endDate) missing.push('结束时间');
    if (missing.length > 0) {
      return { error: `第${i + 1}行缺少：${missing.join('、')}` };
    }
    if (String(row.endDate) < String(row.startDate)) {
      return { error: `第${i + 1}行结束时间必须大于或等于开始时间` };
    }
    rows.push({
      taskTitle: row.taskTitle,
      userId: row.userId,
      planHours,
      startDate: row.startDate,
      endDate: row.endDate,
      taskType: row.taskType || '0',
      taskStatus: row.taskStatus || '0',
      projectId: inheritedProjectId,
      storyId: row.storyId || undefined,
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
      message.warning('请至少填写一条任务');
      return;
    }
    modalApi.lock();
    try {
      await createTasksApi(rows);
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
  <Modal class="w-[1150px]">
    <div class="h-[600px] w-full">
      <div
        id="tableContainer"
        class="h-full w-full"
        style="position: relative"
      ></div>
    </div>

    <template #prepend-footer>
      <Button @click="addRow()">添加行</Button>
    </template>
  </Modal>
</template>

<style scoped>
/* Add your styles here */
</style>
