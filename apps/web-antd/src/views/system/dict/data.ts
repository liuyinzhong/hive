import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import { $t } from '#/locales';
import { type SystemDictApi } from '#/api/system';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'pid',
      label: '父级',
      disabled: true,
      formItemClass: 'col-span-2 md:col-span-2',
      dependencies: {
        show(values) {
          return !!values.pid;
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
          return !!values.pid;
        },
        rules(values) {
          if (!values.pid) {
            return 'required';
          }
          return null;
        },
        triggerFields: ['pid'],
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
      fieldName: 'disabled',
      label: '禁用状态',
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
export function useColumns(
  onActionClick?: OnActionClickFn<SystemDictApi.SystemDict>,
): VxeTableGridOptions<SystemDictApi.SystemDict>['columns'] {
  return [
    {
      align: 'left',
      field: 'label',
      title: $t('system.dict.dictName'),
      treeNode: true,
      width: 150,
    },
    {
      field: 'value',
      title: $t('system.dict.value'),
      align: 'left',
    },
    {
      field: 'type',
      title: $t('system.dict.type'),
      align: 'left',
    },
    {
      cellRender: { name: 'CellSwitch' },
      field: 'disabled',
      title: $t('system.dept.status'),
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
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'label',
          nameTitle: $t('system.dict.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
            disabled: (row: SystemDictApi.SystemDict) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 200,
    },
  ];
}
