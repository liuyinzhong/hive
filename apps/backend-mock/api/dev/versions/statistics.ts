import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockTaskData } from '../task/list';
import { mockBugData } from '../bug/list';
import { mockStoryData } from '../story/list';
import { mockModuleData } from '../module/list';

/** 任务类型映射 */
const TASK_TYPE_MAP: Record<number, string> = {
  0: '开发任务',
  10: '测试任务',
  20: 'UI设计',
  30: '规划任务',
  40: 'Bug修复',
  50: '代码审查',
  60: '部署发布',
  70: '文档编写',
  80: '会议相关',
  90: '请假调休',
};

/** Bug级别映射 */
const BUG_LEVEL_MAP: Record<number, string> = {
  0: 'P0-低优先级',
  10: 'P1-中优先级',
  20: 'P2-高优先级',
  30: 'P3-紧急致命',
};

/** Bug类型映射 */
const BUG_TYPE_MAP: Record<number, string> = {
  0: '功能缺陷',
  10: '逻辑缺陷',
  20: '数据问题',
  30: '界面问题',
  40: '性能问题',
  50: '安全问题',
  60: '兼容性问题',
  70: '文档问题',
  80: '配置问题',
  90: '部署问题',
  100: '改进建议',
  110: '回归问题',
};

/** Bug来源映射 */
const BUG_SOURCE_MAP: Record<number, string> = {
  0: '内部测试',
  10: '用户反馈',
  20: '监控系统',
  30: '代码审查',
  40: '自动化测试',
  50: '线上事故',
  60: '第三方依赖',
  70: '遗留系统',
  80: '回归问题',
  90: '性能测试',
  100: '安全扫描',
  110: 'UI/UX走查',
  120: '兼容性测试',
};

/** 需求类型映射 */
const STORY_TYPE_MAP: Record<number, string> = {
  0: '新功能',
  10: '功能优化',
  20: 'Bug修复',
  30: '技术债务',
  40: 'UI/UX改进',
  50: '性能优化',
  60: '安全相关',
  70: '合规性需求',
  80: '运维需求',
  90: '技术调研',
  100: '文档编写',
};

/** 需求来源映射 */
const STORY_SOURCE_MAP: Record<number, string> = {
  0: '产品规划',
  10: '业务反馈',
};

/** 需求状态映射 */
const STORY_STATUS_MAP: Record<number, string> = {
  0: '待评审',
  10: '开发中',
  20: '测试中',
  30: '产品验收中',
  31: '业务验收中',
  99: '已关闭',
};

/** 辅助函数：按字段对数组分组计数 */
function countByField<T>(
  arr: T[],
  field: keyof T,
  labelMap: Record<number, string>,
): Array<{ name: string; value: number }> {
  const map: Record<string, number> = {};
  for (const item of arr) {
    const key = item[field] as unknown as number;
    const name = labelMap[key] ?? `未知(${key})`;
    map[name] = (map[name] ?? 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { versionId } = getQuery(event);

  if (!versionId) {
    return useResponseSuccess(null);
  }

  // 过滤当前版本的数据
  const stories = mockStoryData.filter((item) => item.versionId === versionId);
  const tasks = mockTaskData.filter((item) => item.versionId === versionId);
  const bugs = mockBugData.filter((item) => item.versionId === versionId);
  // Bug 需过滤已确认是 bug 的数据（bugConfirmStatus === 10）
  const confirmedBugs = bugs.filter((b) => b.bugConfirmStatus === 10);

  // ---- 数量汇总 ----
  const storyTotal = stories.length;
  const taskTotal = tasks.length;
  const bugTotal = confirmedBugs.length;
  const storyDone = stories.filter((s) => s.storyStatus === 99).length;
  const taskDone = tasks.filter((t) => t.taskStatus === 99).length;
  const bugFixed = confirmedBugs.filter((b) => b.bugStatus === 99).length;

  const summary = {
    storyTotal,
    storyDone,
    taskTotal,
    taskDone,
    bugTotal,
    bugFixed,
  };

  // ---- 开发进度趋势（折线图，按日期分组） ----
  const dateTaskDoneMap: Record<string, number> = {};
  const dateBugFixedMap: Record<string, number> = {};
  for (const task of tasks) {
    if (task.taskStatus === 99 && task.createDate) {
      const day = String(task.createDate).slice(0, 10);
      dateTaskDoneMap[day] = (dateTaskDoneMap[day] ?? 0) + 1;
    }
  }
  for (const bug of confirmedBugs) {
    if (bug.bugStatus === 99 && bug.createDate) {
      const day = String(bug.createDate).slice(0, 10);
      dateBugFixedMap[day] = (dateBugFixedMap[day] ?? 0) + 1;
    }
  }
  const allDates = [
    ...new Set([
      ...Object.keys(dateTaskDoneMap),
      ...Object.keys(dateBugFixedMap),
    ]),
  ]
    .toSorted()
    .slice(-30);
  const progressTrend = {
    dates: allDates,
    taskDone: allDates.map((d) => dateTaskDoneMap[d] ?? 0),
    bugFixed: allDates.map((d) => dateBugFixedMap[d] ?? 0),
  };

  // ============================================================
  // 第一部分：人员维度占比
  // ============================================================

  // 1.1 人员任务数量占比
  const personTaskMap: Record<string, number> = {};
  for (const task of tasks) {
    const name = task.userName || task.realName || '未分配';
    personTaskMap[name] = (personTaskMap[name] ?? 0) + 1;
  }
  const personTaskDist = Object.entries(personTaskMap).map(([name, value]) => ({
    name,
    value,
  }));

  // 1.2 人员参与需求数量占比（通过 userList 展开）
  const personStoryMap: Record<string, number> = {};
  for (const story of stories) {
    const users: any[] = story.userList ?? [];
    if (users.length === 0) {
      personStoryMap['未分配'] = (personStoryMap['未分配'] ?? 0) + 1;
    } else {
      for (const u of users) {
        const name = u.realName || '未知';
        personStoryMap[name] = (personStoryMap[name] ?? 0) + 1;
      }
    }
  }
  const personStoryDist = Object.entries(personStoryMap).map(
    ([name, value]) => ({ name, value }),
  );

  // 1.3 人员工时占比（actualHours）
  const personHoursMap: Record<string, number> = {};
  for (const task of tasks) {
    const name = task.userName || task.realName || '未分配';
    personHoursMap[name] =
      (personHoursMap[name] ?? 0) + (task.actualHours ?? 0);
  }
  const personHoursDist = Object.entries(personHoursMap).map(
    ([name, value]) => ({
      name,
      value: Math.round(value * 10) / 10,
    }),
  );

  // 1.4 模块占比（任务数量按模块分布）
  const moduleTaskMap: Record<string, number> = {};
  for (const task of tasks) {
    // 如果任务有模块 id 则尝试匹配模块名称
    let name = task.moduleTitle || null;
    if (!name && task.moduleId) {
      const mod = mockModuleData.find((m) => m.moduleId === task.moduleId);
      name = mod?.moduleTitle ?? null;
    }
    name = name || '未分模块';
    moduleTaskMap[name] = (moduleTaskMap[name] ?? 0) + 1;
  }
  const moduleDist = Object.entries(moduleTaskMap).map(([name, value]) => ({
    name,
    value,
  }));

  // ============================================================
  // 第二部分：需求面板
  // ============================================================

  // 需求类型分布
  const storyTypeDist = countByField(
    stories,
    'storyType' as any,
    STORY_TYPE_MAP,
  );

  // 需求来源分布
  const storySourceDist = countByField(
    stories,
    'source' as any,
    STORY_SOURCE_MAP,
  );

  // 需求状态漏斗图（按状态顺序排列）
  const storyStatusOrder = [0, 10, 20, 30, 31, 99];
  const storyStatusCountMap: Record<number, number> = {};
  for (const s of stories) {
    const st: number = s.storyStatus ?? 0;
    storyStatusCountMap[st] = (storyStatusCountMap[st] ?? 0) + 1;
  }
  const storyStatusFunnel = storyStatusOrder
    .filter((v) => storyStatusCountMap[v] !== undefined)
    .map((v) => ({
      name: STORY_STATUS_MAP[v] ?? `状态${v}`,
      value: storyStatusCountMap[v],
    }));

  // ============================================================
  // 第三部分：任务面板
  // ============================================================

  // 任务类型分布
  const taskTypeDist = countByField(tasks, 'taskType' as any, TASK_TYPE_MAP);

  // 任务工作量（柱状图，按类型分组）
  const taskWorkloadMap: Record<
    string,
    { planHours: number; actualHours: number }
  > = {};
  for (const task of tasks) {
    const name = TASK_TYPE_MAP[task.taskType] ?? `类型${task.taskType}`;
    if (!taskWorkloadMap[name])
      taskWorkloadMap[name] = { planHours: 0, actualHours: 0 };
    taskWorkloadMap[name].planHours += task.planHours ?? 0;
    taskWorkloadMap[name].actualHours += task.actualHours ?? 0;
  }
  const taskWorkloadCategories = Object.keys(taskWorkloadMap);
  const taskWorkload = {
    categories: taskWorkloadCategories,
    planHours: taskWorkloadCategories.map(
      (k) => Math.round(taskWorkloadMap[k].planHours * 10) / 10,
    ),
    actualHours: taskWorkloadCategories.map(
      (k) => Math.round(taskWorkloadMap[k].actualHours * 10) / 10,
    ),
  };

  // ============================================================
  // 第四部分： Bug 面板（已确认 bug）
  // ============================================================

  const bugTypeDist = countByField(
    confirmedBugs,
    'bugType' as any,
    BUG_TYPE_MAP,
  )
    .toSorted((a, b) => b.value - a.value)
    .slice(0, 8);

  const bugLevelDist = countByField(
    confirmedBugs,
    'bugLevel' as any,
    BUG_LEVEL_MAP,
  );

  const bugSourceDist = countByField(
    confirmedBugs,
    'bugSource' as any,
    BUG_SOURCE_MAP,
  )
    .toSorted((a, b) => b.value - a.value)
    .slice(0, 8);

  // Bug 修复人数量分布
  const bugFixerMap: Record<string, number> = {};
  for (const bug of confirmedBugs) {
    const name = bug.realName || '未分配';
    bugFixerMap[name] = (bugFixerMap[name] ?? 0) + 1;
  }
  const bugFixerDist = Object.entries(bugFixerMap)
    .map(([name, value]) => ({ name, value }))
    .toSorted((a, b) => b.value - a.value);

  return useResponseSuccess({
    summary,
    progressTrend,
    // 人员维度
    personTaskDist,
    personStoryDist,
    personHoursDist,
    moduleDist,
    // 需求面板
    storyTypeDist,
    storySourceDist,
    storyStatusFunnel,
    // 任务面板
    taskTypeDist,
    taskWorkload,
    // Bug 面板
    bugTypeDist,
    bugLevelDist,
    bugSourceDist,
    bugFixerDist,
  });
});
