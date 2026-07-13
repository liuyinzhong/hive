import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'WorkflowDefinitionDesigner',
    path: '/workflow/definition/designer/:definitionId',
    component: () => import('#/views/workflow/definition/designer.vue'),
    meta: {
      activePath: '/workflow/definition/list',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      title: '流程设计器',
    },
  },
];

export default routes;
