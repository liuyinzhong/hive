import { Switch } from 'ant-design-vue';
import { h } from 'vue';
import { $t } from '#/locales';

/**
 * 单元格开关组件
 * @description 用于渲染单元格中的开关，根据值和配置选项渲染不同的开关样式
 * @param {Object} props - 组件属性，包含开关的颜色、样式等
 * @param {any} value - 单元格的值，用于匹配配置选项中的值
 * @param {Object} row - 行数据，用于获取单元格的值
 * @param {Object} column - 列配置，用于获取单元格的字段名
 * @returns {VNode} - 渲染后的标签节点
 *
 * 可配置开关开启、关闭前的弹窗提醒/参考角色管理页面
 * 可继承 antdv 的 Switch 组件属性
 */

export default {
  renderTableDefault(
    {
      attrs,
      props,
    }: { attrs?: Record<string, any>; props?: Record<string, any> },
    { column, row }: { column: { field: string }; row: Record<string, any> },
  ) {
    const loadingKey = `__loading_${column.field}`;
    const finallyProps = {
      checkedChildren: $t('common.enabled'),
      checkedValue: 1,
      unCheckedChildren: $t('common.disabled'),
      unCheckedValue: 0,
      ...props,
      checked: row[column.field],
      loading: row[loadingKey] ?? false,
      'onUpdate:checked': onChange,
    };
    async function onChange(newVal: any) {
      row[loadingKey] = true;
      try {
        const result = await attrs?.beforeChange?.(newVal, row);
        if (result !== false) {
          row[column.field] = newVal;
        }
      } finally {
        row[loadingKey] = false;
      }
    }
    return h(Switch, finallyProps);
  },
};
