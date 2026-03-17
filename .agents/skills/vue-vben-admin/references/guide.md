# Vue-Vben-Docs - Guide

**Pages:** 59

---

## 规范 | Vben Admin

**URL:** https://doc.vben.pro/guide/project/standard.html

**Contents:**
- 规范 ​
- 作用 ​
- 工具 ​
- ESLint ​
  - 命令 ​
  - 配置 ​
- Stylelint ​
  - 命令 ​
  - 配置 ​
- Prettier ​

具备基本工程素养的同学都会注重编码规范，而代码风格检查（Code Linting，简称 Lint）是保障代码规范一致性的重要手段。

项目的配置文件位于 internal/lint-configs 下，你可以在这里修改各种lint的配置。

ESLint 是一个代码规范和错误检查工具，用于识别和报告 TypeScript 代码中的语法错误。

eslint 配置文件为 eslint.config.mjs，其核心配置放在internal/lint-configs/eslint-config目录下，可以根据项目需求进行修改。

Stylelint 用于校验项目内部 css 的风格,加上编辑器的自动修复，可以很好的统一项目内部 css 风格

Stylelint 配置文件为 stylelint.config.mjs，其核心配置放在internal/lint-configs/stylelint-config目录下，可以根据项目需求进行修改。

Prettier 可以用于统一项目代码风格，统一的缩进，单双引号，尾逗号等等风格

Prettier 配置文件为 .prettier.mjs，其核心配置放在internal/lint-configs/prettier-config目录下，可以根据项目需求进行修改。

在一个团队中，每个人的 git 的 commit 信息都不一样，五花八门，没有一个机制很难保证规范化，如何才能规范化呢？可能你想到的是 git 的 hook 机制，去写 shell 脚本去实现。这当然可以，其实 JavaScript 有一个很好的工具可以实现这个模板，它就是 commitlint（用于校验 git 提交信息规范）。

CommitLint 配置文件为 .commitlintrc.mjs，其核心配置放在internal/lint-configs/commitlint-config目录下，可以根据项目需求进行修改。

如果你想关闭 Git 提交规范检查，有两种方式：

Publint 是一个用于检查 npm 包的规范的工具，可以检查包的版本号是否符合规范，是否符合标准的 ESM 规范包等等。

Cspell 是一个用于检查拼写错误的工具，可以检查代码中的拼写错误，避免因为拼写错误导致的 bug。

cspell 配置文件为 cspell.json，可以根据项目需求进行修改。

git hook 一般结合各种 lint，在 git 提交代码的时候进行代码风格校验，如果校验没通过，则不会进行提交。需要开发者自行修改后再次进行提交

有一个问题就是校验会校验全部代码，但是我们只想校验我们自己提交的代码，这个时候就可以使用 lefthook。

最有效的解决方案就是将 Lint 校验放到本地，常见做法是使用 lefthook 在本地提交之前先做一次 Lint 校验。

项目在 lefthook.yml 内部定义了相应的 hooks：

pre-commit: 在提交前运行，用于代码格式化和检查

post-merge: 在合并后运行，用于自动安装依赖

commit-msg: 在提交时运行，用于检查提交信息格式

如果你想关闭 lefthook，有两种方式：

如果你想修改 lefthook 的配置，可以编辑 lefthook.yml 文件。例如：

**Examples:**

Example 1 (unknown):
```unknown
pnpm eslint .
```

Example 2 (unknown):
```unknown
pnpm stylelint "**/*.{vue,css,less.scss}"
```

Example 3 (unknown):
```unknown
pnpm prettier .
```

Example 4 (unknown):
```unknown
git commit -m 'feat: add home page' --no-verify
```

---

## 服务端交互与数据Mock | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/server.html

**Contents:**
- 服务端交互与数据Mock ​
- 开发环境交互 ​
  - 本地开发跨域配置 ​
    - 配置本地开发接口地址 ​
    - 配置开发服务器代理 ​
    - 接口请求 ​
  - 没有跨域时的配置 ​
- 生产环境交互 ​
  - 接口地址配置 ​
  - 跨域处理 ​

本文档介绍如何在开发环境下使用 Mock 数据和与服务端进行交互，涉及到的技术有：

如果前端应用和后端接口服务器没有运行在同一个主机上，你需要在开发环境下将接口请求代理到接口服务器。如果是同一个主机，可以直接请求具体的接口地址。

本地开发跨域配置项目已经配置好了，如有其他需求，可以自行增加或者调整配置。

在项目根目录下的 .env.development 文件中配置接口地址，这里配置为 /api：

开发环境时候，如果需要处理跨域，接口地址在对应的应用目录下的 vite.config.mts 文件中配置：

根据上面的配置，我们可以在前端项目中使用 /api 作为接口请求的前缀，例如：

此时，请求会被代理到 http://localhost:5320/api/user。

从浏览器控制台的 Network 看，请求是 http://localhost:5555/api/user, 这是因为 proxy 配置不会改变本地请求的 url。

如果没有跨域问题，可以直接忽略 配置开发服务器代理 配置，直接将接口地址设置在 VITE_GLOB_API_URL

在项目根目录下的 .env.development 文件中配置接口地址：

在项目根目录下的 .env.production 文件中配置接口地址：

.env 文件内的 VITE_GLOB_* 开头的变量会在打包的时候注入 _app.config.js 文件内。在 dist/_app.config.js 修改相应的接口地址后刷新页面即可，不需要在根据不同环境打包多次，一次打包可以用于多个不同接口环境的部署。

生产环境如果出现跨域问题，可以使用 nginx 代理接口地址 或者后台开启 cors 进行处理即可（可参考mock服务）。

项目中默认自带了基于 axios 封装的基础的请求配置，核心由 @vben/request 包提供。项目没有过多的封装，只是简单的封装了一些常用的配置，如有其他需求，可以自行增加或者调整配置。针对不同的app，可能是用到了不同的组件库以及store,所以在应用目录下的src/api/request.ts文件夹下，有对应的请求配置文件,如web-antd项目下的src/api/request.ts文件,可以根据自己的需求进行配置。

除了基础的Axios配置外，扩展了部分配置。

应用内的src/api/request.ts可以根据自己应用的情况的需求进行配置：

只需要创建多个 requestClient 即可，如：

项目中默认提供了刷新 Token 的逻辑，只需要按照下面的配置即可开启：

调整对应应用目录下的preferences.ts，确保enableRefreshToken='true'。

在 src/api/request.ts 中配置 doRefreshToken 方法即可:

新版本不再支持生产环境 mock，请使用真实接口。

Mock 数据是前端开发过程中必不可少的一环，是分离前后端开发的关键链路。通过预先跟服务器端约定好的接口，模拟请求数据甚至逻辑，能够让前端开发独立自主，不会被服务端的开发进程所阻塞。

项目使用 Nitro 来进行本地 mock 数据处理。其原理是本地额外启动一个后端服务，是一个真实的后端服务，可以处理请求，返回数据。

Mock 服务代码位于apps/backend-mock目录下，无需手动启动，已经集成在项目中，只需要在项目根目录下运行pnpm dev即可，运行成功之后，控制台会打印 http://localhost:5320/api, 访问该地址即可查看 mock 服务。

Nitro 语法简单，可以根据自己的需求进行配置及开发，具体配置可以查看 Nitro 文档。

mock的本质是一个真实的后端服务，如果不需要 mock 服务，可以在项目根目录下的 .env.development 文件中配置 VITE_NITRO_MOCK=false 即可关闭 mock 服务。

**Examples:**

Example 1 (unknown):
```unknown
VITE_GLOB_API_URL=/api
```

Example 2 (javascript):
```javascript
// apps/web-antd/vite.config.mts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
```

Example 3 (javascript):
```javascript
import axios from 'axios';

axios.get('/api/user').then((res) => {
  console.log(res);
});
```

Example 4 (sass):
```sass
VITE_GLOB_API_URL=https://mock-napi.vben.pro/api
```

---

## Access Control | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/access.html

**Contents:**
- Access Control ​
- Frontend Access Control ​
  - Steps ​
    - If not configured, it is visible by default ​
  - Menu Visible but Access Forbidden ​
- Backend Access Control ​
  - Steps ​
- Mixed Access Control ​
  - Steps ​
- Fine-grained Control of Buttons ​

The framework has built-in three types of access control methods:

Implementation Principle: The permissions for routes are hardcoded on the frontend, specifying which permissions are required to view certain routes. Only general routes are initialized, and routes that require permissions are not added to the route table. After logging in or obtaining user roles through other means, the roles are used to traverse the route table to generate a route table that the role can access. This table is then added to the router instance using router.addRoute, achieving permission filtering.

Disadvantage: The permissions are relatively inflexible; if the backend changes roles, the frontend needs to be adjusted accordingly. This is suitable for systems with relatively fixed roles.

Adjust preferences.ts in the corresponding application directory to ensure accessMode='frontend'.

You can look under src/store/auth in the application to find the following code:

At this point, the configuration is complete. You need to ensure that the roles returned by the interface after login match the permissions in the route table; otherwise, access will not be possible.

Sometimes, we need the menu to be visible but access to it forbidden. This can be achieved by setting menuVisibleWithForbidden to true. In this case, the menu will be visible, but access will be forbidden, redirecting to a 403 page.

Implementation Principle: It is achieved by dynamically generating a routing table through an API, which returns data following a certain structure. The frontend processes this data into a recognizable structure, then adds it to the routing instance using router.addRoute, realizing the dynamic generation of permissions.

Disadvantage: The backend needs to provide a data structure that meets the standards, and the frontend needs to process this structure. This is suitable for systems with more complex permissions.

Adjust preferences.ts in the corresponding application directory to ensure accessMode='backend'.

You can look under src/router/access.ts in the application to find the following code:

At this point, the configuration is complete. You need to ensure that after logging in, the format of the menu returned by the interface is correct; otherwise, access will not be possible.

Implementation Principle: Mixed mode combines both frontend access control and backend access control methods. The system processes frontend fixed route permissions and backend dynamic menu data in parallel, ultimately merging both parts of routes to provide a more flexible access control solution.

Advantages: Combines the performance advantages of frontend control with the flexibility of backend control, suitable for complex business scenarios requiring permission management.

Adjust preferences.ts in the corresponding application directory to ensure accessMode='mixed'.

Same as the route permission configuration method in Frontend Access Control mode.

Same as the interface configuration method in Backend Access Control mode.

Must satisfy both frontend route permission configuration and backend menu data return requirements, ensuring user roles match the permission configurations of both modes.

At this point, the configuration is complete. Mixed mode will automatically merge frontend and backend routes, providing complete access control functionality.

In some cases, we need to control the display of buttons with fine granularity. We can control the display of buttons through interfaces or roles.

The permission code is the code returned by the interface. The logic to determine whether a button is displayed is located under src/store/auth:

Locate the getAccessCodes corresponding interface, which can be adjusted according to business logic.

The data structure returned by the permission code is an array of strings, for example: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010']

With the permission codes, you can use the AccessControl component and API provided by @vben/access to show and hide buttons.

The directive supports binding single or multiple permission codes. For a single one, you can pass a string or an array containing one permission code, and for multiple permission codes, you can pass an array.

The method of determining roles does not require permission codes returned by the interface; it directly determines whether buttons are displayed based on roles.

The directive supports binding single or multiple permission codes. For a single one, you can pass a string or an array containing one permission code, and for multiple permission codes, you can pass an array.

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // Default value, optional
    accessMode: 'frontend',
  },
});
```

Example 2 (json):
```json
{
    meta: {
      authority: ['super'],
    },
},
```

Example 3 (sql):
```sql
// Set the login user information, ensuring that userInfo.roles is an array and contains permissions from the route table
// For example: userInfo.roles=['super', 'admin']
authStore.setUserInfo(userInfo);
```

Example 4 (json):
```json
{
    meta: {
      menuVisibleWithForbidden: true,
    },
},
```

---

## Standards | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/standard.html

**Contents:**
- Standards ​
- Purpose ​
- Tools ​
- ESLint ​
  - Command ​
  - Configuration ​
- Stylelint ​
  - Command ​
  - Configuration ​
- Prettier ​

Students with basic engineering literacy always pay attention to coding standards, and code style checking (Code Linting, simply called Lint) is an important means to ensure the consistency of coding standards.

Following the corresponding coding standards has the following benefits:

The project's configuration files are located in internal/lint-configs, where you can modify various lint configurations.

The project integrates the following code verification tools:

ESLint is a code standard and error checking tool used to identify and report syntax errors in TypeScript code.

The ESLint configuration file is eslint.config.mjs, with its core configuration located in the internal/lint-configs/eslint-config directory, which can be modified according to project needs.

Stylelint is used to check the style of CSS within the project. Coupled with the editor's auto-fix feature, it can effectively unify the CSS style within the project.

The Stylelint configuration file is stylelint.config.mjs, with its core configuration located in the internal/lint-configs/stylelint-config directory, which can be modified according to project needs.

Prettier Can be used to unify project code style, consistent indentation, single and double quotes, trailing commas, and other styles.

The Prettier configuration file is .prettier.mjs, with its core configuration located in the internal/lint-configs/prettier-config directory, which can be modified according to project needs.

In a team, everyone's git commit messages can vary widely, making it difficult to ensure standardization without a mechanism. How can standardization be achieved? You might think of using git's hook mechanism to write shell scripts to implement this. Of course, this is possible, but actually, JavaScript has a great tool for implementing this template, which is commitlint (used for verifying the standard of git commit messages).

The CommitLint configuration file is .commitlintrc.mjs, with its core configuration located in the internal/lint-configs/commitlint-config directory, which can be modified according to project needs.

If you want to disable Git commit standard checks, there are two ways:

Publint is a tool for checking the standard of npm packages, which can check whether the package version conforms to the standard, whether it conforms to the standard ESM package specification, etc.

Cspell is a tool for checking spelling errors, which can check for spelling errors in the code, avoiding bugs caused by spelling errors.

The cspell configuration file is cspell.json, which can be modified according to project needs.

Git hooks are generally combined with various lints to check code style during git commits. If the check fails, the commit will not proceed. Developers need to modify and resubmit.

One issue is that the check will verify all code, but we only want to check the code we are committing. This is where lefthook comes in.

The most effective solution is to perform Lint checks locally before committing. A common practice is to use lefthook to perform a Lint check before local submission.

The project defines corresponding hooks inside lefthook.yml:

pre-commit: Runs before commit, used for code formatting and checking

post-merge: Runs after merge, used for automatic dependency installation

commit-msg: Runs during commit, used for checking commit message format

If you want to disable lefthook, there are two ways:

If you want to modify lefthook's configuration, you can edit the lefthook.yml file. For example:

**Examples:**

Example 1 (unknown):
```unknown
pnpm eslint .
```

Example 2 (unknown):
```unknown
pnpm stylelint "**/*.{vue,css,less.scss}"
```

Example 3 (unknown):
```unknown
pnpm prettier .
```

Example 4 (unknown):
```unknown
git commit -m 'feat: add home page' --no-verify
```

---

## Build and Deployment | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/build.html

**Contents:**
- Build and Deployment ​
- Building ​
- Preview ​
- Compression ​
  - Enable gzip Compression ​
  - Enable brotli Compression ​
  - Enable Both gzip and brotli Compression ​
- Build Analysis ​
- Deployment ​
  - Integration of Frontend Routing and Server ​

Since this is a demonstration project, the package size after building is relatively large. If there are plugins in the project that are not used, you can delete the corresponding files or routes. If they are not referenced, they will not be packaged.

After the project development is completed, execute the following command to build:

Note: Please execute the following command in the project root directory.

After the build is successful, a dist folder for the corresponding application will be generated in the root directory, which contains the built and packaged files, for example: apps/web-antd/dist/

Before publishing, you can preview it locally in several ways, here are two:

Note： Please execute the following command in the project root directory.

After waiting for the build to succeed, visit http://localhost:4173 to view the effect.

You can globally install a serve service on your computer, such as live-server,

Then execute the live-server command in the dist directory to view the effect locally.

To enable during the build process, change the .env.production configuration:

To enable during the build process, change the .env.production configuration:

To enable during the build process, change the .env.production configuration:

Both gzip and brotli require specific modules to be installed for use.

If your build files are large, you can optimize your code by analyzing the code size with the built-in rollup-plugin-analyzer plugin. Just execute the following command in the root directory:

After running, you can see the specific distribution of sizes on the automatically opened page to analyze which dependencies are problematic.

A simple deployment only requires publishing the final static files, the static files in the dist folder, to your CDN or static server. It's important to note that the index.html is usually the entry page for your backend service. After determining the static js and css, you may need to change the page's import path.

For example, to upload to an nginx server, you can upload the files under the dist folder to the server's /srv/www/project/index.html directory, and then access the configured domain name.

If you find the resource path is incorrect during deployment, you just need to modify the .env.production file.

The project uses vue-router for frontend routing, so you can choose between two modes: history and hash.

You can modify the mode in .env.production:

Enabling history mode requires server configuration. For more details on server configuration, see history-mode

Here is an example of nginx configuration:

Using nginx to handle cross-domain issues after project deployment

**Examples:**

Example 1 (unknown):
```unknown
pnpm preview
```

Example 2 (unknown):
```unknown
npm i -g live-server
```

Example 3 (markdown):
```markdown
cd apps/web-antd/dist
# Local preview, default port 8080
live-server
# Specify port
live-server --port 9000
```

Example 4 (sass):
```sass
VITE_COMPRESS=gzip
```

---

## Server Interaction and Data Mocking | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/server.html

**Contents:**
- Server Interaction and Data Mocking ​
- Interaction in Development Environment ​
  - Local Development CORS Configuration ​
    - Configuring Local Development API Endpoint ​
    - Configuring Development Server Proxy ​
    - API Requests ​
  - Configuration Without CORS ​
- Production Environment Interaction ​
  - API Endpoint Configuration ​
  - Cross-Origin Resource Sharing (CORS) Handling ​

This document explains how to use Mock data and interact with the server in a development environment, involving technologies such as:

If the frontend application and the backend API server are not running on the same host, you need to proxy the API requests to the API server in the development environment. If they are on the same host, you can directly request the specific API endpoint.

The CORS configuration for local development has already been set up. If you have other requirements, you can add or adjust the configuration as needed.

Configure the API endpoint in the .env.development file at the project root directory, here it is set to /api:

In the development environment, if you need to handle CORS, configure the API endpoint in the vite.config.mts file under the corresponding application directory:

Based on the above configuration, we can use /api as the prefix for API requests in our frontend project, for example:

At this point, the request will be proxied to http://localhost:5320/api/user.

From the browser's console Network tab, the request appears as http://localhost:5555/api/user. This is because the proxy configuration does not change the local request's URL.

If there is no CORS issue, you can directly ignore the Configure Development Server Proxy settings and set the API endpoint directly in VITE_GLOB_API_URL.

Configure the API endpoint in the .env.development file at the project root directory:

Configure the API endpoint in the .env.production file at the project root directory:

How to Dynamically Modify API Endpoint in Production

Variables starting with VITE_GLOB_* in the .env file are injected into the _app.config.js file during packaging. After packaging, you can modify the corresponding API addresses in dist/_app.config.js and refresh the page to apply the changes. This eliminates the need to package multiple times for different environments, allowing a single package to be deployed across multiple API environments.

In the production environment, if CORS issues arise, you can use nginx to proxy the API address or enable cors on the backend to handle it (refer to the mock service for examples).

The project comes with a default basic request configuration based on axios, provided by the @vben/request package. The project does not overly complicate things but simply wraps some common configurations. If there are other requirements, you can add or adjust the configurations as needed. Depending on the app, different component libraries and store might be used, so under the src/api/request.ts folder in the application directory, there are corresponding request configuration files. For example, in the web-antd project, there's a src/api/request.ts file where you can configure according to your needs.

The src/api/request.ts within the application can be configured according to the needs of your application:

To handle multiple API endpoints, simply create multiple requestClient instances, as follows:

The project provides a default logic for refreshing tokens. To enable it, follow the configuration below:

Adjust the preferences.ts in the corresponding application directory to ensure enableRefreshToken='true'.

Configure the doRefreshToken method in src/api/request.ts as follows:

Production Environment Mock

The new version no longer supports mock in the production environment. Please use real interfaces.

Mock data is an indispensable part of frontend development, serving as a key link in separating frontend and backend development. By agreeing on interfaces with the server side in advance and simulating request data and even logic, frontend development can proceed independently, without being blocked by the backend development process.

The project uses Nitro for local mock data processing. The principle is to start an additional backend service locally, which is a real backend service that can handle requests and return data.

The mock service code is located in the apps/backend-mock directory. It does not need to be started manually and is already integrated into the project. You only need to run pnpm dev in the project root directory. After running successfully, the console will print http://localhost:5320/api, and you can access this address to view the mock service.

Nitro syntax is simple, and you can configure and develop according to your needs. For specific configurations, you can refer to the Nitro documentation.

Since mock is essentially a real backend service, if you do not need the mock service, you can configure VITE_NITRO_MOCK=false in the .env.development file in the project root directory to disable the mock service.

**Examples:**

Example 1 (unknown):
```unknown
VITE_GLOB_API_URL=/api
```

Example 2 (javascript):
```javascript
// apps/web-antd/vite.config.mts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock proxy
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
```

Example 3 (javascript):
```javascript
import axios from 'axios';

axios.get('/api/user').then((res) => {
  console.log(res);
});
```

Example 4 (sass):
```sass
VITE_GLOB_API_URL=https://mock-napi.vben.pro/api
```

---

## External Modules | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/external-module.html

**Contents:**
- External Modules ​
- Installing Dependencies ​
- Usage ​
  - Global Import ​
    - Usage ​
  - Partial Import ​
- Contributors
- Changelog

In addition to the external modules that are included by default in the project, sometimes we need to import other external modules. Let's take ant-design-vue as an example:

Install dependencies into a specific package

**Examples:**

Example 1 (go):
```go
# cd /path/to/your/package
pnpm add ant-design-vue
```

Example 2 (sql):
```sql
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(Antd).mount('#app');
```

Example 3 (vue):
```vue
<template>
  <a-button>text</a-button>
</template>
```

Example 4 (vue):
```vue
<script setup lang="ts">
import { Button } from 'ant-design-vue';
</script>

<template>
  <Button>text</Button>
</template>
```

---

## Local Development | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/development.html

**Contents:**
- Local Development ​
- Prerequisites ​
  - Required Basic Knowledge ​
  - Tool Configuration ​
- Npm Scripts ​
- Running the Project Locally ​
  - Distinguishing Build Environments ​
- Public Static Resources ​
- DevTools ​
- Running Documentation Locally ​

If you haven't acquired the code yet, you can start by reading the documentation from Quick Start.

For a better development experience, we provide some tool configurations and project descriptions to facilitate your development.

This project requires some basic frontend knowledge. Please ensure you are familiar with the basics of Vue to handle common issues. It is recommended to learn the following topics before development. Understanding these will be very helpful for the project:

If you are using vscode (recommended) as your IDE, you can install the following tools to improve development efficiency and code formatting:

Npm scripts are common configurations used in the project to perform common tasks such as starting the project, building the project, etc. The following scripts can be found in the package.json file at the root of the project.

The execution command is: pnpm run [script] or npm run [script].

To run the documentation locally and make adjustments, you can execute the following command. This command allows you to select the application you want to develop:

If you want to run a specific application directly, you can execute the following commands:

To run the web-antd application:

To run the web-naive application:

To run the web-ele application:

To run the docs application:

In actual business development, multiple environments are usually distinguished during the build process, such as the test environment test and the production environment build.

At this point, you can modify three files and add corresponding script configurations to distinguish between production environments.

Take the addition of the test environment test to @vben/web-antd as an example:

Add the command "build:test" and change the original "build" to "build:prod" to avoid building packages for two environments simultaneously.

Add the command to build the test environment in the root directory package.json.

Add the relevant dependent commands in turbo.json.

If you need to use public static resources in the project, such as images, static HTML, etc., and you want to directly import them in the development process through src="/xxx.png".

You need to put the resource in the corresponding project's public/static directory. The import path for the resource should be src="/static/xxx.png".

The project has a built-in Vue DevTools plugin, which can be used during development. It is disabled by default, but can be enabled in the .env.development file. After enabling it, restart the project:

Once enabled, a Vue DevTools icon will appear at the bottom of the page during project runtime. Click it to open the DevTools.

To run the documentation locally and make adjustments, you can execute the following command:

If you encounter dependency-related issues, you can try reinstalling the dependencies:

**Examples:**

Example 1 (json):
```json
{
  "scripts": {
    // Build the project
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build",
    // Build the project with analysis
    "build:analyze": "turbo build:analyze",
    // Build a local Docker image
    "build:docker": "./build-local-docker-image.sh",
    // Build the web-antd application separately
    "build:antd": "pnpm run build --filter=@vben/web-antd",
    // Build the documentation separately
    "build:docs": "pnpm run build --filter=@vben/docs",
    // Build the web-ele application separately
    "build:ele": "pnpm run build --filter=@vben/web-ele",
    // Build the web-naive application separately
    "build:naive": "pnpm run build --filter=@vben/naive",
    // Build the web-tdesign application separately
    "build:tdesign": "pnpm run build --filter=@vben/web-tdesign",
    // Build the playground application separately
    "build:play": "pnpm run build --filter=@vben/playground",
    // Changeset version management
    "changeset": "pnpm exec changeset",
    // Check for various issues in the project
    "check": "pnpm run check:circular && pnpm run check:dep && pnpm run check:type && pnpm check:cspell",
    // Check for circular dependencies
    "check:circular": "vsh check-circular",
    // Check spelling
    "check:cspell": "cspell lint **/*.ts **/README.md .changeset/*.md --no-progress"
    // Check dependencies
    "check:dep": "vsh check-dep",
    // Check types
    "check:type": "turbo run typecheck",
    // Clean the project (delete node_modules, dist, .turbo, etc.)
    "clean": "node ./scripts/clean.mjs",
    // Commit code
    "commit": "czg",
    // Start the project (by default, the dev scripts of all packages in the entire repository will run)
    "dev": "turbo-run dev",
    // Start the web-antd application
    "dev:antd": "pnpm -F @vben/web-antd run dev",
    // Start the documentation
    "dev:docs": "pnpm -F @vben/docs run dev",
    // Start the web-ele application
    "dev:ele": "pnpm -F @vben/web-ele run dev",
    // Start the web-naive application
    "dev:naive": "pnpm -F @vben/web-naive run dev",
    // Start the playground application
    "dev:play": "pnpm -F @vben/playground run dev",
    // Format code
    "format": "vsh lint --format",
    // Lint code
    "lint": "vsh lint",
    // After installing dependencies, execute the stub script for all packages
    "postinstall": "pnpm -r run stub --if-present",
    // Only allow using pnpm
    "preinstall": "npx only-allow pnpm",
    // Install lefthook
    "prepare": "is-ci || lefthook install",
    // Preview the application
    "preview": "turbo-run preview",
    // Package specification check
    "publint": "vsh publint",
    // Delete all node_modules, yarn.lock, package.lock.json, and reinstall dependencies
    "reinstall": "pnpm clean --del-lock && pnpm install",
    // Run vitest unit tests
    "test:unit": "vitest run --dom",
    // Update project dependencies
    "update:deps": " pnpm update --latest --recursive",
    // Changeset generation and versioning
    "version": "pnpm exec changeset version && pnpm install --no-frozen-lockfile"
  }
}
```

Example 2 (unknown):
```unknown
pnpm dev:antd
```

Example 3 (unknown):
```unknown
pnpm dev:naive
```

Example 4 (unknown):
```unknown
pnpm dev:ele
```

---

## 样式 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/styles.html

**Contents:**
- 样式 ​
- 项目结构 ​
- Scss ​
- Postcss ​
- Tailwind CSS ​
- BEM 规范 ​
- CSS Modules ​
- 贡献者
- 页面历史

对于 vue 项目，官方文档 对语法已经有比较详细的介绍，这里主要是介绍项目中的样式文件结构和使用。

项目中的样式文件存放在 @vben/styles，包含一些全局样式，如重置样式、全局变量等，它继承了 @vben-core/design 的样式和能力，可以根据项目需求进行覆盖。

项目中使用 scss 作为样式预处理器，可以在项目中使用 scss 的特性，如变量、函数、混合等。

如果你不习惯使用 scss，也可以使用 postcss，它是一个更加强大的样式处理器，可以使用更多的插件，项目内置了 postcss-nested 插件，配置 Css Variables，完全可以取代 scss。

项目中集成了 Tailwind CSS，可以在项目中使用 tailwindcss 的类名，快速构建页面。

样式冲突的另一种选择，是使用 BEM 规范。如果选择 scss ，建议使用 BEM 命名规范，可以更好的管理样式。项目默认提供了useNamespace函数，可以方便的生成命名空间。

针对样式冲突问题，还有一种方案是使用 CSS Modules 模块化方案。使用方式如下。

更多用法可以见 CSS Modules 官方文档。

**Examples:**

Example 1 (sass):
```sass
<style lang="scss" scoped>
$font-size: 30px;

.box {
  .title {
    color: green;
    font-size: $font-size;
  }
}
</style>
```

Example 2 (css):
```css
<style scoped>
.box {
  --font-size: 30px;
  .title {
    color: green;
    font-size: var(--font-size);
  }
}
</style>
```

Example 3 (vue):
```vue
<template>
  <div class="bg-white p-4">
    <p class="text-green">hello world</p>
  </div>
</template>
```

Example 4 (typescript):
```typescript
<script lang="ts" setup>
import { useNamespace } from '@vben/hooks';

const { b, e, is } = useNamespace('menu');
</script>
<template>
  <div :class="[b()]">
    <div :class="[e('item'), is('active', true)]">item1</div>
  </div>
</template>
<style lang="scss" scoped>
// 如果你在应用内使用，这行代码可以省略，已经在所有的应用内全局引入了
@use '@vben/styles/global' as *;
@include b('menu') {
  color: black;

  @include e('item') {
    background-color: black;

    @include is('active') {
      background-color: red;
    }
  }
}
</style>
```

---

## 项目更新 | Vben Admin

**URL:** https://doc.vben.pro/guide/other/project-update.html

**Contents:**
- 项目更新 ​
- 为什么无法像 npm 插件一样更新 ​
- 我需要怎么做 ​
- 使用 Git 更新代码 ​
- 贡献者
- 页面历史

因为项目是一个完整的项目模版，不是一个插件或者安装包，无法像插件一样更新，你使用代码后，会根据业务需求，进行二次开发，需要自行手动合并升级。

项目采用了 Monorepo 的方式进行管理，并将一些比较核心的代码进行了抽离，比如 packages/@core、packages/effects，只要业务代码没有修改这部分代码，那么你可以直接拉取最新代码，然后合并到你的分支上，只需要简单的处理部分冲突即可。其余文件夹只会进行一些小的调整，不会对业务代码产生影响。

建议关注仓库动态，积极去合并，不要长时间积累，否则将会导致合并冲突过多，增加合并难度。

同步代码的时候会出现冲突。只需要把冲突解决即可

**Examples:**

Example 1 (unknown):
```unknown
git clone https://github.com/vbenjs/vue-vben-admin.git
```

Example 2 (markdown):
```markdown
# up 为源名称,可以随意设置
# gitUrl为开源最新代码
git remote add up gitUrl;
```

Example 3 (markdown):
```markdown
# 提交代码到自己公司
# main为分支名 需要自行根据情况修改
git push up main

# 同步公司的代码
# main为分支名 需要自行根据情况修改
git pull up main
```

Example 4 (unknown):
```unknown
git pull origin main
```

---

## 常用功能 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/features.html

**Contents:**
- 常用功能 ​
- 登录认证过期 ​
  - 跳转登录页面 ​
  - 打开登录弹窗 ​
- 动态标题 ​
- 页面水印 ​
- 贡献者
- 页面历史

当接口返回401状态码时，框架会认为登录认证过期，登录超时会跳转到登录页或者打开登录弹窗。在应用目录下的preferences.ts可以配置：

开启后网页标题随着路由的title而变化。在应用目录下的preferences.ts，开启或者关闭即可。

开启后网页会显示水印，在应用目录下的preferences.ts，开启或者关闭即可。

如果你想更新水印的内容，可以这么做，参数可以参考 watermark-js-plus：

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    loginExpiredMode: 'page',
  },
});
```

Example 2 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    loginExpiredMode: 'modal',
  },
});
```

Example 3 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    dynamicTitle: true,
  },
});
```

Example 4 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    watermark: true,
  },
});
```

---

## About Vben Admin | Vben Admin

**URL:** https://doc.vben.pro/en/guide/introduction/vben.html

**Contents:**
- About Vben Admin ​
- Features ​
- Browser Support ​
- Contribution ​
- Contributors
- Changelog

You are reading the documentation for Vben Admin version 5.0!

Vben Admin is a backend solution based on Vue 3.0, Vite, and TypeScript, aimed at providing an out-of-the-box solution for developing medium to large-scale projects. It includes features like component re-encapsulation, utilities, hooks, dynamic menus, permission validation, multi-theme configurations, and button-level permission control. The project uses the latest frontend technology stack, making it a good starting template for quickly building enterprise-level mid- to backend product prototypes. It can also serve as an example for learning vue3, vite, ts, and other mainstream technologies. The project will continue to follow the latest technologies and apply them within the project.

Local development is recommended using the latest version of Chrome. Versions below Chrome 80 are not supported.

Production environment supports modern browsers, IE is not supported.

---

## Common Features | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/features.html

**Contents:**
- Common Features ​
- Login Authentication Expiry ​
  - Redirect to Login Page ​
  - Open Login Popup ​
- Dynamic Title ​
- Page Watermark ​
- Contributors
- Changelog

A collection of some commonly used features.

When the interface returns a 401 status code, the framework will consider the login authentication to have expired. Upon login timeout, it will redirect to the login page or open a login popup. This can be configured in preferences.ts in the application directory:

Upon login timeout, it will redirect to the login page.

When login times out, a login popup will open.

When enabled, the webpage title changes according to the route's title. You can enable or disable this in the preferences.ts file in your application directory.

When enabled, the webpage will display a watermark. You can enable or disable this in the preferences.ts file in your application directory.

If you want to update the content of the watermark, you can do so. The parameters can be referred to watermark-js-plus:

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    loginExpiredMode: 'page',
  },
});
```

Example 2 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    loginExpiredMode: 'modal',
  },
});
```

Example 3 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    dynamicTitle: true,
  },
});
```

Example 4 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    watermark: true,
  },
});
```

---

## 为什么选择我们? | Vben Admin

**URL:** https://doc.vben.pro/guide/introduction/why.html

**Contents:**
- 为什么选择我们? ​
- 框架历程 ​
- 单元测试 ​
- 质量与规范 ​
- 贡献者
- 页面历史

我们不会去和其他框架做比较。我们认为每个框架都有自己的特点，适合不同的场景。我们的目标是提供一个简单、易用的框架，让开发者可以快速上手，专注于业务逻辑的开发。所以我们只会不断完善和优化我们的框架，提供更好的体验。

我们致力于为开发者提供一个高效、现代、易用的前端框架。我们的解决方案基于最新的技术栈，如 Vue3、Vite 和 TypeScript，确保您在构建项目时始终走在技术的前沿。同时，我们注重代码的质量与规范，通过严格的工具链保证代码的一致性和可维护性。无论是初创项目还是企业级应用，我们的框架都能帮助您快速构建、迭代和部署。

从 Vue Vben Admin 1.x 版本开始，框架经历了许多迭代和优化。从一开始使用 Vite 0.x 版本，没有现成的插件，开发了很多自定义插件来弥合 Webpack 和 Vite 之间的差异。虽然很多现在已经被代替，但是我们的初衷一直没有变，就是提供一个简单、易用的框架。

虽然中间有段时间由社区维护，但我们一直密切关注 Vue Vben Admin 的发展。见证了许多开发者使用 Vben Admin，并提供了许多宝贵的建议和反馈。非常感谢大家的支持和贡献，这些都是我们持续改进 Vben Admin 的动力。新版本中，我们持续收集用户反馈，重新开始，不断优化框架，以提供更好的用户体验。我们的目标是让开发者能够快速上手，专注于业务逻辑的开发。

单元测试是确保代码质量的基石。在开发过程中编写和执行单元测试，以捕捉潜在的错误并提升代码的可靠性。框架核心逻辑使用 vitest 做了单元测试，并在逐步增加覆盖率。通过单元测试，可以放心地进行代码重构，减少回归问题，从而提高整体开发效率。

我们始终高度重视代码的质量与规范。通过使用 ESLint、Prettier、Stylelint、Publint、CSpell 等工具来确保代码质量。我们的代码规范基于 Vue3、Vite、TypeScript 等现代前端技术制定，旨在提供一个简洁、易用的框架，使开发者能够快速上手并专注于业务逻辑的开发。

---

## 路由和菜单 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/route.html

**Contents:**
- 路由和菜单 ​
- 路由类型 ​
  - 核心路由 ​
  - 静态路由 ​
  - 动态路由 ​
- 路由定义 ​
  - 二级路由 ​
  - 多级路由 ​
- 新增页面 ​
  - 添加路由 ​

在项目中，框架提供了一套基础的路由系统，并根据路由文件自动生成对应的菜单结构。

路由分为核心路由、静态路由和动态路由，核心路由是框架内置的路由，包含了根路由、登录路由、404路由等；静态路由是在项目启动时就已经确定的路由；动态路由一般是在用户登录后，根据用户的权限动态生成的路由。

静态路由和动态路由都会走权限控制，可以通过配置路由的 meta 属性中的 authority 字段来控制权限，可以参考路由权限控制。

核心路由是框架内置的路由，包含了根路由、登录路由、404路由等，核心路由的配置在应用下 src/router/routes/core 目录下

核心路由主要用于框架的基础功能，因此不建议将业务相关的路由放在核心路由中，推荐将业务相关的路由放在静态路由或动态路由中。

静态路由的配置在应用下 src/router/routes/index 目录下，打开注释的文件内容:

权限控制是通过路由的 meta 属性中的 authority 字段来控制的，如果你的页面项目不需要权限控制，可以不设置 authority 字段。

动态路由的配置在对应应用 src/router/routes/modules 目录下，这个目录下存放了所有的路由文件。每个文件的内容格式如下，与 Vue Router 的路由配置格式一致，以下为二级路由和多级路由的配置。

静态路由与动态路由的配置方式一致，以下为二级路由和多级路由的配置：

新增一个页面，你只需要添加一个路由及对应的页面组件即可。

在对应的路由文件中添加一个路由对象，如下：

在#/views/home/下，新增一个index.vue文件，如下：

到这里页面已添加完成，访问 http://localhost:5555/home/index 出现对应的页面即可。

路由配置项主要在对象路由的 meta 属性中，以下为常用的配置项：

用于配置页面的标题，会在菜单和标签页中显示。一般会配合国际化使用。

用于配置页面的图标，会在菜单和标签页中显示。一般会配合图标库使用，如果是http链接，会自动加载图片。

用于配置页面的激活图标，会在菜单中显示。一般会配合图标库使用，如果是http链接，会自动加载图片。

用于配置页面是否开启缓存，开启后页面会缓存，不会重新加载，仅在标签页启用时有效。

用于配置页面是否在菜单中隐藏，隐藏后页面不会在菜单中显示。

用于配置页面是否在标签页中隐藏，隐藏后页面不会在标签页中显示。

用于配置页面是否在面包屑中隐藏，隐藏后页面不会在面包屑中显示。

用于配置页面的子页面是否在菜单中隐藏，隐藏后子页面不会在菜单中显示。

用于配置页面的权限，只有拥有对应权限的用户才能访问页面，不配置则不需要权限。

用于配置页面的徽标类型，dot 为小红点，normal 为文本。

是否将路由的完整路径作为tab key（默认true）

用于配置当前激活的菜单，有时候页面没有显示在菜单内，需要激活父级菜单时使用。

用于配置页面是否固定标签页，固定后页面不可关闭。

用于配置页面固定标签页的排序, 采用升序排序。

用于配置内嵌页面的 iframe 地址，设置后会在当前页面内嵌对应的页面。

用于配置标签页最大打开数量，设置后会在打开新标签页时自动关闭最早打开的标签页(仅在打开同名标签页时生效)。

用于配置页面在菜单可以看到，但是访问会被重定向到403。

设置为 true 时，会在新窗口打开页面。

注意: 排序仅针对一级菜单有效，二级菜单的排序需要在对应的一级菜单中按代码顺序设置。

用于配置页面的菜单参数，会在菜单中传递给页面。

用于配置当前路由不使用基础布局，仅在顶级时生效。默认情况下，所有的路由都会被包裹在基础布局中（包含顶部以及侧边等导航部件），如果你的页面不需要这些部件，可以设置 noBasicLayout 为 true。

用于配置当前路由是否要将route对应dom元素缓存起来。对于一些复杂页面切换tab浏览器回流/重绘会导致卡顿， domCached 设为 true可解决该问题，但是也有代价：1、内存占用升高 2、vue的部分生命周期不会触发

在某些场景下，需要单个路由打开多个标签页，或者修改路由的query不打开新的标签页

每个标签页Tab使用唯一的key标识，设置Tab key有三种方式，优先级由高到低：

meta 属性中的 fullPathKey不为false，则使用路由fullPath作为key

meta 属性中的 fullPathKey为false，则使用路由path作为key

**Examples:**

Example 1 (typescript):
```typescript
// 有需要可以自行打开注释，并创建文件夹
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true }); 
/** 动态路由 */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** 外部路由列表，访问这些页面可以不需要Layout，可能用于内嵌在别的系统 */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles)
const externalRoutes: RouteRecordRaw[] = []; 
const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
```

Example 2 (json):
```json
import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      badgeVariants: 'destructive',
      icon: VBEN_LOGO_URL,
      order: 9999,
      title: $t('page.vben.title'),
    },
    name: 'VbenProject',
    path: '/vben-admin',
    redirect: '/vben-admin/about',
    children: [
      {
        name: 'VbenAbout',
        path: '/vben-admin/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          badgeType: 'dot',
          badgeVariants: 'destructive',
          icon: 'lucide:copyright',
          title: $t('page.vben.about'),
        },
      },
    ],
  },
];

export default routes;
```

Example 3 (json):
```json
import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    redirect: '/demos/access',
    children: [
      // 嵌套菜单
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('demos.nested.title'),
        },
        name: 'NestedDemos',
        path: '/demos/nested',
        redirect: '/demos/nested/menu1',
        children: [
          {
            name: 'Menu1Demo',
            path: '/demos/nested/menu1',
            component: () => import('#/views/demos/nested/menu-1.vue'),
            meta: {
              icon: 'ic:round-menu',
              keepAlive: true,
              title: $t('demos.nested.menu1'),
            },
          },
          {
            name: 'Menu2Demo',
            path: '/demos/nested/menu2',
            meta: {
              icon: 'ic:round-menu',
              keepAlive: true,
              title: $t('demos.nested.menu2'),
            },
            redirect: '/demos/nested/menu2/menu2-1',
            children: [
              {
                name: 'Menu21Demo',
                path: '/demos/nested/menu2/menu2-1',
                component: () => import('#/views/demos/nested/menu-2-1.vue'),
                meta: {
                  icon: 'ic:round-menu',
                  keepAlive: true,
                  title: $t('demos.nested.menu2_1'),
                },
              },
            ],
          },
          {
            name: 'Menu3Demo',
            path: '/demos/nested/menu3',
            meta: {
              icon: 'ic:round-menu',
              title: $t('demos.nested.menu3'),
            },
            redirect: '/demos/nested/menu3/menu3-1',
            children: [
              {
                name: 'Menu31Demo',
                path: 'menu3-1',
                component: () => import('#/views/demos/nested/menu-3-1.vue'),
                meta: {
                  icon: 'ic:round-menu',
                  keepAlive: true,
                  title: $t('demos.nested.menu3_1'),
                },
              },
              {
                name: 'Menu32Demo',
                path: 'menu3-2',
                meta: {
                  icon: 'ic:round-menu',
                  title: $t('demos.nested.menu3_2'),
                },
                redirect: '/demos/nested/menu3/menu3-2/menu3-2-1',
                children: [
                  {
                    name: 'Menu321Demo',
                    path: '/demos/nested/menu3/menu3-2/menu3-2-1',
                    component: () =>
                      import('#/views/demos/nested/menu-3-2-1.vue'),
                    meta: {
                      icon: 'ic:round-menu',
                      keepAlive: true,
                      title: $t('demos.nested.menu3_2_1'),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default routes;
```

Example 4 (json):
```json
import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:home',
      title: $t('page.home.title'),
    },
    name: 'Home',
    path: '/home',
    redirect: '/home/index',
    children: [
      {
        name: 'HomeIndex',
        path: '/home/index',
        component: () => import('#/views/home/index.vue'),
        meta: {
          icon: 'mdi:home',
          title: $t('page.home.index'),
        },
      },
    ],
  },
];

export default routes;
```

---

## 精简版本 | Vben Admin

**URL:** https://doc.vben.pro/guide/introduction/thin.html

**Contents:**
- 精简版本 ​
- 应用精简 ​
- 演示代码精简 ​
- 文档精简 ​
- Mock 服务精简 ​
- 安装依赖 ​
- 命令调整 ​
- 其他 ​
- 应用精简 ​
  - 删除不需要的路由及页面 ​

从 5.0 版本开始，我们不再提供精简的仓库或者分支。我们的目标是提供一个更加一致的开发体验，同时减少维护成本。在这里，我们将如何介绍自己的项目，如何去精简以及移除不需要的功能。

首先，确认你需要的 UI 组件库版本，然后删除对应的应用，比如你选择使用 Ant Design Vue，那么你可以删除其他应用， 只需要删除下面两个文件夹即可：

如果项目没有内置你需要的 UI 组件库应用，你可以直接全部删除其他应用。然后自行新建应用即可。

如果你不需要演示代码，你可以直接删除 playground 文件夹。

如果你不需要文档，你可以直接删除docs文件夹。

如果你不需要Mock服务，你可以直接删除apps/backend-mock文件夹。同时在你的应用下.env.development文件中删除VITE_NITRO_MOCK变量。

到这里，你已经完成了精简操作，接下来你可以安装依赖，并启动你的项目：

在精简后，你可能需要根据你的项目调整命令，在根目录下的package.json文件中，你可以调整scripts字段，移除你不需要的命令。

如果你想更进一步精简，你可以删除参考以下文件或者文件夹的作用，判断自己是否需要，不需要删除即可：

在应用的 src/router/routes 文件中，你可以删除不需要的路由。其中 core 文件夹内，如果只需要登录和忘记密码，你可以删除其他路由，如忘记密码、注册等。路由删除后，你可以删除对应的页面文件，在 src/views/_core 文件夹中。

在应用的 src/router/routes 文件中，你可以按需求删除不需要的路由，如demos、vben 目录等。路由删除后，你可以在 src/views 文件夹中删除对应的页面文件。

**Examples:**

Example 1 (unknown):
```unknown
apps/web-ele
apps/web-naive
```

Example 2 (sass):
```sass
# 是否开启 Nitro Mock服务，true 为开启，false 为关闭
VITE_NITRO_MOCK=false
```

Example 3 (markdown):
```markdown
# 根目录下执行
pnpm install
```

Example 4 (json):
```json
{
  "scripts": {
    "build:antd": "pnpm run build --filter=@vben/web-antd",
    "build:docs": "pnpm run build --filter=@vben/docs",
    "build:ele": "pnpm run build --filter=@vben/web-ele",
    "build:naive": "pnpm run build --filter=@vben/web-naive",
    "build:tdesign": "pnpm run build --filter=@vben/web-tdesign",
    "build:play": "pnpm run build --filter=@vben/playground",
    "dev:antd": "pnpm -F @vben/web-antd run dev",
    "dev:docs": "pnpm -F @vben/docs run dev",
    "dev:ele": "pnpm -F @vben/web-ele run dev",
    "dev:play": "pnpm -F @vben/playground run dev",
    "dev:naive": "pnpm -F @vben/web-naive run dev"
  }
}
```

---

## Theme | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/theme.html

**Contents:**
- Theme ​
- CSS Variables ​
- Detailed List of CSS Variables ​
- Overriding Default CSS Variables ​
  - Under the Default Theme ​
  - In Dark Mode ​
- Changing the Brand Primary Color ​
- Built-in Themes ​
  - Built-in Theme List ​
- Adding a New Theme ​

The framework is built on shadcn-vue and tailwindcss, offering a rich theme configuration. You can easily switch between various themes through simple configuration to meet personalized needs. You can choose to use CSS variables or Tailwind CSS utility classes for theme settings.

The project follows the theme configuration of shadcn-vue, for example:

We use a simple convention for colors. The background variable is used for the background color of components, and the foreground variable is used for text color.

For the following components, background will be hsl(var(--primary)), and foreground will be hsl(var(--primary-foreground)).

The colors inside CSS variables must use the hsl format, such as 0 0% 100%, without adding hsl() and ,.

You can check the list below to understand all the available variables.

You only need to override the CSS variables you want to change in your project. For example, to change the default card background color, you can add the following content to your CSS file to override it:

You only need to customize the primary color in the preferences.ts file under the application directory:

The framework includes a variety of built-in themes, which you can configure in the preferences.ts file:

The framework includes 16 built-in themes and also supports custom themes. Theoretically, you can expand the themes without limit.

To add a new theme, simply follow these steps:

The framework includes a variety of built-in themes, which you can configure in preferences.ts. The dark theme also uses CSS variables for configuration:

The sidebar color is configured through the --sidebar variable.

The header color is configured through the --header variable.

Typically used in special scenarios, you can set the application to color weakness mode. This can be configured in preferences.ts:

Typically used in special scenarios, this mode grays out the webpage. You can configure it in preferences.ts:

**Examples:**

Example 1 (jsx):
```jsx
<div class="bg-background text-foreground" />
```

Example 2 (jsx):
```jsx
:root {
  --font-family:
    -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, 'Helvetica Neue',
    arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';

  /* Default background color of <body />...etc */
  --background: 0 0% 100%;

  /* Main area background color */
  --background-deep: 216 20.11% 95.47%;
  --foreground: 210 6% 21%;

  /* Background color for <Card /> */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover /> */
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Muted backgrounds such as <TabsList />, <Skeleton /> and <Switch /> */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Theme Colors */

  --primary: 212 100% 45%;
  --primary-foreground: 0 0% 98%;

  /* Used for destructive actions such as <Button variant="destructive"> */

  --destructive: 0 78% 68%;
  --destructive-foreground: 0 0% 98%;

  /* Used for success actions such as <message> */

  --success: 144 57% 58%;
  --success-foreground: 0 0% 98%;

  /* Used for warning actions such as <message> */

  --warning: 42 84% 61%;
  --warning-foreground: 0 0% 98%;

  /* Secondary colors for <Button /> */

  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;

  /* Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>...etc */
  --accent: 240 5% 96%;
  --accent-hover: 200deg 10% 90%;
  --accent-foreground: 240 6% 10%;

  /* Darker color */
  --heavy: 192deg 9.43% 89.61%;
  --heavy-foreground: var(--accent-foreground);

  /* Default border color */
  --border: 240 5.9% 90%;

  /* Border color for inputs such as <Input />, <Select />, <Textarea /> */
  --input: 240deg 5.88% 90%;
  --input-placeholder: 217 10.6% 65%;
  --input-background: 0 0% 100%;

  /* Used for focus ring */
  --ring: 222.2 84% 4.9%;

  /* Border radius for card, input and buttons */
  --radius: 0.5rem;

  /* ============= custom ============= */

  /* overlay color */
  --overlay: 0deg 0% 0% / 30%;

  /* base font size */
  --font-size-base: 16px;

  /* =============component & UI============= */

  /* menu */
  --sidebar: 0 0% 100%;
  --sidebar-deep: 216 20.11% 95.47%;
  --menu: var(--sidebar);

  /* header */
  --header: 0 0% 100%;

  accent-color: var(--primary);
  color-scheme: light;
}
```

Example 3 (jsx):
```jsx
.dark,
.dark[data-theme='custom'],
.dark[data-theme='default'] {
  /* Default background color of <body />...etc */
  --background: 222.34deg 10.43% 12.27%;

  /* Main area background color */
  --background-deep: 220deg 13.06% 9%;
  --foreground: 0 0% 95%;

  /* Background color for <Card /> */
  --card: 222.34deg 10.43% 12.27%;

  /* --card: 222.2 84% 4.9%; */
  --card-foreground: 210 40% 98%;

  /* Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover /> */
  --popover: 222.82deg 8.43% 12.27%;
  --popover-foreground: 210 40% 98%;

  /* Muted backgrounds such as <TabsList />, <Skeleton /> and <Switch /> */
  --muted: 220deg 6.82% 17.25%;
  --muted-foreground: 215 20.2% 65.1%;

  /* Theme Colors */

  /* --primary: 245 82% 67%; */
  --primary-foreground: 0 0% 98%;

  /* Used for destructive actions such as <Button variant="destructive"> */

  --destructive: 0 78% 68%;
  --destructive-foreground: 0 0% 98%;

  /* Used for success actions such as <message> */

  --success: 144 57% 58%;
  --success-foreground: 0 0% 98%;

  /* Used for warning actions such as <message> */

  --warning: 42 84% 61%;
  --warning-foreground: 0 0% 98%;

  /* secondary color */
  --secondary: 240 5% 17%;
  --secondary-foreground: 0 0% 98%;

  /* Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>...etc */
  --accent: 0deg 0% 100% / 8%;
  --accent-hover: 0deg 0% 100% / 12%;
  --accent-foreground: 0 0% 98%;

  /* Darker color */
  --heavy: 0deg 0% 100% / 12%;
  --heavy-foreground: var(--accent-foreground);

  /* Default border color */
  --border: 240 3.7% 15.9%;

  /* Border color for inputs such as <Input />, <Select />, <Textarea /> */
  --input: 0deg 0% 100% / 10%;
  --input-placeholder: 218deg 11% 65%;
  --input-background: 0deg 0% 100% / 5%;

  /* Used for focus ring */
  --ring: 222.2 84% 4.9%;

  /* base radius */
  --radius: 0.5rem;

  /* ============= Custom ============= */

  /* overlay color */
  --overlay: 0deg 0% 0% / 40%;

  /* base font size */
  --font-size-base: 16px;

  /* =============component & UI============= */

  --sidebar: 222.34deg 10.43% 12.27%;
  --sidebar-deep: 220deg 13.06% 9%;
  --menu: var(--sidebar);
  --header: 222.34deg 10.43% 12.27%;

  color-scheme: dark;
}
```

Example 4 (jsx):
```jsx
:root {
  /* Background color for <Card /> */
  --card: 0 0% 30%;
}
```

---

## Configuration | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/settings.html

**Contents:**
- Configuration ​
- Environment Variable Configuration ​
- Environment Configuration Description ​
- Dynamic Configuration in Production Environment ​
  - Purpose ​
  - Usage ​
  - Adding New ​
- Preferences ​
  - Framework default configuration ​
- Contributors

The project's environment variable configuration is located in the application directory under .env, .env.development, .env.production.

The rules are consistent with Vite Env Variables and Modes. The format is as follows:

Only variables starting with VITE_ will be embedded into the client-side package. You can access them in the project code like this:

Variables starting with VITE_GLOB_* will be added to the _app.config.js configuration file during packaging.

When executing pnpm build in the root directory of the monorepo, a dist/_app.config.js file will be automatically generated in the corresponding application and inserted into index.html.

_app.config.js is a dynamic configuration file that allows for modifications to the configuration dynamically based on different environments after the project has been built. The content is as follows:

_app.config.js is used for projects that need to dynamically modify configurations after packaging, such as API endpoints. There's no need to repackage; you can simply modify the variables in /dist/_app.config.js after packaging, and refresh to update the variables in the code. A js file is used to ensure that the configuration file is loaded early in the order.

To access the variables inside _app.config.js, you need to use the useAppConfig method provided by @vben/hooks.

To add a new dynamically modifiable configuration item, simply follow the steps below:

First, add the variable that needs to be dynamically configurable in the .env file or the corresponding development environment configuration file. The variable must start with VITE_GLOB_*, for example:

In packages/types/global.d.ts, add the corresponding type definition, such as:

In packages/effects/hooks/src/use-app-config.ts, add the corresponding configuration item, such as:

At this point, you can use the useAppConfig method within the project to access the newly added configuration item.

The useAppConfig method should only be used within the application and not be coupled with the internals of a package. The reason for passing import.meta.env and import.meta.env.PROD is to avoid such coupling. A pure package should avoid using variables specific to a particular build tool.

The project offers a wide range of preference settings for dynamically configuring various features of the project:

If you cannot find documentation for a setting, you can try configuring it yourself and then click Copy Preferences to override the project defaults. The configuration file is located in the application directory under preferences.ts, where you can override the framework's default configurations to achieve custom settings.

**Examples:**

Example 1 (unknown):
```unknown
.env                # Loaded in all environments
.env.local          # Loaded in all environments, but ignored by git
.env.[mode]         # Only loaded in the specified mode
.env.[mode].local   # Only loaded in the specified mode, but ignored by git
```

Example 2 (javascript):
```javascript
console.log(import.meta.env.VITE_PROT);
```

Example 3 (sass):
```sass
# Application title
VITE_APP_TITLE=Vben Admin

# Application namespace, used as a prefix for caching, store, etc., to ensure isolation
VITE_APP_NAMESPACE=vben-web-antd
```

Example 4 (sass):
```sass
# Port Number
VITE_PORT=5555

# Public Path for Resources, must start and end with /
VITE_BASE=/

# API URL
VITE_GLOB_API_URL=/api

# Whether to enable Nitro Mock service, true to enable, false to disable
VITE_NITRO_MOCK=true

# Whether to open devtools, true to open, false to close
VITE_DEVTOOLS=true

# Whether to inject global loading
VITE_INJECT_APP_LOADING=true

# Whether to generate after packaging dist.zip
VITE_ARCHIVER=true
```

---

## 本地开发 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/development.html

**Contents:**
- 本地开发 ​
- 前置准备 ​
  - 需要掌握的基础知识 ​
  - 工具配置 ​
- Npm Scripts ​
- 本地运行项目 ​
- 区分构建环境 ​
- 公共静态资源 ​
- DevTools ​
- 本地运行文档 ​

如果你还没有获取代码，可以先从 快速开始 处开始阅读文档。

为了更好的开发体验，我们提供了一些工具配置、项目说明，以便于您更好的开发。

本项目需要一定前端基础知识，请确保掌握 Vue 的基础知识，以便能处理一些常见的问题。建议在开发前先学一下以下内容，提前了解和学习这些知识，会对项目理解非常有帮助:

如果您使用的 IDE 是vscode(推荐)的话，可以安装以下工具来提高开发效率及代码格式化:

npm 脚本是项目常见的配置，用于执行一些常见的任务，比如启动项目、打包项目等。以下的脚本都可以在项目根目录的 package.json 文件中找到。

执行方式为：pnpm run [script] 或 npm run [script]。

如需本地运行文档，并进行调整，可以执行以下命令，执行该命令，你可以选择需要的应用进行开发：

如果你想直接运行某个应用，可以执行以下命令：

在实际的业务开发中，通常会在构建时区分多种环境，如测试环境test、生产环境build等。

此时可以修改三个文件，在其中增加对应的脚本配置来达到区分生产环境的效果。

以@vben/web-antd添加测试环境test为例：

增加命令"build:test", 并将原"build"改为"build:prod"以避免同时构建两个环境的包。

在根目录package.json中加入构建测试环境的命令

在turbo.json中加入相关依赖的命令

项目中需要使用到的公共静态资源，如：图片、静态HTML等，需要在开发中通过 src="/xxx.png" 直接引入的。

需要将资源放在对应项目的 public/static 目录下。引入的路径为：src="/static/xxx.png"。

项目内置了 Vue DevTools 插件，可以在开发过程中使用。默认关闭，可在.env.development 内开启，并重新运行项目即可：

开启后，项目运行会在页面底部显示一个 Vue DevTools 的图标，点击即可打开 DevTools。

如需本地运行文档，并进行调整，可以执行以下命令：

如果你在使用过程中遇到依赖相关的问题，可以尝试以下重新安装依赖：

**Examples:**

Example 1 (json):
```json
{
  "scripts": {
    // 构建项目
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build",
    // 构建项目并分析
    "build:analyze": "turbo build:analyze",
    // 构建本地 docker 镜像
    "build:docker": "./build-local-docker-image.sh",
    // 单独构建 web-antd 应用
    "build:antd": "pnpm run build --filter=@vben/web-antd",
    // 单独构建文档
    "build:docs": "pnpm run build --filter=@vben/docs",
    // 单独构建 web-ele 应用
    "build:ele": "pnpm run build --filter=@vben/web-ele",
    // 单独构建 web-naive 应用
    "build:naive": "pnpm run build --filter=@vben/naive",
    // 单独构建 web-tdesign 应用
    "build:tdesign": "pnpm run build --filter=@vben/web-tdesign",
    // 单独构建 playground 应用
    "build:play": "pnpm run build --filter=@vben/playground",
    // changeset 版本管理
    "changeset": "pnpm exec changeset",
    // 检查项目各种问题
    "check": "pnpm run check:circular && pnpm run check:dep && pnpm run check:type && pnpm check:cspell",
    // 检查循环引用
    "check:circular": "vsh check-circular",
    // 检查拼写
    "check:cspell": "cspell lint **/*.ts **/README.md .changeset/*.md --no-progress"
    // 检查依赖
    "check:dep": "vsh check-dep",
    // 检查类型
    "check:type": "turbo run typecheck",
    // 清理项目（删除node_modules、dist、.turbo）等目录
    "clean": "node ./scripts/clean.mjs",
    // 提交代码
    "commit": "czg",
    // 启动项目（默认会运行整个仓库所有包的dev脚本）
    "dev": "turbo-run dev",
    // 启动web-antd应用
    "dev:antd": "pnpm -F @vben/web-antd run dev",
    // 启动文档
    "dev:docs": "pnpm -F @vben/docs run dev",
    // 启动web-ele应用
    "dev:ele": "pnpm -F @vben/web-ele run dev",
    // 启动web-naive应用
    "dev:naive": "pnpm -F @vben/web-naive run dev",
    // 启动演示应用
    "dev:play": "pnpm -F @vben/playground run dev",
    // 格式化代码
    "format": "vsh lint --format",
    // lint 代码
    "lint": "vsh lint",
    // 依赖安装完成之后，执行所有包的stub脚本
    "postinstall": "pnpm -r run stub --if-present",
    // 只允许使用pnpm
    "preinstall": "npx only-allow pnpm",
    // lefthook的安装
    "prepare": "is-ci || lefthook install",
    // 预览应用
    "preview": "turbo-run preview",
    // 包规范检查
    "publint": "vsh publint",
    // 删除所有的node_modules、yarn.lock、package.lock.json，重新安装依赖
    "reinstall": "pnpm clean --del-lock && pnpm install",
    // 运行 vitest 单元测试
    "test:unit": "vitest run --dom",
    // 更新项目依赖
    "update:deps": " pnpm update --latest --recursive",
    // changeset生成提交集
    "version": "pnpm exec changeset version && pnpm install --no-frozen-lockfile"
  }
}
```

Example 2 (unknown):
```unknown
pnpm dev:antd
```

Example 3 (unknown):
```unknown
pnpm dev:naive
```

Example 4 (unknown):
```unknown
pnpm dev:ele
```

---

## Global Loading | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/loading.html

**Contents:**
- Global Loading ​
- Principle ​
- Disable ​
- Customization ​
- Contributors
- Changelog

Global loading refers to the loading effect that appears when the page is refreshed, usually a spinning icon:

Implemented by the vite-plugin-inject-app-loading plugin, the plugin injects a global loading html into each application.

If you do not need global loading, you can disable it in the .env file:

If you want to customize the global loading, you can create a loading.html file in the application directory, at the same level as index.html. The plugin will automatically read and inject this HTML. You can define the style and animation of this HTML as you wish.

**Examples:**

Example 1 (sass):
```sass
VITE_INJECT_APP_LOADING=false
```

Example 2 (lua):
```lua
<style data-app-loading="inject-css">
  #__app-loading__.hidden {
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    transition: all 1s ease-out;
  }
  /* ... */
</style>
<div id="__app-loading__">
  <!-- ... -->
  <div class="title"><%= VITE_APP_TITLE %></div>
</div>
```

---

## 构建与部署 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/build.html

**Contents:**
- 构建与部署 ​
- 构建 ​
- 预览 ​
- 压缩 ​
  - 开启 gzip 压缩 ​
  - 开启 brotli 压缩 ​
  - 同时开启 gzip 和 brotli 压缩 ​
- 构建分析 ​
- 部署 ​
  - 前端路由与服务端的结合 ​

由于是展示项目，所以打包后相对较大，如果项目中没有用到的插件，可以删除对应的文件或者路由，不引用即可，没有引用就不会打包。

构建打包成功之后，会在根目录生成对应的应用下的 dist 文件夹，里面就是构建打包好的文件，例如: apps/web-antd/dist/

发布之前可以在本地进行预览，有多种方式，这里介绍两种：

等待构建成功后，访问 http://localhost:4173 即可查看效果。

可以在电脑全局安装 serve 服务，如 live-server,

然后在 dist 目录下执行 live-server 命令，即可在本地查看效果。

需要在打包的时候更改.env.production配置:

需要在打包的时候更改.env.production配置:

需要在打包的时候更改.env.production配置:

gzip 和 brotli 都需要安装特定模块才能使用。

如果你的构建文件很大，可以通过项目内置 rollup-plugin-analyzer 插件进行代码体积分析，从而优化你的代码。只需要在根目录下执行以下命令：

运行之后，在自动打开的页面可以看到具体的体积分布，以分析哪些依赖有问题。

简单的部署只需要将最终生成的静态文件，dist 文件夹的静态文件发布到你的 cdn 或者静态服务器即可，需要注意的是其中的 index.html 通常会是你后台服务的入口页面，在确定了 js 和 css 的静态之后可能需要改变页面的引入路径。

例如上传到 nginx 服务器，可以将 dist 文件夹下的文件上传到服务器的 /srv/www/project/index.html 目录下，然后访问配置好的域名即可。

部署时可能会发现资源路径不对，只需要修改.env.production文件即可。

项目前端路由使用的是 vue-router，所以你可以选择两种方式：history 和 hash。

可在 .env.production 内进行 mode 修改

开启 history 模式需要服务器配置，更多的服务器配置详情可以看 history-mode

使用 nginx 处理项目部署后的跨域问题

**Examples:**

Example 1 (unknown):
```unknown
pnpm preview
```

Example 2 (unknown):
```unknown
npm i -g live-server
```

Example 3 (sass):
```sass
cd apps/web-antd/dist
# 本地预览，默认端口8080
live-server
# 指定端口
live-server --port=9000
```

Example 4 (sass):
```sass
VITE_COMPRESS=gzip
```

---

## Directory Explanation | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/dir.html

**Contents:**
- Directory Explanation ​
- Contributors
- Changelog

The directory uses Monorepo management, and the project structure is as follows:

**Examples:**

Example 1 (elixir):
```elixir
.
├── Dockerfile # Docker image build file
├── README.md # Project documentation
├── apps # Project applications directory
│   ├── backend-mock # Backend mock service application
│   ├── web-antd # Frontend application based on Ant Design Vue
│   ├── web-ele # Frontend application based on Element Plus
│   └── web-naive # Frontend application based on Naive UI
├── build-local-docker-image.sh # Script for building Docker images locally
├── cspell.json # CSpell configuration file
├── docs # Project documentation directory
├── eslint.config.mjs # ESLint configuration file
├── internal # Internal tools directory
│   ├── lint-configs # Code linting configurations
│   │   ├── commitlint-config # Commitlint configuration
│   │   ├── eslint-config # ESLint configuration
│   │   ├── prettier-config # Prettier configuration
│   │   └── stylelint-config # Stylelint configuration
│   ├── node-utils # Node.js tools
│   ├── tailwind-config # Tailwind configuration
│   ├── tsconfig # Common tsconfig settings
│   └── vite-config # Common Vite configuration
├── package.json # Project dependency configuration
├── packages # Project packages directory
│   ├── @core # Core package
│   │   ├── base # Base package
│   │   │   ├── design # Design related
│   │   │   ├── icons # Icons
│   │   │   ├── shared # Shared
│   │   │   └── typings # Type definitions
│   │   ├── composables # Composable APIs
│   │   ├── preferences # Preferences
│   │   └── ui-kit # UI component collection
│   │       ├── layout-ui # Layout UI
│   │       ├── menu-ui  # Menu UI
│   │       ├── shadcn-ui # shadcn UI
│   │       └── tabs-ui # Tabs UI
│   ├── constants # Constants
│   ├── effects # Effects related packages
│   │   ├── access # Access control
│   │   ├── plugins # Plugins
│   │   ├── common-ui # Common UI
│   │   ├── hooks # Composable APIs
│   │   ├── layouts # Layouts
│   │   └── request # Request
│   ├── icons # Icons
│   ├── locales # Internationalization
│   ├── preferences  # Preferences
│   ├── stores # State management
│   ├── styles # Styles
│   ├── types # Type definitions
│   └── utils # Utilities
├── playground # Demo directory
├── pnpm-lock.yaml # pnpm lock file
├── pnpm-workspace.yaml # pnpm workspace configuration file
├── scripts # Scripts directory
│   ├── turbo-run # Turbo run script
│   └── vsh # VSH script
├── stylelint.config.mjs # Stylelint configuration file
├── turbo.json # Turbo configuration file
├── vben-admin.code-workspace # VS Code workspace configuration file
└── vitest.config.ts # Vite configuration file
```

---

## Remove Code | Vben Admin

**URL:** https://doc.vben.pro/en/guide/other/remove-code.html

**Contents:**
- Remove Code ​
- Remove Code ​
- Contributors
- Changelog

In the corresponding application's index.html file, find the following code and delete it:

**Examples:**

Example 1 (vue):
```vue
<!-- apps/web-antd -->
<script>
  var _hmt = _hmt || [];
  (function () {
    var hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?d20a01273820422b6aa2ee41b6c9414d';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(hm, s);
  })();
</script>
```

---

## Why Choose Us? | Vben Admin

**URL:** https://doc.vben.pro/en/guide/introduction/why.html

**Contents:**
- Why Choose Us? ​
- Framework History ​
- Contributors
- Changelog

First of all, we do not compare ourselves with other frameworks. We believe that every framework has its own characteristics and is suited for different scenarios. Our goal is to provide a simple and easy-to-use framework that allows developers to get started quickly and focus on developing business logic. Therefore, we will continue to improve and optimize our framework to offer a better experience.

Starting from Vue Vben Admin version 1.x, the framework has undergone numerous iterations and optimizations. From initially using Vite 0.x when there were no ready-made plugins available, we developed many custom plugins to bridge the gap between Webpack and Vite. Although many of these have since been replaced, our original intention has remained the same: to provide a simple and easy-to-use framework.

Although the community maintained the project for a period, we have always closely monitored the development of Vue Vben Admin. We have witnessed many developers use Vben Admin and provide valuable suggestions and feedback. We are very grateful for everyone's support and contributions, which continue to drive us to improve Vben Admin. In the new version, we have continuously collected user feedback, started anew, and optimized the framework to provide a better user experience. Our goal is to enable developers to get started quickly and focus on developing business logic.

---

## Styles | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/styles.html

**Contents:**
- Styles ​
- Project Structure ​
- Scss ​
- Postcss ​
- Tailwind CSS ​
- BEM Standard ​
- CSS Modules ​
- Contributors
- Changelog

For Vue projects, the official documentation already provides a detailed introduction to the syntax. Here, we mainly introduce the structure and usage of style files in the project.

The style files in the project are stored in @vben/styles, which includes some global styles, such as reset styles, global variables, etc. It inherits the styles and capabilities of @vben-core/design and can be overridden according to project needs.

The project uses scss as the style preprocessor, allowing the use of scss features such as variables, functions, mixins, etc., within the project.

If you're not accustomed to using scss, you can also use postcss, which is a more powerful style processor that supports a wider range of plugins. The project includes the postcss-nested plugin and is configured with Css Variables, making it a complete substitute for scss.

The project integrates Tailwind CSS, allowing the use of tailwindcss class names to quickly build pages.

Another option to avoid style conflicts is to use the BEM standard. If you choose scss, it is recommended to use the BEM naming convention for better style management. The project provides a default useNamespace function to easily generate namespaces.

Another solution to address style conflicts is to use the CSS Modules modular approach. The usage method is as follows.

For more usage, see the CSS Modules official documentation.

**Examples:**

Example 1 (sass):
```sass
<style lang="scss" scoped>
$font-size: 30px;

.box {
  .title {
    color: green;
    font-size: $font-size;
  }
}
</style>
```

Example 2 (css):
```css
<style scoped>
.box {
  --font-size: 30px;
  .title {
    color: green;
    font-size: var(--font-size);
  }
}
</style>
```

Example 3 (vue):
```vue
<template>
  <div class="bg-white p-4">
    <p class="text-green">hello world</p>
  </div>
</template>
```

Example 4 (typescript):
```typescript
<script lang="ts" setup>
import { useNamespace } from '@vben/hooks';

const { b, e, is } = useNamespace('menu');
</script>
<template>
  <div :class="[b()]">
    <div :class="[e('item'), is('active', true)]">item1</div>
  </div>
</template>
<style lang="scss" scoped>
// If you use it within the application, this line of code can be omitted as it has already been globally introduced in all applications
@use '@vben/styles/global' as *;
@include b('menu') {
  color: black;

  @include e('item') {
    background-color: black;

    @include is('active') {
      background-color: red;
    }
  }
}
</style>
```

---

## 快速开始 | Vben Admin

**URL:** https://doc.vben.pro/guide/introduction/quick-start.html

**Contents:**
- 快速开始 ​
- 前置准备 ​
- 启动项目 ​
  - 获取源码 ​
  - 安装依赖 ​
  - 运行项目 ​
    - 选择项目 ​
    - 运行指定项目 ​
- 贡献者
- 页面历史

在启动项目前，你需要确保你的环境满足以下要求：

验证你的环境是否满足以上要求，你可以通过以下命令查看版本：

注意存放代码的目录及所有父级目录不能存在中文、韩文、日文以及空格，否则安装依赖后启动会出错。

在你的代码目录内打开终端，并执行以下命令:

此时，你会看到类似如下的输出，选择你需要运行的项目：

现在，你可以在浏览器访问 http://localhost:5555 查看项目。

如果你不想选择项目，可以直接运行以下命令运行你需要的应用：

**Examples:**

Example 1 (markdown):
```markdown
# 出现相应 node LTS版本即可
node -v
# 出现相应 git 版本即可
git -v
```

Example 2 (markdown):
```markdown
# clone 代码
git clone https://github.com/vbenjs/vue-vben-admin.git
```

Example 3 (markdown):
```markdown
# clone 代码
# Gitee 的代码可能不是最新的
git clone https://gitee.com/annsion/vue-vben-admin.git
```

Example 4 (markdown):
```markdown
# 进入项目目录
cd vue-vben-admin

# 使用项目指定的pnpm版本进行依赖安装
npm i -g corepack

# 安装依赖
pnpm install
```

---

## 主题 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/theme.html

**Contents:**
- 主题 ​
- Css 变量 ​
- 详细的CSS变量列表 ​
- 覆盖默认的 CSS 变量 ​
  - 默认主题下 ​
  - 黑暗模式下 ​
- 更改品牌主色 ​
- 内置主题 ​
  - 内置主题列表 ​
- 新增主题 ​

框架基于 shadcn-vue 和 tailwindcss 构建，提供了丰富的主题配置，可以通过简单的配置实现各种主题切换，满足个性化需求。您可以选择使用 CSS 变量或 Tailwind CSS 实用程序类进行主题设置。

项目遵循 shadcn-vue 的主题配置，示例：

我们对颜色使用一个简单的约定。background变量用于组件的背景颜色，foreground变量用于文本颜色。

以下组件的background将为hsl(var(--primary))，foreground将为hsl(var(--primary-foreground))。

css 变量内的颜色，必须使用 hsl 格式，如 0 0% 100%，不需要加 hsl()和 ，。

你可以查看下面的CSS变量列表，以了解所有可用的变量。

你只需要在你的项目中覆盖你想要修改的 CSS 变量即可。例如，要更改默认卡片背景色，你可以在你的 CSS 文件中添加以下内容进行覆盖：

只需要在应用目录下的preferences.ts，自定义配置主色即可：

框架中内置了多种主题，你可以在preferences.ts中进行配置：

框架内置了 16种主题，且还支持自定义主题。理论上，你可以无限制的扩展主题。

框架中内置了多种主题，你可以在preferences.ts中进行配置，黑暗主题同样会读取css变量来进行配置：

侧边栏颜色通过--sidebar变量来配置

一般用于特殊场景，将设置为色弱模式，你可以在preferences.ts中进行配置：

一般用于特殊场景，将网页置灰，你可以在preferences.ts中进行配置：

**Examples:**

Example 1 (jsx):
```jsx
<div class="bg-background text-foreground" />
```

Example 2 (jsx):
```jsx
:root {
  --font-family:
    -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, 'Helvetica Neue',
    arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';

  /* Default background color of <body />...etc */
  --background: 0 0% 100%;

  /* 主体区域背景色 */
  --background-deep: 216 20.11% 95.47%;
  --foreground: 210 6% 21%;

  /* Background color for <Card /> */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover /> */
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Muted backgrounds such as <TabsList />, <Skeleton /> and <Switch /> */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* 主题颜色 */

  --primary: 212 100% 45%;
  --primary-foreground: 0 0% 98%;

  /* Used for destructive actions such as <Button variant="destructive"> */

  --destructive: 0 78% 68%;
  --destructive-foreground: 0 0% 98%;

  /* Used for success actions such as <message> */

  --success: 144 57% 58%;
  --success-foreground: 0 0% 98%;

  /* Used for warning actions such as <message> */

  --warning: 42 84% 61%;
  --warning-foreground: 0 0% 98%;

  /* Secondary colors for <Button /> */

  --secondary: 240 5% 96%;
  --secondary-foreground: 240 6% 10%;

  /* Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>...etc */
  --accent: 240 5% 96%;
  --accent-hover: 200deg 10% 90%;
  --accent-foreground: 240 6% 10%;

  /* Darker color */
  --heavy: 192deg 9.43% 89.61%;
  --heavy-foreground: var(--accent-foreground);

  /* Default border color */
  --border: 240 5.9% 90%;

  /* Border color for inputs such as <Input />, <Select />, <Textarea /> */
  --input: 240deg 5.88% 90%;
  --input-placeholder: 217 10.6% 65%;
  --input-background: 0 0% 100%;

  /* Used for focus ring */
  --ring: 222.2 84% 4.9%;

  /* Border radius for card, input and buttons */
  --radius: 0.5rem;

  /* ============= custom ============= */

  /* 遮罩颜色 */
  --overlay: 0deg 0% 0% / 30%;

  /* 基本文字大小 */
  --font-size-base: 16px;

  /* =============component & UI============= */

  /* menu */
  --sidebar: 0 0% 100%;
  --sidebar-deep: 216 20.11% 95.47%;
  --menu: var(--sidebar);

  /* header */
  --header: 0 0% 100%;

  accent-color: var(--primary);
  color-scheme: light;
}
```

Example 3 (jsx):
```jsx
.dark,
.dark[data-theme='custom'],
.dark[data-theme='default'] {
  /* Default background color of <body />...etc */
  --background: 222.34deg 10.43% 12.27%;

  /* 主体区域背景色 */
  --background-deep: 220deg 13.06% 9%;
  --foreground: 0 0% 95%;

  /* Background color for <Card /> */
  --card: 222.34deg 10.43% 12.27%;

  /* --card: 222.2 84% 4.9%; */
  --card-foreground: 210 40% 98%;

  /* Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover /> */
  --popover: 222.82deg 8.43% 12.27%;
  --popover-foreground: 210 40% 98%;

  /* Muted backgrounds such as <TabsList />, <Skeleton /> and <Switch /> */
  --muted: 220deg 6.82% 17.25%;
  --muted-foreground: 215 20.2% 65.1%;

  /* 主题颜色 */

  /* --primary: 245 82% 67%; */
  --primary-foreground: 0 0% 98%;

  /* Used for destructive actions such as <Button variant="destructive"> */

  --destructive: 0 78% 68%;
  --destructive-foreground: 0 0% 98%;

  /* Used for success actions such as <message> */

  --success: 144 57% 58%;
  --success-foreground: 0 0% 98%;

  /* Used for warning actions such as <message> */

  --warning: 42 84% 61%;
  --warning-foreground: 0 0% 98%;

  /* 颜色次要 */
  --secondary: 240 5% 17%;
  --secondary-foreground: 0 0% 98%;

  /* Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>...etc */
  --accent: 0deg 0% 100% / 8%;
  --accent-hover: 0deg 0% 100% / 12%;
  --accent-foreground: 0 0% 98%;

  /* Darker color */
  --heavy: 0deg 0% 100% / 12%;
  --heavy-foreground: var(--accent-foreground);

  /* Default border color */
  --border: 240 3.7% 15.9%;

  /* Border color for inputs such as <Input />, <Select />, <Textarea /> */
  --input: 0deg 0% 100% / 10%;
  --input-placeholder: 218deg 11% 65%;
  --input-background: 0deg 0% 100% / 5%;

  /* Used for focus ring */
  --ring: 222.2 84% 4.9%;

  /* 基本圆角大小 */
  --radius: 0.5rem;

  /* ============= Custom ============= */

  /* 遮罩颜色 */
  --overlay: 0deg 0% 0% / 40%;

  /* 基本文字大小 */
  --font-size-base: 16px;

  /* =============component & UI============= */

  --sidebar: 222.34deg 10.43% 12.27%;
  --sidebar-deep: 220deg 13.06% 9%;
  --menu: var(--sidebar);
  --header: 222.34deg 10.43% 12.27%;

  color-scheme: dark;
}
```

Example 4 (jsx):
```jsx
:root {
  /* Background color for <Card /> */
  --card: 0 0% 30%;
}
```

---

## 图标 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/icons.html

**Contents:**
- 图标 ​
- Iconify 图标 推荐 ​
  - 新增 ​
  - 使用 ​
- Svg 图标 推荐 ​
  - 新增 ​
  - 使用 ​
- Tailwind CSS 图标 ​
  - 使用 ​
- 贡献者

项目中有以下多种图标使用方式，可以根据实际情况选择使用：

可在 packages/icons/src/iconify 目录下新增图标：

没有采用 Svg Sprite 的方式，而是直接引入 Svg 图标，

可以在 packages/icons/src/svg/icons 目录下新增图标文件test.svg, 然后在 packages/icons/src/svg/index.ts 中引入：

直接添加 Tailwind CSS 的图标类名即可使用，图标类名可查看 iconify ：

**Examples:**

Example 1 (javascript):
```javascript
// packages/icons/src/iconify/index.ts
import { createIconifyIcon } from '@vben-core/icons';

export const MdiKeyboardEsc = createIconifyIcon('mdi:keyboard-esc');
```

Example 2 (vue):
```vue
<script setup lang="ts">
import { MdiKeyboardEsc } from '@vben/icons';
</script>

<template>
  <!-- 一个宽高为20px的图标 -->
  <MdiKeyboardEsc class="size-5" />
</template>
```

Example 3 (sql):
```sql
// packages/icons/src/svg/index.ts
import { createIconifyIcon } from '@vben-core/icons';

const SvgTestIcon = createIconifyIcon('svg:test');

export { SvgTestIcon };
```

Example 4 (vue):
```vue
<script setup lang="ts">
import { SvgTestIcon } from '@vben/icons';
</script>

<template>
  <!-- 一个宽高为20px的图标 -->
  <SvgTestIcon class="size-5" />
</template>
```

---

## Frequently Asked Questions # | Vben Admin

**URL:** https://doc.vben.pro/en/guide/other/faq.html

**Contents:**
- Frequently Asked Questions # ​
- Instructions ​
- Dependency Issues ​
- About Cache Update Issues ​
- About Modifying Configuration Files ​
- Errors When Running Locally ​
- Blank Page After Switching Pages ​
- My code works locally but not when packaged ​
- Dependency Installation Issues ​
- Package File Too Large ​

Listed are some common questions

If you have a question, you can first look here. If not found, you can search or submit your question on GitHub Issue, or if it's a discussion-type question, you can go to GitHub Discussions

If you encounter a problem, you can start looking from the following aspects:

In a Monorepo project, it's important to get into the habit of running pnpm install after every git pull because new dependencies are often added. The project has configured automatic execution of pnpm install in lefthook.yml, but sometimes there might be issues. If it does not execute automatically, it is recommended to execute it manually once.

The project configuration is by default cached in localStorage, so some configurations may not change after a version update.

The solution is to modify the version number in package.json each time the code is updated. This is because the key for localStorage is based on the version number. Therefore, after an update, the configurations from a previous version will become invalid. Simply re-login to apply the new settings.

When modifying environment files such as .env or the vite.config.ts file, Vite will automatically restart the service.

There's a chance that automatic restarts may encounter issues. Simply rerunning the project can resolve these problems.

Since Vite does not transform code locally and the code uses relatively new syntax such as optional chaining, local development requires using a higher version of the browser (Chrome 90+).

This issue occurs because route switching animations are enabled, and the corresponding page component has multiple root nodes. Adding a <div></div> at the outermost layer of the page can solve this problem.

The reason for this issue could be one of the following. You can check these reasons, and if there are other possibilities, feel free to add them:

First, the full version will be larger because it includes many library files. You can use the simplified version for development.

Secondly, it is recommended to enable gzip, which can reduce the size to about 1/3 of the original. Gzip can be enabled directly by the server. If so, the frontend does not need to build .gz format files. If the frontend has built .gz files, for example, with nginx, you need to enable the gzip_static: on option.

While enabling gzip, you can also enable brotli for better compression than gzip. Both can coexist.

gzip_static: This module requires additional installation in nginx, as the default nginx does not include this module.

Enabling brotli also requires additional nginx module installation.

If you encounter errors similar to the following, please check that the full project path (including all parent paths) does not contain Chinese, Japanese, or Korean characters. Otherwise, you will encounter a 404 error for the path, leading to the following issue:

If you see the following warning in the console, and the page can open normally, you can ignore this warning.

Future versions of vue-router may provide an option to disable this warning.

If you encounter the following error message, please check if your nodejs version meets the requirements.

After deploying to nginx，you might encounter the following error:

Open the mime.types file under nginx and change application/javascript js; to application/javascript js mjs;

**Examples:**

Example 1 (vue):
```vue
<template>
  <!-- Annotations are also considered a node -->
  <h1>text h1</h1>
  <h2>text h2</h2>
</template>
```

Example 2 (vue):
```vue
<template>
  <div>
    <h1>text h1</h1>
    <h2>text h2</h2>
  </div>
</template>
```

Example 3 (sql):
```sql
import { getCurrentInstance } from 'vue';
getCurrentInstance().ctx.xxxx;
```

Example 4 (markdown):
```markdown
# .npmrc
registry = https://registry.npmmirror.com/
```

---

## Changeset | Vben Admin

**URL:** https://doc.vben.pro/guide/project/changeset.html

**Contents:**
- Changeset ​
- 命令行 ​
  - 交互式填写变更集 ​
  - 统一提升版本号 ​
- 贡献者
- 页面历史

项目内置了 changeset 作为版本管理工具。Changeset 是一个版本管理工具，它可以帮助我们更好的管理版本，生成 changelog，以及自动发布。

详细使用方式可查看官方文档，这里不再阐述。如果你不需要它，可以直接忽略。

changeset 命令在项目中已经内置：

**Examples:**

Example 1 (unknown):
```unknown
pnpm run changeset
```

Example 2 (unknown):
```unknown
pnpm run version
```

---

## 检查更新 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/check-updates.html

**Contents:**
- 检查更新 ​
- 介绍 ​
- 效果 ​
- 替换为其他检查更新方式 ​
- 替换为第三方库检查更新方式 ​
- 贡献者
- 页面历史

当网站有更新时，您可能需要检查更新。框架提供了这一功能，通过定时检查更新，您可以在应用的 preferences.ts 文件中配置 checkUpdatesInterval和 enableCheckUpdates 字段，以开启和设置检查更新的时间间隔（单位：分钟）。

检测到更新时，会弹出提示框，询问用户是否刷新页面：

如果需要通过其他方式检查更新，例如通过接口来更灵活地控制更新逻辑（如强制刷新、显示更新内容等），你可以通过修改 @vben/layouts 下面的 src/widgets/check-updates/check-updates.vue文件来实现。

如果需要通过其他方式检查更新，例如使用其他版本控制方式（chunkHash、version.json）、使用Web Worker在后台轮询更新、自定义检查更新时机（不使用轮询），你可以通过JS库version-polling来实现。

以apps/web-antd项目为例，在项目入口文件main.ts或者app.vue添加以下代码

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // 是否开启检查更新
    enableCheckUpdates: true,
    // 检查更新的时间间隔，单位为分钟
    checkUpdatesInterval: 1,
  },
});
```

Example 2 (javascript):
```javascript
// 这里可以替换为你的检查更新逻辑
async function getVersionTag() {
  try {
    const response = await fetch('/', {
      cache: 'no-cache',
      method: 'HEAD',
    });

    return (
      response.headers.get('etag') || response.headers.get('last-modified')
    );
  } catch {
    console.error('Failed to fetch version tag');
    return null;
  }
}
```

Example 3 (unknown):
```unknown
pnpm add version-polling
```

Example 4 (swift):
```swift
import { h } from 'vue';

import { Button, notification } from 'ant-design-vue';
import { createVersionPolling } from 'version-polling';

createVersionPolling({
  silent: import.meta.env.MODE === 'development', // 开发环境下不检测
  onUpdate: (self) => {
    const key = `open${Date.now()}`;
    notification.info({
      message: '提示',
      description: '检测到网页有更新, 是否刷新页面加载最新版本？',
      btn: () =>
        h(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: () => {
              notification.close(key);
              self.onRefresh();
            },
          },
          { default: () => '刷新' },
        ),
      key,
      duration: null,
      placement: 'bottomRight',
    });
  },
});
```

---

## Vite Config | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/vite.html

**Contents:**
- Vite Config ​
- Application ​
- Package ​
- Contributors
- Changelog

The project encapsulates a layer of Vite configuration and integrates some plugins for easy reuse across multiple packages and applications. The usage is as follows:

**Examples:**

Example 1 (javascript):
```javascript
// vite.config.mts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    // Vite configuration, override according to the official Vite documentation
    vite: {},
  };
});
```

Example 2 (javascript):
```javascript
// vite.config.mts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    library: {},
    // Vite configuration, override according to the official Vite documentation
    vite: {},
  };
});
```

---

## 组件库切换 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/ui-framework.html

**Contents:**
- 组件库切换 ​
- 新增组件库应用 ​
- 贡献者
- 页面历史

Vue Admin 支持你自由选择组件库，目前演示站点的默认组件库是 Ant Design Vue，与旧版本保持一致。同时框架还内置了 Element Plus 版本和 Naive UI 版本，你可以根据自己的喜好选择。

如果你想用其他别的组件库，你只需要按以下步骤进行操作：

---

## Unit Testing | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/test.html

**Contents:**
- Unit Testing ​
- Writing Test Cases ​
- Running Tests ​
- Existing Unit Tests ​
- Contributors
- Changelog

The project incorporates Vitest as the unit testing tool. Vitest is a test runner based on Vite, offering a simple API for writing test cases.

Within the project, we follow the convention of naming test files with a .test.ts suffix or placing them inside a __tests__ directory. For example, if you create a utils.ts file, then you would create a corresponding utils.spec.ts file in the same directory,

To run the tests, execute the following command at the root of the monorepo:

There are already some unit test cases in the project. You can search for files ending with .test.ts to view them. When you make changes to related code, you can run the unit tests to ensure the correctness of your code. It is recommended to maintain the coverage of unit tests during the development process and to run unit tests as part of the CI/CD process to ensure tests pass before deploying the project.

Existing unit test status:

**Examples:**

Example 1 (sql):
```sql
// utils.test.ts
import { expect, test } from 'vitest';
import { sum } from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

Example 2 (unknown):
```unknown
pnpm test:unit
```

---

## PROJECT UPDATE | Vben Admin

**URL:** https://doc.vben.pro/en/guide/other/project-update.html

**Contents:**
- PROJECT UPDATE ​
- Why Can't It Be Updated Like a npm Plugin ​
- What Should I Do ​
- Updating Code Using Git ​
- Contributors
- Changelog

Because the project is a complete project template, not a plugin or a package, it cannot be updated like a plugin. After you use the code, you will develop it further based on business needs, and you need to manually merge and upgrade.

The project is managed using a Monorepo approach and has abstracted some of the more core code, such as packages/@core, packages/effects. As long as the business code has not modified this part of the code, you can directly pull the latest code and then merge it into your branch. You only need to handle some conflicts simply. Other folders will only make some minor adjustments, which will not affect the business code.

It is recommended to follow the repository updates actively and merge them; do not accumulate over a long time, Otherwise, it will lead to too many merge conflicts and increase the difficulty of merging.

When syncing the code, conflicts may occur. Just resolve the conflicts.

**Examples:**

Example 1 (unknown):
```unknown
git clone https://github.com/vbenjs/vue-vben-admin.git
```

Example 2 (markdown):
```markdown
# up is the source name, can be set arbitrarily
# gitUrl is the latest open-source code
git remote add up gitUrl;
```

Example 3 (markdown):
```markdown
# Push the code to your company
# main is the branch name, adjust according to your situation
git push up main
# Sync the company's code
# main is the branch name, adjust according to your situation
git pull up main
```

Example 4 (unknown):
```unknown
git pull origin main
```

---

## CLI | Vben Admin

**URL:** https://doc.vben.pro/guide/project/cli.html

**Contents:**
- CLI ​
- vsh ​
  - 用法 ​
  - vsh check-circular ​
    - 用法 ​
    - 选项 ​
  - vsh check-dep ​
    - 用法 ​
    - 选项 ​
  - vsh lint ​

项目中，提供了一些命令行工具，用于一些常用的操作，代码位于 scrips 内。

用于一些项目操作，如清理项目、检查项目等。

检查整个项目循环引用，如果有循环引用，会在控制台输出循环引用的模块。

检查整个项目依赖情况，并在控制台输出未使用的依赖、未安装的依赖信息

对项目进行lint检查，检查项目中的代码是否符合规范。

对 Monorepo 项目进行包规范检查，检查项目中的包是否符合规范。

生成 vben-admin.code-workspace 文件，目前不需要手动执行，会在代码提交时自动执行。

用于快速执行大仓中脚本，并提供选项式交互选择。

快速执行dev命令，并提供选项式交互选择。

**Examples:**

Example 1 (unknown):
```unknown
pnpm vsh [command] [options]
```

Example 2 (unknown):
```unknown
pnpm vsh check-circular
```

Example 3 (unknown):
```unknown
pnpm vsh check-dep
```

Example 4 (unknown):
```unknown
pnpm vsh lint
```

---

## 外部模块 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/external-module.html

**Contents:**
- 外部模块 ​
- 安装依赖 ​
- 使用 ​
  - 全局引入 ​
    - 使用 ​
  - 局部引入 ​
- 贡献者
- 页面历史

除了项目默认引入的外部模块，有时我们还需要引入其他外部模块。我们以 ant-design-vue 为例：

**Examples:**

Example 1 (go):
```go
# cd /path/to/your/package
pnpm add ant-design-vue
```

Example 2 (sql):
```sql
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(Antd).mount('#app');
```

Example 3 (vue):
```vue
<template>
  <a-button>text</a-button>
</template>
```

Example 4 (vue):
```vue
<script setup lang="ts">
import { Button } from 'ant-design-vue';
</script>

<template>
  <Button>text</Button>
</template>
```

---

## 登录 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/login.html

**Contents:**
- 登录 ​
- 登录页面调整 ​
- 登录表单调整 ​
- 接口对接流程 ​
  - 前置条件 ​
  - 登录接口 ​
- 贡献者
- 页面历史

本文介绍如何去改造自己的应用程序登录页以及如何快速的对接登录页面接口。

如果你想调整登录页面的标题、描述和图标以及工具栏，你可以通过配置 AuthPageLayout 组件的参数来实现。

只需要在应用下的 src/layouts/auth.vue 内，配置AuthPageLayout的 props参数即可：

如果你想调整登录表单的相关内容，你可以在应用下的 src/views/_core/authentication/login.vue 内，配置AuthenticationLogin 组件参数即可：

如果这些配置不能满足你的需求，你可以自行实现登录表单及相关登录逻辑或者给我们提交 PR。

这里将会快速的介绍如何快速对接自己的后端。

如果你不符合这个格式，你需要先阅读 服务端交互 文档，改造你的request.ts配置。

为了能正常登录，你的后端最少需要提供 2-3 个接口：

接口地址可在应用下的 src/api/core/auth 内修改，以下为默认接口地址：

接口地址可在应用下的 src/api/core/user 内修改，以下为默认接口地址：

这个接口用于获取用户的权限码，权限码是用于控制用户的权限的，接口地址可在应用下的 src/api/core/auth 内修改，以下为默认接口地址：

如果你不需要这个权限，你只需要把代码改为返回一个空数组即可。

**Examples:**

Example 1 (jsx):
```jsx
<AuthPageLayout
  :copyright="true"
  :toolbar="true"
  :toolbarList="['color', 'language', 'layout', 'theme']"
  :app-name="appName"
  :logo="logo"
  :page-description="$t('authentication.pageDesc')"
  :page-title="$t('authentication.pageTitle')"
>
</AuthPageLayout>
```

Example 2 (perl):
```perl
<AuthenticationLogin
  :loading="authStore.loginLoading"
  @submit="authStore.authLogin"
/>
```

Example 3 (elixir):
```elixir
{
  /**
   * @zh_CN 验证码登录路径
   */
  codeLoginPath?: string;
  /**
   * @zh_CN 忘记密码路径
   */
  forgetPasswordPath?: string;

  /**
   * @zh_CN 是否处于加载处理状态
   */
  loading?: boolean;

  /**
   * @zh_CN 二维码登录路径
   */
  qrCodeLoginPath?: string;

  /**
   * @zh_CN 注册路径
   */
  registerPath?: string;

  /**
   * @zh_CN 是否显示验证码登录
   */
  showCodeLogin?: boolean;
  /**
   * @zh_CN 是否显示忘记密码
   */
  showForgetPassword?: boolean;

  /**
   * @zh_CN 是否显示二维码登录
   */
  showQrcodeLogin?: boolean;

  /**
   * @zh_CN 是否显示注册按钮
   */
  showRegister?: boolean;

  /**
   * @zh_CN 是否显示记住账号
   */
  showRememberMe?: boolean;

  /**
   * @zh_CN 是否显示第三方登录
   */
  showThirdPartyLogin?: boolean;

  /**
   * @zh_CN 登录框子标题
   */
  subTitle?: string;

  /**
   * @zh_CN 登录框标题
   */
  title?: string;

}
```

Example 4 (tsx):
```tsx
interface HttpResponse<T = any> {
  /**
   * 0 表示成功 其他表示失败
   * 0 means success, others means fail
   */
  code: number;
  data: T;
  message: string;
}
```

---

## Quick Start | Vben Admin

**URL:** https://doc.vben.pro/en/guide/introduction/quick-start.html

**Contents:**
- Quick Start ​
- Prerequisites ​
- Starting the Project ​
  - Obtain the Source Code ​
  - Install Dependencies ​
  - Run the Project ​
- Contributors
- Changelog

Environment Requirements

Before starting the project, ensure that your environment meets the following requirements:

To verify if your environment meets the above requirements, you can check the versions using the following commands:

Ensure that the directory where you store the code and all its parent directories do not contain Chinese, Korean, Japanese characters, or spaces, as this may cause errors when installing dependencies and starting the project.

Open a terminal in your code directory and execute the following commands:

The project only supports using pnpm for installing dependencies. By default, corepack will be used to install the specified version of pnpm.

Execute the following command to run the project:

You will see an output similar to the following, allowing you to select the project you want to run:

Now, you can visit http://localhost:5555 in your browser to view the project.

**Examples:**

Example 1 (markdown):
```markdown
# Ensure the correct node LTS version is displayed
node -v
# Ensure the correct git version is displayed
git -v
```

Example 2 (markdown):
```markdown
# Clone the code
git clone https://github.com/vbenjs/vue-vben-admin.git
```

Example 3 (markdown):
```markdown
# Clone the code
# The Gitee repository may not have the latest code
git clone https://gitee.com/annsion/vue-vben-admin.git
```

Example 4 (markdown):
```markdown
# Enter the project directory
cd vue-vben-admin

# Enable the project-specified version of pnpm
npm i -g corepack

# Install dependencies
pnpm install
```

---

## 基础概念 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/concept.html

**Contents:**
- 基础概念 ​
- 大仓 ​
- 应用 ​
- 包 ​
  - 包引入 ​
  - 包使用 ​
- 别名 ​
- 贡献者
- 页面历史

新版本中，整体工程进行了重构，现在我们将会介绍一些基础概念，以便于你更好的理解整个文档。请务必仔细阅读这一部分。

大仓指的是整个项目的仓库，包含了所有的代码、包、应用、规范、文档、配置等，也就是一整个 Monorepo 目录的所有内容。

应用指的是一个完整的项目，一个项目可以包含多个应用，这些项目可以复用大仓内的代码、包、规范等。应用都被放置在 apps 目录下。每个应用都是独立的，可以单独运行、构建、测试、部署，可以引入不同的组件库等等。

应用不限于前端应用，也可以是后端应用、移动端应用等，例如 apps/backend-mock就是一个后端服务。

包指的是一个独立的模块，可以是一个组件、一个工具、一个库等。包可以被多个应用引用，也可以被其他包引用。包都被放置在 packages 目录下。

对于这些包，你可以把它看作是一个独立的 npm 包，使用方式与 npm 包一样。

在项目中，你可以看到一些 # 开头的路径，例如： #/api、#/views, 这些路径都是别名，用于快速定位到某个目录。它不是通过 vite 的 alias 实现的，而是通过 Node.js 本身的 subpath imports 原理。只需要在 package.json 中配置 imports 字段即可。

为了 IDE 能够识别这些别名，我们还需要在tsconfig.json内配置：

**Examples:**

Example 1 (json):
```json
{
  "dependencies": {
    "@vben/utils": "workspace:*"
  }
}
```

Example 2 (sql):
```sql
import { isString } from '@vben/utils';
```

Example 3 (json):
```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

Example 4 (json):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["src/*"]
    }
  }
}
```

---

## 国际化 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/locale.html

**Contents:**
- 国际化 ​
- IDE 插件 ​
- 配置默认语言 ​
- 动态切换语言 ​
- 新增翻译文本 ​
- 使用翻译文本 ​
  - 在代码中使用 ​
- 新增语言包 ​
- 界面切换语言功能 ​
- 远程加载语言包 ​

项目已经集成了 Vue i18n，并且已经配置好了中文和英文的语言包。

如果你使用的 vscode 开发工具，则推荐安装 i18n Ally 这个插件。它可以帮助你更方便的管理国际化的文案，安装了该插件后，你的代码内可以实时看到对应的语言内容：

只需要覆盖默认的偏好设置即可，在对应的应用内，找到 src/preferences.ts 文件，修改 locale 的值即可：

新增翻译文本，只需要在对应的应用内，找到 src/locales/langs/，新增对应的文本即可，例:

src/locales/langs/zh-CN/*.json

src/locales/langs/en-US.ts

通过 @vben/locales，你可以很方便的使用翻译文本：

如果你需要新增语言包，需要按照以下步骤进行：

在 packages/locales/langs 目录下新增对应的语言包文件，例：zh-TW.json，并翻译对应的文本。

在对应的应用内，找到 src/locales/langs 文件，新增对应的语言包 zh-TW.json

在 packages/constants/src/core.ts内，新增对应的语言：

在 packages/locales/typing.ts内，新增 Typescript 类型：

到这里，你就可以在项目内使用新增的语言包了。

如果你想关闭界面上的语言切换显示按钮，在对应的应用内，找到 src/preferences.ts 文件，修改 locale 的值即可：

通过项目自带的request工具进行接口请求时，默认请求头里会带上 Accept-Language ，服务端可根据请求头进行动态数据国际化处理。

每个应用都有一个独立的语言包，它可以覆盖通用的语言配置，你可以通过远程加载的方式来获取对应的语言包，只需要在对应的应用内，找到 src/locales/index.ts 文件，修改 loadMessages 方法即可：

不同应用内使用的第三方组件库或者插件国际化方式可能不一致，所以需要差别处理。 如果你需要引入第三方的语言包，你可以在对应的应用内，找到 src/locales/index.ts 文件，修改 loadThirdPartyMessage 方法即可：

首先，不是很建议移除国际化，因为国际化是一个很好的开发习惯，但是如果你真的需要移除国际化，你可以直接使用中文文案，然后保留项目自带的语言包即可，整体开发体验不会影响。移除国际化的步骤如下：

隐藏界面上的语言切换按钮，见：界面切换语言功能

关闭 vue-i18n的警告提示，在src/locales/index.ts文件内，修改missingWarn为false即可：

**Examples:**

Example 1 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  app: {
    locale: 'en-US',
  },
});
```

Example 2 (javascript):
```javascript
import type { SupportedLanguagesType } from '@vben/locales';
import { loadLocaleMessages } from '@vben/locales';
import { updatePreferences } from '@vben/preferences';

async function updateLocale(value: string) {
  // 1. 更新偏好设置
  const locale = value as SupportedLanguagesType;
  updatePreferences({
    app: {
      locale,
    },
  });
  // 2. 加载对应的语言包
  await loadLocaleMessages(locale);
}

updateLocale('en-US');
```

Example 3 (json):
```json
```json
{
  "about": {
    "desc": "Vben Admin 是一个现代的管理模版。"
  }
}
```

Example 4 (json):
```json
```json
{
  "about": {
    "desc": "Vben Admin is a modern management template."
  }
}
```

---

## CLI | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/cli.html

**Contents:**
- CLI ​
- vsh ​
  - Usage ​
  - vsh check-circular ​
    - Usage ​
    - Options ​
  - vsh check-dep ​
    - Usage ​
  - vsh lint ​
    - Usage ​

In the project, some command-line tools are provided for common operations, located in scripts.

Used for some project operations, such as cleaning the project, checking the project, etc.

Check for circular references throughout the project. If there are circular references, the modules involved will be output to the console.

Check the dependency situation of the entire project and output unused dependencies, uninstalled dependencies information to the console.

Lint checks the project to see if the code in the project conforms to standards.

Perform package standard checks on Monorepo projects to see if the packages in the project conform to standards.

Generate vben-admin.code-workspace file. Currently, it does not need to be executed manually and will be executed automatically when code is committed.

Used to quickly execute scripts in the large repository and provide option-based interactive selection.

Quickly execute the dev command and provide option-based interactive selection.

**Examples:**

Example 1 (unknown):
```unknown
pnpm vsh [command] [options]
```

Example 2 (unknown):
```unknown
pnpm vsh check-circular
```

Example 3 (unknown):
```unknown
pnpm vsh check-dep
```

Example 4 (unknown):
```unknown
pnpm vsh lint
```

---

## Icons | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/icons.html

**Contents:**
- Icons ​
- Iconify Icons Recommended ​
  - Adding New Icons ​
  - Usage ​
- SVG Icons Recommended ​
  - Adding New Icons ​
  - Usage ​
- Tailwind CSS Icons Not Recommended ​
  - Usage ​
- Contributors

About Icon Management

There are several ways to use icons in the project, you can choose according to the actual situation:

Integrated with the iconify icon library

You can add new icons in the packages/icons/src/iconify directory:

Instead of using Svg Sprite, SVG icons are directly imported,

You can add new icon files test.svg in the packages/icons/src/svg/icons directory, and then import it in packages/icons/src/svg/index.ts:

You can use the icons by directly adding the Tailwind CSS icon class names, which can be found on iconify ：

**Examples:**

Example 1 (javascript):
```javascript
// packages/icons/src/iconify/index.ts
import { createIconifyIcon } from '@vben-core/icons';

export const MdiKeyboardEsc = createIconifyIcon('mdi:keyboard-esc');
```

Example 2 (vue):
```vue
<script setup lang="ts">
import { MdiKeyboardEsc } from '@vben/icons';
</script>

<template>
  <!-- An icon with a width and height of 20px -->
  <MdiKeyboardEsc class="size-5" />
</template>
```

Example 3 (sql):
```sql
// packages/icons/src/svg/index.ts
import { createIconifyIcon } from '@vben-core/icons';

const SvgTestIcon = createIconifyIcon('svg:test');

export { SvgTestIcon };
```

Example 4 (vue):
```vue
<script setup lang="ts">
import { SvgTestIcon } from '@vben/icons';
</script>

<template>
  <!-- An icon with a width and height of 20px -->
  <SvgTestIcon class="size-5" />
</template>
```

---

## Internationalization | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/locale.html

**Contents:**
- Internationalization ​
- IDE Plugin ​
- Configure Default Language ​
- Dynamic Language Switching ​
- Adding Translation Texts ​
- Using Translation Texts ​
  - In Code ​
- Adding a New Language Pack ​
- Interface Language Switching Function ​
- Remote Loading of Language Packs ​

The project has integrated Vue i18n, and Chinese and English language packs have been configured.

If you are using vscode as your development tool, it is recommended to install the i18n Ally plugin. It can help you manage internationalization copy more conveniently. After installing this plugin, you can see the corresponding language content in your code in real-time:

You just need to override the default preferences. In the corresponding application, find the src/preferences.ts file and modify the value of locale:

Switching languages consists of two parts:

To add new translation texts, simply find src/locales/langs/ in the corresponding application and add the texts accordingly, for example:

src/locales/langs/zh-CN/*.json

src/locales/langs/en-US.ts

With @vben/locales, you can easily use translation texts:

If you need to add a new language pack, follow these steps:

Add the corresponding language pack file in the packages/locales/langs directory, for example, zh-TW.json, and translate the respective texts.

In the corresponding application, locate the src/locales/langs file and add the new language pack zh-TW.json.

Add the corresponding language in packages/constants/src/core.ts:

In packages/locales/typing.ts, add a new TypeScript type:

At this point, you can use the newly added language pack in the project.

If you want to disable the language switching display button on the interface, in the corresponding application, find the src/preferences.ts file and modify the value of locale accordingly:

When making interface requests through the project's built-in request tool, the default request header will include Accept-Language, allowing the server to dynamically internationalize data based on the request header.

Each application has an independent language pack that can override the general language configuration. You can remotely load the corresponding language pack by finding the src/locales/index.ts file in the corresponding application and modifying the loadMessages method accordingly:

Different applications may use third-party component libraries or plugins with varying internationalization methods, so they need to be handled differently. If you need to introduce a third-party language pack, you can find the src/locales/index.ts file in the corresponding application and modify the loadThirdPartyMessage method accordingly:

Firstly, it is not recommended to remove internationalization, as it is a good development practice. However, if you really need to remove it, you can directly use Chinese copy and then retain the project's built-in language pack, which will not affect the overall development experience. The steps to remove internationalization are as follows:

Hide the language switching button on the interface, see: Interface Language Switching Function

Modify the default language, see: Configure Default Language

Disable vue-i18n warning prompts, in the src/locales/index.ts file, modify missingWarn to false:

**Examples:**

Example 1 (javascript):
```javascript
export const overridesPreferences = defineOverridesPreferences({
  app: {
    locale: 'en-US',
  },
});
```

Example 2 (javascript):
```javascript
import type { SupportedLanguagesType } from '@vben/locales';
import { loadLocaleMessages } from '@vben/locales';
import { updatePreferences } from '@vben/preferences';

async function updateLocale(value: string) {
  // 1. Update preferences
  const locale = value as SupportedLanguagesType;
  updatePreferences({
    app: {
      locale,
    },
  });
  // 2. Load the corresponding language pack
  await loadLocaleMessages(locale);
}

updateLocale('en-US');
```

Example 3 (json):
```json
```json
{
  "about": {
    "desc": "Vben Admin 是一个现代的管理模版。"
  }
}
```

Example 4 (json):
```json
```json
{
  "about": {
    "desc": "Vben Admin is a modern management template."
  }
}
```

---

## UI Framework Switching | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/ui-framework.html

**Contents:**
- UI Framework Switching ​
- Adding a New UI Framework ​
- Contributors
- Changelog

Vue Admin supports your freedom to choose the UI framework. The default UI framework for the demo site is Ant Design Vue, consistent with the older version. The framework also has built-in versions for Element Plus and Naive UI, allowing you to choose according to your preference.

If you want to use a different UI framework, you only need to follow these steps:

---

## 全局loading | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/loading.html

**Contents:**
- 全局loading ​
- 原理 ​
- 关闭 ​
- 自定义 ​
- 贡献者
- 页面历史

全局 loading 指的是页面刷新时出现的加载效果，通常是一个旋转的图标：

由 vite-plugin-inject-app-loading 插件实现，插件会在每个应用都注入一个全局的 loading html。

如果你不需要全局 loading，可以在 .env 文件中关闭：

如果你想要自定义全局 loading，可以在应用目录下，与index.html同级，创建一个loading.html文件，插件会自动读取并注入。这个html可以自行定义样式和动画。

**Examples:**

Example 1 (sass):
```sass
VITE_INJECT_APP_LOADING=false
```

Example 2 (lua):
```lua
<style data-app-loading="inject-css">
  #__app-loading__.hidden {
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    transition: all 1s ease-out;
  }
  /* ... */
</style>
<div id="__app-loading__">
  <!-- ... -->
  <div class="title"><%= VITE_APP_TITLE %></div>
</div>
```

---

## Slimmed-Down Version | Vben Admin

**URL:** https://doc.vben.pro/en/guide/introduction/thin.html

**Contents:**
- Slimmed-Down Version ​
- Application Slimming ​
- Demo Code Slimming ​
- Documentation Slimming ​
- Remove Mock Service ​
- Installing Dependencies ​
- Adjusting Commands ​
- Contributors
- Changelog

Starting from version 5.0, we no longer provide slimmed-down repositories or branches. Our goal is to offer a more consistent development experience while reducing maintenance costs. Here’s how we introduce our project, slim down, and remove unnecessary features.

First, identify the version of the UI component library you need, and then delete the corresponding applications. For example, if you choose to use Ant Design Vue, you can delete the other applications. Simply remove the following two folders:

If your project doesn’t include the UI component library you need, you can delete all other applications and create your own new application as needed.

If you don’t need demo code, you can simply delete the playground folder

If you don’t need documentation, you can delete the docs folder.

If you don’t need the Mock service, you can delete the apps/backend-mock folder. Also, remove the VITE_NITRO_MOCK variable from the .env.development file in your application.

Now that you’ve completed the slimming operations, you can install the dependencies and start your project:

After slimming down, you may need to adjust commands according to your project. In the package.json file in the root directory, you can adjust the scripts field and remove any commands you don’t need.

**Examples:**

Example 1 (unknown):
```unknown
apps/web-ele
apps/web-native
```

Example 2 (sass):
```sass
# Whether to enable Nitro Mock service, true to enable, false to disable
VITE_NITRO_MOCK=false
```

Example 3 (markdown):
```markdown
# Run in the root directory
pnpm install
```

Example 4 (json):
```json
{
  "scripts": {
    "build:antd": "pnpm run build --filter=@vben/web-antd",
    "build:docs": "pnpm run build --filter=@vben/docs",
    "build:ele": "pnpm run build --filter=@vben/web-ele",
    "build:naive": "pnpm run build --filter=@vben/web-naive",
    "build:tdesign": "pnpm run build --filter=@vben/web-tdesign",
    "build:play": "pnpm run build --filter=@vben/playground",
    "dev:antd": "pnpm -F @vben/web-antd run dev",
    "dev:docs": "pnpm -F @vben/docs run dev",
    "dev:ele": "pnpm -F @vben/web-ele run dev",
    "dev:play": "pnpm -F @vben/playground run dev",
    "dev:naive": "pnpm -F @vben/web-naive run dev"
  }
}
```

---

## 常见问题 # | Vben Admin

**URL:** https://doc.vben.pro/guide/other/faq.html

**Contents:**
- 常见问题 # ​
- 说明 ​
- 依赖问题 ​
- 关于缓存更新问题 ​
- 关于修改配置文件的问题 ​
- 本地运行报错 ​
- 页面切换后页面空白 ​
- 我的代码本地开发可以，打包就不行了 ​
- 依赖安装问题 ​
- 打包文件过大 ​

有问题可以先来这里寻找，如果没有可以在 GitHub Issue 搜索或者提交你的问题, 如果是讨论性的问题可以在 GitHub Discussions

在 Monorepo 项目下，需要养成每次 git pull代码都要执行pnpm install的习惯，因为经常会有新的依赖包加入，项目在lefthook.yml已经配置了自动执行pnpm install，但是有时候会出现问题，如果没有自动执行，建议手动执行一次。

项目配置默认是缓存在 localStorage 内，所以版本更新后可能有些配置没改变。

解决方式是每次更新代码的时候修改 package.json 内的 version 版本号. 因为 localStorage 的 key 是根据版本号来的。所以更新后版本不同前面的配置会失效。重新登录即可

当修改 .env 等环境文件以及 vite.config.ts 文件时，vite 会自动重启服务。

自动重启有几率出现问题，请重新运行项目即可解决.

由于 vite 在本地没有转换代码，且代码中用到了可选链等比较新的语法。所以本地开发需要使用版本较高的浏览器(Chrome 90+)进行开发

这是由于开启了路由切换动画,且对应的页面组件存在多个根节点导致的，在页面最外层添加<div></div>即可

目前发现这个原因可能有以下，可以从以下原因来排查，如果还有别的可能，欢迎补充

首先，完整版由于引用了比较多的库文件，所以打包会比较大。可以使用精简版来进行开发

其次建议开启 gzip，使用之后体积会只有原先 1/3 左右。gzip 可以由服务器直接开启。如果是这样，前端不需要构建 .gz 格式的文件，如果前端构建了 .gz 文件，以 nginx 为例，nginx 需要开启 gzip_static: on 这个选项。

开启 gzip 的同时还可以同时开启 brotli，比 gzip 更好的压缩。两者可以共存

gzip_static: 这个模块需要 nginx 另外安装，默认的 nginx 没有安装这个模块。

开启 brotli 也需要 nginx 另外安装模块

如果出现类似以下错误，请检查项目全路径（包含所有父级路径）不能出现中文、日文、韩文。否则将会出现路径访问 404 导致以下问题

如果看到控制台有如下警告，且页面能正常打开 可以忽略该警告。

后续 vue-router 可能会提供配置项来关闭警告

当出现以下错误信息时，请检查你的 nodejs 版本号是否符合要求

部署到 nginx后，可能会出现以下错误：

进入 nginx 下的mime.types文件, 将application/javascript js; 修改为 application/javascript js mjs;

**Examples:**

Example 1 (vue):
```vue
<template>
  <!-- 注释也算一个节点 -->
  <h1>text h1</h1>
  <h2>text h2</h2>
</template>
```

Example 2 (vue):
```vue
<template>
  <div>
    <h1>text h1</h1>
    <h2>text h2</h2>
  </div>
</template>
```

Example 3 (sql):
```sql
import { getCurrentInstance } from 'vue';
getCurrentInstance().ctx.xxxx;
```

Example 4 (markdown):
```markdown
# .npmrc
registry = https://registry.npmmirror.com/
```

---

## 配置 | Vben Admin

**URL:** https://doc.vben.pro/guide/essentials/settings.html

**Contents:**
- 配置 ​
- 环境变量配置 ​
- 环境配置说明 ​
- 生产环境动态配置 ​
  - 作用 ​
  - 使用 ​
  - 新增 ​
- 偏好设置 ​
  - 框架默认配置 ​
- 贡献者

项目的环境变量配置位于应用目录下的 .env、.env.development、.env.production。

规则与 Vite Env Variables and Modes 一致。格式如下：

只有以 VITE_ 开头的变量会被嵌入到客户端侧的包中，你可以在项目代码中这样访问它们：

以 VITE_GLOB_* 开头的的变量，在打包的时候，会被加入 _app.config.js配置文件当中.

当在大仓根目录下，执行 pnpm build构建项目之后，会自动在对应的应用下生成 dist/_app.config.js文件并插入 index.html。

_app.config.js 是一个动态配置文件，可以在项目构建之后，根据不同的环境动态修改配置。内容如下：

_app.config.js 用于项目在打包后，需要动态修改配置的需求，如接口地址。不用重新进行打包，可在打包后修改 /dist/_app.config.js 内的变量，刷新即可更新代码内的局部变量。这里使用js文件，是为了确保配置文件加载顺序保持在前面。

想要获取 _app.config.js 内的变量，需要使用@vben/hooks提供的 useAppConfig方法。

新增一个可动态修改的配置项，只需要按照如下步骤即可：

首先在 .env 或者对应的开发环境配置文件内，新增需要可动态配置的变量，需要以 VITE_GLOB_* 开头的变量，如：

在 packages/types/global.d.ts,新增对应的类型定义，如：

在 packages/effects/hooks/src/use-app-config.ts 中，新增对应的配置项，如：

到这里，就可以在项目内使用 useAppConfig方法获取到新增的配置项了。

useAppConfig方法只能在应用内使用，不要耦合到包内部去使用。这里传入 import.meta.env和import.meta.env.PROD是为了避免这种情况，一个纯粹的包，应避免使用特定构建工具的变量。

项目提供了非常丰富的偏好设置，用于动态配置项目的各种功能：

如果你找不到文档说明，可以尝试自己配置好以后，点击复制偏好设置，覆盖项目默认即可。配置文件位于应用目录下的preferences.ts，在这里，你可以覆盖框架默认的配置，实现自定义配置。

**Examples:**

Example 1 (unknown):
```unknown
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```

Example 2 (javascript):
```javascript
console.log(import.meta.env.VITE_PROT);
```

Example 3 (sass):
```sass
# 应用标题
VITE_APP_TITLE=Vben Admin

# 应用命名空间，用于缓存、store等功能的前缀，确保隔离
VITE_APP_NAMESPACE=vben-web-antd
```

Example 4 (sass):
```sass
# 端口号
VITE_PORT=5555

# 资源公共路径,需要以 / 开头和结尾
VITE_BASE=/

# 接口地址
VITE_GLOB_API_URL=/api

# 是否开启 Nitro Mock服务，true 为开启，false 为关闭
VITE_NITRO_MOCK=true

# 是否打开 devtools，true 为打开，false 为关闭
VITE_DEVTOOLS=true

# 是否注入全局loading
VITE_INJECT_APP_LOADING=true
```

---

## Basic Concepts | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/concept.html

**Contents:**
- Basic Concepts ​
- Monorepo ​
- Applications ​
- Packages ​
  - Package Import ​
  - Package Usage ​
- Aliases ​
- Contributors
- Changelog

In the new version, the entire project has been restructured. Now, we will introduce some basic concepts to help you better understand the entire document. Please make sure to read this section first.

Monorepo refers to the repository of the entire project, which includes all code, packages, applications, standards, documentation, configurations, etc., that is, the entire content of a Monorepo directory.

Applications refer to a complete project; a project can contain multiple applications, which can reuse the code, packages, standards, etc., within the monorepo. Applications are placed in the apps directory. Each application is independent and can be run, built, tested, and deployed separately; it can also include different component libraries, etc.

Applications are not limited to front-end applications; they can also be back-end applications, mobile applications, etc. For example, apps/backend-mock is a back-end service.

A package refers to an independent module, which can be a component, a tool, a library, etc. Packages can be referenced by multiple applications or other packages. Packages are placed in the packages directory.

You can consider these packages as independent npm packages, and they are used in the same way as npm packages.

Importing a package in package.json:

Importing a package in the code:

In the project, you can see some paths starting with #, such as #/api, #/views. These paths are aliases, used for quickly locating a certain directory. They are not implemented through vite's alias, but through the principle of subpath imports in Node.js itself. You only need to configure the imports field in package.json.

To make these aliases recognizable by the IDE, we also need to configure them in tsconfig.json:

This way, you can use aliases in your code.

**Examples:**

Example 1 (json):
```json
{
  "dependencies": {
    "@vben/utils": "workspace:*"
  }
}
```

Example 2 (sql):
```sql
import { isString } from '@vben/utils';
```

Example 3 (json):
```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

Example 4 (json):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["src/*"]
    }
  }
}
```

---

## Tailwind CSS | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/tailwindcss.html

**Contents:**
- Tailwind CSS ​
- Configuration ​
- Contributors
- Changelog

Tailwind CSS is a utility-first CSS framework for quickly building custom designs.

The project's configuration file is located in internal/tailwind-config, where you can modify the Tailwind CSS configuration.

Restrictions on using tailwindcss in packages

Tailwind CSS compilation will only be enabled if there is a tailwind.config.mjs file present in the corresponding package. Otherwise, Tailwind CSS will not be enabled. If you have a pure SDK package that does not require Tailwind CSS, you do not need to create a tailwind.config.mjs file.

---

## 关于 Vben Admin | Vben Admin

**URL:** https://doc.vben.pro/guide/introduction/vben.html

**Contents:**
- 关于 Vben Admin ​
- 特点 ​
- 浏览器支持 ​
- 贡献 ​
- 贡献者
- 页面历史

你正在阅读的是 Vben Admin 5.0版本的文档！

Vben Admin 是一个基于 Vue3.0、Vite、 TypeScript 的中后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、多主题配置、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模板，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 vue3、vite、ts 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。

本地开发推荐使用Chrome 最新版浏览器，不支持Chrome 80以下版本。

---

## Tailwind CSS | Vben Admin

**URL:** https://doc.vben.pro/guide/project/tailwindcss.html

**Contents:**
- Tailwind CSS ​
- 配置 ​
- 提示 ​
- 贡献者
- 页面历史

Tailwind CSS 是一个实用性优先的CSS框架，用于快速构建自定义设计。

项目的配置文件位于 internal/tailwind-config 下，你可以在这里修改 Tailwind CSS 的配置。

当前只有对应的包下面存在 tailwind.config.mjs 文件才会启用 tailwindcss 的编译，否则不会启用 tailwindcss。如果你是纯粹的 SDK 包，不需要使用 tailwindcss，可以不用创建 tailwind.config.mjs 文件。

现tailwindcss已至v4.x版本，使用方法与tailwindcss: ^3.4.17有差异，v4.0无法与v3.x版本兼容，在开发前请确认package.json中的tailwindcss版本。

---

## Changeset | Vben Admin

**URL:** https://doc.vben.pro/en/guide/project/changeset.html

**Contents:**
- Changeset ​
- Command Line ​
  - Interactively Add Changesets ​
  - Uniformly Increment Version Numbers ​
- Contributors
- Changelog

The project has integrated changeset as a version management tool. Changeset is a version management tool that helps us better manage versions, generate changelogs, and automate releases.

For detailed usage, please refer to the official documentation. If you do not need it, you can ignore it directly.

The changeset command is already built into the project:

**Examples:**

Example 1 (unknown):
```unknown
pnpm run changeset
```

Example 2 (unknown):
```unknown
pnpm run version
```

---

## Login | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/login.html

**Contents:**
- Login ​
- Login Page Adjustment ​
- Login Form Adjustment ​
- Contributors
- Changelog

This document explains how to customize the login page of your application.

If you want to adjust the title, description, icon, and toolbar of the login page, you can do so by configuring the props parameter of the AuthPageLayout component.

You just need to configure the props parameter of AuthPageLayout in src/router/routes/core.ts within your application:

If these configurations do not meet your needs, you can implement your own login page. Simply implement your own AuthPageLayout.

If you want to adjust the content of the login form, you can configure the AuthenticationLogin component parameters in src/views/_core/authentication/login.vue within your application:

If these configurations do not meet your needs, you can implement your own login form and related login logic.

**Examples:**

Example 1 (lua):
```lua
{
    component: AuthPageLayout,
    props: {
      sloganImage: "xxx/xxx.png",
      pageTitle: "开箱即用的大型中后台管理系统",
      pageDescription: "工程化、高性能、跨组件库的前端模版",
      toolbar: true,
      toolbarList: ['color', 'language', 'layout', 'theme'],
    }
    // ...
  },
```

Example 2 (perl):
```perl
<AuthenticationLogin
  :loading="authStore.loginLoading"
  @submit="authStore.authLogin"
/>
```

Example 3 (elixir):
```elixir
{
  /**
   * @en Verification code login path
   */
  codeLoginPath?: string;
  /**
   * @en Forget password path
   */
  forgetPasswordPath?: string;

  /**
   * @en Whether it is in loading state
   */
  loading?: boolean;

  /**
   * @en QR code login path
   */
  qrCodeLoginPath?: string;

  /**
   * @en Registration path
   */
  registerPath?: string;

  /**
   * @en Whether to show verification code login
   */
  showCodeLogin?: boolean;
  /**
   * @en Whether to show forget password
   */
  showForgetPassword?: boolean;

  /**
   * @en Whether to show QR code login
   */
  showQrcodeLogin?: boolean;

  /**
   * @en Whether to show registration button
   */
  showRegister?: boolean;

  /**
   * @en Whether to show remember account
   */
  showRememberMe?: boolean;

  /**
   * @en Whether to show third-party login
   */
  showThirdPartyLogin?: boolean;

  /**
   * @en Login box subtitle
   */
  subTitle?: string;

  /**
   * @en Login box title
   */
  title?: string;
}
```

---

## Check Updates | Vben Admin

**URL:** https://doc.vben.pro/en/guide/in-depth/check-updates.html

**Contents:**
- Check Updates ​
- Introduction ​
- Effect ​
- Replacing with Other Update Checking Methods ​
- Contributors
- Changelog

When there are updates to the website, you might need to check for updates. The framework provides this functionality. By periodically checking for updates, you can configure the checkUpdatesInterval and enableCheckUpdates fields in your application's preferences.ts file to enable and set the interval for checking updates (in minutes).

When an update is detected, a prompt will pop up asking the user whether to refresh the page:

If you need to check for updates in other ways, such as through an API to more flexibly control the update logic (such as force refresh, display update content, etc.), you can do so by modifying the src/widgets/check-updates/check-updates.vue file under @vben/layouts.

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // Whether to enable check for updates
    enableCheckUpdates: true,
    // The interval for checking updates, in minutes
    checkUpdatesInterval: 1,
  },
});
```

Example 2 (javascript):
```javascript
// Replace this with your update checking logic
async function getVersionTag() {
  try {
    const response = await fetch('/', {
      cache: 'no-cache',
      method: 'HEAD',
    });

    return (
      response.headers.get('etag') || response.headers.get('last-modified')
    );
  } catch {
    console.error('Failed to fetch version tag');
    return null;
  }
}
```

---

## 单元测试 | Vben Admin

**URL:** https://doc.vben.pro/guide/project/test.html

**Contents:**
- 单元测试 ​
- 编写测试用例 ​
- 运行测试 ​
- 现有单元测试 ​
- 贡献者
- 页面历史

项目内置了 Vitest 作为单元测试工具。Vitest 是一个基于 Vite 的测试运行器，它提供了一套简单的 API 来编写测试用例。

在项目中，我们约定将测试文件名以 .test.ts 结尾，或者存放到__tests__目录内。例如，创建一个 utils.ts 文件，然后同级目录utils.test.ts 文件，

项目中已经有一些单元测试用例，可以搜索以.test.ts结尾的文件查看，在你更改到相关代码时，可以运行单元测试来保证代码的正确性，建议在开发过程中，保持单元测试的覆盖率，且同时在 CI/CD 流程中运行单元测试，保证测试通过在进行项目部署。

**Examples:**

Example 1 (sql):
```sql
// utils.test.ts
import { expect, test } from 'vitest';
import { sum } from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

Example 2 (unknown):
```unknown
pnpm test:unit
```

---

## 权限 | Vben Admin

**URL:** https://doc.vben.pro/guide/in-depth/access.html

**Contents:**
- 权限 ​
- 前端访问控制 ​
  - 步骤 ​
  - 菜单可见，但禁止访问 ​
- 后端访问控制 ​
  - 步骤 ​
- 混合访问控制 ​
  - 步骤 ​
- 按钮细粒度控制 ​
  - 权限码 ​

实现原理: 在前端固定写死路由的权限，指定路由有哪些权限可以查看。只初始化通用的路由，需要权限才能访问的路由没有被加入路由表内。在登录后或者其他方式获取用户角色后，通过角色去遍历路由表，获取该角色可以访问的路由表，生成路由表，再通过 router.addRoute 添加到路由实例，实现权限的过滤。

缺点: 权限相对不自由，如果后台改动角色，前台也需要跟着改动。适合角色较固定的系统

调整对应应用目录下的preferences.ts，确保accessMode='frontend'。

可查看应用下的 src/store/auth,找到下面代码，

到这里，就已经配置完成，你需要确保登录后，接口返回的角色和路由表的权限匹配，否则无法访问。

有时候，我们需要菜单可见，但是禁止访问，可以通过下面的方式实现，设置 menuVisibleWithForbidden 为 true，此时菜单可见，但是禁止访问，会跳转403页面。

实现原理: 是通过接口动态生成路由表，且遵循一定的数据结构返回。前端根据需要处理该数据为可识别的结构，再通过 router.addRoute 添加到路由实例，实现权限的动态生成。

缺点: 后端需要提供符合规范的数据结构，前端需要处理数据结构，适合权限较为复杂的系统。

调整对应应用目录下的preferences.ts，确保accessMode='backend'。

可查看应用下的 src/router/access.ts,找到下面代码，

到这里，就已经配置完成，你需要确保登录后，接口返回的菜单格式正确，否则无法访问。

实现原理: 混合模式同时结合了前端访问控制和后端访问控制两种方式。系统会并行处理前端固定路由权限和后端动态菜单数据，最终将两部分路由合并，提供更灵活的权限控制方案。

优点: 兼具前端控制的性能优势和后端控制的灵活性，适合复杂业务场景下的权限管理。

调整对应应用目录下的preferences.ts，确保accessMode='mixed'。

需要同时满足前端路由权限配置和后端菜单数据返回的要求，确保用户角色与两种模式的权限配置都匹配。

到这里，就已经配置完成，混合模式会自动合并前端和后端的路由，提供完整的权限控制功能。

在某些情况下，我们需要对按钮进行细粒度的控制，我们可以借助接口或者角色来控制按钮的显示。

权限码为接口返回的权限码，通过权限码来判断按钮是否显示，逻辑在src/store/auth下：

找到 getAccessCodes 对应的接口，可根据业务逻辑进行调整。

权限码返回的数据结构为字符串数组，例如：['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010']

有了权限码，就可以使用 @vben/access 提供的AccessControl组件及API来进行按钮的显示与隐藏。

指令支持绑定单个或多个权限码。单个时可以直接传入字符串或数组中包含一个权限码，多个权限码则传入数组。

角色判断方式不需要接口返回的权限码，直接通过角色来判断按钮是否显示。

指令支持绑定单个或多个角色。单个时可以直接传入字符串或数组中包含一个角色，多个角色均可访问则传入数组。

**Examples:**

Example 1 (javascript):
```javascript
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // 默认值，可不填
    accessMode: 'frontend',
  },
});
```

Example 2 (json):
```json
{
    meta: {
      authority: ['super'],
    },
},
```

Example 3 (unknown):
```unknown
// 设置登录用户信息，需要确保 userInfo.roles 是一个数组，且包含路由表中的权限
// 例如：userInfo.roles=['super', 'admin']
authStore.setUserInfo(userInfo);
```

Example 4 (json):
```json
{
    meta: {
      menuVisibleWithForbidden: true,
    },
},
```

---

## Routes and Menus | Vben Admin

**URL:** https://doc.vben.pro/en/guide/essentials/route.html

**Contents:**
- Routes and Menus ​
- Types of Routes ​
  - Core Routes ​
  - Static Routes ​
  - Dynamic Routes ​
- Route Definition ​
  - Secondary Routes ​
  - Multi-level Routes ​
- Adding a New Page ​
  - Adding a Route ​

This page is translated by machine translation and may not be very accurate.

In the project, the framework provides a basic routing system and automatically generates the corresponding menu structure based on the routing files.

Routes are divided into core routes, static routes, and dynamic routes. Core routes are built-in routes of the framework, including root routes, login routes, 404 routes, etc.; static routes are routes that are determined when the project starts; dynamic routes are generally generated dynamically based on the user's permissions after the user logs in.

Both static and dynamic routes go through permission control, which can be controlled by configuring the authority field in the meta property of the route.

Core routes are built-in routes of the framework, including root routes, login routes, 404 routes, etc. The configuration of core routes is in the src/router/routes/core directory under the application.

Core routes are mainly used for the basic functions of the framework, so it is not recommended to put business-related routes in core routes. It is recommended to put business-related routes in static or dynamic routes.

The configuration of static routes is in the src/router/routes/index directory under the application. Open the commented file content:

Permission control is controlled by the authority field in the meta property of the route. If your page project does not require permission control, you can omit the authority field.

The configuration of dynamic routes is in the src/router/routes/modules directory under the corresponding application. This directory contains all the route files. The content format of each file is consistent with the Vue Router route configuration format. Below is the configuration of secondary and multi-level routes.

The configuration method of static routes and dynamic routes is the same. Below is the configuration of secondary and multi-level routes:

To add a new page, you only need to add a route and the corresponding page component.

Add a route object in the corresponding route file, as follows:

In #/views/home/, add a new index.vue file, as follows:

At this point, the page has been added. Visit http://localhost:5555/home/index to see the corresponding page.

The route configuration items are mainly in the meta property of the route object. The following are common configuration items:

Used to configure the title of the page, which will be displayed in the menu and tab. Generally used with internationalization.

Used to configure the icon of the page, which will be displayed in the menu and tab. Generally used with an icon library, if it is an http link, the image will be loaded automatically.

Used to configure the active icon of the page, which will be displayed in the menu. Generally used with an icon library, if it is an http link, the image will be loaded automatically.

Used to configure whether the page cache is enabled. When enabled, the page will be cached and will not reload, only effective when the tab is enabled.

Used to configure whether the page is hidden in the menu. When hidden, the page will not be displayed in the menu.

Used to configure whether the page is hidden in the tab. When hidden, the page will not be displayed in the tab.

Used to configure whether the page is hidden in the breadcrumb. When hidden, the page will not be displayed in the breadcrumb.

Used to configure whether the subpages of the page are hidden in the menu. When hidden, the subpages will not be displayed in the menu.

Used to configure the permissions of the page. Only users with the corresponding permissions can access the page. If not configured, no permissions are required.

Used to configure the badge of the page, which will be displayed in the menu.

Used to configure the badge type of the page. dot is a small red dot, normal is text.

Used to configure the badge color of the page.

Used to configure the currently active menu. Sometimes the page is not displayed in the menu, and this is used to activate the parent menu.

Used to configure whether the page is fixed in the tab. When fixed, the page cannot be closed.

Used to configure the order of fixed tabs, sorted in ascending order.

Used to configure the iframe address of the embedded page. When set, the corresponding page will be embedded in the current page.

Used to configure whether the page ignores permissions and can be accessed directly.

Used to configure the external link jump path, which will open in a new window.

Used to configure the maximum number of open tabs. When set, the earliest opened tab will be automatically closed when opening a new tab (only effective when opening tabs with the same name).

Used to configure whether the page can be seen in the menu, but access will be redirected to 403.

When set to true, the page will open in a new window.

Used to configure the sorting of the page, used for route to menu sorting.

Note: Sorting is only effective for first-level menus. The sorting of second-level menus needs to be set in the corresponding first-level menu in code order.

Used to configure the menu parameters of the page, which will be passed to the page in the menu.

The route refresh method is as follows:

**Examples:**

Example 1 (typescript):
```typescript
// Uncomment if needed and create the folder
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true }); 
/** Dynamic routes */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** External route list, these pages can be accessed without Layout, possibly used for embedding in other systems */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles)
const externalRoutes: RouteRecordRaw[] = []; 
const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
```

Example 2 (json):
```json
import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      badgeType: 'dot',
      badgeVariants: 'destructive',
      icon: VBEN_LOGO_URL,
      order: 9999,
      title: $t('page.vben.title'),
    },
    name: 'VbenProject',
    path: '/vben-admin',
    redirect: '/vben-admin/about',
    children: [
      {
        name: 'VbenAbout',
        path: '/vben-admin/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          badgeType: 'dot',
          badgeVariants: 'destructive',
          icon: 'lucide:copyright',
          title: $t('page.vben.about'),
        },
      },
    ],
  },
];

export default routes;
```

Example 3 (swift):
```swift
import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    redirect: '/demos/access',
    children: [
      // Nested menu
      {
        meta: {
          icon: 'ic:round-menu',
          title: $t('demos.nested.title'),
        },
        name: 'NestedDemos',
        path: '/demos/nested',
        redirect: '/demos/nested/menu1',
        children: [
          {
            name: 'Menu1Demo',
            path: '/demos/nested/menu1',
            component: () => import('#/views/demos/nested/menu-1.vue'),
            meta: {
              icon: 'ic:round-menu',
              keepAlive: true,
              title: $t('demos.nested.menu1'),
            },
          },
          {
            name: 'Menu2Demo',
            path: '/demos/nested/menu2',
            meta: {
              icon: 'ic:round-menu',
              keepAlive: true,
              title: $t('demos.nested.menu2'),
            },
            redirect: '/demos/nested/menu2/menu2-1',
            children: [
              {
                name: 'Menu21Demo',
                path: '/demos/nested/menu2/menu2-1',
                component: () => import('#/views/demos/nested/menu-2-1.vue'),
                meta: {
                  icon: 'ic:round-menu',
                  keepAlive: true,
                  title: $t('demos.nested.menu2_1'),
                },
              },
            ],
          },
          {
            name: 'Menu3Demo',
            path: '/demos/nested/menu3',
            meta: {
              icon: 'ic:round-menu',
              title: $t('demos.nested.menu3'),
            },
            redirect: '/demos/nested/menu3/menu3-1',
            children: [
              {
                name: 'Menu31Demo',
                path: 'menu3-1',
                component: () => import('#/views/demos/nested/menu-3-1.vue'),
                meta: {
                  icon: 'ic:round-menu',
                  keepAlive: true,
                  title: $t('demos.nested.menu3_1'),
                },
              },
              {
                name: 'Menu32Demo',
                path: 'menu3-2',
                meta: {
                  icon: 'ic:round-menu',
                  title: $t('demos.nested.menu3_2'),
                },
                redirect: '/demos/nested/menu3/menu3-2/menu3-2-1',
                children: [
                  {
                    name: 'Menu321Demo',
                    path: '/demos/nested/menu3/menu3-2/menu3-2-1',
                    component: () =>
                      import('#/views/demos/nested/menu-3-2-1.vue'),
                    meta: {
                      icon: 'ic:round-menu',
                      keepAlive: true,
                      title: $t('demos.nested.menu3_2_1'),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default routes;
```

Example 4 (json):
```json
import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:home',
      title: $t('page.home.title'),
    },
    name: 'Home',
    path: '/home',
    redirect: '/home/index',
    children: [
      {
        name: 'HomeIndex',
        path: '/home/index',
        component: () => import('#/views/home/index.vue'),
        meta: {
          icon: 'mdi:home',
          title: $t('page.home.index'),
        },
      },
    ],
  },
];

export default routes;
```

---
