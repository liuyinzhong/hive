import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    name: 'devStoryDetail',
    path: '/dev/story/detail/:storyNum',
    component: () => import('#/views/dev/story/detail.vue'),
    meta: {
      title: '需求详情',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      activePath: '/dev/story/list',
    },
  },
  {
    name: 'devTaskDetail',
    path: '/dev/task/detail/:taskNum',
    component: () => import('#/views/dev/task/detail.vue'),
    meta: {
      title: '任务详情',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      activePath: '/dev/task/list',
    },
  },
  {
    name: 'devBugDetail',
    path: '/dev/bug/detail/:bugNum',
    component: () => import('#/views/dev/bug/detail.vue'),
    meta: {
      title: '缺陷详情',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      activePath: '/dev/bug/list',
    },
  },
];

export default routes;
