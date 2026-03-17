# Vue-Vben-Docs - Components

**Pages:** 10

---

## Page 常规页面组件 | Vben Admin

**URL:** https://doc.vben.pro/components/layout-ui/page.html

**Contents:**
- Page 常规页面组件 ​
- 基础用法 ​
  - Props ​
  - Slots ​
- 贡献者
- 页面历史

提供一个常规页面布局的组件，包括头部、内容区域、底部三个部分。

本组件是一个基本布局组件。如果有更多的通用页面布局需求（比如双列布局等），可以根据实际需求自行封装。

如果title、description、extra三者均未提供有效内容（通过props或者slots均可），则页面头部区域不会渲染。

---

## Vben Vxe Table 表格 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-vxe-table.html

**Contents:**
- Vben Vxe Table 表格 ​
- 适配器 ​
  - 适配器说明 ​
- 基础表格 ​
- 远程加载 ​
- 树形表格 ​
- 固定表头/列 ​
- 自定义单元格 ​
- 搜索表单 ​
  - 定制分隔条 ​

框架提供的Table 列表组件基于 vxe-table，结合Vben Form 表单进行了二次封装。

其中，表头的 表单搜索 部分采用了Vben Form表单，表格主体部分使用了vxe-grid组件，支持表格的分页、排序、筛选等功能。

如果文档内没有参数说明，可以尝试在在线示例或者在 vxe-grid 官方API 文档 内寻找

如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

表格底层使用 vxe-table 进行实现，所以你可以使用 vxe-table 的所有功能。对于不同的 UI 框架，我们提供了适配器，以便更好的适配不同的 UI 框架。

每个应用都可以自己配置vxe-table的适配器，你可以根据自己的需求。下面是一个简单的配置示例：

使用 useVbenVxeGrid 创建最基础的表格。

通过指定 proxyConfig.ajax 的 query 方法，可以实现远程加载数据。

树形表格的数据源为扁平结构，可以指定treeConfig配置项，实现树形表格。

列固定可选参数： 'left' | 'right' | '' | null

表单搜索 部分采用了Vben Form 表单，参考 Vben Form 表单文档。

当启用了表单搜索时，可以在toolbarConfig中配置search为true来让表格在工具栏区域显示一个搜索表单控制按钮。表格的所有以form-开头的命名插槽都会被传递给搜索表单。

当你启用表单搜索时，在表单和表格之间会显示一个分隔条。这个分隔条使用了默认的组件背景色，并且横向贯穿整个Vben Vxe Table在视觉上融入了页面的默认背景中。如果你在Vben Vxe Table的外层包裹了一个不同背景色的容器（如将其放在一个Card内），默认的表单和表格之间的分隔条可能就显得格格不入了，下面的代码演示了如何定制这个分隔条。

通过指定editConfig.mode为cell，可以实现单元格编辑。

通过指定editConfig.mode为row，可以实现行编辑。

通过 scroll-y.enabled 与 scroll-y.gt 组合开启，其中 enabled 为总开关，gt 是指当总行数大于指定行数时自动开启。

参考 vxe-table 官方文档 - 虚拟滚动。

useVbenVxeGrid 返回一个数组，第一个元素是表格组件，第二个元素是表格的方法。

useVbenVxeGrid 返回的第二个参数，是一个对象，包含了一些表单的方法。

所有属性都可以传入 useVbenVxeGrid 的第一个参数中。

大部分插槽的说明请参考 vxe-table 官方文档，但工具栏部分由于做了一些定制封装，需使用以下插槽定制表格的工具栏：

对于使用了搜索表单的表格来说，所有以form-开头的命名插槽都会传递给表单。

**Examples:**

Example 1 (typescript):
```typescript
import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { Button, Image } from 'ant-design-vue';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        border: false,
        columnConfig: {
          resizable: true,
        },
        minHeight: 180,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'items',
            total: 'total',
            list: 'items',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        round: true,
        showOverflow: true,
        size: 'small',
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        return h(Image, { src: row[column.field] });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          Button,
          { size: 'small', type: 'link' },
          { default: () => props?.text },
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    // vxeUI.formats.add
  },
  useVbenForm,
});

export { useVbenVxeGrid };

export type * from '@vben/plugins/vxe-table';
```

Example 2 (typescript):
```typescript
<script lang="ts" setup>
import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { MOCK_TABLE_DATA } from '../table-data';

interface RowType {
  address: string;
  age: number;
  id: number;
  name: string;
  nickname: string;
  role: string;
}

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: 'Name' },
    { field: 'age', sortable: true, title: 'Age' },
    { field: 'nickname', title: 'Nickname' },
    { field: 'role', title: 'Role' },
    { field: 'address', showOverflow: true, title: 'Address' },
  ],
  data: MOCK_TABLE_DATA,
  pagerConfig: {
    enabled: false,
  },
  sortConfig: {
    multiple: true,
  },
};

const gridEvents: VxeGridListeners<RowType> = {
  cellClick: ({ row }) => {
    message.info(`cell-click: ${row.name}`);
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions });

const showBorder = gridApi.useStore((state) => state.gridOptions?.border);
const showStripe = gridApi.useStore((state) => state.gridOptions?.stripe);

function changeBorder() {
  gridApi.setGridOptions({
    border: !showBorder.value,
  });
}

function changeStripe() {
  gridApi.setGridOptions({
    stripe: !showStripe.value,
  });
}

function changeLoading() {
  gridApi.setLoading(true);
  setTimeout(() => {
    gridApi.setLoading(false);
  }, 2000);
}
</script>

<template>
  <!-- 此处的`vp-raw` 是为了适配文档的展示效果，实际使用时不需要 -->
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="changeBorder">
          {{ showBorder ? '隐藏' : '显示' }}边框
        </Button>
        <Button class="mr-2" type="primary" @click="changeLoading">
          显示loading
        </Button>
        <Button class="mr-2" type="primary" @click="changeStripe">
          {{ showStripe ? '隐藏' : '显示' }}斑马纹
        </Button>
      </template>
    </Grid>
  </div>
</template>
```

Example 3 (javascript):
```javascript
<script lang="ts" setup>
import type { DemoTableApi } from '../mock-api';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { MOCK_API_DATA } from '../table-data';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

// 数据实例
// const MOCK_TREE_TABLE_DATA = [
//   {
//     date: '2020-08-01',
//     id: 10_000,
//     name: 'Test1',
//     parentId: null,
//     size: 1024,
//     type: 'mp3',
//   },
// ]

const sleep = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

/**
 * 获取示例表格数据
 */
async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  return new Promise<{ items: any; total: number }>((resolve) => {
    const { page, pageSize } = params;
    const items = MOCK_API_DATA.slice((page - 1) * pageSize, page * pageSize);

    sleep(1000).then(() => {
      resolve({
        total: items.length,
        items,
      });
    });
  });
}

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'category', title: 'Category' },
    { field: 'color', title: 'Color' },
    { field: 'productName', title: 'Product Name' },
    { field: 'price', title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'DateTime' },
  ],
  exportConfig: {},
  // height: 'auto', // 如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素，否则会出现高度闪动问题
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});
</script>

<template>
  <div class="vp-raw w-full">
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="() => gridApi.query()">
          刷新当前页面
        </Button>
        <Button type="primary" @click="() => gridApi.reload()">
          刷新并返回第一页
        </Button>
      </template>
    </Grid>
  </div>
</template>
```

Example 4 (yaml):
```yaml
treeConfig: {
  transform: true, // 指定表格为树形表格
  parentField: 'parentId', // 父节点字段名
  rowField: 'id', // 行数据字段名
},
```

---

## Vben EllipsisText 省略文本 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-ellipsis-text.html

**Contents:**
- Vben EllipsisText 省略文本 ​
- 基础用法 ​
- 可折叠的文本块 ​
- 自定义提示浮层 ​
- 自动显示 tooltip ​
- API ​
  - Props ​
  - Events ​
  - Slots ​
- 贡献者

框架提供的文本展示组件，可配置超长省略、tooltip提示、展开收起等功能。

如果文档内没有参数说明，可以尝试在在线示例内寻找

通过默认插槽设置文本内容，maxWidth属性设置最大宽度。

通过line设置折叠后的行数，expand属性设置是否支持展开收起。

通过名为tooltip的插槽定制提示信息。

通过tooltip-when-ellipsis设置，仅在文本长度超出导致省略号出现时才触发 tooltip。

**Examples:**

Example 1 (jsx):
```jsx
<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';

const text = `
Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。
`;
</script>
<template>
  <EllipsisText :max-width="500">{{ text }}</EllipsisText>
</template>
```

Example 2 (typescript):
```typescript
<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';

const text = `
Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。
`;
</script>
<template>
  <EllipsisText :line="3" expand>{{ text }}</EllipsisText>
</template>
```

Example 3 (jsx):
```jsx
<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';
</script>
<template>
  <EllipsisText :max-width="240">
    住在我心里孤独的 孤独的海怪 痛苦之王 开始厌倦 深海的光 停滞的海浪
    <template #tooltip>
      <div style="text-align: center">
        《秦皇岛》<br />住在我心里孤独的<br />孤独的海怪 痛苦之王<br />开始厌倦
        深海的光 停滞的海浪
      </div>
    </template>
  </EllipsisText>
</template>
```

Example 4 (typescript):
```typescript
<script lang="ts" setup>
import { EllipsisText } from '@vben/common-ui';

const text = `
Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。
`;
</script>
<template>
  <EllipsisText :line="2" :tooltip-when-ellipsis="true">
    {{ text }}
  </EllipsisText>

  <EllipsisText :line="3" :tooltip-when-ellipsis="true">
    {{ text }}
  </EllipsisText>
</template>
```

---

## Vben ApiComponent Api组件包装器 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-api-component.html

**Contents:**
- Vben ApiComponent Api组件包装器 ​
- 基础用法 ​
- 并发和缓存 ​
- API ​
  - Props ​
    - autoSelect 自动设置选项 ​
  - Methods ​
- 贡献者
- 页面历史

框架提供的API“包装器”，它一般不独立使用，主要用于包装其它组件，为目标组件提供自动获取远程数据的能力，但仍然保持了目标组件的原始用法。

我们在各个应用的组件适配器中，使用ApiComponent包装了Select、TreeSelect组件，使得这些组件可以自动获取远程数据并生成选项。其它类似的组件（比如Cascader）如有需要也可以参考示例代码自行进行包装。

通过 component 传入其它组件的定义，并配置相关的其它属性（主要是一些名称映射）。包装组件将通过api获取数据（beforerFetch、afterFetch将分别在api运行前、运行后被调用），使用resultField从中提取数组，使用valueField、labelField等来从数据中提取value和label（如果提供了childrenField，会将其作为树形结构递归处理每一级数据），之后将处理好的数据通过optionsPropName指定的属性传递给目标组件。

有些场景下可能需要使用多个ApiComponent，它们使用了相同的远程数据源（例如用在可编辑的表格中）。如果直接将请求后端接口的函数传递给api属性，则每一个实例都会访问一次接口，这会造成资源浪费，是完全没有必要的。Tanstack Query提供了并发控制、缓存、重试等诸多特性，我们可以将接口请求函数用useQuery包装一下再传递给ApiComponent，这样的话无论页面有多少个使用相同数据源的ApiComponent实例，都只会发起一次远程请求。演示效果请参考 Playground vue-query，具体代码请查看项目文件concurrency-caching

如果当前值为undefined，在选项数据成功加载之后，自动从备选项中选择一个作为当前值。默认值为false，即不自动选择选项。注意：该属性不应用于多选组件。可选值有：

**Examples:**

Example 1 (json):
```json
<script lang="ts" setup>
import { ApiComponent } from '@vben/common-ui';

import { Cascader } from 'ant-design-vue';

const treeData: Record<string, any> = [
  {
    label: '浙江',
    value: 'zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          {
            value: 'xihu',
            label: '西湖',
          },
          {
            value: 'sudi',
            label: '苏堤',
          },
        ],
      },
      {
        value: 'jiaxing',
        label: '嘉兴',
        children: [
          {
            value: 'wuzhen',
            label: '乌镇',
          },
          {
            value: 'meihuazhou',
            label: '梅花洲',
          },
        ],
      },
      {
        value: 'zhoushan',
        label: '舟山',
        children: [
          {
            value: 'putuoshan',
            label: '普陀山',
          },
          {
            value: 'taohuadao',
            label: '桃花岛',
          },
        ],
      },
    ],
  },
  {
    label: '江苏',
    value: 'jiangsu',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          {
            value: 'zhonghuamen',
            label: '中华门',
          },
          {
            value: 'zijinshan',
            label: '紫金山',
          },
          {
            value: 'yuhuatai',
            label: '雨花台',
          },
        ],
      },
    ],
  },
];
/**
 * 模拟请求接口
 */
function fetchApi(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(treeData);
    }, 1000);
  });
}
</script>
<template>
  <ApiComponent
    :api="fetchApi"
    :component="Cascader"
    :immediate="false"
    children-field="children"
    loading-slot="suffixIcon"
    visible-event="onDropdownVisibleChange"
  />
</template>
```

---

## 介绍 | Vben Admin

**URL:** https://doc.vben.pro/components/introduction.html

**Contents:**
- 介绍 ​
- 布局组件 ​
- 通用组件 ​
- 贡献者
- 页面历史

该文档介绍的是框架组件的使用方法、属性、事件等。如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

布局组件一般在页面内容区域用作顶层容器组件，提供一些统一的布局样式和基本功能。

通用组件是一些常用的组件，比如弹窗、抽屉、表单等。大部分基于 Tailwind CSS 实现，可适用于不同 UI 组件库的应用。

---

## Vben Alert 轻量提示框 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-alert.html

**Contents:**
- Vben Alert 轻量提示框 ​
- 基础用法 ​
- useAlertContext ​
  - Methods ​
- 类型说明 ​
- 贡献者
- 页面历史

框架提供的一些用于轻量提示的弹窗，仅使用js代码即可快速动态创建提示而不需要在template写任何代码。

Alert提供的功能与Modal类似，但只适用于简单应用场景。例如临时性、动态地弹出模态确认框、输入框等。如果对弹窗有更复杂的需求，请使用VbenModal

Alert提供的快捷方法alert、confirm、prompt动态创建的弹窗在已打开的情况下，不支持HMR（热更新），代码变更后需要关闭这些弹窗后重新打开。

下方示例代码中的，存在一些主题色未适配、样式缺失的问题，这些问题只在文档内会出现，实际使用并不会有这些问题，可忽略，不必纠结。

使用 alert 创建只有一个确认按钮的提示框。

使用 confirm 创建有确认和取消按钮的提示框。

使用 prompt 创建有确认和取消按钮、接受用户输入的提示框。

当弹窗的content、footer、icon使用自定义组件时，在这些组件中可以使用 useAlertContext 获取当前弹窗的上下文对象，用来主动控制弹窗。

useAlertContext只能用在setup或者函数式组件中。

**Examples:**

Example 1 (vue):
```vue
<script lang="ts" setup>
import { h } from 'vue';

import { alert, VbenButton } from '@vben/common-ui';

import { Result } from 'ant-design-vue';

function showAlert() {
  alert('This is an alert message');
}

function showIconAlert() {
  alert({
    content: 'This is an alert message with icon',
    icon: 'success',
  });
}

function showCustomAlert() {
  alert({
    buttonAlign: 'center',
    content: h(Result, {
      status: 'success',
      subTitle: '已成功创建订单。订单ID：2017182818828182881',
      title: '操作成功',
    }),
  });
}
</script>
<template>
  <div class="flex gap-4">
    <VbenButton @click="showAlert">Alert</VbenButton>
    <VbenButton @click="showIconAlert">Alert With Icon</VbenButton>
    <VbenButton @click="showCustomAlert">Alert With Custom Content</VbenButton>
  </div>
</template>
```

Example 2 (javascript):
```javascript
<script lang="ts" setup>
import { h, ref } from 'vue';

import { alert, confirm, VbenButton } from '@vben/common-ui';

import { Checkbox, message } from 'ant-design-vue';

function showConfirm() {
  confirm('This is an alert message')
    .then(() => {
      alert('Confirmed');
    })
    .catch(() => {
      alert('Canceled');
    });
}

function showIconConfirm() {
  confirm({
    content: 'This is an alert message with icon',
    icon: 'success',
  });
}

function showfooterConfirm() {
  const checked = ref(false);
  confirm({
    cancelText: '不要虾扯蛋',
    confirmText: '是的，我们都是NPC',
    content:
      '刚才发生的事情，为什么我似乎早就经历过一般？\n我甚至能在事情发生过程中潜意识里预知到接下来会发生什么。\n\n听起来挺玄乎的，你有过这种感觉吗？',
    footer: () =>
      h(
        Checkbox,
        {
          checked: checked.value,
          class: 'flex-1',
          'onUpdate:checked': (v) => (checked.value = v),
        },
        '不再提示',
      ),
    icon: 'question',
    title: '未解之谜',
  }).then(() => {
    if (checked.value) {
      message.success('我不会再拿这个问题烦你了');
    } else {
      message.info('下次还要继续问你哟');
    }
  });
}

function showAsyncConfirm() {
  confirm({
    beforeClose({ isConfirm }) {
      if (isConfirm) {
        // 这里可以执行一些异步操作。如果最终返回了false，将阻止关闭弹窗
        return new Promise((resolve) => setTimeout(resolve, 2000));
      }
    },
    content: 'This is an alert message with async confirm',
    icon: 'success',
  }).then(() => {
    alert('Confirmed');
  });
}
</script>
<template>
  <div class="flex gap-4">
    <VbenButton @click="showConfirm">Confirm</VbenButton>
    <VbenButton @click="showIconConfirm">Confirm With Icon</VbenButton>
    <VbenButton @click="showfooterConfirm">Confirm With Footer</VbenButton>
    <VbenButton @click="showAsyncConfirm">Async Confirm</VbenButton>
  </div>
</template>
```

Example 3 (javascript):
```javascript
<script lang="ts" setup>
import { h } from 'vue';

import { alert, prompt, useAlertContext, VbenButton } from '@vben/common-ui';

import { Input, RadioGroup, Select } from 'ant-design-vue';
import { BadgeJapaneseYen } from 'lucide-vue-next';

function showPrompt() {
  prompt({
    content: '请输入一些东西',
  })
    .then((val) => {
      alert(`已收到你的输入：${val}`);
    })
    .catch(() => {
      alert('Canceled');
    });
}

function showSlotsPrompt() {
  prompt({
    component: () => {
      // 获取弹窗上下文。注意：只能在setup或者函数式组件中调用
      const { doConfirm } = useAlertContext();
      return h(
        Input,
        {
          onKeydown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
              e.preventDefault();
              // 调用弹窗提供的确认方法
              doConfirm();
            }
          },
          placeholder: '请输入',
          prefix: '充值金额：',
          type: 'number',
        },
        {
          addonAfter: () => h(BadgeJapaneseYen),
        },
      );
    },
    content:
      '此弹窗演示了如何使用自定义插槽，并且可以使用useAlertContext获取到弹窗的上下文。\n在输入框中按下回车键会触发确认操作。',
    icon: 'question',
    modelPropName: 'value',
  }).then((val) => {
    if (val) alert(`你输入的是${val}`);
  });
}

function showSelectPrompt() {
  prompt({
    component: Select,
    componentProps: {
      options: [
        { label: 'Option A', value: 'Option A' },
        { label: 'Option B', value: 'Option B' },
        { label: 'Option C', value: 'Option C' },
      ],
      placeholder: '请选择',
      // 弹窗会设置body的pointer-events为none，这回影响下拉框的点击事件
      popupClassName: 'pointer-events-auto',
    },
    content: '此弹窗演示了如何使用component传递自定义组件',
    icon: 'question',
    modelPropName: 'value',
  }).then((val) => {
    if (val) {
      alert(`你选择了${val}`);
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showAsyncPrompt() {
  prompt({
    async beforeClose(scope) {
      if (scope.isConfirm) {
        if (scope.value) {
          // 模拟异步操作，如果不成功，可以返回false
          await sleep(2000);
        } else {
          alert('请选择一个选项');
          return false;
        }
      }
    },
    component: RadioGroup,
    componentProps: {
      class: 'flex flex-col',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
    },
    content: '选择一个选项后再点击[确认]',
    icon: 'question',
    modelPropName: 'value',
  }).then((val) => {
    alert(`${val} 已设置。`);
  });
}
</script>
<template>
  <div class="flex gap-4">
    <VbenButton @click="showPrompt">Prompt</VbenButton>
    <VbenButton @click="showSlotsPrompt"> Prompt With slots </VbenButton>
    <VbenButton @click="showSelectPrompt">Prompt With Select</VbenButton>
    <VbenButton @click="showAsyncPrompt">Prompt With Async</VbenButton>
  </div>
</template>
```

Example 4 (typescript):
```typescript
/** 预置的图标类型 */
export type IconType = 'error' | 'info' | 'question' | 'success' | 'warning';

export type BeforeCloseScope = {
  /** 是否为点击确认按钮触发的关闭 */
  isConfirm: boolean;
};

/**
 * alert 属性
 */
export type AlertProps = {
  /** 关闭前的回调，如果返回false，则终止关闭 */
  beforeClose?: (
    scope: BeforeCloseScope,
  ) => boolean | Promise<boolean | undefined> | undefined;
  /** 边框 */
  bordered?: boolean;
  /** 按钮对齐方式 */
  buttonAlign?: 'center' | 'end' | 'start';
  /** 取消按钮的标题 */
  cancelText?: string;
  /** 是否居中显示 */
  centered?: boolean;
  /** 确认按钮的标题 */
  confirmText?: string;
  /** 弹窗容器的额外样式 */
  containerClass?: string;
  /** 弹窗提示内容 */
  content: Component | string;
  /** 弹窗内容的额外样式 */
  contentClass?: string;
  /** 执行beforeClose回调期间，在内容区域显示一个loading遮罩*/
  contentMasking?: boolean;
  /** 弹窗底部内容（与按钮在同一个容器中） */
  footer?: Component | string;
  /** 弹窗的图标（在标题的前面） */
  icon?: Component | IconType;
  /**
   * 弹窗遮罩模糊效果
   */
  overlayBlur?: number;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 弹窗标题 */
  title?: string;
};

/** prompt 属性 */
export type PromptProps<T = any> = {
  /** 关闭前的回调，如果返回false，则终止关闭 */
  beforeClose?: (scope: {
    isConfirm: boolean;
    value: T | undefined;
  }) => boolean | Promise<boolean | undefined> | undefined;
  /** 用于接受用户输入的组件 */
  component?: Component;
  /** 输入组件的属性 */
  componentProps?: Recordable<any>;
  /** 输入组件的插槽 */
  componentSlots?: Recordable<Component>;
  /** 默认值 */
  defaultValue?: T;
  /** 输入组件的值属性名 */
  modelPropName?: string;
} & Omit<AlertProps, 'beforeClose'>;

/**
 * 函数签名
 * alert和confirm的函数签名相同。
 * confirm默认会显示取消按钮，而alert默认只有一个按钮
 *  */
export function alert(options: AlertProps): Promise<void>;
export function alert(
  message: string,
  options?: Partial<AlertProps>,
): Promise<void>;
export function alert(
  message: string,
  title?: string,
  options?: Partial<AlertProps>,
): Promise<void>;

/**
 * 弹出输入框的函数签名。
 * beforeClose的参数会传入用户当前输入的值
 * component指定接受用户输入的组件，默认为Input
 * componentProps 为输入组件设置的属性数据
 * defaultValue 默认的值
 * modelPropName 输入组件的值属性名称。默认为modelValue
 */
export async function prompt<T = any>(
  options: Omit<AlertProps, 'beforeClose'> & {
    beforeClose?: (
      scope: BeforeCloseScope & {
        /** 输入组件的当前值 */
        value: T;
      },
    ) => boolean | Promise<boolean | undefined> | undefined;
    component?: Component;
    componentProps?: Recordable<any>;
    defaultValue?: T;
    modelPropName?: string;
  },
): Promise<T | undefined>;
```

---

## Vben Modal 模态框 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-modal.html

**Contents:**
- Vben Modal 模态框 ​
- 基础用法 ​
- 组件抽离 ​
- 开启拖拽 ​
- 自动计算高度 ​
- 使用 Api ​
- 数据共享 ​
- 动画类型 ​
- API ​
  - Props ​

框架提供的模态框组件，支持拖拽、全屏、自动高度、loading等功能。

如果文档内没有参数说明，可以尝试在在线示例内寻找

如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

下方示例代码中的，存在一些国际化、主题色未适配问题，这些问题只在文档内会出现，实际使用并不会有这些问题，可忽略，不必纠结。

使用 useVbenModal 创建最基础的模态框。

Modal 内的内容一般业务中，会比较复杂，所以我们可以将 modal 内的内容抽离出来，也方便复用。通过 connectedComponent 参数，可以将内外组件进行连接，而不用其他任何操作。

通过 draggable 参数，可开启拖拽功能。

弹窗会自动计算内容高度，超过一定高度会出现滚动条，同时结合 loading 效果以及使用 prepend-footer 插槽。

通过 modalApi 可以调用 modal 的方法以及使用 setState 更新 modal 的状态。

如果你使用了 connectedComponent 参数，那么内外组件会共享数据，比如一些表单回填等操作。可以用 modalApi 来获取数据和设置数据，配合 onOpenChange，可以满足大部分的需求。

通过 animationType 属性可以控制弹窗的动画效果：

所有属性都可以传入 useVbenModal 的第一个参数中。

appendToMain可以指定将弹窗挂载到内容区域，打开这种弹窗时，内容区域以外的部分（标签栏、导航菜单等等）不会被遮挡。默认情况下，弹窗会挂载到body上。但是：挂载到内容区域时，作为页面根容器的Page组件，需要设置auto-content-height属性，以便弹窗能够正确计算高度。

以下事件，只有在 useVbenModal({onCancel:()=>{}}) 中传入才会生效。

除了上面的属性类型包含slot，还可以通过插槽来自定义弹窗的内容。

lock方法用于锁定当前弹窗的状态，一般用于提交数据的过程中防止用户重复提交或者弹窗被意外关闭、表单数据被改变等等。当处于锁定状态时，弹窗的确认按钮会变为loading状态，同时禁用取消按钮和关闭按钮、禁止ESC或者点击遮罩等方式关闭弹窗、开启弹窗的spinner动画以遮挡弹窗内容。调用close方法关闭处于锁定状态的弹窗时，会自动解锁。要主动解除这种状态，可以调用unlock方法或者再次调用lock方法并传入false参数。

**Examples:**

Example 1 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenModal, VbenButton } from '@vben/common-ui';

const [Modal, modalApi] = useVbenModal();
</script>
<template>
  <div>
    <VbenButton @click="() => modalApi.open()">Open</VbenButton>
    <Modal class="w-[600px]" title="基础示例"> modal content </Modal>
  </div>
</template>
```

Example 2 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenModal, VbenButton } from '@vben/common-ui';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi.open();
}
</script>

<template>
  <div>
    <Modal />
    <VbenButton @click="openModal">Open</VbenButton>
  </div>
</template>
```

Example 3 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenModal, VbenButton } from '@vben/common-ui';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi.open();
}
</script>

<template>
  <div>
    <Modal />
    <VbenButton @click="openModal">Open</VbenButton>
  </div>
</template>
```

Example 4 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenModal, VbenButton } from '@vben/common-ui';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi.open();
}
</script>

<template>
  <div>
    <Modal />
    <VbenButton @click="openModal">Open</VbenButton>
  </div>
</template>
```

---

## Vben CountToAnimator 数字动画 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-count-to-animator.html

**Contents:**
- Vben CountToAnimator 数字动画 ​
- 基础用法 ​
- 自定义前缀及分隔符 ​
  - Props ​
  - Events ​
  - Methods ​
- 贡献者
- 页面历史

框架提供的数字动画组件，支持数字动画效果。

如果文档内没有参数说明，可以尝试在在线示例内寻找

如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

通过 start-val 和 end-val设置数字动画的开始值和结束值， 持续时间3000ms。

通过 prefix 和 separator 设置数字动画的前缀和分隔符。

**Examples:**

Example 1 (typescript):
```typescript
<script lang="ts" setup>
import { VbenCountToAnimator } from '@vben/common-ui';
</script>
<template>
  <VbenCountToAnimator :duration="3000" :end-val="30000" :start-val="1" />
</template>
```

Example 2 (typescript):
```typescript
<script lang="ts" setup>
import { VbenCountToAnimator } from '@vben/common-ui';
</script>
<template>
  <VbenCountToAnimator
    :duration="3000"
    :end-val="2000000"
    :start-val="1"
    prefix="$"
    separator="/"
  />
</template>
```

---

## Vben Drawer 抽屉 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-drawer.html

**Contents:**
- Vben Drawer 抽屉 ​
- 基础用法 ​
- 组件抽离 ​
- 自动计算高度 ​
- 使用 Api ​
- 数据共享 ​
- API ​
  - Props ​
  - Event ​
  - Slots ​

框架提供的抽屉组件，支持自动高度、loading等功能。

如果文档内没有参数说明，可以尝试在在线示例内寻找

如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

下方示例代码中的，存在一些国际化、主题色未适配问题，这些问题只在文档内会出现，实际使用并不会有这些问题，可忽略，不必纠结。

使用 useVbenDrawer 创建最基础的抽屉。

Drawer 内的内容一般业务中，会比较复杂，所以我们可以将 drawer 内的内容抽离出来，也方便复用。通过 connectedComponent 参数，可以将内外组件进行连接，而不用其他任何操作。

弹窗会自动计算内容高度，超过一定高度会出现滚动条，同时结合 loading 效果以及使用 prepend-footer 插槽。

通过 drawerApi 可以调用 drawer 的方法以及使用 setState 更新 drawer 的状态。

如果你使用了 connectedComponent 参数，那么内外组件会共享数据，比如一些表单回填等操作。可以用 drawerApi 来获取数据和设置数据，配合 onOpenChange，可以满足大部分的需求。

所有属性都可以传入 useVbenDrawer 的第一个参数中。

appendToMain可以指定将抽屉挂载到内容区域，打开抽屉时，内容区域以外的部分（标签栏、导航菜单等等）不会被遮挡。默认情况下，抽屉会挂载到body上。但是：挂载到内容区域时，作为页面根容器的Page组件，需要设置auto-content-height属性，以便抽屉能够正确计算高度。

以下事件，只有在 useVbenDrawer({onCancel:()=>{}}) 中传入才会生效。

除了上面的属性类型包含slot，还可以通过插槽来自定义弹窗的内容。

lock方法用于锁定抽屉的状态，一般用于提交数据的过程中防止用户重复提交或者抽屉被意外关闭、表单数据被改变等等。当处于锁定状态时，抽屉的确认按钮会变为loading状态，同时禁用取消按钮和关闭按钮、禁止ESC或者点击遮罩等方式关闭抽屉、开启抽屉的spinner动画以遮挡弹窗内容。调用close方法关闭处于锁定状态的抽屉时，会自动解锁。要主动解除这种状态，可以调用unlock方法或者再次调用lock方法并传入false参数。

**Examples:**

Example 1 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenDrawer, VbenButton } from '@vben/common-ui';

const [Drawer, drawerApi] = useVbenDrawer();
</script>
<template>
  <div>
    <VbenButton @click="() => drawerApi.open()">Open</VbenButton>
    <Drawer class="w-[600px]" title="基础示例"> drawer content </Drawer>
  </div>
</template>
```

Example 2 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import ExtraDrawer from './drawer.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function open() {
  drawerApi.open();
}
</script>

<template>
  <div>
    <Drawer />
    <VbenButton @click="open">Open</VbenButton>
  </div>
</template>
```

Example 3 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import ExtraDrawer from './drawer.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function open() {
  drawerApi.open();
}
</script>

<template>
  <div>
    <Drawer />
    <VbenButton @click="open">Open</VbenButton>
  </div>
</template>
```

Example 4 (jsx):
```jsx
<script lang="ts" setup>
import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import ExtraDrawer from './drawer.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function open() {
  drawerApi.open();
}

function handleUpdateTitle() {
  drawerApi.setState({ title: '外部动态标题' }).open();
}
</script>

<template>
  <div>
    <Drawer />

    <VbenButton @click="open">Open</VbenButton>
    <VbenButton class="ml-2" type="primary" @click="handleUpdateTitle">
      从外部修改标题并打开
    </VbenButton>
  </div>
</template>
```

---

## Vben Form 表单 | Vben Admin

**URL:** https://doc.vben.pro/components/common-ui/vben-form.html

**Contents:**
- Vben Form 表单 ​
- 适配器 ​
  - 适配器说明 ​
- 基础用法 ​
- 查询表单 ​
- 表单校验 ​
- 表单联动 ​
- 自定义组件 ​
- 操作 ​
- API ​

框架提供的表单组件，可适配 Element Plus、Ant Design Vue、Naive UI 等框架。

如果文档内没有参数说明，可以尝试在在线示例内寻找

如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

表单底层使用 vee-validate 进行表单验证，所以你可以使用 vee-validate 的所有功能。对于不同的 UI 框架，我们提供了适配器，以便更好的适配不同的 UI 框架。

每个应用都有不同的 UI 框架，所以在应用的 src/adapter/form 和 src/adapter/component 内部，你可以根据自己的需求，进行组件适配。下面是 Ant Design Vue 的适配器示例代码，可根据注释查看说明：

下方示例代码中的，存在一些国际化、主题色未适配问题，这些问题只在文档内会出现，实际使用并不会有这些问题，可忽略，不必纠结。

使用 useVbenForm 创建最基础的表单。

查询表单是一种特殊的表单，用于查询数据。查询表单不会触发表单验证，只会触发查询事件。

表单校验是一个非常重要的功能，可以通过 rules 属性进行校验。

表单联动是一个非常常见的功能，可以通过 dependencies 属性进行联动。

注意 需要指定 dependencies 的 triggerFields 属性，设置由谁的改动来触发，以便表单组件能够正确的联动。

如果你的业务组件库没有提供某个组件，你可以自行封装一个组件，然后加到表单内部。

useVbenForm 返回一个数组，第一个元素是表单组件，第二个元素是表单的方法。

useVbenForm 返回的第二个参数，是一个对象，包含了一些表单的方法。

所有属性都可以传入 useVbenForm 的第一个参数中。

handleValuesChange 回调函数的第一个参数values装载了表单改变后的当前值对象，第二个参数fieldsChanged是一个数组，包含了所有被改变的字段名。注意：第二个参数仅在v5.5.4(不含)以上版本可用，并且传递的是已在schema中定义的字段名。如果你使用了字段映射并且需要检查是哪些字段发生了变化的话，请注意该参数并不会包含映射后的字段名。

此属性用于将表单内的数组值映射成 2 个字段，它应当传入一个数组，数组的每一项是一个映射规则，规则的第一个成员是一个字符串，表示需要映射的字段名，第二个成员是一个数组，表示映射后的字段名，第三个成员是一个可选的格式掩码，用于格式化日期时间字段；也可以提供一个格式化函数（参数分别为当前值和当前字段名，返回格式化后的值）。如果明确地将格式掩码设为null，则原值映射而不进行格式化（适用于非日期时间字段）。例如：[['timeRange', ['startTime', 'endTime'], 'YYYY-MM-DD']]，timeRange应当是一个至少具有2个成员的数组类型的值。Form会将timeRange的值前两个值分别按照格式掩码YYYY-MM-DD格式化后映射到startTime和endTime字段上。每一项的第三个参数是一个可选的格式掩码，

表单联动需要通过 schema 内的 dependencies 属性进行联动，允许您添加字段之间的依赖项，以根据其他字段的值控制字段。

表单校验需要通过 schema 内的 rules 属性进行配置。

rules的值可以是字符串（预定义的校验规则名称），也可以是一个zod的schema。

rules也支持 zod 的 schema，可以进行更复杂的校验，zod 的使用请查看 zod文档。

除了以上内置插槽之外，schema属性中每个字段的fieldName都可以作为插槽名称，这些字段插槽的优先级高于component定义的组件。也就是说，当提供了与fieldName同名的插槽时，这些插槽的内容将会作为这些字段的组件，此时component的值将会被忽略。

**Examples:**

Example 1 (typescript):
```typescript
import type {
  VbenFormSchema as FormSchema,
  VbenFormProps,
} from '@vben/common-ui';

import type { ComponentType } from './component';

import { setupVbenForm, useVbenForm as useForm, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

setupVbenForm<ComponentType>({
  config: {
    // ant design vue组件库默认都是 v-model:value
    baseModelPropName: 'value',
    // 一些组件是 v-model:checked 或者 v-model:fileList
    modelPropNameMap: {
      Checkbox: 'checked',
      Radio: 'checked',
      Switch: 'checked',
      Upload: 'fileList',
    },
  },
  defineRules: {
    // 输入项目必填国际化适配
    required: (value, _params, ctx) => {
      if (value === undefined || value === null || value.length === 0) {
        return $t('ui.formRules.required', [ctx.label]);
      }
      return true;
    },
    // 选择项目必填国际化适配
    selectRequired: (value, _params, ctx) => {
      if (value === undefined || value === null) {
        return $t('ui.formRules.selectRequired', [ctx.label]);
      }
      return true;
    },
  },
});

const useVbenForm = useForm<ComponentType>;

export { useVbenForm, z };
export type VbenFormSchema = FormSchema<ComponentType>;
export type { VbenFormProps };
```

Example 2 (typescript):
```typescript
/**
 * 通用组件共同的使用的基础组件，原先放在 adapter/form 内部，限制了使用范围，这里提取出来，方便其他地方使用
 * 可用于 vben-form、vben-modal、vben-drawer 等组件使用,
 */

import type { BaseFormComponentType } from '@vben/common-ui';

import type { Component, SetupContext } from 'vue';
import { h } from 'vue';

import { globalShareState, IconPicker } from '@vben/common-ui';
import { $t } from '@vben/locales';

const AutoComplete = defineAsyncComponent(
  () => import('ant-design-vue/es/auto-complete'),
);
const Button = defineAsyncComponent(() => import('ant-design-vue/es/button'));
const Checkbox = defineAsyncComponent(
  () => import('ant-design-vue/es/checkbox'),
);
const CheckboxGroup = defineAsyncComponent(() =>
  import('ant-design-vue/es/checkbox').then((res) => res.CheckboxGroup),
);
const DatePicker = defineAsyncComponent(
  () => import('ant-design-vue/es/date-picker'),
);
const Divider = defineAsyncComponent(() => import('ant-design-vue/es/divider'));
const Input = defineAsyncComponent(() => import('ant-design-vue/es/input'));
const InputNumber = defineAsyncComponent(
  () => import('ant-design-vue/es/input-number'),
);
const InputPassword = defineAsyncComponent(() =>
  import('ant-design-vue/es/input').then((res) => res.InputPassword),
);
const Mentions = defineAsyncComponent(
  () => import('ant-design-vue/es/mentions'),
);
const Radio = defineAsyncComponent(() => import('ant-design-vue/es/radio'));
const RadioGroup = defineAsyncComponent(() =>
  import('ant-design-vue/es/radio').then((res) => res.RadioGroup),
);
const RangePicker = defineAsyncComponent(() =>
  import('ant-design-vue/es/date-picker').then((res) => res.RangePicker),
);
const Rate = defineAsyncComponent(() => import('ant-design-vue/es/rate'));
const Select = defineAsyncComponent(() => import('ant-design-vue/es/select'));
const Space = defineAsyncComponent(() => import('ant-design-vue/es/space'));
const Switch = defineAsyncComponent(() => import('ant-design-vue/es/switch'));
const Textarea = defineAsyncComponent(() =>
  import('ant-design-vue/es/input').then((res) => res.Textarea),
);
const TimePicker = defineAsyncComponent(
  () => import('ant-design-vue/es/time-picker'),
);
const TreeSelect = defineAsyncComponent(
  () => import('ant-design-vue/es/tree-select'),
);
const Upload = defineAsyncComponent(() => import('ant-design-vue/es/upload'));


const withDefaultPlaceholder = <T extends Component>(
  component: T,
  type: 'input' | 'select',
) => {
  return (props: any, { attrs, slots }: Omit<SetupContext, 'expose'>) => {
    const placeholder = props?.placeholder || $t(`ui.placeholder.${type}`);
    return h(component, { ...props, ...attrs, placeholder }, slots);
  };
};

// 这里需要自行根据业务组件库进行适配，需要用到的组件都需要在这里类型说明
export type ComponentType =
  | 'AutoComplete'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'DefaultButton'
  | 'Divider'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'Mentions'
  | 'PrimaryButton'
  | 'Radio'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Rate'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'Textarea'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | 'IconPicker';
  | BaseFormComponentType;

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    // 如果你的组件体积比较大，可以使用异步加载
    // Button: () =>
    // import('xxx').then((res) => res.Button),

    AutoComplete,
    Checkbox,
    CheckboxGroup,
    DatePicker,
    // 自定义默认按钮
    DefaultButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'default' }, slots);
    },
    Divider,
    IconPicker,
    Input: withDefaultPlaceholder(Input, 'input'),
    InputNumber: withDefaultPlaceholder(InputNumber, 'input'),
    InputPassword: withDefaultPlaceholder(InputPassword, 'input'),
    Mentions: withDefaultPlaceholder(Mentions, 'input'),
    // 自定义主要按钮
    PrimaryButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'primary' }, slots);
    },
    Radio,
    RadioGroup,
    RangePicker,
    Rate,
    Select: withDefaultPlaceholder(Select, 'select'),
    Space,
    Switch,
    Textarea: withDefaultPlaceholder(Textarea, 'input'),
    TimePicker,
    TreeSelect: withDefaultPlaceholder(TreeSelect, 'select'),
    Upload,
  };

  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components);

  // 定义全局共享状态中的消息提示
  globalShareState.defineMessage({
    // 复制成功消息提示
    copyPreferencesSuccess: (title, content) => {
      notification.success({
        description: content,
        message: title,
        placement: 'bottomRight',
      });
    },
  });
}

export { initComponentAdapter };
```

Example 3 (jsx):
```jsx
<script lang="ts" setup>
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

const [BaseForm] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入用户名',
      },
      // 字段名
      fieldName: 'username',
      // 界面显示的label
      label: '字符串',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字(带后缀)',
      suffix: () => '¥',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'options',
      label: '下拉选',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
      },
      fieldName: 'radioGroup',
      label: '单选组',
    },
    {
      component: 'Radio',
      fieldName: 'radio',
      label: '',
      renderComponentContent: () => {
        return {
          default: () => ['Radio'],
        };
      },
    },
    {
      component: 'CheckboxGroup',
      componentProps: {
        name: 'cname',
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
      },
      fieldName: 'checkboxGroup',
      label: '多选组',
    },
    {
      component: 'Checkbox',
      fieldName: 'checkbox',
      label: '',
      renderComponentContent: () => {
        return {
          default: () => ['我已阅读并同意'],
        };
      },
    },
    {
      component: 'Mentions',
      componentProps: {
        options: [
          {
            label: 'afc163',
            value: 'afc163',
          },
          {
            label: 'zombieJ',
            value: 'zombieJ',
          },
        ],
        placeholder: '请输入',
      },
      fieldName: 'mentions',
      label: '提及',
    },
    {
      component: 'Rate',
      fieldName: 'rate',
      label: '评分',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'switch',
      label: '开关',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: '日期选择框',
    },
    {
      component: 'RangePicker',
      fieldName: 'rangePicker',
      label: '范围选择器',
    },
    {
      component: 'TimePicker',
      fieldName: 'timePicker',
      label: '时间选择框',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        showSearch: true,
        treeData: [
          {
            label: 'root 1',
            value: 'root 1',
            children: [
              {
                label: 'parent 1',
                value: 'parent 1',
                children: [
                  {
                    label: 'parent 1-0',
                    value: 'parent 1-0',
                    children: [
                      {
                        label: 'my leaf',
                        value: 'leaf1',
                      },
                      {
                        label: 'your leaf',
                        value: 'leaf2',
                      },
                    ],
                  },
                  {
                    label: 'parent 1-1',
                    value: 'parent 1-1',
                  },
                ],
              },
              {
                label: 'parent 2',
                value: 'parent 2',
              },
            ],
          },
        ],
        treeNodeFilterProp: 'label',
      },
      fieldName: 'treeSelect',
      label: '树选择',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>

<template>
  <BaseForm />
</template>
```

Example 4 (jsx):
```jsx
<script lang="ts" setup>
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

const [QueryForm] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入用户名',
      },
      // 字段名
      fieldName: 'username',
      // 界面显示的label
      label: '字符串',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字(带后缀)',
      suffix: () => '¥',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'options',
      label: '下拉选',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: '日期选择框',
    },
  ],
  // 是否可展开
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>

<template>
  <QueryForm />
</template>
```

---
