import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalOutpatientApi } from '#/api/medical';

import { $t } from '#/locales';

export function usePrescriptionReviewSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'prescriptionNo',
      label: $t('medical.prescriptionReview.prescriptionNo'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'patientKeyword',
      label: $t('medical.prescriptionReview.patientKeyword'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [10, 20, 30].map((value) => ({
          label: $t(`medical.workbench.prescriptionStatus${value}`),
          value,
        })),
      },
      fieldName: 'status',
      label: $t('medical.prescriptionReview.status'),
    },
  ];
}

export function usePrescriptionReviewColumns(): VxeTableGridOptions<MedicalOutpatientApi.Prescription>['columns'] {
  return [
    {
      field: 'prescriptionNo',
      fixed: 'left',
      minWidth: 150,
      sortable: true,
      title: $t('medical.prescriptionReview.prescriptionNo'),
    },
    {
      field: 'patientNo',
      minWidth: 130,
      title: $t('medical.prescriptionReview.patientNo'),
    },
    {
      field: 'patientName',
      minWidth: 110,
      sortable: true,
      title: $t('medical.prescriptionReview.patientName'),
    },
    {
      field: 'doctorName',
      minWidth: 110,
      sortable: true,
      title: $t('medical.prescriptionReview.doctorName'),
    },
    {
      field: 'departmentName',
      minWidth: 120,
      title: $t('medical.prescriptionReview.departmentName'),
    },
    {
      field: 'currentVersion',
      formatter: ({ row }) => `v${row.currentVersion}`,
      title: $t('medical.prescriptionReview.version'),
      width: 90,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      sortable: true,
      title: $t('medical.prescriptionReview.status'),
      width: 110,
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('medical.prescriptionReview.submitTime'),
      width: 170,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('medical.common.operation'),
      width: 100,
    },
  ];
}
