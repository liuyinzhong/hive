import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  theme: {
    mode: 'auto',
  },
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // 检查更新的时间间隔，单位为分钟
    checkUpdatesInterval: 60,
    // 是否开启检查更新
    enableCheckUpdates: true,

    /* 权限文档： https://doc.vben.pro/guide/in-depth/access.html#%E5%89%8D%E7%AB%AF%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6 */
    // accessMode: 'frontend', // 默认值
    accessMode: 'mixed',
    // accessMode: 'mixed',
    defaultHomePath: '/dashboard',
  },
  widget: {
    languageToggle: true,
    timezone: true,
  },
});
