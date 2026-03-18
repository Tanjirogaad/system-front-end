"use client";
import { useState } from "react";
import { EmployeeType } from "./Types/employee";
import PersonalInformation from "./components/PersonalInformation";
import Address from "./components/Address";
import EducationalQualifications from "./components/EducationalQualifications";
import JobInformation from "./components/JobInformation";
import WorkSchedule from "./components/WorkSchedule";

export default function Register() {
  const [employee, setEmployee] = useState<EmployeeType>({
    PersonalInformation: {
      FullName: "",
      NationalIDNumber: "",
      DateOfBirth: "",
      Gender: "",
      Nationality: "مصري",
      Religion: "مسلم",
      MaritalStatus: "",
      PersonalPhoto: "",
    },

    Address: {
      Governorate: "",
      Area: "",
      DetailedAddress: "",
      PhoneNumbers: [""],
    },

    EducationalQualifications: {
      Qualification: "",
      Specialization: "",
      University: "",
      GraduationYear: "",
    },

    JobInformation: {
      EmployeeCode: "",
      Department: "",
      JobTitle: "",
      WorkLocation: "6 اكتوبر الحي 11",
      HiringDate: "",
      EmploymentStatus: "",
      DirectManagers: [""],
    },

    WorkSchedule: {
      StartTime: "",
      EndTime: "",
      TimeOff: [""],
      SickLeave: "",
      AnnualLeave: "",
    },

    Accounts: {
      SocialInsuranceNumber: "",
      AccountHolderName: "",
      BankName: "",
      BankAccountNumber: "",
      Documents: [],
    },

    Contacts: {
      Relationship: "",
      PersonName: "",
      PhoneNumber: "",
      Address: "",
    },
    Account: {
      email: "",
      password: "",
    },
  });

  const [step, setStep] = useState<number>(4);

  // البيانات الشخصية
  const handlePersonalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      PersonalInformation: {
        ...prev.PersonalInformation,
        [name]: value,
      },
    }));
  };

  // العنوان
  const handleAddressChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      Address: {
        ...prev.Address,
        [name]: value,
      },
    }));
  };

  // دوال أرقام الهاتف (العنوان)
  const handlePhoneChange = (index: number, value: string) => {
    setEmployee((prev) => {
      const phones = [...prev.Address.PhoneNumbers];
      phones[index] = value;
      return {
        ...prev,
        Address: {
          ...prev.Address,
          PhoneNumbers: phones,
        },
      };
    });
  };

  const addPhone = () => {
    setEmployee((prev) => ({
      ...prev,
      Address: {
        ...prev.Address,
        PhoneNumbers: [...prev.Address.PhoneNumbers, ""],
      },
    }));
  };

  const removePhone = (index: number) => {
    setEmployee((prev) => {
      const phones = prev.Address.PhoneNumbers.filter((_, i) => i !== index);
      return {
        ...prev,
        Address: {
          ...prev.Address,
          PhoneNumbers: phones,
        },
      };
    });
  };

  // المؤهلات الدراسية
  const handleEduChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      EducationalQualifications: {
        ...prev.EducationalQualifications,
        [name]: value,
      },
    }));
  };

  // معلومات الوظيفة (الحقول المفردة)
  const handleJobChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      JobInformation: {
        ...prev.JobInformation,
        [name]: value,
      },
    }));
  };

  // دوال المدراء المباشرين (مصفوفة)
  const handleManagerChange = (index: number, value: string) => {
    setEmployee((prev) => {
      const managers = [...prev.JobInformation.DirectManagers];
      managers[index] = value;
      return {
        ...prev,
        JobInformation: {
          ...prev.JobInformation,
          DirectManagers: managers,
        },
      };
    });
  };

  const addManager = () => {
    setEmployee((prev) => ({
      ...prev,
      JobInformation: {
        ...prev.JobInformation,
        DirectManagers: [...prev.JobInformation.DirectManagers, ""],
      },
    }));
  };

  const removeManager = (index: number) => {
    setEmployee((prev) => {
      const managers = prev.JobInformation.DirectManagers.filter(
        (_, i) => i !== index,
      );
      return {
        ...prev,
        JobInformation: {
          ...prev.JobInformation,
          DirectManagers: managers,
        },
      };
    });
  };
  // دوال WorkSchedule (الحقول المفردة)
  const handleWorkScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      WorkSchedule: {
        ...prev.WorkSchedule,
        [name]: value,
      },
    }));
  };

  const toggleTimeOff = (day: string) => {
    setEmployee((prev) => {
      const currentTimeOff = prev.WorkSchedule.TimeOff;
      let newTimeOff: string[];

      if (currentTimeOff.includes(day)) {
        // إذا كان اليوم موجوداً، نحذفه
        newTimeOff = currentTimeOff.filter((d) => d !== day);
      } else {
        // إذا لم يكن موجوداً، نضيفه
        newTimeOff = [...currentTimeOff, day];
      }

      return {
        ...prev,
        WorkSchedule: {
          ...prev.WorkSchedule,
          TimeOff: newTimeOff,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex justify-evenly">
        <button type="button" onClick={() => setStep(1)}>
          البيانات الشخصية
        </button>
        <button type="button" onClick={() => setStep(2)}>
          العنوان
        </button>
        <button type="button" onClick={() => setStep(3)}>
          المؤهلات
        </button>
        <button type="button" onClick={() => setStep(4)}>
          معلومات الوظيفة
        </button>
        <button type="button" onClick={() => setStep(5)}>
          مواعيد العمل
        </button>
        <button type="button" onClick={() => setStep(6)}>
          الحسابات
        </button>
      </nav>

      <form className="max-w-5xl mx-auto p-6 space-y-6">
        {step === 1 && (
          <PersonalInformation
            PersonalInformation={employee.PersonalInformation}
            handleChange={handlePersonalChange}
          />
        )}
        {step === 2 && (
          <Address
            Address={employee.Address}
            handleChange={handleAddressChange}
            handlePhoneChange={handlePhoneChange}
            addPhone={addPhone}
            removePhone={removePhone}
          />
        )}
        {step === 3 && (
          <EducationalQualifications
            EducationalQualifications={employee.EducationalQualifications}
            handleChange={handleEduChange}
          />
        )}
        {step === 4 && (
          <JobInformation
            JobInformation={employee.JobInformation}
            handleChange={handleJobChange}
            handleManagerChange={handleManagerChange}
            addManager={addManager}
            removeManager={removeManager}
          />
        )}
        {step === 5 && (
          <WorkSchedule
            WorkSchedule={employee.WorkSchedule}
            handleChange={handleWorkScheduleChange}
            toggleTimeOff={toggleTimeOff}
          />
        )}
      </form>
    </div>
  );
}
