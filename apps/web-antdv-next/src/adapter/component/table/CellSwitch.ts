import { h } from 'vue';

import { message, Modal, Switch } from 'antdv-next';

import { $t } from '#/locales';

interface CellSwitchAttrs {
  onChange?: (
    newStatus: 0 | 1,
    row: Record<string, any>,
  ) => PromiseLike<unknown> | unknown;
}

interface CellSwitchRenderOptions {
  attrs?: CellSwitchAttrs;
  props?: Record<string, any>;
}

/**
 * 通用表格状态开关，固定使用 0 表示禁用、1 表示启用。
 * 用户确认后调用 cellRender.attrs.onChange；接口成功后更新单元格并提示操作成功。
 * 接口失败提示由统一请求拦截器处理，单元格保持原状态。
 */
export default {
  renderTableDefault(
    { attrs, props }: CellSwitchRenderOptions,
    { column, row }: { column: { field: string }; row: Record<string, any> },
  ) {
    const loadingKey = `__loading_${column.field}`;

    function confirmChange(newStatus: 0 | 1) {
      const statusText =
        newStatus === 1 ? $t('common.enabled') : $t('common.disabled');
      return new Promise<boolean>((resolve) => {
        Modal.confirm({
          content: $t('ui.actionMessage.statusChangeConfirm', [statusText]),
          onCancel: () => resolve(false),
          onOk: () => resolve(true),
        });
      });
    }

    async function handleChange(value: unknown) {
      const newStatus: 0 | 1 = value === 1 ? 1 : 0;
      if (!(await confirmChange(newStatus))) return;

      row[loadingKey] = true;
      try {
        await attrs?.onChange?.(newStatus, row);
        row[column.field] = newStatus;
        message.success($t('ui.actionMessage.operationSuccess'));
      } catch {
        // 接口错误提示由 requestClient 的统一错误拦截器处理。
      } finally {
        row[loadingKey] = false;
      }
    }

    return h(Switch, {
      ...props,
      checked: row[column.field],
      checkedChildren: $t('common.enabled'),
      checkedValue: 1,
      loading: row[loadingKey] ?? false,
      unCheckedChildren: $t('common.disabled'),
      unCheckedValue: 0,
      'onUpdate:checked': handleChange,
    });
  },
};
