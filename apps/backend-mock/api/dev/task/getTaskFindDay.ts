import { eventHandler, getQuery } from 'h3';
import { useResponseSuccess } from '~/utils/response';
import { mockTaskData } from '~/api/dev/task/list';

/**
 * 按小时分组统计任务数量
 * @param data 任务数据数组
 * @returns 24小时的统计数组
 */
function groupByHour(data: any[]) {
  // 初始化24小时数组，默认为0
  const hourArray = new Array(24).fill(0);

  // 遍历数据，按小时统计
  data.forEach((item) => {
    const createDate = item.createDate;
    if (createDate) {
      // 从创建时间中提取小时
      const hour = parseInt(createDate.split(' ')[1].split(':')[0]);
      if (hour >= 0 && hour < 24) {
        hourArray[hour]++;
      }
    }
  });

  return hourArray;
}

/**
 * 过滤指定日期范围内的任务
 * @param data 任务数据数组
 * @param dateStr 日期字符串 (格式: YYYY/MM/DD)
 * @returns 过滤后的数据
 */
function filterByDate(data: any[], dateStr: string) {
  return data.filter((item) => {
    const createDate = item.createDate;
    if (createDate) {
      // 提取创建日期部分 (YYYY/MM/DD)
      const taskDate = createDate.split(' ')[0];
      return taskDate === dateStr;
    }
    return false;
  });
}

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockTaskData);

  const { date1, date2 } = getQuery(event);

  // 过滤 date1 日期的数据并按小时分组
  const date1Data = filterByDate(listData, date1 as string);
  const date1Result = groupByHour(date1Data);

  // 过滤 date2 日期的数据并按小时分组
  const date2Data = filterByDate(listData, date2 as string);
  const date2Result = groupByHour(date2Data);

  // 计算 date1 和 date2 数组的最大值
  const allValues = [...date1Result, ...date2Result];
  const max = Math.max(...allValues);

  return useResponseSuccess({
    date1: date1Result,
    date2: date2Result,
    max: max,
  });
});
