import { requestClient } from '#/api/request';

export namespace BaseInstitutionApi {
  export interface Qualification {
    attachment?: null | string;
    certificateName: string;
    certificateNo: string;
    expiryDate?: null | string;
    issuingAuthority?: null | string;
    issueDate?: null | string;
    qualificationId: string;
    remark?: null | string;
    scope?: null | string;
  }

  export interface Contact {
    contactId: string;
    contactName: string;
    contactType: string;
    email?: null | string;
    isPrimary: boolean;
    jobTitle?: null | string;
    phone?: null | string;
    remark?: null | string;
  }

  export interface Address {
    addressId: string;
    addressType: string;
    fullAddress: string;
    isPrimary: boolean;
    phone?: null | string;
    postalCode?: null | string;
    remark?: null | string;
  }

  export interface BankAccount {
    accountName: string;
    accountNumber: string;
    accountType?: null | string;
    bankAccountId: string;
    bankName: string;
    isDefault: boolean;
    remark?: null | string;
  }

  export interface Institution {
    addresses: Address[];
    aliases?: null | string;
    bankAccounts: BankAccount[];
    contacts: Contact[];
    createDate?: null | string;
    diagnosisSubjects?: null | string;
    displayName?: null | string;
    emergencyDescription?: null | string;
    englishName?: null | string;
    establishmentDate?: null | string;
    hospitalCategory: string;
    hospitalLevel: string;
    institutionId: string;
    institutionName: string;
    institutionNature: string;
    institutionType: string;
    introduction?: null | string;
    invoiceTitle?: null | string;
    keySpecialties?: null | string;
    logoUrl?: null | string;
    qualifications: Qualification[];
    remark?: null | string;
    serviceFeatures?: null | string;
    serviceHours?: null | string;
    shortName?: null | string;
    slogan?: null | string;
    taxpayerId?: null | string;
    taxpayerType?: null | string;
    unifiedCreditCode: string;
    updateDate?: null | string;
  }

  export interface QualificationInput {
    attachment?: null | string;
    certificateName: string;
    certificateNo: string;
    expiryDate?: string;
    issuingAuthority?: null | string;
    issueDate?: string;
    remark?: null | string;
    scope?: null | string;
  }

  export interface ContactInput {
    contactName: string;
    contactType: string;
    email?: null | string;
    isPrimary: boolean;
    jobTitle?: null | string;
    phone?: null | string;
    remark?: null | string;
  }

  export interface AddressInput {
    addressType: string;
    fullAddress: string;
    isPrimary: boolean;
    phone?: null | string;
    postalCode?: null | string;
    remark?: null | string;
  }

  export interface BankAccountInput {
    accountName: string;
    accountNumber: string;
    accountType?: null | string;
    bankName: string;
    isDefault: boolean;
    remark?: null | string;
  }

  export interface SaveInstitution {
    addresses: AddressInput[];
    aliases?: null | string;
    bankAccounts: BankAccountInput[];
    contacts: ContactInput[];
    diagnosisSubjects?: null | string;
    displayName?: null | string;
    emergencyDescription?: null | string;
    englishName?: null | string;
    establishmentDate?: string;
    hospitalCategory: string;
    hospitalLevel: string;
    institutionName: string;
    institutionNature: string;
    institutionType: string;
    introduction?: null | string;
    invoiceTitle?: null | string;
    keySpecialties?: null | string;
    logoUrl?: null | string;
    qualifications: QualificationInput[];
    remark?: null | string;
    serviceFeatures?: null | string;
    serviceHours?: null | string;
    shortName?: null | string;
    slogan?: null | string;
    taxpayerId?: null | string;
    taxpayerType?: null | string;
    unifiedCreditCode: string;
  }
}

export function getInstitutionApi() {
  return requestClient.get<BaseInstitutionApi.Institution | null>(
    '/base/institution',
  );
}

export function saveInstitutionApi(data: BaseInstitutionApi.SaveInstitution) {
  return requestClient.put<BaseInstitutionApi.Institution>(
    '/base/institution',
    data,
  );
}
