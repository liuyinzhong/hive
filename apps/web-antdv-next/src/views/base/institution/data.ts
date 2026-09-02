import type { VbenFormSchema } from '#/adapter/form';

import { $t } from '#/locales';

export interface InstitutionUploadFile {
  name?: string;
  response?: { originalName?: string; url?: string };
  status?: string;
  uid?: string;
  url?: string;
}

export interface InstitutionQualificationFormItem {
  attachment: InstitutionUploadFile[];
  certificateName: string;
  certificateNo: string;
  expiryDate?: string;
  issuingAuthority: string;
  issueDate?: string;
  remark: string;
  scope: string;
}

export interface InstitutionContactFormItem {
  contactName: string;
  contactType: string;
  email: string;
  isPrimary: boolean;
  jobTitle: string;
  phone: string;
  remark: string;
}

export interface InstitutionAddressFormItem {
  addressType: string;
  fullAddress: string;
  isPrimary: boolean;
  phone: string;
  postalCode: string;
  remark: string;
}

export interface InstitutionBankAccountFormItem {
  accountName: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  isDefault: boolean;
  remark: string;
}

export interface InstitutionFormValues extends Record<string, unknown> {
  addresses: InstitutionAddressFormItem[];
  aliases: string;
  brand: {
    displayName: string;
    logoUrl: InstitutionUploadFile[];
    slogan: string;
  };
  contacts: InstitutionContactFormItem[];
  englishName: string;
  establishmentDate?: string;
  hospitalCategory: string;
  hospitalLevel: string;
  institutionName: string;
  institutionNature: string;
  institutionType: string;
  overview: {
    diagnosisSubjects: string;
    emergencyDescription: string;
    introduction: string;
    keySpecialties: string;
    serviceFeatures: string;
    serviceHours: string;
  };
  qualifications: InstitutionQualificationFormItem[];
  remark: string;
  settlement: {
    bankAccounts: InstitutionBankAccountFormItem[];
    invoiceTitle: string;
    taxpayerId: string;
    taxpayerType: string;
  };
  shortName: string;
  unifiedCreditCode: string;
}

const contactTypeOptions = () =>
  [
    ['LEGAL_REPRESENTATIVE', 'contactLegalRepresentative'],
    ['PRINCIPAL', 'contactPrincipal'],
    ['MEDICAL_QUALITY', 'contactMedicalQuality'],
    ['INFORMATION', 'contactInformation'],
    ['FINANCE', 'contactFinance'],
    ['GENERAL', 'contactGeneral'],
  ].map(([value, label]) => ({
    label: $t(`base.institution.${label}`),
    value,
  }));

const addressTypeOptions = () =>
  [
    ['REGISTERED', 'addressRegistered'],
    ['PRACTICE', 'addressPractice'],
    ['MAILING', 'addressMailing'],
  ].map(([value, label]) => ({
    label: $t(`base.institution.${label}`),
    value,
  }));

export function useInstitutionFormSchema(): VbenFormSchema<InstitutionFormValues>[] {
  return [
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg,.svg',
        listType: 'picture-card',
        maxCount: 1,
        maxSize: 5,
      },
      fieldName: 'brand.logoUrl',
      label: $t('base.institution.logo'),
      renderComponentContent: () => ({
        default: () => $t('base.institution.uploadLogo'),
      }),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'brand.displayName',
      label: $t('base.institution.displayName'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 256 },
      fieldName: 'brand.slogan',
      label: $t('base.institution.slogan'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'institutionName',
      label: $t('base.institution.institutionName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'shortName',
      label: $t('base.institution.shortName'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'englishName',
      label: $t('base.institution.englishName'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 256 },
      fieldName: 'aliases',
      label: $t('base.institution.aliases'),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('base.institution.typeHospital'), value: 'HOSPITAL' },
        ],
      },
      defaultValue: 'HOSPITAL',
      fieldName: 'institutionType',
      label: $t('base.institution.institutionType'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('base.institution.naturePublic'), value: 'PUBLIC' },
          { label: $t('base.institution.naturePrivate'), value: 'PRIVATE' },
          {
            label: $t('base.institution.natureNonProfit'),
            value: 'NON_PROFIT',
          },
          {
            label: $t('base.institution.natureForProfit'),
            value: 'FOR_PROFIT',
          },
        ],
      },
      fieldName: 'institutionNature',
      label: $t('base.institution.institutionNature'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('base.institution.categoryGeneral'), value: 'GENERAL' },
          {
            label: $t('base.institution.categorySpecialty'),
            value: 'SPECIALTY',
          },
          {
            label: $t('base.institution.categoryTraditional'),
            value: 'TRADITIONAL',
          },
          {
            label: $t('base.institution.categoryMaternalChild'),
            value: 'MATERNAL_CHILD',
          },
          {
            label: $t('base.institution.categoryIntegrated'),
            value: 'INTEGRATED',
          },
          {
            label: $t('base.institution.categoryRehabilitation'),
            value: 'REHABILITATION',
          },
          { label: $t('base.institution.categoryOther'), value: 'OTHER' },
        ],
      },
      fieldName: 'hospitalCategory',
      label: $t('base.institution.hospitalCategory'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('base.institution.levelTertiaryA'), value: 'TERTIARY_A' },
          { label: $t('base.institution.levelTertiaryB'), value: 'TERTIARY_B' },
          { label: $t('base.institution.levelTertiaryC'), value: 'TERTIARY_C' },
          {
            label: $t('base.institution.levelSecondaryA'),
            value: 'SECONDARY_A',
          },
          {
            label: $t('base.institution.levelSecondaryB'),
            value: 'SECONDARY_B',
          },
          {
            label: $t('base.institution.levelSecondaryC'),
            value: 'SECONDARY_C',
          },
          { label: $t('base.institution.levelPrimary'), value: 'PRIMARY' },
          { label: $t('base.institution.levelUnrated'), value: 'UNRATED' },
        ],
      },
      fieldName: 'hospitalLevel',
      label: $t('base.institution.hospitalLevel'),
      rules: 'selectRequired',
    },

    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'establishmentDate',
      label: $t('base.institution.establishmentDate'),
    },
    {
      component: 'Input',
      fieldName: 'overview.serviceHours',
      label: $t('base.institution.serviceHours'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      label: $t('base.institution.remark'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 5000, rows: 3, showCount: true },
      fieldName: 'overview.introduction',
      label: $t('base.institution.introduction'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 5000, rows: 3, showCount: true },
      fieldName: 'overview.diagnosisSubjects',
      label: $t('base.institution.diagnosisSubjects'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 5000, rows: 3, showCount: true },
      fieldName: 'overview.keySpecialties',
      label: $t('base.institution.keySpecialties'),
    },

    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 3, showCount: true },
      fieldName: 'overview.emergencyDescription',
      label: $t('base.institution.emergencyDescription'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 5000, rows: 3, showCount: true },
      fieldName: 'overview.serviceFeatures',
      label: $t('base.institution.serviceFeatures'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'unifiedCreditCode',
      label: $t('base.institution.unifiedCreditCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'settlement.invoiceTitle',
      label: $t('base.institution.invoiceTitle'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'settlement.taxpayerId',
      label: $t('base.institution.taxpayerId'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'settlement.taxpayerType',
      label: $t('base.institution.taxpayerType'),
    },
    {
      arrayProps: {
        actionText: $t('base.institution.action'),
        addButtonText: $t('base.institution.addBankAccount'),
        createRow: () => ({
          accountName: '',
          accountNumber: '',
          accountType: '',
          bankName: '',
          isDefault: false,
          remark: '',
        }),
        max: 10,
      },
      children: [
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'accountName',
          label: $t('base.institution.accountName'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'bankName',
          label: $t('base.institution.bankName'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 64 },
          fieldName: 'accountNumber',
          label: $t('base.institution.accountNumber'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 32 },
          fieldName: 'accountType',
          label: $t('base.institution.accountType'),
        },
        {
          component: 'Switch',
          componentProps: { class: 'w-auto' },
          fieldName: 'isDefault',
          label: $t('base.institution.isDefault'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('base.institution.remark'),
        },
      ],
      fieldName: 'settlement.bankAccounts',
      formItemClass: 'col-span-1 md:col-span-4',
      label: $t('base.institution.bankAccounts'),
      type: 'array',
    },
    {
      arrayProps: {
        actionText: $t('base.institution.action'),
        addButtonText: $t('base.institution.addQualification'),
        createRow: () => ({
          attachment: [],
          certificateName: '',
          certificateNo: '',
          expiryDate: undefined,
          issuingAuthority: '',
          issueDate: undefined,
          remark: '',
          scope: '',
        }),
        max: 30,
      },
      children: [
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'certificateName',
          label: $t('base.institution.certificateName'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'certificateNo',
          label: $t('base.institution.certificateNo'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'issuingAuthority',
          label: $t('base.institution.issuingAuthority'),
        },
        {
          component: 'DatePicker',
          componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
          fieldName: 'issueDate',
          label: $t('base.institution.issueDate'),
        },
        {
          component: 'DatePicker',
          componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
          fieldName: 'expiryDate',
          label: $t('base.institution.expiryDate'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'scope',
          label: $t('base.institution.scope'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('base.institution.remark'),
        },
        {
          component: 'Upload',
          componentProps: {
            accept: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
            maxCount: 1,
            maxSize: 20,
            listType: 'picture',
          },
          fieldName: 'attachment',
          label: $t('base.institution.attachment'),
          renderComponentContent: () => ({
            default: () => $t('base.institution.uploadFile'),
          }),
        },
      ],
      fieldName: 'qualifications',
      formItemClass: 'col-span-1 md:col-span-4',
      label: $t('base.institution.qualifications'),
      type: 'array',
    },
    {
      arrayProps: {
        actionText: $t('base.institution.action'),
        addButtonText: $t('base.institution.addContact'),
        createRow: () => ({
          contactName: '',
          contactType: undefined,
          email: '',
          isPrimary: false,
          jobTitle: '',
          phone: '',
          remark: '',
        }),
        max: 30,
      },
      children: [
        {
          component: 'Select',
          componentProps: { options: contactTypeOptions() },
          fieldName: 'contactType',
          label: $t('base.institution.contactType'),
          rules: 'selectRequired',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 64 },
          fieldName: 'contactName',
          label: $t('base.institution.contactName'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 64 },
          fieldName: 'jobTitle',
          label: $t('base.institution.jobTitle'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 32 },
          fieldName: 'phone',
          label: $t('base.institution.phone'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 128 },
          fieldName: 'email',
          label: $t('base.institution.email'),
        },
        {
          component: 'Switch',
          componentProps: { class: 'w-auto' },
          fieldName: 'isPrimary',
          label: $t('base.institution.isPrimary'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('base.institution.remark'),
        },
      ],
      fieldName: 'contacts',
      formItemClass: 'col-span-1 md:col-span-4',
      label: $t('base.institution.contacts'),
      type: 'array',
    },
    {
      arrayProps: {
        actionText: $t('base.institution.action'),
        addButtonText: $t('base.institution.addAddress'),
        createRow: () => ({
          addressType: undefined,
          fullAddress: '',
          isPrimary: false,
          phone: '',
          postalCode: '',
          remark: '',
        }),
        max: 10,
      },
      children: [
        {
          component: 'Select',
          componentProps: { options: addressTypeOptions() },
          fieldName: 'addressType',
          label: $t('base.institution.addressType'),
          rules: 'selectRequired',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'fullAddress',
          label: $t('base.institution.fullAddress'),
          rules: 'required',
        },
        {
          component: 'Input',
          componentProps: { maxlength: 16 },
          fieldName: 'postalCode',
          label: $t('base.institution.postalCode'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 32 },
          fieldName: 'phone',
          label: $t('base.institution.phone'),
        },
        {
          component: 'Switch',
          componentProps: { class: 'w-auto' },
          fieldName: 'isPrimary',
          label: $t('base.institution.isPrimary'),
        },
        {
          component: 'Input',
          componentProps: { maxlength: 512 },
          fieldName: 'remark',
          label: $t('base.institution.remark'),
        },
      ],
      fieldName: 'addresses',
      formItemClass: 'col-span-1 md:col-span-4',
      label: $t('base.institution.addresses'),
      type: 'array',
    },
  ];
}
