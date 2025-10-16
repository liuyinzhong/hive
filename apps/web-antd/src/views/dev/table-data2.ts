import type { StoryFace } from '#/types';

export const MOCK_API_StoryData: StoryFace[] = [
  {
    storyId: '10000',
    storyTitle:
      '在线生成随机字符串数据，数值型数据，时间数据，电话号码数据等测试数据，基于字符串模板随机生成。',
    storyRichText: '<p>参数将首先尝试作为JSON对象传递，如果不行，</p>',
    creatorName: '阎思源',
    pmLink: 'https://www.lddgo.net/string/random-data',
    userList: [
      {
        userId: '001',
        realName: '张三',
        avatar: 'https://picsum.photos/30/30',
      },
      {
        userId: '002',
        realName: '李四',
        avatar: 'https://picsum.photos/30/30',
      },
    ],
    version: '1.0.0',
    storyRemark: '这是一个测试需求',
    files: [
      'https://his.sass.lnyiyao.com/upload/sass-patient-wx/saas/homeicon1.png',
    ],

    createdTime: '2024-02-21 15:01:01',
    updateTime: '2024-02-21 15:01:01',
    storyType: '1',
    storyStatus: '0',
    storyLevel: '2',
    moduleTitle: '医生端',
  },
];
