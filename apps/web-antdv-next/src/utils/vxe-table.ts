/** VxeTable 相关工具函数 */
/** VxeTable 相关工具函数 */
/** VxeTable 相关工具函数 */

/**
 * @description 格式化排序参数
 * @param sorts 排序数组
 * @returns 格式化后的排序字符串 avatar,desc;username,desc
 */
export function formatVxeTableSorts(sorts: any[]) {
  return sorts.map((a: any) => `${a.field},${a.order}`).join(';');
}

/**
 * @description 格式化选中列参数
 * @param columns 列数组
 * @returns 格式化后的选中列参数数组
 */
export function formatVxeTableColumns(columns: any[]) {
  return columns
    .filter((a: any) => a.checked)
    .map((a: any) => ({
      field: a.field,
      title: a.title,
      width: a.width,
    }));
}
