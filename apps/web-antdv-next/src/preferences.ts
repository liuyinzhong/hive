import {
  appCopyrightPreferences,
  defineOverridesPreferences,
  definePreferencesExtension,
} from '@vben/preferences';
import { $t } from '#/locales';

interface WebAntdPreferencesExtension {
  /** 是否启用新消息提醒音 */
  enableNewUnreadSummary: boolean;
}

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
    enableRefreshToken: false /* 是否开启刷新accessToken功能 */,
    name: import.meta.env.VITE_APP_TITLE,
    // 检查更新的时间间隔，单位为分钟
    checkUpdatesInterval: 60,
    // 是否开启检查更新
    enableCheckUpdates: true,

    /* 权限文档： https://doc.vben.pro/guide/in-depth/access.html#%E5%89%8D%E7%AB%AF%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6 */
    // accessMode: "frontend", // 默认值 前端控制
    // accessMode: "backend", //后端控制
    accessMode: 'mixed', //混合模式
  },
  copyright: appCopyrightPreferences,
  widget: {
    languageToggle: true,
    timezone: true,
  },
});

export const preferencesExtension =
  definePreferencesExtension<WebAntdPreferencesExtension>({
    tabLabel: $t('preferences.message.tabLabel'),
    title: $t('preferences.message.title'),
    fields: [
      {
        component: 'switch',
        defaultValue: true,
        key: 'enableNewUnreadSummary',
        label: $t('preferences.message.fields.enableNewUnreadSummary.label'),
        tip: $t('preferences.message.fields.enableNewUnreadSummary.tip'),
      },
    ],
  });
