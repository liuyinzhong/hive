import { h } from 'vue';

import CellProgress from '#/components/CellProgress/index.vue';
/**
 * vxe-table 自定义进度条单元格组件
 * 根据当前值和总值计算进度百分比，并显示不同颜色的进度条
 */
export default {
  renderTableDefault(renderOpts: any, params: any) {
    const { row, column } = params;
    const percent = row[column.field] || 0;
    return h(CellProgress, {
      value: percent,
    });
  },
};
