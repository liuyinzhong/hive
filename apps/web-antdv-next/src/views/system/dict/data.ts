import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { SystemDictApi } from '#/api/system';

import { updateDictStatusApi } from '#/api/system';
import { $t } from '#/locales';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '字典表主键id',
      disabled: true,
      dependencies: {
        show(_values) {
          return false;
        },
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'pid',
      label: '父级字典表主键id',
      disabled: true,
      formItemClass: 'col-span-2 md:col-span-2',
      dependencies: {
        show(_values) {
          return false;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: '字典类型',
      formItemClass: 'col-span-2 md:col-span-2',
      defaultValue: '',
      dependencies: {
        disabled(values) {
          if (values.id || values.pid) {
            return true;
          }
          return false;
        },
        rules(values) {
          if (!values.pid) {
            return 'required';
          }
          return null;
        },
        triggerFields: ['pid', 'id'],
      },
    },
    {
      component: 'Input',
      fieldName: 'label',
      label: '字典标题',
      rules: 'required',
      defaultValue: '',
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: '字典值',
      rules: 'required',
      defaultValue: '',
      dependencies: {
        show(values) {
          /* 只有当有父级时才显示 */
          return !!values.pid;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'ColorSelect',
      fieldName: 'color',
      label: '颜色',
      defaultValue: 'default',
      componentProps: {},
      dependencies: {
        show(values) {
          return !!values.pid;
        },
        triggerFields: ['pid'],
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
      formItemClass: 'col-span-2 md:col-span-2',
      defaultValue: '',
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'value',
      label: '字典值',
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'type',
      label: '字典类型',
      componentProps: {
        allowClear: true,
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(): VxeTableGridOptions<SystemDictApi.SystemDictFace>['columns'] {
  return [
    {
      align: 'left',
      field: 'label',
      title: $t('system.dict.dictName'),
      treeNode: true,
      sortable: true,
      width: 150,
    },
    {
      field: 'value',
      title: $t('system.dict.value'),
      align: 'left',
      sortable: true,
    },
    {
      field: 'type',
      title: $t('system.dict.type'),
      align: 'left',
      sortable: true,
    },
    {
      cellRender: {
        attrs: {
          onChange: (newStatus: 0 | 1, row: SystemDictApi.SystemDictFace) =>
            updateDictStatusApi(row.id as string, { status: newStatus }),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },

    {
      field: 'remark',
      title: $t('system.dept.remark'),
      align: 'left',
    },
    {
      field: 'color',
      title: 'color',
      cellRender: { name: 'CellTag' },
    },
    {
      field: 'createDate',
      title: $t('system.dept.createDate'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.dept.operation'),
      width: 200,
    },
  ];
}
