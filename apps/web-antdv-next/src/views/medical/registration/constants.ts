import type { MedicalRegistrationApi } from '#/api/medical';

import { $t } from '#/locales';

export const registrationStatusValues: MedicalRegistrationApi.RegistrationStatus[] =
  [0, 10, 30, 50, 60, 70, 80, 90, 100];

export function registrationStatusLabel(
  status: MedicalRegistrationApi.RegistrationStatus,
) {
  return $t(`medical.registration.status${status}`);
}

export function registrationStatusColor(
  status: MedicalRegistrationApi.RegistrationStatus,
) {
  const colors: Record<MedicalRegistrationApi.RegistrationStatus, string> = {
    0: 'orange',
    10: 'blue',
    30: 'cyan',
    50: 'green',
    60: 'default',
    70: 'red',
    80: 'volcano',
    90: 'purple',
    100: 'green',
  };
  return colors[status];
}

export function registrationMethodLabel(
  method: MedicalRegistrationApi.RegistrationMethod,
) {
  return $t(`medical.registration.method${method}`);
}
