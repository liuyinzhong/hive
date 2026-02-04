import { Tag } from 'ant-design-vue';
import { get } from '@vben/utils';
import { h } from 'vue';
import { $t } from '#/locales';
import { objectOmit } from '@vueuse/core';

/**
 * 单元格标签组件
 * @description 用于渲染单元格中的标签，根据值和配置选项渲染不同的标签样式
 * @param {Object} props - 组件属性，包含标签的颜色、样式等
 * @param {Object} options - 配置选项，包含标签的文本和值
 * @param {any} value - 单元格的值，用于匹配配置选项中的值
 * @param {Object} row - 行数据，用于获取单元格的值
 * @param {Object} column - 列配置，用于获取单元格的字段名
 * @returns {VNode} - 渲染后的标签节点
 *
 * 默认为 success/error 标签 可通过 options 自定义标签样式
 * 可继承 antdv 的 Tag 组件属性
 */

export default {
  renderTableDefault(
    { options, props }: { options?: any; props?: any },
    { column, row }: { column: any; row: any },
  ) {
    const value = get(row, column.field);
    if (column.field == 'color') {
      return h(
        Tag,
        {
          ...props,
          color: value,
        },
        { default: () => value },
      );
    } else {
      const tagOptions = options ?? [
        { color: 'success', label: $t('common.enabled'), value: 1 },
        { color: 'error', label: $t('common.disabled'), value: 0 },
      ];
      const tagItem = tagOptions.find(
        (item: { value: any }) => item.value === value,
      );
      return h(
        Tag,
        {
          ...props,
          ...objectOmit(tagItem ?? {}, ['label']),
        },
        { default: () => tagItem?.label ?? value },
      );
    }
  },
};
