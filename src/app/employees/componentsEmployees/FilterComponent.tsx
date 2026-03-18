"use client";

import React, { useState } from "react";
import { DEPARTMENTS, EMPLOYEE_STATUS } from "@/data";

interface FilterComponentProps {
  filters: {
    search: string;
    department: string;
    status: string;
  };
  onFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onClearFilters: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterComponent({
  filters,
  onFilterChange,
  onClearFilters,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
}: FilterComponentProps) {
  // استخدمنا lazy initializer عشان نقرأ document.dir مرة واحدة من غير effect
  const [isRTL] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    const dir = document.dir || document.documentElement.dir;
    return Boolean(dir && dir.toLowerCase() === "rtl");
  });

  const clearSingleFilter = (name: string) => {
    const fakeEvent = {
      target: { name, value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    onFilterChange(fakeEvent);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== "");

  // لو لاحقاً تحب تستخدم موضع أيقونة الإدخال فعّل هذا الدّالة أو أعد إضافتها
  // const inputIconPos = (rtlClass = "right-3", ltrClass = "left-3") =>
  //   isRTL ? rtlClass : ltrClass;
  const inputPadding = () => (isRTL ? "pl-4 pr-10" : "pl-10 pr-4");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <h2 className="text-lg font-semibold text-gray-800">
            تصفية الموظفين
          </h2>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1 rtl:space-x-reverse"
          >
            <span>مسح الفلاتر</span>
          </button>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              شبكة
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              قائمة
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البحث بالكود أو الاسم
          </label>
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={onFilterChange}
              placeholder="ابحث برقم الكود أو اسم الموظف..."
              className={`w-full ${inputPadding()} py-2 px-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
            />
          </div>
        </div>

        {/* Department */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الإدارة
          </label>
          <div className="relative">
            <select
              name="department"
              value={filters.department}
              onChange={onFilterChange}
              className={`w-full ${inputPadding()} py-2 px-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
            >
              <option value="">كل الإدارات</option>
              {DEPARTMENTS.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حالة التوظيف
          </label>
          <div className="relative">
            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className={`w-full ${inputPadding()} py-2 px-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
            >
              <option value="">جميع الحالات</option>
              {EMPLOYEE_STATUS.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters + Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            عرض{" "}
            <span className="font-semibold text-gray-800">{filteredCount}</span>{" "}
            من <span className="font-semibold text-gray-800">{totalCount}</span>{" "}
            موظف
          </div>

          {hasActiveFilters && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters)
                  .filter(([, v]) => v) // تجاهل المفتاح الأول بطريقة صحيحة
                  .map(([key, value]) => {
                    const label =
                      key === "search"
                        ? "البحث"
                        : key === "department"
                          ? "الإدارة"
                          : "الحالة";

                    return (
                      <div
                        key={key}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {label}: {value}
                        <button
                          onClick={() => clearSingleFilter(key)}
                          className="text-blue-600 hover:text-blue-800"
                        ></button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
