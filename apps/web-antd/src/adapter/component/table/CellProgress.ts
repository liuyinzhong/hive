import { Progress } from 'ant-design-vue';
import { h } from 'vue';

/**
 * vxe-table 自定义进度条单元格组件
 * 根据当前值和总值计算进度百分比，并显示不同颜色的进度条
 */
export default {
  /**
   * 渲染表格单元格
   * @param params - 行数据和列信息
   * @returns 渲染后的进度条组件
   */
  renderTableDefault(renderOpts: any, params: any) {
    const { row, column } = params;
    let percent = row[column.field] || 0;

    // 根据百分比设置进度条颜色
    const status = percent > 100 ? 'exception' : 'success';

    return h(Progress, {
      percent,
      status,
      showInfo: true,
      format: (e) => `${percent}%`,
      style: {
        width: '100%',
        paddingRight: '30px',
        margin: 0,
      },
    });
  },
};
