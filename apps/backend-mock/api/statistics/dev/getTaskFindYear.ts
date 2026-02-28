import { eventHandler, getQuery } from 'h3';
import { useResponseSuccess } from '~/utils/response';
import { mockTaskData } from '~/api/dev/task/list';

/**
 * 按月份分组统计任务数量
 * @param data 任务数据数组
 * @returns 12个月的统计数组
 */
function groupByMonth(data: any[]) {
  // 初始化12个月数组，默认为0
  const monthArray = new Array(12).fill(0);

  // 遍历数据，按月份统计
  data.forEach((item) => {
    const createDate = item.createDate;
    if (createDate) {
      // 从创建时间中提取月份 (格式: YYYY/MM/DD)
      const month = parseInt(createDate.split('/')[1]) - 1; // 转换为0-11的索引
      if (month >= 0 && month < 12) {
        monthArray[month] += item.actualHours;
      }
    }
  });

  return monthArray;
}

/**
 * 过滤指定年份的任务
 * @param data 任务数据数组
 * @param year 年份字符串 (格式: YYYY)
 * @returns 过滤后的数据
 */
function filterByYear(data: any[], year: string) {
  return data.filter((item) => {
    const createDate = item.createDate;
    if (createDate) {
      // 提取创建年份部分 (YYYY)
      const taskYear = createDate.split('/')[0];
      return taskYear === year;
    }
    return false;
  });
}

export default eventHandler(async (event) => {
  let listData = structuredClone(mockTaskData);

  const { year } = getQuery(event);

  // 过滤指定年份的数据并按月份分组
  const yearData = filterByYear(listData, year as string);
  const result = groupByMonth(yearData);

  // 计算最大值
  const max = Math.max(...result);

  return useResponseSuccess({
    list: result,
    max: max,
  });
});
