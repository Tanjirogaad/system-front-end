"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import {
  DEPARTMENTS,
  EMPLOYEE_STATUS,
  QUALIFICATION,
  MARITAL_STATUS,
  BANKS,
  AREAS_BY_GOVERNORATE,
  GOVERNORATES,
} from "@/data";
import {
  FaUser,
  FaIdCard,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaGraduationCap,
  FaCalendarAlt,
  FaEnvelope,
  FaMoneyBillWave,
  FaHeartbeat,
  FaUmbrellaBeach,
  FaUserTie,
  FaBuilding,
  FaArrowLeft,
  FaVenusMars,
  FaGlobe,
  FaStarAndCrescent,
  FaRing,
  FaUniversity,
  FaPercentage,
  FaFileInvoice,
  FaPhoneAlt,
  FaAddressBook,
  FaRegClock,
  FaShieldAlt,
  FaSave,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaEye,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

// تعريف واجهة الموظف
interface Employee {
  _id?: string;
  PersonalInformation?: {
    FullName?: string;
    NationalIDNumber?: string;
    DateOfBirth?: string;
    Gender?: string;
    Nationality?: string;
    Religion?: string;
    MaritalStatus?: string;
    PersonalPhoto?: string;
  };
  Address?: {
    Governorate?: string;
    Area?: string;
    DetailedAddress?: string;
    PhoneNumbers?: string[];
  };
  EducationalQualifications?: {
    Qualification?: string;
    Specialization?: string;
    University?: string;
    GraduationYear?: string;
  };
  JobInformation?: {
    EmployeeCode?: string;
    Department?: string;
    JobTitle?: string;
    WorkLocation?: string;
    HiringDate?: string;
    EmploymentStatus?: string;
    DirectManagers?: string[];
    role?: string;
    isInsured?: boolean;
  };
  WorkSchedule?: {
    StartTime?: string;
    EndTime?: string;
    TimeOff?: string[];
    SickLeave?: string;
    AnnualLeave?: string;
  };
  Accounts?: {
    SocialInsuranceNumber?: string;
    AccountHolderName?: string;
    BankName?: string;
    BankAccountNumber?: string;
    Salary?: string;
    Documents?: string[];
  };
  Contacts?: {
    Relationship?: string;
    PersonName?: string;
    PhoneNumber?: string;
    Address?: string;
  };
  Account?: {
    email?: string;
    password?: string;
  };
}

// أنواع مساعدة للحقول
type PersonalFields = keyof NonNullable<Employee["PersonalInformation"]>;
type JobFields = keyof NonNullable<Employee["JobInformation"]>;
type AddressFields = keyof NonNullable<Employee["Address"]>;
type EducationFields = keyof NonNullable<Employee["EducationalQualifications"]>;
type WorkScheduleFields = keyof NonNullable<Employee["WorkSchedule"]>;
type AccountsFields = keyof NonNullable<Employee["Accounts"]>;
type ContactsFields = keyof NonNullable<Employee["Contacts"]>;
type AccountFields = keyof NonNullable<Employee["Account"]>;

// مكون البطاقة الأساسي
const InfoCard = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
  >
    <div className="px-6 py-4 bg-linear-to-l from-blue-50 to-indigo-50 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        {title}
      </h3>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

// مكون حقل الإدخال (نص)
const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  icon: Icon,
  required = false,
}: {
  label: string;
  value?: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon: IconType;
  required?: boolean;
}) => (
  <div className="flex items-start gap-3 group">
    <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

// مكون حقل Select
const SelectField = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  icon: IconType;
}) => (
  <div className="flex items-start gap-3 group">
    <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">اختر</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// مكون حقل Checkbox
const CheckboxField = ({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  icon: IconType;
}) => (
  <div className="flex items-start gap-3 group">
    <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <span className="mr-2 text-gray-700">نعم</span>
      </label>
    </div>
  </div>
);

// مكون حقل النص الطويل
const TextareaField = ({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  icon: IconType;
}) => (
  <div className="flex items-start gap-3 group">
    <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

// مكون حقل القائمة (مثل أرقام الهاتف)
const ArrayField = ({
  label,
  items,
  onChange,
  icon: Icon,
}: {
  label: string;
  items?: string[];
  onChange: (items: string[]) => void;
  icon: IconType;
}) => {
  const [newItem, setNewItem] = useState("");
  const addItem = () => {
    if (newItem.trim()) {
      onChange([...(items || []), newItem.trim()]);
      setNewItem("");
    }
  };
  const removeItem = (index: number) => {
    const newItems = [...(items || [])];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="flex items-start gap-3 group">
      <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {items?.map((item, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="أضف قيمة جديدة"
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
};

type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;

// مكون عرض معاينة الملف (للصور وغيرها)
const FilePreview = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileType = file.type;
  const isImage = fileType.startsWith("image/");

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  const getFileIcon = () => {
    if (fileType === "application/pdf")
      return <FaFilePdf className="text-red-500" size={20} />;
    if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return <FaFileWord className="text-blue-500" size={20} />;
    if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return <FaFileExcel className="text-green-500" size={20} />;
    return <FaFileAlt className="text-gray-500" size={20} />;
  };

  const handleView = () => {
    if (isImage && previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        {isImage && previewUrl ? (
          <Image
            src={previewUrl}
            alt="preview"
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded"
            unoptimized
          />
        ) : (
          getFileIcon()
        )}
        <span className="text-sm text-gray-700 truncate max-w-[200px]">
          {file.name}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleView}
          className="text-blue-500 hover:text-blue-700"
          title="عرض"
        >
          <FaEye size={16} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
          title="حذف"
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
};

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const rawId = (params as Record<string, string | string[] | undefined>)
    .employeeid;
  const employeeId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Employee>({});

  // حالات الملفات والحذف
  const [personalPhotoFile, setPersonalPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false); // حذف الصورة الحالية
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]); // المستندات الحالية (المحتفظ بها)
  const [documentsFiles, setDocumentsFiles] = useState<File[]>([]); // المستندات الجديدة

  // مرجع للمدخل المخفي لإضافة المستندات
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب البيانات
  useEffect(() => {
    if (!employeeId) {
      setError("معرف الموظف غير متوفر");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchEmployee = async (retry = true) => {
      try {
        setLoading(true);
        const response = await axios.get<{ employee: Employee }>(
          `${process.env.NEXT_PUBLIC_API}/api/employee/get-employee/${employeeId}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!cancelled) {
          setFormData(response.data.employee);
          // تهيئة المستندات الحالية
          if (response.data.employee.Accounts?.Documents) {
            setExistingDocuments([
              ...response.data.employee.Accounts.Documents,
            ]);
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data?.message;
          if (message === "access token expired" && retry) {
            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
                {},
                { withCredentials: true },
              );
              const retryResp = await axios.get<{ employee: Employee }>(
                `${process.env.NEXT_PUBLIC_API}/api/employee/get-employee/${employeeId}`,
                { withCredentials: true },
              );
              if (!cancelled) {
                setFormData(retryResp.data.employee);
                if (retryResp.data.employee.Accounts?.Documents) {
                  setExistingDocuments([
                    ...retryResp.data.employee.Accounts.Documents,
                  ]);
                }
              }
            } catch {
              if (!cancelled)
                setError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
            }
          } else {
            if (!cancelled)
              setError(err.message || "حدث خطأ أثناء جلب البيانات");
          }
        } else {
          if (!cancelled) setError("حدث خطأ غير متوقع");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEmployee();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  // دوال تحديث الحقول
  const updatePersonal = (field: PersonalFields, value: string) => {
    setFormData((prev) => ({
      ...prev,
      PersonalInformation: { ...prev.PersonalInformation, [field]: value },
    }));
  };

  const updateJob = (field: JobFields, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      JobInformation: { ...prev.JobInformation, [field]: value },
    }));
  };

  const updateAddress = (field: AddressFields, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      Address: { ...prev.Address, [field]: value },
    }));
  };

  const updateEducation = (field: EducationFields, value: string) => {
    setFormData((prev) => ({
      ...prev,
      EducationalQualifications: {
        ...prev.EducationalQualifications,
        [field]: value,
      },
    }));
  };

  const updateWorkSchedule = (
    field: WorkScheduleFields,
    value: string | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      WorkSchedule: { ...prev.WorkSchedule, [field]: value },
    }));
  };

  const updateAccounts = (field: AccountsFields, value: string) => {
    setFormData((prev) => ({
      ...prev,
      Accounts: { ...prev.Accounts, [field]: value },
    }));
  };

  const updateContacts = (field: ContactsFields, value: string) => {
    setFormData((prev) => ({
      ...prev,
      Contacts: { ...prev.Contacts, [field]: value },
    }));
  };

  const updateAccount = (field: AccountFields, value: string) => {
    setFormData((prev) => ({
      ...prev,
      Account: { ...prev.Account, [field]: value },
    }));
  };

  const handleGovernorateChange = (governorate: string) => {
    updateAddress("Governorate", governorate);
    updateAddress("Area", "");
  };

  // معالج رفع الصورة الشخصية
  const handlePersonalPhotoChange = (files: FileList | null) => {
    if (files && files[0]) {
      setPersonalPhotoFile(files[0]);
      setRemovePhoto(false); // إلغاء حذف الصورة القديمة
      // إزالة الصورة القديمة من formData
      setFormData((prev) => ({
        ...prev,
        PersonalInformation: { ...prev.PersonalInformation, PersonalPhoto: "" },
      }));
    }
  };

  // حذف الصورة الحالية
  const handleRemovePhoto = () => {
    setRemovePhoto(true);
    setPersonalPhotoFile(null); // إلغاء أي صورة جديدة
    // إزالة الصورة من formData
    setFormData((prev) => ({
      ...prev,
      PersonalInformation: { ...prev.PersonalInformation, PersonalPhoto: "" },
    }));
  };

  // إضافة مستند جديد
  const addDocument = (file: File) => {
    if (existingDocuments.length + documentsFiles.length >= 10) {
      alert("لا يمكنك إضافة أكثر من 10 مستندات");
      return;
    }
    setDocumentsFiles((prev) => [...prev, file]);
  };

  // فتح نافذة اختيار الملف
  const handleAddDocumentClick = () => {
    fileInputRef.current?.click();
  };

  // معالج اختيار الملف من الإدخال المخفي
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addDocument(files[0]);
    }
    // إعادة تعيين قيمة الإدخال للسماح باختيار نفس الملف مرة أخرى
    event.target.value = "";
  };

  // حذف مستند من القائمة الجديدة
  const removeDocument = (index: number) => {
    setDocumentsFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // حذف مستند من القائمة الحالية (من الخادم)
  const removeExistingDocument = (index: number) => {
    const newList = [...existingDocuments];
    newList.splice(index, 1);
    setExistingDocuments(newList);
    // تحديث formData.Accounts.Documents
    setFormData((prev) => ({
      ...prev,
      Accounts: { ...prev.Accounts, Documents: newList },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();

      // تحضير البيانات النصية (بدون Account)
      const dataToSend = { ...formData };
      delete dataToSend.Account; // حذف Account بالكامل

      // تحديث قائمة المستندات الحالية (المحتفظ بها)
      if (dataToSend.Accounts) {
        dataToSend.Accounts.Documents = existingDocuments;
      } else {
        dataToSend.Accounts = { Documents: existingDocuments };
      }

      // إذا تم حذف الصورة الحالية ولم يتم رفع جديدة، نضيف إشارة للخادم
      if (removePhoto && !personalPhotoFile) {
        dataToSend.PersonalInformation = {
          ...dataToSend.PersonalInformation,
          PersonalPhoto: "", // إرسال مسار فارغ لمسحه
        };
      }

      // إضافة البيانات النصية كـ JSON في حقل "data"
      formDataToSend.append("data", JSON.stringify(dataToSend));

      // إضافة الملفات
      if (personalPhotoFile) {
        formDataToSend.append("personalPhoto", personalPhotoFile);
      }
      documentsFiles.forEach((file) => {
        formDataToSend.append("documents", file);
      });

      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/employee/update-employee/${employeeId}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setSuccess(true);
      setTimeout(() => router.push(`/employees/${employeeId}`), 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message === "access token expired") {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
              {},
              { withCredentials: true },
            );

            const formDataToSend = new FormData();
            const dataToSend = { ...formData };
            delete dataToSend.Account;
            if (dataToSend.Accounts) {
              dataToSend.Accounts.Documents = existingDocuments;
            } else {
              dataToSend.Accounts = { Documents: existingDocuments };
            }
            if (removePhoto && !personalPhotoFile) {
              dataToSend.PersonalInformation = {
                ...dataToSend.PersonalInformation,
                PersonalPhoto: "",
              };
            }
            formDataToSend.append("data", JSON.stringify(dataToSend));
            if (personalPhotoFile)
              formDataToSend.append("personalPhoto", personalPhotoFile);
            documentsFiles.forEach((file) =>
              formDataToSend.append("documents", file),
            );

            await axios.put(
              `${process.env.NEXT_PUBLIC_API}/api/employee/update-employee/${employeeId}`,
              formDataToSend,
              {
                withCredentials: true,
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
            setSuccess(true);
            setTimeout(() => router.push(`/employees/${employeeId}`), 1500);
          } catch {
            setError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
          }
        } else {
          setError(err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
        }
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div
          className="flex items-center justify-center p-6"
          style={{ minHeight: "calc(100vh - 80px)" }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <FaArrowLeft className="inline ml-2" /> العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const personal = formData.PersonalInformation || {};
  const job = formData.JobInformation || {};
  const address = formData.Address || {};
  const education = formData.EducationalQualifications || {};
  const workSchedule = formData.WorkSchedule || {};
  const accounts = formData.Accounts || {};
  const contacts = formData.Contacts || {};
  const account = formData.Account || {};

  const areaOptions = address.Governorate
    ? (AREAS_BY_GOVERNORATE[address.Governorate] || []).map((area) => ({
        value: area,
        label: area,
      }))
    : [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* شريط العنوان */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              تعديل بيانات الموظف
            </h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm"
            >
              <FaArrowLeft />
              <span>إلغاء</span>
            </button>
          </div>

          {/* رسائل الخطأ والنجاح */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
              تم حفظ التغييرات بنجاح! جاري التحويل...
            </div>
          )}

          {/* النموذج */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* المعلومات الشخصية */}
            <InfoCard title="المعلومات الشخصية">
              <InputField
                label="الاسم الكامل"
                value={personal.FullName}
                onChange={(v) => updatePersonal("FullName", v)}
                icon={FaUser}
              />
              <InputField
                label="الرقم القومي"
                value={personal.NationalIDNumber}
                onChange={(v) => updatePersonal("NationalIDNumber", v)}
                icon={FaIdCard}
              />
              <InputField
                label="تاريخ الميلاد"
                type="date"
                value={personal.DateOfBirth?.split("T")[0]}
                onChange={(v) => updatePersonal("DateOfBirth", v)}
                icon={FaCalendarAlt}
              />
              <SelectField
                label="الجنس"
                value={personal.Gender}
                onChange={(v) => updatePersonal("Gender", v)}
                options={[
                  { value: "ذكر", label: "ذكر" },
                  { value: "أنثى", label: "أنثى" },
                ]}
                icon={FaVenusMars}
              />
              <InputField
                label="الجنسية"
                value={personal.Nationality}
                onChange={(v) => updatePersonal("Nationality", v)}
                icon={FaGlobe}
              />
              <InputField
                label="الديانة"
                value={personal.Religion}
                onChange={(v) => updatePersonal("Religion", v)}
                icon={FaStarAndCrescent}
              />
              <SelectField
                label="الحالة الاجتماعية"
                value={personal.MaritalStatus}
                onChange={(v) => updatePersonal("MaritalStatus", v)}
                options={MARITAL_STATUS.map((status) => ({
                  value: status,
                  label: status,
                }))}
                icon={FaRing}
              />
              {/* الصورة الشخصية الحالية */}
              {!removePhoto && personal.PersonalPhoto && !personalPhotoFile && (
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                    <FaUser size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">الصورة الحالية</p>
                    <div className="relative inline-block">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API}/${personal.PersonalPhoto}`}
                        alt="Personal"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="حذف الصورة"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* الصورة الجديدة معاينة */}
              {personalPhotoFile && (
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                    <FaUser size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">الصورة الجديدة</p>
                    <div className="relative inline-block">
                      <Image
                        src={URL.createObjectURL(personalPhotoFile)}
                        alt="New personal"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setPersonalPhotoFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="إلغاء"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* رفع صورة جديدة */}
              <div className="flex items-start gap-3">
                <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                  <FaUser size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">
                    {personalPhotoFile
                      ? "تغيير الصورة"
                      : "إضافة / تغيير الصورة الشخصية"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePersonalPhotoChange(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </InfoCard>

            {/* معلومات الوظيفة */}
            <InfoCard title="معلومات الوظيفة">
              <InputField
                label="كود الموظف"
                value={job.EmployeeCode}
                onChange={(v) => updateJob("EmployeeCode", v)}
                icon={FaIdCard}
              />
              <SelectField
                label="القسم"
                value={job.Department}
                onChange={(v) => updateJob("Department", v)}
                options={DEPARTMENTS.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
                icon={FaBuilding}
              />
              <InputField
                label="المسمى الوظيفي"
                value={job.JobTitle}
                onChange={(v) => updateJob("JobTitle", v)}
                icon={FaBriefcase}
              />
              <InputField
                label="موقع العمل"
                value={job.WorkLocation}
                onChange={(v) => updateJob("WorkLocation", v)}
                icon={FaMapMarkerAlt}
              />
              <InputField
                label="تاريخ التعيين"
                type="date"
                value={job.HiringDate?.split("T")[0]}
                onChange={(v) => updateJob("HiringDate", v)}
                icon={FaCalendarAlt}
              />
              <SelectField
                label="حالة التوظيف"
                value={job.EmploymentStatus}
                onChange={(v) => updateJob("EmploymentStatus", v)}
                options={EMPLOYEE_STATUS.map((status) => ({
                  value: status,
                  label: status,
                }))}
                icon={FaHeartbeat}
              />
              <SelectField
                label="الدور"
                value={job.role}
                onChange={(v) => updateJob("role", v)}
                options={[
                  { value: "admin", label: "مدير" },
                  { value: "employee", label: "موظف" },
                ]}
                icon={FaUserTie}
              />
              <CheckboxField
                label="مؤمن عليه"
                checked={job.isInsured}
                onChange={(v) => updateJob("isInsured", v)}
                icon={FaShieldAlt}
              />
              <ArrayField
                label="المديرون المباشرون"
                items={job.DirectManagers}
                onChange={(v) => updateJob("DirectManagers", v)}
                icon={FaUserTie}
              />
            </InfoCard>

            {/* العنوان وبيانات الاتصال */}
            <InfoCard title="العنوان وبيانات الاتصال">
              <SelectField
                label="المحافظة"
                value={address.Governorate}
                onChange={handleGovernorateChange}
                options={GOVERNORATES.map((gov) => ({
                  value: gov,
                  label: gov,
                }))}
                icon={FaMapMarkerAlt}
              />
              <SelectField
                label="المنطقة"
                value={address.Area}
                onChange={(v) => updateAddress("Area", v)}
                options={areaOptions}
                icon={FaMapMarkerAlt}
              />
              <TextareaField
                label="العنوان التفصيلي"
                value={address.DetailedAddress}
                onChange={(v) => updateAddress("DetailedAddress", v)}
                icon={FaMapMarkerAlt}
              />
              <ArrayField
                label="أرقام الهاتف"
                items={address.PhoneNumbers}
                onChange={(v) => updateAddress("PhoneNumbers", v)}
                icon={FaPhone}
              />
              <InputField
                label="البريد الإلكتروني"
                type="email"
                value={account.email}
                onChange={(v) => updateAccount("email", v)}
                icon={FaEnvelope}
              />
            </InfoCard>

            {/* المؤهلات الدراسية */}
            <InfoCard title="المؤهلات الدراسية">
              <SelectField
                label="المؤهل"
                value={education.Qualification}
                onChange={(v) => updateEducation("Qualification", v)}
                options={QUALIFICATION.map((qual) => ({
                  value: qual,
                  label: qual,
                }))}
                icon={FaGraduationCap}
              />
              <InputField
                label="التخصص"
                value={education.Specialization}
                onChange={(v) => updateEducation("Specialization", v)}
                icon={FaPercentage}
              />
              <InputField
                label="الجامعة / المعهد"
                value={education.University}
                onChange={(v) => updateEducation("University", v)}
                icon={FaUniversity}
              />
              <InputField
                label="سنة التخرج"
                value={education.GraduationYear}
                onChange={(v) => updateEducation("GraduationYear", v)}
                icon={FaCalendarAlt}
              />
            </InfoCard>

            {/* مواعيد العمل والإجازات */}
            <InfoCard title="مواعيد العمل والإجازات">
              <InputField
                label="بداية العمل"
                type="time"
                value={workSchedule.StartTime}
                onChange={(v) => updateWorkSchedule("StartTime", v)}
                icon={FaRegClock}
              />
              <InputField
                label="نهاية العمل"
                type="time"
                value={workSchedule.EndTime}
                onChange={(v) => updateWorkSchedule("EndTime", v)}
                icon={FaRegClock}
              />
              <InputField
                label="الإجازة السنوية (أيام)"
                value={workSchedule.AnnualLeave}
                onChange={(v) => updateWorkSchedule("AnnualLeave", v)}
                icon={FaUmbrellaBeach}
              />
              <InputField
                label="الإجازة المرضية (أيام)"
                value={workSchedule.SickLeave}
                onChange={(v) => updateWorkSchedule("SickLeave", v)}
                icon={FaHeartbeat}
              />
              <ArrayField
                label="أيام الإجازة الأسبوعية"
                items={workSchedule.TimeOff}
                onChange={(v) => updateWorkSchedule("TimeOff", v)}
                icon={FaUmbrellaBeach}
              />
            </InfoCard>

            {/* المعلومات البنكية والمستندات */}
            <InfoCard title="المعلومات البنكية والمستندات">
              <InputField
                label="الرقم التأميني"
                value={accounts.SocialInsuranceNumber}
                onChange={(v) => updateAccounts("SocialInsuranceNumber", v)}
                icon={FaFileInvoice}
              />
              <InputField
                label="صاحب الحساب"
                value={accounts.AccountHolderName}
                onChange={(v) => updateAccounts("AccountHolderName", v)}
                icon={FaUser}
              />
              <SelectField
                label="البنك"
                value={accounts.BankName}
                onChange={(v) => updateAccounts("BankName", v)}
                options={BANKS.map((bank) => ({
                  value: bank,
                  label: bank,
                }))}
                icon={FaBuilding}
              />
              <InputField
                label="رقم الحساب"
                value={accounts.BankAccountNumber}
                onChange={(v) => updateAccounts("BankAccountNumber", v)}
                icon={FaIdCard}
              />
              <InputField
                label="الراتب"
                type="number"
                value={accounts.Salary}
                onChange={(v) => updateAccounts("Salary", v)}
                icon={FaMoneyBillWave}
              />

              {/* المستندات الحالية (مع إمكانية الحذف) */}
              {existingDocuments.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                    <FaFileInvoice size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      المستندات الحالية ({existingDocuments.length}/10)
                    </p>
                    <div className="space-y-1">
                      {existingDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <a
                            href={`${process.env.NEXT_PUBLIC_API}/${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            مستند {idx + 1}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(idx)}
                            className="text-red-500 hover:text-red-700"
                            title="حذف"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* المستندات الجديدة (قائمة) */}
              {documentsFiles.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                    <FaFileInvoice size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      المستندات الجديدة ({documentsFiles.length}/10)
                    </p>
                    <div className="space-y-2">
                      {documentsFiles.map((file, idx) => (
                        <FilePreview
                          key={idx}
                          file={file}
                          onRemove={() => removeDocument(idx)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* إضافة مستند جديد */}
              <div className="flex items-start gap-3">
                <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                  <FaFileInvoice size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">إضافة مستند جديد</p>
                  <button
                    type="button"
                    onClick={handleAddDocumentClick}
                    disabled={
                      existingDocuments.length + documentsFiles.length >= 10
                    }
                    className={`w-full px-3 py-2 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      existingDocuments.length + documentsFiles.length >= 10
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <FaPlus size={14} />
                    {existingDocuments.length + documentsFiles.length >= 10
                      ? "الحد الأقصى 10 مستندات"
                      : "اختر ملف"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </InfoCard>

            {/* جهة اتصال الطوارئ */}
            <InfoCard title="جهة اتصال الطوارئ">
              <InputField
                label="الاسم"
                value={contacts.PersonName}
                onChange={(v) => updateContacts("PersonName", v)}
                icon={FaUser}
              />
              <InputField
                label="رقم الهاتف"
                value={contacts.PhoneNumber}
                onChange={(v) => updateContacts("PhoneNumber", v)}
                icon={FaPhoneAlt}
              />
              <TextareaField
                label="العنوان"
                value={contacts.Address}
                onChange={(v) => updateContacts("Address", v)}
                icon={FaMapMarkerAlt}
              />
              <InputField
                label="صلة القرابة"
                value={contacts.Relationship}
                onChange={(v) => updateContacts("Relationship", v)}
                icon={FaAddressBook}
              />
            </InfoCard>
          </div>

          {/* أزرار الحفظ */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors flex items-center gap-2"
              disabled={saving}
            >
              <FaTimes /> إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {saving ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <FaSave /> حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
