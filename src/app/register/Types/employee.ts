export type PersonalInformationType = {
  FullName: string;
  NationalIDNumber: string;
  DateOfBirth: string;
  Gender: "" | "ذكر" | "أنثى";
  Nationality: string;
  Religion: string;
  MaritalStatus: "" | "أرمل" | "مطلق" | "متزوج" | "أعزب";
  PersonalPhoto?: string;
};

export type AddressType = {
  Governorate: string;
  Area: string;
  DetailedAddress: string;
  PhoneNumbers: string[];
};

export type EducationalQualificationsType = {
  Qualification: string;
  Specialization?: string;
  University?: string;
  GraduationYear?: string;
};

export type JobInformationType = {
  EmployeeCode: string;
  Department:
    | ""
    | "الحسابات"
    | "التشغيل"
    | "التسويق"
    | "الدعم الفني"
    | "الاستقبال"
    | "الادارة العليا"
    | "نظم المعلومات";
  JobTitle: string;
  WorkLocation: string;
  HiringDate: string;
  EmploymentStatus: string;
  DirectManagers: string[];
};

export type WorkScheduleType = {
  StartTime: string;
  EndTime: string;
  TimeOff: string[];
  SickLeave: string;
  AnnualLeave: string;
};

export type AccountsType = {
  SocialInsuranceNumber: string;
  AccountHolderName?: string;
  BankName?: string;
  BankAccountNumber?: string;
  Documents: string[];
};

type ContactsType = {
  Relationship?: string;
  PersonName?: string;
  PhoneNumber?: string;
  Address?: string;
};

type AccountType = {
  email: string;
  password: string;
};

export type EmployeeType = {
  PersonalInformation: PersonalInformationType;
  Address: AddressType;
  EducationalQualifications: EducationalQualificationsType;
  JobInformation: JobInformationType;
  WorkSchedule: WorkScheduleType;
  Accounts: AccountsType;
  Contacts: ContactsType;
  Account: AccountType;
};
