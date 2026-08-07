<script lang="ts" setup>
import type { BaseInstitutionApi } from '#/api/base';
import { useInstitutionFormSchema } from './data';
import type { InstitutionFormValues, InstitutionUploadFile } from './data';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { useAccess } from '@vben/access';

import { Button, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { getInstitutionApi, saveInstitutionApi } from '#/api/base';
import { $t } from '#/locales';
import { filesToUrlString, urlStringToFiles } from '#/utils';

const { hasAccessByCodes } = useAccess();
const loading = ref(false);
const saving = ref(false);

const [Form, formApi] = useVbenForm<InstitutionFormValues>({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useInstitutionFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-4',
});

function defaultFormValues(): InstitutionFormValues {
  return {
    addresses: [],
    aliases: '',
    brand: { displayName: '', logoUrl: [], slogan: '' },
    contacts: [],
    englishName: '',
    establishmentDate: undefined,
    hospitalCategory: 'GENERAL',
    hospitalLevel: 'UNRATED',
    institutionName: '',
    institutionNature: 'PUBLIC',
    institutionType: 'HOSPITAL',
    overview: {
      diagnosisSubjects: '',
      emergencyDescription: '',
      introduction: '',
      keySpecialties: '',
      serviceFeatures: '',
      serviceHours: '',
    },
    qualifications: [],
    remark: '',
    settlement: {
      bankAccounts: [],
      invoiceTitle: '',
      taxpayerId: '',
      taxpayerType: '',
    },
    shortName: '',
    unifiedCreditCode: '',
  };
}

function logoToForm(url?: null | string): InstitutionUploadFile[] {
  return url ? urlStringToFiles(url) : [];
}

function normalizeDetail(
  detail: BaseInstitutionApi.Institution | null,
): InstitutionFormValues {
  const defaults = defaultFormValues();
  if (!detail) return defaults;

  return {
    ...defaults,
    addresses: (detail.addresses ?? []).map((item) => ({
      addressType: item.addressType,
      fullAddress: item.fullAddress,
      isPrimary: item.isPrimary,
      phone: item.phone ?? '',
      postalCode: item.postalCode ?? '',
      remark: item.remark ?? '',
    })),
    aliases: detail.aliases ?? '',
    brand: {
      displayName: detail.displayName ?? '',
      logoUrl: logoToForm(detail.logoUrl),
      slogan: detail.slogan ?? '',
    },
    contacts: (detail.contacts ?? []).map((item) => ({
      contactName: item.contactName,
      contactType: item.contactType,
      email: item.email ?? '',
      isPrimary: item.isPrimary,
      jobTitle: item.jobTitle ?? '',
      phone: item.phone ?? '',
      remark: item.remark ?? '',
    })),
    englishName: detail.englishName ?? '',
    establishmentDate: detail.establishmentDate ?? undefined,
    hospitalCategory: detail.hospitalCategory,
    hospitalLevel: detail.hospitalLevel,
    institutionName: detail.institutionName,
    institutionNature: detail.institutionNature,
    institutionType: detail.institutionType,
    overview: {
      diagnosisSubjects: detail.diagnosisSubjects ?? '',
      emergencyDescription: detail.emergencyDescription ?? '',
      introduction: detail.introduction ?? '',
      keySpecialties: detail.keySpecialties ?? '',
      serviceFeatures: detail.serviceFeatures ?? '',
      serviceHours: detail.serviceHours ?? '',
    },
    qualifications: (detail.qualifications ?? []).map((item) => ({
      attachment: item.attachment ? urlStringToFiles(item.attachment) : [],
      certificateName: item.certificateName,
      certificateNo: item.certificateNo,
      expiryDate: item.expiryDate ?? undefined,
      issuingAuthority: item.issuingAuthority ?? '',
      issueDate: item.issueDate ?? undefined,
      remark: item.remark ?? '',
      scope: item.scope ?? '',
    })),
    remark: detail.remark ?? '',
    settlement: {
      bankAccounts: (detail.bankAccounts ?? []).map((item) => ({
        accountName: item.accountName,
        accountNumber: item.accountNumber,
        accountType: item.accountType ?? '',
        bankName: item.bankName,
        isDefault: item.isDefault,
        remark: item.remark ?? '',
      })),
      invoiceTitle: detail.invoiceTitle ?? '',
      taxpayerId: detail.taxpayerId ?? '',
      taxpayerType: detail.taxpayerType ?? '',
    },
    shortName: detail.shortName ?? '',
    unifiedCreditCode: detail.unifiedCreditCode,
  };
}

function toPayload(
  values: InstitutionFormValues,
): BaseInstitutionApi.SaveInstitution {
  return {
    addresses: values.addresses,
    aliases: values.aliases || undefined,
    bankAccounts: values.settlement.bankAccounts,
    contacts: values.contacts,
    diagnosisSubjects: values.overview.diagnosisSubjects || undefined,
    displayName: values.brand.displayName || undefined,
    emergencyDescription: values.overview.emergencyDescription || undefined,
    englishName: values.englishName || undefined,
    establishmentDate: values.establishmentDate || undefined,
    hospitalCategory: values.hospitalCategory,
    hospitalLevel: values.hospitalLevel,
    institutionName: values.institutionName,
    institutionNature: values.institutionNature,
    institutionType: values.institutionType,
    introduction: values.overview.introduction || undefined,
    invoiceTitle: values.settlement.invoiceTitle || undefined,
    keySpecialties: values.overview.keySpecialties || undefined,
    logoUrl: filesToUrlString(values.brand.logoUrl) || undefined,
    qualifications: values.qualifications.map((item) => ({
      attachment: filesToUrlString(item.attachment) || undefined,
      certificateName: item.certificateName,
      certificateNo: item.certificateNo,
      expiryDate: item.expiryDate || undefined,
      issuingAuthority: item.issuingAuthority || undefined,
      issueDate: item.issueDate || undefined,
      remark: item.remark || undefined,
      scope: item.scope || undefined,
    })),
    remark: values.remark || undefined,
    serviceFeatures: values.overview.serviceFeatures || undefined,
    serviceHours: values.overview.serviceHours || undefined,
    shortName: values.shortName || undefined,
    slogan: values.brand.slogan || undefined,
    taxpayerId: values.settlement.taxpayerId || undefined,
    taxpayerType: values.settlement.taxpayerType || undefined,
    unifiedCreditCode: values.unifiedCreditCode,
  };
}

async function loadInstitution() {
  loading.value = true;
  try {
    const detail = await getInstitutionApi();
    await formApi.setValues(normalizeDetail(detail));
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const values = (await formApi.getValues()) as InstitutionFormValues;
    await saveInstitutionApi(toPayload(values));
    message.success($t('base.institution.saveSuccess'));
    await loadInstitution();
  } finally {
    saving.value = false;
  }
}

onMounted(loadInstitution);
</script>

<template>
  <Page auto-content-height :title="$t('base.institution.title')">
    <template #extra>
      <Space>
        <Button
          v-if="hasAccessByCodes(['base:institution:update'])"
          :loading="loading || saving"
          type="primary"
          @click="handleSave"
        >
          {{ $t('base.institution.save') }}
        </Button>
      </Space>
    </template>
    <div class="bg-card mx-auto h-full overflow-auto rounded-md p-2">
      <Form />
    </div>
  </Page>
</template>
