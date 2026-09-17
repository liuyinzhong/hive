import type { RangePickerProps } from 'antdv-next';
import dayjs from 'dayjs';

import { $t } from '#/locales';

/** 常用范围预设，label 已国际化 */
export function getRangePresets(): RangePickerProps['presets'] {
  return [
    {
      label: $t('base.date.last7Days'),
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: $t('base.date.last14Days'),
      value: [dayjs().add(-14, 'd'), dayjs()],
    },
    {
      label: $t('base.date.last30Days'),
      value: [dayjs().add(-30, 'd'), dayjs()],
    },
    {
      label: $t('base.date.last60Days'),
      value: [dayjs().add(-60, 'd'), dayjs()],
    },
    {
      label: $t('base.date.last90Days'),
      value: [dayjs().add(-90, 'd'), dayjs()],
    },
    {
      label: $t('base.date.last180Days'),
      value: [dayjs().add(-180, 'd'), dayjs()],
    },
  ];
}
