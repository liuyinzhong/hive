import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken, compareVersion } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem: Record<string, any> = {
      storyId: faker.string.uuid(),
      pid: null,
      storyTitle: faker.lorem.word(),
      storyNum: i,
      creatorName: faker.person.fullName(),
      creatorId: faker.string.uuid(),
      storyRichText: faker.lorem.paragraph(),
      pmLink: faker.internet.url(),
      storyRemark: faker.lorem.word(),
      files: '',
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
      versionId: faker.string.uuid(),
      version: '1.0.0',
      moduleId: faker.string.uuid(),
      moduleTitle: faker.helpers.arrayElement([
        '医生端',
        '患者端',
        'EXE端',
        '商户管理端',
        '平台管理端',
        '药店端',
      ]),
      source: faker.helpers.arrayElement(['0', '1']),
      updateDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
      createDate: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2025-01-01' }),
      ),
    };
    dataList.push(dataItem);
  }

  return dataList;
}

export const mockData = generateMockDataList(20);

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
