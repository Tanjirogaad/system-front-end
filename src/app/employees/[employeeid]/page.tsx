"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
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
} from "react-icons/fa";

// تعريف واجهة الموظف (كما هي)
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
  };
  Contacts?: {
    Relationship?: string;
    PersonName?: string;
    PhoneNumber?: string;
    Address?: string;
  };
  Account?: {
    email?: string;
  };
}

// دالة تنسيق التاريخ
const formatDate = (dateString?: string) => {
  if (!dateString) return "غير محدد";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

// ICON type آمن (يتقبل props الـ SVG و size)
type IconType = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number }
>;

// عنصر عرض بيانات (صف)
const DataRow = ({
  icon: Icon,
  label,
  value,
  badge = false,
}: {
  icon: IconType;
  label: string;
  value?: string | number | null;
  badge?: boolean;
}) => {
  if (value === undefined || value === null || value === "") return null; // لا تعرض إذا كانت القيمة فارغة
  return (
    <div className="flex items-start gap-3 group">
      <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {badge ? (
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {value}
          </span>
        ) : (
          <p className="text-gray-800 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
};

// عنصر لعرض مجموعة من القيم (مثل أرقام الهاتف)
const DataList = ({
  icon: Icon,
  label,
  items,
}: {
  icon: IconType;
  label: string;
  items?: string[];
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-3 group">
      <div className="text-blue-500 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // تأكد من أن employeeId نصي واحد (next يمكن أن يرجع string[] أحيانًا)
  const rawId = (params as Record<string, string | string[] | undefined>)
    .employeeid;
  const employeeId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch داخل useEffect لتجنب تحذير الـ hooks عن التبعيات
  useEffect(() => {
    if (!employeeId) {
      setError("معرف الموظف غير متوفر");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOnce = async (retry = true) => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken") ?? "";

        const response = await axios.get<{ employee: Employee }>(
          `${process.env.NEXT_PUBLIC_API}/api/employee/get-employee/${employeeId}`,
          {
            headers: { accesstoken: token },
          },
        );

        if (!cancelled) {
          setEmployee(response.data.employee);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data?.message;
          // إذا انتهى توكن الوصول وجربنا مرة واحدة فقط، نجدد ثم نعيد الطلب (مرة واحدة فقط)
          if (message === "access token expired" && retry) {
            try {
              const refresh = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
                {
                  refreshToken: localStorage.getItem("refreshToken"),
                },
              );
              const newToken = refresh.data.accessToken;
              localStorage.setItem("accessToken", newToken);

              // بعد التجديد نعيد الطلب مرة واحدة مع التوكن الجديد
              const retryResp = await axios.get<{ employee: Employee }>(
                `${process.env.NEXT_PUBLIC_API}/api/employee/get-employee/${employeeId}`,
                {
                  headers: { accesstoken: newToken },
                },
              );
              if (!cancelled) {
                setEmployee(retryResp.data.employee);
              }
            } catch {
              if (!cancelled) {
                setError("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى");
              }
            }
          } else {
            if (!cancelled) {
              setError(err.message || "حدث خطأ أثناء جلب البيانات");
            }
          }
        } else {
          if (!cancelled) {
            setError("حدث خطأ غير متوقع");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnce();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (loading) return <Loading />;

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div
          className="flex items-center justify-center p-6"
          style={{ minHeight: "calc(100vh - 80px)" }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">{error ? "⚠️" : "👤"}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error ? "خطأ" : "الموظف غير موجود"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "لم يتم العثور على بيانات هذا الموظف"}
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <FaArrowLeft /> العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const personal = employee.PersonalInformation || {};
  const job = employee.JobInformation || {};
  const address = employee.Address || {};
  const education = employee.EducationalQualifications || {};
  const workSchedule = employee.WorkSchedule || {};
  const accounts = employee.Accounts || {};
  const contacts = employee.Contacts || {};
  const account = employee.Account || {};

  // الحصول على الحرف الأول للصورة الرمزية
  const initial = personal.FullName?.charAt(0) || "?";

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 md:px-6"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto">
          {/* شريط التنقل العلوي */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
              ملف الموظف
            </h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
            >
              <FaArrowLeft />
              <span>العودة</span>
            </button>
          </div>

          {/* الهيدر الشخصي */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-blue-200">
                {initial}
              </div>
              <div className="text-center md:text-right">
                <h2 className="text-3xl font-bold text-gray-800">
                  {personal.FullName}
                </h2>
                <p className="text-gray-600 mt-1 flex items-center gap-2 justify-center md:justify-start">
                  <FaBriefcase className="text-blue-500" size={18} />
                  {job.JobTitle || "غير محدد"} ·{" "}
                  <span className="text-sm text-gray-500">
                    {job.Department}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                    <FaIdCard /> {job.EmployeeCode || "بدون كود"}
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                      job.EmploymentStatus === "نشط"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FaHeartbeat /> {job.EmploymentStatus || "غير محدد"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* شبكة البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* المعلومات الشخصية */}
            <InfoCard title="المعلومات الشخصية" className="md:col-span-1">
              <DataRow
                icon={FaIdCard}
                label="الرقم القومي"
                value={personal.NationalIDNumber}
              />
              <DataRow
                icon={FaCalendarAlt}
                label="تاريخ الميلاد"
                value={formatDate(personal.DateOfBirth)}
              />
              <DataRow
                icon={FaVenusMars}
                label="الجنس"
                value={personal.Gender}
              />
              <DataRow
                icon={FaGlobe}
                label="الجنسية"
                value={personal.Nationality}
              />
              <DataRow
                icon={FaStarAndCrescent}
                label="الديانة"
                value={personal.Religion}
              />
              <DataRow
                icon={FaRing}
                label="الحالة الاجتماعية"
                value={personal.MaritalStatus}
              />
            </InfoCard>

            {/* معلومات الوظيفة */}
            <InfoCard title="معلومات الوظيفة" className="md:col-span-1">
              <DataRow
                icon={FaIdCard}
                label="كود الموظف"
                value={job.EmployeeCode}
              />
              <DataRow icon={FaBuilding} label="القسم" value={job.Department} />
              <DataRow
                icon={FaBriefcase}
                label="المسمى الوظيفي"
                value={job.JobTitle}
              />
              <DataRow
                icon={FaMapMarkerAlt}
                label="موقع العمل"
                value={job.WorkLocation}
              />
              <DataRow
                icon={FaCalendarAlt}
                label="تاريخ التعيين"
                value={formatDate(job.HiringDate)}
              />
              <DataRow icon={FaUserTie} label="الدور" value={job.role} />
              {job.DirectManagers && job.DirectManagers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    المديرون المباشرون
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.DirectManagers.map((manager, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {manager}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* العنوان وبيانات الاتصال */}
            <InfoCard title="العنوان وبيانات الاتصال" className="md:col-span-1">
              <DataRow
                icon={FaMapMarkerAlt}
                label="المحافظة"
                value={address.Governorate}
              />
              <DataRow
                icon={FaMapMarkerAlt}
                label="المنطقة"
                value={address.Area}
              />
              <DataRow
                icon={FaMapMarkerAlt}
                label="العنوان التفصيلي"
                value={address.DetailedAddress}
              />
              <DataList
                icon={FaPhone}
                label="أرقام الهاتف"
                items={address.PhoneNumbers}
              />
              <DataRow
                icon={FaEnvelope}
                label="البريد الإلكتروني"
                value={account.email}
              />
            </InfoCard>

            {/* المؤهلات الدراسية */}
            <InfoCard title="المؤهلات الدراسية" className="md:col-span-1">
              <DataRow
                icon={FaGraduationCap}
                label="المؤهل"
                value={education.Qualification}
              />
              <DataRow
                icon={FaPercentage}
                label="التخصص"
                value={education.Specialization}
              />
              <DataRow
                icon={FaUniversity}
                label="الجامعة / المعهد"
                value={education.University}
              />
              <DataRow
                icon={FaCalendarAlt}
                label="سنة التخرج"
                value={education.GraduationYear}
              />
            </InfoCard>

            {/* مواعيد العمل والإجازات */}
            <InfoCard title="مواعيد العمل والإجازات" className="md:col-span-1">
              <DataRow
                icon={FaRegClock}
                label="بداية العمل"
                value={workSchedule.StartTime}
              />
              <DataRow
                icon={FaRegClock}
                label="نهاية العمل"
                value={workSchedule.EndTime}
              />
              <DataRow
                icon={FaUmbrellaBeach}
                label="الإجازة السنوية"
                value={workSchedule.AnnualLeave}
              />
              <DataRow
                icon={FaHeartbeat}
                label="الإجازة المرضية"
                value={workSchedule.SickLeave}
              />
              {workSchedule.TimeOff && workSchedule.TimeOff.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    أيام الإجازة الأسبوعية
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {workSchedule.TimeOff.map((day, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </InfoCard>

            {/* المعلومات البنكية */}
            <InfoCard title="المعلومات البنكية" className="md:col-span-1">
              <DataRow
                icon={FaFileInvoice}
                label="الرقم التأميني"
                value={accounts.SocialInsuranceNumber}
              />
              <DataRow
                icon={FaUser}
                label="صاحب الحساب"
                value={accounts.AccountHolderName}
              />
              <DataRow
                icon={FaIdCard}
                label="البنك"
                value={accounts.BankName}
              />
              <DataRow
                icon={FaIdCard}
                label="رقم الحساب"
                value={accounts.BankAccountNumber}
              />
              <DataRow
                icon={FaMoneyBillWave}
                label="الراتب"
                value={accounts.Salary ? `${accounts.Salary} ج.م` : undefined}
              />
            </InfoCard>

            {/* جهة اتصال الطوارئ */}
            <InfoCard title="جهة اتصال الطوارئ" className="md:col-span-1">
              <DataRow
                icon={FaUser}
                label="الاسم"
                value={contacts.PersonName}
              />
              <DataRow
                icon={FaPhoneAlt}
                label="رقم الهاتف"
                value={contacts.PhoneNumber}
              />
              <DataRow
                icon={FaMapMarkerAlt}
                label="العنوان"
                value={contacts.Address}
              />
              <DataRow
                icon={FaAddressBook}
                label="صلة القرابة"
                value={contacts.Relationship}
              />
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}
