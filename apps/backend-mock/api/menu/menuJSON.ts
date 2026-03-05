const baseInfo = {
  activePath: null,
  activeIcon: null,
  status: 1,
  link: null,
  iframeSrc: null,
  order: null,
  badgeType: null,
  badge: null,
  badgeVariants: null,
  keepAlive: 0,
  affixTab: 0,
  hideInMenu: 0,
  hideChildrenInMenu: 0,
  hideInBreadcrumb: 0,
  hideInTab: 0,
  maxNumOfOpenTab: -1,
  affixTabOrder: 0,
  noBasicLayout: 0,
  openInNewWindow: 0,
  query: null,
  domCached: 0,
  creatorId: null,
  creatorName: null,
  createDate: null,
  updateDate: null,
};
/* 工作台 */
const menuWorkspaceJSON = [
  {
    title: 'page.dashboard.title',
    id: '205ce73c-baa0-4df9-b853-f6ae810d38ef',
    pid: null,
    type: 'catalog',
    icon: 'carbon:workspace',
    name: 'Dashboard',
    path: '/dashboard',
    component: null,
    authCode: 'sys:workspace',
    ...baseInfo,
    order: -1,
  },
  {
    title: 'page.dashboard.analytics',
    id: '7c17031e-63fd-4f5d-8c00-17d85673457c',
    pid: '205ce73c-baa0-4df9-b853-f6ae810d38ef',
    type: 'menu',
    icon: 'lucide:area-chart',
    name: 'Analytics',
    path: '/analytics',
    component: '/dashboard/analytics/index',
    authCode: 'sys:analytics',
    ...baseInfo,
    affixTab: 1,
  },
  {
    title: 'page.dashboard.workspace',
    id: '45843bfc-4e97-4061-87cb-7e4835100d43',
    pid: '205ce73c-baa0-4df9-b853-f6ae810d38ef',
    type: 'menu',
    icon: 'carbon:workspace',
    name: 'Workspace',
    path: '/workspace',
    component: '/dashboard/workspace/index',
    authCode: 'sys:workspace',
    ...baseInfo,
  },
];

/* 开发管理 */
const menuDevJSON = [
  /* 开发管理 */
  {
    title: 'page.dev.title',
    id: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    pid: null,
    type: 'catalog',
    icon: 'lucide:code-xml',
    name: 'dev',
    path: '/dev',
    component: '',
    authCode: 'sys:dev',
    ...baseInfo,
  },
  {
    title: '项目集',
    id: '877eb221-31fd-4d46-8c6d-03d667b62dcd',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:album',
    name: 'projectHome',
    path: '/dev/project/home',
    component: '/dev/project/home',
    authCode: 'sys:dev:project:home',
    ...baseInfo,
    menuVisibleWithForbidden: 1,
  },
  {
    title: '迭代版本',
    id: '383afd6b-6090-4dce-b7d8-7f0df0ebb225',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:file-stack',
    name: 'devVersions',
    path: '/dev/versions/list',
    component: '/dev/versions/list',
    authCode: 'sys:dev:versions:list',
    ...baseInfo,
  },
  {
    title: '开发项目',
    id: '1be595c3-dc09-49dc-a468-f2eea965aa12',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:projector',
    name: 'project',
    path: '/dev/project/index',
    component: '/dev/project/index',
    authCode: 'sys:dev:project:index',
    ...baseInfo,
  },
  {
    title: '需求管理',
    id: '3e35239c-a181-4963-a368-e2cd23e0b734',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:film',
    name: 'devStory',
    path: '/dev/story/list',
    component: '/dev/story/list',
    authCode: 'sys:dev:story:list',
    ...baseInfo,
  },

  {
    title: '添加按钮',
    id: '66a635f0-6a2d-4690-851a-89976ac2ea8c',
    pid: '3e35239c-a181-4963-a368-e2cd23e0b734',
    type: 'button',
    name: 'AddStory',
    authCode: 'sys:dev:story:list:add',
    ...baseInfo,
  },
  {
    title: '修改按钮',
    id: '58fe567b-de36-40fb-96b4-0b4846cb8204',
    pid: '3e35239c-a181-4963-a368-e2cd23e0b734',
    type: 'button',
    name: 'UpdateStory',
    authCode: 'sys:dev:story:list:update',
    ...baseInfo,
  },
  {
    title: '删除按钮',
    id: 'c39c613b-eedd-467e-8d03-e6e83432bd30',
    pid: '3e35239c-a181-4963-a368-e2cd23e0b734',
    type: 'button',
    name: 'DeleteStory',
    authCode: 'sys:dev:story:list:delete',
    ...baseInfo,
  },
  {
    title: '任务管理',
    id: '22ce1ac1-eb8e-4238-8a8d-e0c736156508',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:chart-bar-stacked',
    name: 'task',
    path: '/dev/task/list',
    component: '/dev/task/list',
    authCode: 'sys:dev:task:list',
    ...baseInfo,
  },

  {
    title: '任务甘特',
    id: 'f503e83d-479c-4377-bf4e-07306f97f20c',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:chart-no-axes-gantt',
    name: 'taskGantt',
    path: '/dev/task/gantt',
    component: '/dev/task/gantt',
    authCode: 'sys:dev:task:gantt',
    ...baseInfo,
  },
  {
    title: '任务待办',
    id: '11d8b422-9586-4754-813b-ac978be20da3',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:list-todo',
    name: 'taskTodo',
    path: '/dev/task/todo',
    component: '/dev/task/todo-list',
    authCode: 'sys:dev:task:todo',
    ...baseInfo,
  },
  {
    title: '缺陷管理',
    id: 'e2f3e82a-7b16-4cb3-b3c0-a29502f18ae7',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: 'lucide:bug',
    name: 'devBug',
    path: '/dev/bug/list',
    component: '/dev/bug/list',
    authCode: 'sys:dev:bug:list',
    ...baseInfo,
    badge: '10',
    badgeVariants: 'destructive',
    badgeType: 'dot',
  },

  {
    title: 'signature.title',
    id: 'ffa185fa-4070-4a98-ae35-6e98b5eadec2',
    pid: 'f9d7d286-4a01-48dd-a503-eda000103a4a',
    type: 'menu',
    icon: '',
    name: 'signature',
    path: '/demos/signature',
    component: '/demos/signature/index',
    authCode: 'sys:demos:signature',
    ...baseInfo,
  },
];

/* 流程管理 */
const menuFlowJSON = [
  {
    title: 'flow.title',
    id: '975030a3-c34c-4ed4-a500-52fe6b08eb3d',
    pid: null,
    type: 'catalog',
    icon: 'lucide:workflow',
    name: 'Flow',
    path: '/flow',
    component: '',
    authCode: 'sys:flow',
    ...baseInfo,
  },
  {
    title: 'flow.demo.title',
    id: '42a00658-be1e-4ed5-8e1d-93c7a4f75b64',
    pid: '975030a3-c34c-4ed4-a500-52fe6b08eb3d',
    type: 'menu',
    icon: 'mdi:account-group',
    name: 'FlowDemo',
    path: '/flow/demo',
    component: '/flow/demo/index',
    authCode: 'sys:flow:demo',
    ...baseInfo,
  },
  {
    title: 'flow.list.title',
    id: 'd1de0ae8-6ce4-45dd-bd9b-2d58740da66c',
    pid: '975030a3-c34c-4ed4-a500-52fe6b08eb3d',
    type: 'menu',
    icon: 'mdi:account-group',
    name: 'FlowList',
    path: '/flow/list',
    component: '/flow/list/index',
    authCode: 'sys:flow:list',
    ...baseInfo,
  },
];

/* 系统管理 */
const menuSystemJSON = [
  {
    title: 'system.title',
    id: '4d7223d8-a14d-4dec-9063-1e111d208278',
    pid: null,
    type: 'catalog',
    icon: 'carbon:settings',
    name: 'System',
    path: '/system',
    component: '',
    authCode: 'sys:system',
    ...baseInfo,
  },
  {
    title: '人员管理',
    id: '382dc7b6-de8d-45bc-834b-fee9c19cae32',
    pid: '4d7223d8-a14d-4dec-9063-1e111d208278',
    type: 'menu',
    icon: 'lucide:user-pen',
    name: 'systemUser',
    path: '/user/list',
    component: '/system/user/list',
    authCode: 'sys:system:user:list',
    ...baseInfo,
    query: '{ "id": 1 }',
  },
  {
    title: 'system.role.title',
    id: 'd4abd481-5e86-4a1c-b91c-6c6b821c00bb',
    pid: '4d7223d8-a14d-4dec-9063-1e111d208278',
    type: 'menu',
    icon: 'mdi:account-group',
    name: 'SystemRole',
    path: '/system/role',
    component: '/system/role/list',
    authCode: 'sys:system:role:list',
    ...baseInfo,
  },
  {
    title: 'system.menu.title',
    id: '8d9c1f40-549e-4de3-8322-dc15417ff00a',
    pid: '4d7223d8-a14d-4dec-9063-1e111d208278',
    type: 'menu',
    icon: 'mdi:menu',
    name: 'SystemMenu',
    path: '/system/menu',
    component: '/system/menu/list',
    authCode: 'sys:system:menu:list',
    ...baseInfo,
  },
  {
    title: 'system.dept.title',
    id: 'c6a12e2a-30cf-47cf-a407-17baf6269abf',
    pid: '4d7223d8-a14d-4dec-9063-1e111d208278',
    type: 'menu',
    icon: 'charm:organisation',
    name: 'SystemDept',
    path: '/system/dept',
    component: '/system/dept/list',
    authCode: 'sys:system:dept:list',
    ...baseInfo,
  },
  {
    title: 'system.dict.title',
    id: '49bd2e37-8544-487c-a17f-27d122ffe092',
    pid: '4d7223d8-a14d-4dec-9063-1e111d208278',
    type: 'menu',
    icon: 'lucide:book',
    name: 'SystemDict',
    path: '/system/dict',
    component: '/system/dict/list',
    authCode: 'sys:system:dict:list',
    ...baseInfo,
  },
];

export const MOCK_MENU_LIST_V2: any = [
  ...menuWorkspaceJSON,
  ...menuDevJSON,
  ...menuFlowJSON,
  ...menuSystemJSON,
];

/**
 * 将菜单数组转换为树状结构
 * @returns 树状结构的菜单数组
 * @param data 菜单数组
 * @param hasButton 是否包含按钮
 */
export function convertMenuToTree(data: any[], hasButton: boolean = false) {
  // 首先将每个菜单项转换为标准格式
  const menuItems = data
    .map((item) => {
      if (item.status == 0) {
        return null;
      }

      if (!hasButton && item.type == 'button') {
        return null;
      }

      return {
        authCode: item.authCode,
        children: [],
        component: item.component,
        id: item.id,
        meta: {
          activeIcon: item.activeIcon,
          activePath: item.activePath,
          affixTab: !!item.affixTab,
          affixTabOrder: item.affixTabOrder,
          badge: item.badge,
          badgeType: item.badgeType,
          badgeVariants: item.badgeVariants,
          hideChildrenInMenu: !!item.hideChildrenInMenu,
          hideInBreadcrumb: !!item.hideInBreadcrumb,
          hideInMenu: !!item.hideInMenu,
          hideInTab: !!item.hideInTab,
          icon: item.icon,
          iframeSrc: item.iframeSrc,
          keepAlive: !!item.keepAlive,
          link: item.link,
          maxNumOfOpenTab: item.maxNumOfOpenTab,
          noBasicLayout: !!item.noBasicLayout,
          openInNewWindow: !!item.openInNewWindow,
          order: item.order,
          query: item.query,
          title: item.title,
          domCached: !!item.domCached,
          menuVisibleWithForbidden: !!item.menuVisibleWithForbidden,
        },
        name: item.name,
        path: item.path,
        pid: item.pid,
        type: item.type,
        creatorId: item.creatorId,
        creatorName: item.creatorName,
        createDate: item.createDate,
        updateDate: item.updateDate,
        status: item.status,
      };
    })
    .filter(Boolean); // 过滤掉 status 为 0 的项

  // 创建一个以 id 为键的映射，便于快速查找
  const menuMap = new Map();
  menuItems.forEach((item) => {
    menuMap.set(item.id, item);
  });

  // 构建树状结构
  const tree = [];
  menuItems.forEach((item) => {
    const parentId = item.pid;
    if (!parentId) {
      // 没有父节点，是根节点
      tree.push(item);
    } else {
      // 有父节点，将当前节点添加到父节点的 children 数组中
      const parent = menuMap.get(parentId);
      if (parent) {
        parent.children.push(item);
      }
    }
  });

  return tree;
}
