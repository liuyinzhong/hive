import { type VbenFormSchema } from '#/adapter/form';
import { type DevModuleApi } from '#/api/dev';
import { type OnActionClickFn } from '#/adapter/vxe-table';
import { type VxeTableGridOptions } from '@vben/plugins/vxe-table';
import { upload_file } from '#/api/examples/upload';
/** 新增项目表单配置 */
export function useFormProjectSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      label: '项目标题',
      fieldName: 'projectTitle',
      rules: 'required',
      componentProps: {
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'Textarea',
      label: '项目描述',
      fieldName: 'description',
      rules: 'required',
      componentProps: {
        maxlength: 150,
      },
    },
    {
      component: 'Upload',
      componentProps: {
        // 更多属性见：https://ant.design/components/upload-cn
        accept: '.png,.jpg,.jpeg',
        // 自动携带认证信息
        customRequest: upload_file,
        disabled: false,
        maxCount: 1,
        multiple: false,
        showUploadList: true,
        // 上传列表的内建样式，支持四种基本样式 text, picture, picture-card 和 picture-circle
        listType: 'picture-card',
      },
      fieldName: 'projectLogo',
      label: '项目logo',
      renderComponentContent: () => {
        return {
          default: () => '请选择',
        };
      },
      rules: 'required',
    },
  ];
}

/** 新增模块表单配置 */
export function useFormModuleSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      label: '关联项目id',
      fieldName: 'projectId',
      rules: 'required',
      dependencies: {
        triggerFields: ['projectId'],
        show: false,
      },
    },
    {
      component: 'Input',
      label: '模块标题',
      fieldName: 'moduleTitle',
      rules: 'required',
      componentProps: {
        maxlength: 10,
        showCount: true,
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<DevModuleApi.DevModuleFace>,
): VxeTableGridOptions<DevModuleApi.DevModuleFace>['columns'] {
  return [
    {
      field: 'sort',
      title: '排序',
      dragSort: true,
      width: 70,
    },
    {
      field: 'moduleTitle',
      title: '项目模块',
    },
    {
      field: 'operation',
      fixed: 'right',
      title: '操作',
      width: 100,
      cellRender: {
        attrs: {
          nameField: 'moduleTitle',
          nameTitle: '项目模块',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
          },
        ],
      },
    },
  ];
}
