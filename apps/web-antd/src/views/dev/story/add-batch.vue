<script lang="ts" setup>
import type { StoryFace } from '#/types';
import { onMounted, reactive, ref } from 'vue';
import * as VTable from '@visactor/vtable';
import { Button, message } from 'ant-design-vue';
import { getDictList } from '#/dicts';
import { VbenButton, VbenButtonGroup, useVbenModal } from '@vben/common-ui';

import {
  DateEditor,
  InputEditor,
  SelectEditor,
  TextAreaEditor,
  UploadFileEditor,
  RichTextEditor,
} from '#/vtable';

defineOptions({
  name: 'AddBatchStory',
});

const {
  CHANGE_CELL_VALUE,
  COPY_DATA,
  PASTED_DATA,
  DROPDOWN_MENU_CLICK,
  DBLCLICK_CELL,
} = VTable.ListTable.EVENT_TYPE;

let ListTableApi: VTable.ListTable;

// 初始化为 10个空对象
const records = ref<StoryFace[]>();

const addRow = (installIndex?: number) => {
  ListTableApi.addRecord({} as StoryFace, installIndex);
};

const getRecords = () => {
  console.log(ListTableApi.records);
};

const columns: VTable.ColumnsDefine = [
  {
    field: 'moduleTitle',
    title: '关联模块',
    width: 'auto',
    editor: new SelectEditor({
      options: getDictList('STORY_STATUS'),
      change: (rowData: StoryFace, e: any) => {
        rowData.moduleId = e.value;
      },
    }),
  },
  {
    field: 'version',
    title: '关联版本',
    width: 'auto',
    editor: new SelectEditor({
      options: getDictList('STORY_STATUS'),
      change: (rowData: StoryFace, e: any) => {
        rowData.versionId = e.value;
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
    field: 'pmLink',
    title: '原型链接',
    width: 200,
    editor: new TextAreaEditor(),
  },

  {
    field: 'storyStatus',
    title: '需求状态',
    width: 'auto',
    editor: new SelectEditor({
      options: getDictList('STORY_STATUS'),
      change: (rowData: StoryFace, e: any) => {},
    }),
  },
  {
    field: 'storyType',
    title: '需求类别',
    width: 'auto',
    editor: new SelectEditor({
      options: getDictList('STORY_TYPE'),
      change: (rowData: StoryFace, e: any) => {},
    }),
  },
  {
    field: 'storyLevel',
    title: '优先级',
    width: 'auto',
    editor: new SelectEditor({
      options: getDictList('STORY_LEVEL'),
      change: (rowData: StoryFace, e: any) => {},
    }),
  },
  {
    field: 'storyRichText',
    title: '需求描述',
    width: 'auto',
    editor: new RichTextEditor(),
  },
  {
    field: 'files',
    title: '需求附件',
    width: 'auto',
    editor: new UploadFileEditor({
      maxCount: 10,
    }),
  },
];

const initTable = () => {
  ListTableApi = new VTable.ListTable(
    document.querySelector('#tableContainer') as HTMLDivElement,
    {
      records: records.value,
      columns,
      menu: {
        contextMenuItems: ['复制', '粘贴', '清空单元格', '删除行', '新增行'],
      },
      widthMode: 'standard',
      allowFrozenColCount: 3,
      frozenColCount: 3,
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
        /* 开启快捷键粘贴，与浏览器的快捷键一致。粘贴生效仅针对配置了编辑 editor 的单元格 */
        pasteValueToCell: true,
      },
      editor: '', // 配置一个空的编辑器，以遍能粘贴到单元格中
    },
  );

  for (let i = 0; i < 10; i++) {
    addRow();
  }

  /* ListTableApi.on(CHANGE_CELL_VALUE, (params) => {
    console.log('编辑单元格数据', params);
  }); */
  /* ListTableApi.on(DBLCLICK_CELL, (params) => {
    console.log('双击单元格', params);
  }); */

  /* ListTableApi.on(COPY_DATA, (params) => {
    console.log('已触发复制', params);
  }); */
  /* ListTableApi.on(PASTED_DATA, (params) => {
    console.log('已触发粘贴', params);
    // ListTableApi.renderWithRecreateCells();
  }); */
  ListTableApi.on(DROPDOWN_MENU_CLICK, (params) => {
    switch (params.menuKey) {
      case '删除行': {
        ListTableApi.deleteRecords([params.row - 1]);
        // message.error('未实现,请使用Ctrl+D删除');
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
            const columnConfig = columns[item.col];

            const data = ListTableApi.getRecordByCell(item.col, item.row);
            // @ts-ignore
            columnConfig?.editor?.changeCallback?.(data, {
              label: '',
              value: '',
            });
            data[item.field as string] = '';
            ListTableApi.updateRecords([data], [item.row - 1]);
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

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    modalApi.close();
  },
  onOpened() {
    initTable();
  },
});
</script>
<template>
  <Modal class="w-[1258px]">
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
        <VbenButton @click="getRecords()"> 获取数据 </VbenButton>
      </VbenButtonGroup>
    </template>
  </Modal>
</template>

<style scoped>
/* Add your styles here */
</style>
