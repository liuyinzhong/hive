/**
 * @description 格式化排序参数
 * @param sorts 排序数组
 * @returns 格式化后的排序字符串 avatar,desc;username,desc
 */
export function formatSorts(sorts: any[]) {
  return sorts.map((a: any) => `${a.field},${a.order}`).join(';');
}
