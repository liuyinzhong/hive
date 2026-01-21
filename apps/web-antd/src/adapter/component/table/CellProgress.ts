import { Progress } from 'ant-design-vue';
import { h } from 'vue';

/**
 * vxe-table 自定义进度条单元格组件
 * 根据当前值和总值计算进度百分比，并显示不同颜色的进度条
 */
export default {
  /**
   * 渲染表格单元格
   * @param renderOpts - 渲染选项，包含组件属性和事件
   * @param params - 行数据和列信息
   * @returns 渲染后的进度条组件
   */
  renderTableDefault(renderOpts: any, params: any) {
    const { props } = renderOpts;
    const { row } = params;

    // 从组件属性中获取字段名
    const { totalNumField, currentNumField } = props;

    // 从行数据中获取对应字段的值
    const total = Number(row[totalNumField] || 0);
    const current = Number(row[currentNumField] || 0);

    // 计算进度百分比，避免除以0
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    // 根据百分比设置进度条颜色
    const status = percent > 100 ? 'exception' : 'success';

    return h(Progress, {
      percent,
      status,
      showInfo: true,
      format: (e) => `${percent}%`,
      style: {
        width: '100%',
        paddingRight: '10px',
        margin: 0,
      },
    });
  },
};
