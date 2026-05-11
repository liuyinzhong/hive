import { oxlintConfig } from '@vben/oxlint-config';

import { defineConfig } from 'oxlint';

export default defineConfig({
  ...oxlintConfig,
  rules: {
    ...oxlintConfig.rules,
    'no-console': 'off',
    'no-debugger': 'off',
  },
});
