import { requestClient } from '#/api/request';

export namespace BaseInstitutionApi {
  export type AttachmentOwnerType = 'QUALIFICATION';

  export interface Attachment {
    attachmentId: string;
    attachmentType?: null | string;
    expiryDate?: null | string;
    fileName: string;
    remark?: null | string;
    url: string;
  }

  export interface Qualification {
    attachment: Attachment | null;
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

  export interface Overview {
    diagnosisSubjects?: null | string;
    emergencyDescription?: null | string;
    introduction?: null | string;
    keySpecialties?: null | string;
    overviewId: string;
    serviceFeatures?: null | string;
    serviceHours?: null | string;
  }

  export interface Brand {
    brandId: string;
    displayName?: null | string;
    logoUrl?: null | string;
    slogan?: null | string;
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

  export interface Settlement {
    bankAccounts: BankAccount[];
    invoiceTitle?: null | string;
    settlementId: string;
    taxpayerId?: null | string;
    taxpayerType?: null | string;
  }

  export interface Institution {
    addresses: Address[];
    aliases?: null | string;
    brand: Brand | null;
    createDate?: null | string;
    englishName?: null | string;
    establishmentDate?: null | string;
    hospitalCategory: string;
    hospitalLevel: string;
    institutionId: string;
    institutionName: string;
    institutionNature: string;
    institutionType: string;
    overview: Overview | null;
    qualifications: Qualification[];
    remark?: null | string;
    settlement: Settlement | null;
    shortName?: null | string;
    unifiedCreditCode: string;
    updateDate?: null | string;
    contacts: Contact[];
  }

  export interface AttachmentInput {
    attachmentType?: null | string;
    expiryDate?: string;
    fileName: string;
    remark?: null | string;
    url: string;
  }

  export interface QualificationInput {
    attachment?: AttachmentInput | null;
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
    brand: {
      displayName?: null | string;
      logoUrl?: null | string;
      slogan?: null | string;
    };
    englishName?: null | string;
    establishmentDate?: string;
    hospitalCategory: string;
    hospitalLevel: string;
    institutionName: string;
    institutionNature: string;
    institutionType: string;
    overview: {
      diagnosisSubjects?: null | string;
      emergencyDescription?: null | string;
      introduction?: null | string;
      keySpecialties?: null | string;
      serviceFeatures?: null | string;
      serviceHours?: null | string;
    };
    qualifications: QualificationInput[];
    remark?: null | string;
    settlement: {
      bankAccounts: BankAccountInput[];
      invoiceTitle?: null | string;
      taxpayerId?: null | string;
      taxpayerType?: null | string;
    };
    shortName?: null | string;
    unifiedCreditCode: string;
    contacts: ContactInput[];
  }
}

export function getInstitutionApi() {
  return requestClient.get<BaseInstitutionApi.Institution | null>('/base/institution');
}

export function saveInstitutionApi(data: BaseInstitutionApi.SaveInstitution) {
  return requestClient.put<BaseInstitutionApi.Institution>('/base/institution', data);
}
