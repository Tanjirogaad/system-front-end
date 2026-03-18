"use client";

import {
  FaUser,
  FaPhone,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaCircle,
} from "react-icons/fa";

interface Employee {
  _id?: string; // أضفنا هذا
  PersonalInformation?: {
    FullName?: string;
  };
  JobInformation?: {
    EmployeeCode?: string;
    Department?: string;
    JobTitle?: string;
    HiringDate?: string;
    EmploymentStatus?: string;
  };
  Address?: {
    PhoneNumbers?: string[];
  };
}

interface EmployeeCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
  viewMode: "grid" | "list";
}

export default function EmployeeGridCard({
  employee,
  onClick,
  viewMode,
}: EmployeeCardProps) {
  if (viewMode !== "grid") return null;

  const name = employee.PersonalInformation?.FullName || "غير متوفر";
  const code = employee.JobInformation?.EmployeeCode || "غير متوفر";
  const department = employee.JobInformation?.Department || "غير محدد";
  const jobTitle = employee.JobInformation?.JobTitle || "غير محدد";
  const hiringDateRaw = employee.JobInformation?.HiringDate;
  const status = employee.JobInformation?.EmploymentStatus || "غير محدد";
  const phones = employee.Address?.PhoneNumbers || [];

  const isActive = status.toLowerCase().includes("نشط");

  const formatDate = (d?: string) => {
    if (!d) return "غير محدد";
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  };

  const getDurationSince = (d?: string) => {
    if (!d) return "";
    const start = new Date(d);
    if (Number.isNaN(start.getTime())) return "";
    const now = new Date();
    if (start.getTime() > now.getTime()) return "تاريخ في المستقبل";

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      const prevMonthLastDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      ).getDate();
      days += prevMonthLastDay;
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const parts: string[] = [];

    if (years > 0) {
      const yearsLabel =
        years === 1 ? "سنة واحدة" : years === 2 ? "سنتان" : `${years} سنوات`;
      parts.push(yearsLabel);
    }

    if (months > 0) {
      const monthsLabel =
        months === 1 ? "شهر واحد" : months === 2 ? "شهران" : `${months} شهور`;
      parts.push(monthsLabel);
    }

    if (days > 0) {
      const daysLabel =
        days === 1 ? "يوم واحد" : days === 2 ? "يومان" : `${days} أيام`;
      parts.push(daysLabel);
    }

    if (parts.length === 0) return "منذ اليوم";

    return `منذ ${parts.join(" ")}`;
  };

  const normalizeTel = (p: string) => p.replace(/[^\d+]/g, "");

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 overflow-hidden group h-full flex flex-col"
      onClick={() => onClick(employee)}
    >
      <div className="p-5 sm:p-6 flex flex-col h-full gap-4">
        {/* رأس البطاقة */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <FaUser className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <FaCircle
                className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-full ${
                  isActive ? "text-green-500" : "text-gray-400"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate text-lg sm:text-xl">
                {name}
              </h3>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {jobTitle}
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
              isActive
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {status}
          </span>
        </div>

        {/* شبكة المعلومات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="flex items-center gap-3 min-w-0 bg-gray-50 p-3 rounded-xl">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaIdCard className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">الكود</p>
              <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                {code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0 bg-gray-50 p-3 rounded-xl">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaBuilding className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">القسم</p>
              <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                {department}
              </p>
            </div>
          </div>
        </div>

        {/* أرقام الهاتف */}
        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl">
          <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
            <FaPhone className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">الهاتف</p>
            {phones.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {phones.map((p, idx) => {
                  const display = p || "غير متوفر";
                  const href = p ? `tel:${normalizeTel(p)}` : undefined;
                  return href ? (
                    <a
                      key={idx}
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-gray-700 hover:text-blue-600 transition-colors text-sm bg-white px-2 py-1 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm"
                    >
                      {display}
                    </a>
                  ) : (
                    <span
                      key={idx}
                      className="font-medium text-gray-400 text-sm bg-white px-2 py-1 rounded-lg border border-gray-200"
                    >
                      {display}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="font-medium text-gray-400 text-sm bg-white px-2 py-1 rounded-lg border border-gray-200 inline-block">
                غير متوفر
              </p>
            )}
          </div>
        </div>

        {/* تاريخ التعيين والمدة */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaCalendarAlt className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {formatDate(hiringDateRaw)}
            </span>
          </div>
          <div className="text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-100">
            {getDurationSince(hiringDateRaw)}
          </div>
        </div>
      </div>
    </div>
  );
}
