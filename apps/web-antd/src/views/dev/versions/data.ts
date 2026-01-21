import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { $t } from '#/locales';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import {
  getLastVersion,
  getProjectsList,
  type SystemVersionApi,
} from '#/api/dev';
import { changeVersionType } from '#/utils/versionExtendApi';
import { z } from '#/adapter/form';

/** 新增表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'versionId',
      dependencies: {
        show() {
          return false;
        },
        triggerFields: ['versionId'],
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '项目',
      rules: 'required',
      componentProps: () => {
        return {
          api: () => getProjectsList(),
          labelField: 'projectTitle',
          valueField: 'projectId',
          autoSelect: 'first',
        };
      },
      dependencies: {
        triggerFields: ['versionId'],
        disabled(ctx, e) {
          return ctx.versionId ? true : false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'pordVersion',
      label: '线上版本号',
      componentProps: {
        readonly: true,
        bordered: false,
      },
      dependencies: {
        triggerFields: ['projectId'],
        show(ctx, e) {
          return ctx.versionId ? false : true;
        },
        componentProps: async (ctx, e) => {
          if (!ctx.projectId) {
            return {};
          }
          const lastVersion: any = await getLastVersion({
            projectId: ctx.projectId,
          });
          e.setFieldValue('pordVersion', lastVersion.version);
          return {};
        },
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'versionType',
      label: '更新类型',
      rules: 'required',
      componentProps: {
        options: getDictList('VERSION_TYPE'),
      },
      defaultValue: '20',
      dependencies: {
        triggerFields: ['versionId', 'pordVersion'],
        componentProps: (ctx, e) => {
          if (!ctx.pordVersion) {
            return {};
          }
          e.setFieldValue(
            'version',
            changeVersionType(ctx.pordVersion, ctx.versionType),
          );
          return {};
        },
        disabled(ctx, e) {
          return ctx.versionId ? true : false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'version',
      label: '版本号',
      rules: z
        .string()
        .min(1, { message: '请输入版本号' })
        .refine((value) => /^\d+\.\d+\.\d+$/.test(value), {
          message: '格式：x.y.z，x/y/z 为非负整数',
        }),
      dependencies: {
        triggerFields: ['versionId', 'versionType'],
        disabled(ctx, e) {
          return ctx.versionId ? true : false;
        },
        componentProps: (ctx, e) => {
          if (!ctx.pordVersion) {
            return {};
          }
          const newVersion = changeVersionType(
            ctx.pordVersion,
            ctx.versionType,
          );
          e.setFieldValue('version', newVersion);
          return {};
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'releaseStatus',
      label: '发布状态',
      rules: 'required',
      defaultValue: '0',
      disabled: false,
      componentProps: {
        options: getDictList('RELEASE_STATUS'),
      },
    },

    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
    },
    {
      component: 'RangePicker',
      fieldName: 'timeArr',
      label: '起止时间',
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      fieldName: 'projectId',
      label: '项目',
      componentProps: {
        api: () => getProjectsList(),
        labelField: 'projectTitle',
        valueField: 'projectId',
        allowClear: true,
      },
    },
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'version',
      label: '迭代版本',
    },
    {
      component: 'ApiSelect',
      fieldName: 'releaseStatus',
      label: '发布状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        api: () => getDictList('RELEASE_STATUS'),
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemVersionApi.SystemVersion>,
): VxeTableGridOptions<SystemVersionApi.SystemVersion>['columns'] {
  return [
    {
      field: 'version',
      title: '迭代版本',
    },
    {
      field: 'remark',
      title: '备注',
    },
    {
      field: 'versionType',
      title: '更新类型',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'VERSION_TYPE',
        },
      },
    },
    {
      field: 'releaseStatus',
      title: '发布状态',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'RELEASE_STATUS',
        },
      },
    },
    {
      field: 'startDate',
      title: '预计开始时间',
    },
    {
      field: 'endDate',
      title: '预计结束时间',
    },
    {
      field: 'releaseDate',
      title: '发布时间',
    },
    {
      field: 'creatorName',
      title: '创建人',
    },
    {
      align: 'right',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 110,
      cellRender: {
        attrs: {
          nameField: 'version',
          nameTitle: '版本号',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit', // 默认的编辑按钮
            text: '编辑',
          },
          {
            code: 'delete', // 默认的删除按钮
          },
        ],
      },
    },
  ];
}
