import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'FormSchemaDesigner',
    path: '/form/schema/designer/:formSchemaId',
    component: () => import('#/views/form/schema/designer.vue'),
    meta: {
      activePath: '/form/schema/list',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      title: $t('form.designer.title'),
    },
  },
  {
    name: 'WorkflowDefinitionDesigner',
    path: '/workflow/definition/designer/:definitionId',
    component: () => import('#/views/workflow/definition/designer.vue'),
    meta: {
      activePath: '/workflow/definition/list',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      title: $t('flow.designer.title'),
    },
  },
  {
    name: 'WorkflowInstanceDetail',
    path: '/workflow/instance/detail/:instanceId',
    component: () => import('#/views/workflow/instance/detail.vue'),
    meta: {
      activePath: '/workflow/instance/mine',
      hideInMenu: true,
      maxNumOfOpenTab: 3,
      title: $t('flow.detail.title'),
      icon: 'lucide:file-search',
    },
  },
];

export default routes;
