import type { BugFace } from '#/types';

import { faker } from '@faker-js/faker';

import {
  BUG_ENV,
  BUG_LEVEL,
  BUG_SOURCE,
  BUG_STATUS,
  BUG_TYPE,
} from '#/dicts/data/bug';

export const getTestData = (pageSize: number) => {
  const data: BugFace[] = [];
  for (let i = 0; i < pageSize; i++) {
    data.push({
      bugId: 'xxx',
      bugTitle: 'bug1',
      bugNum: 100_001,
      bugRichText: faker.lorem.sentence(),
      bugStatus: faker.helpers.arrayElement(
        BUG_STATUS.map((item) => item.value),
      ),
      bugLevel: faker.helpers.arrayElement(BUG_LEVEL.map((item) => item.value)),
      bugEnv: faker.helpers.arrayElement(BUG_ENV.map((item) => item.value)),
      bugSource: faker.helpers.arrayElement(
        BUG_SOURCE.map((item) => item.value),
      ),
      bugType: faker.helpers.arrayElement(BUG_TYPE.map((item) => item.value)),
      avatar: 'https://picsum.photos/30/30',
      fixUserId: '001',
      fixUserName: faker.commerce.department(),
      creatorId: '001',
      creatorName: faker.commerce.department(),
      createDate: '2023-01-01',
      bugUa: 'chrome',
      versionId: '1',
      version: `1.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
      moduleId: '1',
      moduleTitle: '模块1',
    });
  }
  return data;
};
