"use client";

import React from "react";

interface Employee {
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
  viewMode: "grid" | "list";
  onClick?: (employee: Employee) => void;
}

export default function EmployeeListItem({
  employee,
  viewMode,
  onClick,
}: EmployeeCardProps) {
  if (viewMode !== "list") return null;

  const name = employee.PersonalInformation?.FullName || "غير متوفر";
  const code = employee.JobInformation?.EmployeeCode || "N/A";
  const department = employee.JobInformation?.Department || "غير محدد";
  const jobTitle = employee.JobInformation?.JobTitle || "غير محدد";
  const status = employee.JobInformation?.EmploymentStatus || "غير محدد";
  const hiringDateRaw = employee.JobInformation?.HiringDate;

  const phones = employee.Address?.PhoneNumbers || [];

  const statusKey = (status || "").toLowerCase();

  const statusStyles = () => {
    if (statusKey.includes("active") || statusKey.includes("نشط"))
      return "bg-green-100 text-green-800";
    if (
      statusKey.includes("leave") ||
      statusKey.includes("إجازة") ||
      statusKey.includes("on leave")
    )
      return "bg-yellow-100 text-yellow-800";
    if (statusKey.includes("terminated") || statusKey.includes("مفصول"))
      return "bg-red-100 text-red-800";
    if (statusKey.includes("probation") || statusKey.includes("تجربة"))
      return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDateReversed = (d?: string) => {
    if (!d) return "غير محدد";
    try {
      const parsed = new Date(d);
      if (Number.isNaN(parsed.getTime())) return d;
      const dd = String(parsed.getDate()).padStart(2, "0");
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const yyyy = parsed.getFullYear();
      return `${yyyy}/${mm}/${dd}`;
    } catch {
      return d;
    }
  };

  const getDurationSince = (d?: string) => {
    if (!d) return "";
    try {
      const start = new Date(d);
      if (Number.isNaN(start.getTime())) return "";
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) return "تاريخ في المستقبل";

      const dayMs = 1000 * 60 * 60 * 24;
      const days = Math.floor(diffMs / dayMs);

      if (days >= 365) {
        const years = Math.floor(days / 365);
        if (years === 1) return `بقاله سنة`;
        if (years === 2) return `بقاله سنتين`;
        return `بقاله ${years} سنوات`;
      }
      if (days >= 30) {
        const months = Math.floor(days / 30);
        if (months === 1) return `بقاله شهر`;
        if (months === 2) return `بقاله شهرين`;
        return `بقاله ${months} شهور`;
      }
      if (days === 1) return `بقاله يوم`;
      if (days === 2) return `بقاله يومين`;
      return `بقاله ${days} أيام`;
    } catch {
      return "";
    }
  };

  const initials = (n: string) => {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "--";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleRowClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (onClick) onClick(employee);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(e);
    }
  };

  return (
    <tr
      className="transition-colors cursor-pointer hover:shadow-sm hover:bg-gray-50"
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`عرض تفاصيل ${name}`}
      onClick={() => handleRowClick()}
    >
      {/* الاسم + أفاتار */}
      <td className="py-3 px-4 align-top min-w-[160px]">
        <div className="flex items-center gap-3 rtl:gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-linear-to-br from-blue-50 to-blue-100">
            <span className="font-semibold text-blue-600 text-sm">
              {initials(name)}
            </span>
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-gray-800 truncate"
              title={name}
              aria-label={`اسم الموظف ${name}`}
            >
              {name}
            </p>
            <p className="text-sm text-gray-500 truncate" title={jobTitle}>
              {jobTitle}
            </p>
          </div>
        </div>
      </td>

      {/* كود الموظف */}
      <td className="py-3 px-4 align-top min-w-[100px]">
        <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
          {code}
        </span>
      </td>

      {/* القسم */}
      <td className="py-3 px-4 align-top min-w-[120px]">
        <div className="flex items-center gap-2 rtl:gap-2">
          <span className="truncate" title={department}>
            {department}
          </span>
        </div>
      </td>

      {/* أرقام الهاتف */}
      <td className="py-3 px-4 align-top min-w-[180px]">
        <div className="flex flex-wrap items-center gap-2 rtl:gap-2">
          {phones.length === 0 ? (
            <span className="text-gray-500">غير متوفر</span>
          ) : (
            phones.map((p, idx) => (
              <a
                key={p + idx}
                href={`tel:${p}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center text-sm px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                title={`اتصال ${p}`}
                aria-label={`اتصال ${p}`}
              >
                {p}
              </a>
            ))
          )}
        </div>
      </td>

      {/* الحالة */}
      <td className="py-3 px-4 align-top min-w-[100px]">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles()}`}
        >
          {status}
        </span>
      </td>

      {/* التاريخ والمدة */}
      <td className="py-3 px-4 align-top min-w-[140px]">
        <div className="flex flex-col">
          <div className="text-xs text-gray-600 mb-1 whitespace-nowrap">
            {hiringDateRaw ? getDurationSince(hiringDateRaw) : ""}
          </div>
          <div className="flex items-center gap-2 rtl:gap-2">
            <span className="truncate font-medium" title={hiringDateRaw}>
              {formatDateReversed(hiringDateRaw)}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}
