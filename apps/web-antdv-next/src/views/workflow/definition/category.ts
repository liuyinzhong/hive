import { $t } from '#/locales';

export function getWorkflowCategoryOptions() {
  return [
    {
      label: $t('flow.definition.category.general'),
      value: 'general',
      prefix: 'TY',
    },
    {
      label: $t('flow.definition.category.finance'),
      value: 'finance',
      prefix: 'CW',
    },
    {
      label: $t('flow.definition.category.hr'),
      value: 'hr',
      prefix: 'RS',
    },
    {
      label: $t('flow.definition.category.administration'),
      value: 'administration',
      prefix: 'XZ',
    },
    {
      label: $t('flow.definition.category.procurement'),
      value: 'procurement',
      prefix: 'CG',
    },
    {
      label: $t('flow.definition.category.development'),
      value: 'development',
      prefix: 'DEV',
    },
    {
      label: $t('flow.definition.category.system'),
      value: 'system',
      prefix: 'SYS',
    },
    {
      label: $t('flow.definition.category.other'),
      value: 'other',
      prefix: 'QT',
    },
  ];
}

export function getWorkflowCategoryText(category?: null | string) {
  if (!category) return '';
  return (
    getWorkflowCategoryOptions().find((item) => item.value === category)
      ?.label ?? category
  );
}
