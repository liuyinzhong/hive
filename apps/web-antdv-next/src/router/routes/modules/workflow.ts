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
];

export default routes;
