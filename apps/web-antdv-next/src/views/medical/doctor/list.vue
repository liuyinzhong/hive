<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDepartmentApi, MedicalDoctorApi } from '#/api/medical';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, Tree, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteDoctorsApi,
  getAllMedicalDepartmentsApi,
  getDoctorListApi,
} from '#/api/medical';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useDoctorColumns, useDoctorSearchSchema } from './data';
import DetailDrawerComponent from './detail-drawer.vue';
import FormDrawerComponent from './form-drawer.vue';

interface DepartmentSelectEvent {
  value?: { departmentId?: string };
}

const { hasAccessByCodes } = useAccess();
const departments = ref<MedicalDepartmentApi.Department[]>([]);
const selectedDepartmentId = ref<string>();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDoctorSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useDoctorColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getDoctorListApi({
            ...formValues,
            departmentId: selectedDepartmentId.value,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          }),
      },
    },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalDoctorApi.Doctor>,
});

onMounted(async () => {
  departments.value = await getAllMedicalDepartmentsApi();
});

function selectDepartment(event: DepartmentSelectEvent) {
  selectedDepartmentId.value = event.value?.departmentId;
  gridApi.query();
}

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openEdit(row: MedicalDoctorApi.Doctor) {
  formDrawerApi.setData({ doctorId: row.doctorId }).open();
}

function openDetail(row: MedicalDoctorApi.Doctor) {
  detailDrawerApi.setData({ doctorId: row.doctorId }).open();
}

async function removeDoctor(row: MedicalDoctorApi.Doctor) {
  await deleteDoctorsApi([row.doctorId]);
  message.success($t('medical.common.deleteSuccess'));
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <DetailDrawer />
    <div class="flex size-full">
      <Card class="w-1/6 min-w-48">
        <Tree
          :default-expanded-level="2"
          label-field="departmentName"
          :tree-data="departments"
          value-field="departmentId"
          selectAllLabel="展开/收起"
          @select="selectDepartment"
        />
      </Card>

      <div class="ml-4 w-5/6">
        <Grid :table-title="$t('medical.doctor.list')">
          <template #toolbar-tools>
            <Button
              v-if="hasAccessByCodes(['medical:doctor:create'])"
              type="primary"
              @click="openCreate"
            >
              <Plus class="size-5" />
              {{ $t('medical.doctor.create') }}
            </Button>
          </template>
          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  auth: 'medical:doctor:detail',
                  icon: 'lucide:eye',
                  text: $t('common.detail'),
                  onClick: () => openDetail(row),
                },
                {
                  auth: 'medical:doctor:update',
                  icon: 'lucide:edit',
                  text: $t('common.edit'),
                  onClick: () => openEdit(row),
                },
              ]"
              :dropdown-actions="[
                {
                  auth: 'medical:doctor:delete',
                  danger: true,
                  icon: 'lucide:trash-2',
                  text: $t('common.delete'),
                  popConfirm: {
                    title: $t('medical.common.deleteConfirm', [row.name]),
                    confirm: () => removeDoctor(row),
                  },
                },
              ]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
