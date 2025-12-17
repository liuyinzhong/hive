import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:code-xml',
      order: 1,
      title: $t('page.dev.title'),
    },
    name: 'dev',
    path: '/dev',
    children: [
      {
        name: 'projectHome',
        path: '/dev/home',
        component: () => import('#/views/dev/project/home.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:album',
          title: '项目集',
        },
      },
      {
        name: 'project',
        path: '/dev/project',
        component: () => import('#/views/dev/project/index.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:projector',
          title: '开发项目',
        },
      },
      {
        name: 'bug',
        path: '/dev/bug',
        component: () => import('#/views/dev/bug/list.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:bug',
          title: '缺陷管理',
          badge: '10',
          badgeVariants: 'destructive',
        },
      },
      {
        name: 'task',
        path: '/dev/task',
        component: () => import('#/views/dev/task/list.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:chart-bar-stacked',
          title: '任务管理',
        },
      },
      {
        name: 'taskGantt',
        path: '/dev/task/gantt',
        component: () => import('#/views/dev/task/gantt.vue'),
        meta: {
          icon: 'lucide:chart-no-axes-gantt',
          title: '任务甘特',
        },
      },
      {
        name: 'taskTodo',
        path: '/dev/task/todo',
        component: () => import('#/views/dev/task/todo-list.vue'),
        meta: {
          icon: 'lucide:list-todo',
          title: '任务待办',
        },
      },
      {
        name: 'devStory',
        path: '/dev/story',
        component: () => import('#/views/dev/story/list.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:film',
          title: '需求管理',
        },
      },
      {
        name: 'devVersions',
        path: '/dev/versions',
        component: () => import('#/views/dev/versions/list.vue'),
        meta: {
          affixTab: false,
          icon: 'lucide:file-stack',
          title: '迭代版本',
        },
      },
    ],
  },
];

export default routes;
