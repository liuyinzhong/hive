import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemParamApi } from '#/api/system';

import { $t } from '#/locales';

/** 参数类型选项 */
const paramTypeOptions = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
];

/**
 * 新增/编辑表单配置
 * paramValue 根据 paramType 联动输入控件
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '参数ID',
      dependencies: {
        triggerFields: ['id'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'paramKey',
      label: $t('system.param.paramKey'),
      rules: 'required',
      defaultValue: '',
      componentProps: {
        placeholder: '例如 SYS_SESSION_TIMEOUT',
      },
    },
    {
      component: 'Select',
      fieldName: 'paramType',
      label: $t('system.param.paramType'),
      rules: 'required',
      defaultValue: 'string',
      componentProps: {
        options: paramTypeOptions,
      },
      dependencies: {
        triggerFields: ['paramType'],
        // 切换参数类型时,为 paramValue 设置合理的类型默认值(仅当当前值不匹配目标类型时)
        componentProps: (values: any, formApi: any) => {
          const type = values.paramType;
          if (type === 'boolean') {
            formApi.setFieldValue('paramValue', 'false');
          } else if (type === 'number') {
            formApi.setFieldValue('paramValue', 0);
          } else if (type === 'json') {
            formApi.setFieldValue('paramValue', '{}');
          } else if (type === 'string') {
            formApi.setFieldValue('paramValue', '');
          }
          return {};
        },
      },
    },
    {
      // number 类型:数字输入框
      component: 'InputNumber',
      fieldName: 'paramValue',
      label: $t('system.param.paramValue'),
      rules: 'required',
      defaultValue: 0,
      dependencies: {
        triggerFields: ['paramType'],
        show(values) {
          return values.paramType === 'number';
        },
      },
    },
    {
      // boolean 类型:开关
      component: 'RadioGroup',
      fieldName: 'paramValue',
      label: $t('system.param.paramValue'),
      defaultValue: 'false',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.param.true'), value: 'true' },
          { label: $t('system.param.false'), value: 'false' },
        ],
        optionType: 'button',
      },
      dependencies: {
        triggerFields: ['paramType'],
        show(values) {
          return values.paramType === 'boolean';
        },
      },
    },
    {
      // json 类型:多行文本
      component: 'Textarea',
      fieldName: 'paramValue',
      label: $t('system.param.paramValue'),
      rules: 'required',
      defaultValue: '',
      componentProps: {
        placeholder: '请输入合法 JSON',
        autoSize: { minRows: 3, maxRows: 8 },
      },
      dependencies: {
        triggerFields: ['paramType'],
        show(values) {
          return values.paramType === 'json';
        },
      },
    },
    {
      // string 类型:普通输入框(默认展示)
      component: 'Input',
      fieldName: 'paramValue',
      label: $t('system.param.paramValue'),
      rules: 'required',
      defaultValue: '',
      dependencies: {
        triggerFields: ['paramType'],
        show(values) {
          return !values.paramType || values.paramType === 'string';
        },
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'isPublic',
      label: $t('system.param.isPublic'),
      defaultValue: 1,
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.param.yes'), value: 1 },
          { label: $t('system.param.no'), value: 0 },
        ],
        optionType: 'button',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.param.remark'),
      defaultValue: '',
      componentProps: {
        autoSize: { minRows: 2, maxRows: 4 },
      },
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'paramKey',
      label: $t('system.param.paramKey'),
      componentProps: {
        allowClear: true,
        placeholder: '模糊搜索',
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'paramType',
      label: $t('system.param.paramType'),
      componentProps: {
        allowClear: true,
        options: paramTypeOptions,
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'isPublic',
      label: $t('system.param.isPublic'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.param.yes'), value: 1 },
          { label: $t('system.param.no'), value: 0 },
        ],
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数形式返回,响应语言切换重新翻译表头
 */
export function useColumns(): VxeTableGridOptions<SystemParamApi.SystemParamFace>['columns'] {
  return [
    {
      field: 'paramKey',
      title: $t('system.param.paramKey'),
      align: 'left',
      minWidth: 200,
      sortable: true,
      sortBy: 'paramKey',
    },
    {
      field: 'paramValue',
      title: $t('system.param.paramValue'),
      align: 'left',
      minWidth: 180,
    },
    {
      field: 'paramType',
      title: $t('system.param.paramType'),
      align: 'left',
      width: 110,
      sortable: true,
      sortBy: 'paramType',
      slots: { default: 'paramType' },
    },
    {
      field: 'isPublic',
      title: $t('system.param.isPublic'),
      align: 'center',
      width: 100,
      sortable: true,
      sortBy: 'isPublic',
      slots: { default: 'isPublic' },
    },
    {
      field: 'remark',
      title: $t('system.param.remark'),
      align: 'left',
      minWidth: 120,
    },
    {
      field: 'updateDate',
      title: $t('system.param.updateDate'),
      width: 180,
      sortable: true,
      sortBy: 'updateDate',
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.param.operation'),
      width: 160,
    },
  ];
}
