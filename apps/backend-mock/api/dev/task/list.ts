import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockUserData } from '~/api/system/user/list';
import { mockProjectData } from '../project/list';
import { mockModuleData } from '../module/list';
import { mockVersionData } from '../versions/list';
import { mockStoryData } from '../story/list';
const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

let projectIds = mockProjectData.map((item) => item.projectId);
let storyIds = mockStoryData.map((item) => item.storyId);
let userIds = mockUserData.map((item) => item.userId);

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    let userId = faker.helpers.arrayElement(userIds);
    let userInfo: any =
      mockUserData.find((item) => item.userId === userId) || {};

    let storyId = faker.helpers.arrayElement(storyIds);
    let storyInfo: any =
      mockStoryData.find((item) => item.storyId === storyId) || {};

    let projectId = faker.helpers.arrayElement(projectIds);
    let projectInfo: any =
      mockProjectData.find((item) => item.projectId === projectId) || {};

    let versionInfo: any =
      mockVersionData.find((item) => item.projectId === projectId) || {};
    let moduleInfo: any =
      mockModuleData.find((item) => item.projectId === projectId) || {};

    const dataItem: Record<string, any> = {
      taskId: faker.string.uuid(),
      pid: null,
      storyId: storyInfo.storyId,
      storyTitle: storyInfo.storyTitle,
      moduleId: moduleInfo?.moduleId || null,
      moduleTitle: moduleInfo?.moduleTitle || null,
      versionId: versionInfo.versionId,
      version: versionInfo.version,
      projectId: projectInfo.projectId,
      projectTitle: projectInfo.projectTitle,
      taskTitle: faker.lorem.sentence(),
      taskNum: i,
      taskRichText: faker.lorem.paragraph(),
      taskStatus: faker.helpers.arrayElement(['0', '10', '99']),
      taskType: faker.helpers.arrayElement([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
      ]),
      planHours: faker.number.int({ min: 1, max: 10 }),
      actualHours: faker.number.int({ min: 1, max: 10 }),
      endDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      startDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      creatorId: userInfo.userId,
      creatorName: userInfo.realName,
      userId: userInfo.userId,
      userName: userInfo.realName,
      avatar: userInfo.avatar,
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockTaskData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockTaskData);

  const {
    page = 1,
    pageSize = 20,
    projectId,
    versionId,
    taskTitle,
    taskStatus,
  } = getQuery(event);

  if (projectId) {
    listData = listData.filter((item) => item.projectId === projectId);
  }
  if (versionId) {
    listData = listData.filter((item) => item.versionId === versionId);
  }
  if (taskTitle) {
    listData = listData.filter((item) => item.taskTitle.includes(taskTitle));
  }
  if (taskStatus) {
    listData = listData.filter((item) => item.taskStatus === taskStatus);
  }

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
