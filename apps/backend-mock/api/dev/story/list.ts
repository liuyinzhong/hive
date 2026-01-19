import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';
import { mockUserData } from '~/api/system/user/list';
import { mockProjectData } from '../project/list';
import { mockModuleData } from '../module/list';
import { mockVersionData } from '../versions/list';
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

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    let projectId = faker.helpers.arrayElement(projectIds);

    let projectInfo: any = mockProjectData.find(
      (item) => item.projectId === projectId,
    );

    let versionInfo: any = mockVersionData.find(
      (item) => item.projectId === projectId,
    );
    let moduleInfo: any = mockModuleData.find(
      (item) => item.projectId === projectId,
    );

    const dataItem: Record<string, any> = {
      storyId: faker.string.uuid(),
      pid: null,
      storyTitle: faker.lorem.word(),
      storyNum: i,
      creatorName: faker.person.fullName(),
      creatorId: faker.string.uuid(),
      storyRichText: faker.lorem.paragraph(),
      files:
        'https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp',
      storyType: faker.helpers.arrayElement([
        '0',
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
      ]),
      storyStatus: faker.helpers.arrayElement([
        '0',
        '10',
        '20',
        '30',
        '31',
        '99',
      ]),
      storyLevel: faker.helpers.arrayElement(['0', '1', '2']),
      versionId: versionInfo.versionId,
      version: versionInfo.version,
      projectId: projectInfo.projectId,
      projectTitle: projectInfo.projectTitle,
      moduleId: moduleInfo?.moduleId || null,
      moduleTitle: moduleInfo?.moduleTitle || null,
      source: faker.helpers.arrayElement(['0', '1']),
      updateDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      /* 关联用户列表，使用 faker 随机 1~5个值 */
      userList: faker.helpers.arrayElements(
        mockUserData
          .filter((item) => item.disabled === 0)
          .map((item) => ({
            userId: item.userId,
            avatar: item.avatar,
            realName: item.realName,
          })),
        faker.number.int({ min: 1, max: 5 }),
      ),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  let listData = structuredClone(mockData);

  const { page = 1, pageSize = 20 } = getQuery(event);

  /* 分页响应 */
  return usePageResponseSuccess(page as string, pageSize as string, listData);

  /* 全量响应 */
  // return useResponseSuccess(listData);
});
