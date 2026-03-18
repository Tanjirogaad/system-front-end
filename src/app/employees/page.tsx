"use client";

import { useState, useMemo, useDeferredValue, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FilterComponent from "./componentsEmployees/FilterComponent";
import EmployeeGridCard from "./componentsEmployees/EmployeeGridCard";
import EmployeeListItem from "./componentsEmployees/EmployeeListItem";
import Navbar from "../components/Navbar";
import Loading from "@/app/components/Loading";

/**
 * أنواع البيانات (كما هي)
 */
interface PersonalInformation {
  FullName?: string;
  NationalIDNumber?: string;
  // أضف حقول أخرى إذا احتجت
}

interface JobInformation {
  EmployeeCode?: string;
  Department?: string;
  EmploymentStatus?: string;
  JobTitle?: string;
  HireDate?: string;
  // أضف حقول أخرى
}

export interface Employee {
  _id?: string; // مهم جداً للتنقل
  PersonalInformation?: PersonalInformation;
  JobInformation?: JobInformation;
  // أقسام أخرى محتملة...
}

/** واجهة الفلاتر */
interface Filters {
  search: string;
  department: string;
  status: string;
}

export default function Employees() {
  const router = useRouter();

  // حالات التصفية والعرض
  const [filters, setFilters] = useState<Filters>({
    search: "",
    department: "",
    status: "",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // حالات البيانات والتحميل
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken") ?? "";

        const response = await axios.get<{ employees: Employee[] }>(
          `${process.env.NEXT_PUBLIC_API}/api/employee/get-employees`,
          {
            headers: { accesstoken: token },
          }
        );
        console.log(response.data?.employees);
        setEmployees(
          Array.isArray(response.data?.employees) ? response.data.employees : []
        );
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.data?.message === "access token expired") {
            const refresh = await axios.post(
              `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
              { refreshToken: localStorage.getItem("refreshToken") }
            );
            localStorage.setItem("accessToken", refresh.data.accessToken);
            fetchEmployees(); // إعادة المحاولة
          } else {
            console.error(err);
            setError(err.message ?? "حدث خطأ أثناء استدعاء الخادم");
          }
        } else {
          console.error(err);
          setError("حدث خطأ غير متوقع");
        }
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // قيمة مؤجلة لتجنب التحميل المتكرر
  const deferredEmployees = useDeferredValue<Employee[]>(employees);

  // حساب الموظفين المفلترين
  const filteredEmployees: Employee[] = useMemo(() => {
    if (!deferredEmployees.length) return [];

    let result: Employee[] = deferredEmployees;

    const search = (filters.search ?? "").trim().toLowerCase();
    if (search) {
      result = result.filter((emp: Employee) => {
        const code = `${emp?.JobInformation?.EmployeeCode ?? ""}`.toLowerCase();
        const name = `${emp?.PersonalInformation?.FullName ?? ""}`.toLowerCase();
        const nationalId = `${emp?.PersonalInformation?.NationalIDNumber ?? ""}`.toLowerCase();
        return (
          code.includes(search) ||
          name.includes(search) ||
          nationalId.includes(search)
        );
      });
    }

    if (filters.department) {
      const dept = filters.department.toLowerCase();
      result = result.filter((emp: Employee) =>
        `${emp?.JobInformation?.Department ?? ""}`.toLowerCase().includes(dept)
      );
    }

    if (filters.status) {
      const status = filters.status.toLowerCase();
      result = result.filter((emp: Employee) =>
        `${emp?.JobInformation?.EmploymentStatus ?? ""}`
          .toLowerCase()
          .includes(status)
      );
    }

    return result;
  }, [deferredEmployees, filters.search, filters.department, filters.status]);

  // معالجة تغيير الفلاتر
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name as keyof Filters]: value }));
  };

  // عند النقر على بطاقة موظف: ننتقل إلى صفحة التفاصيل باستخدام _id
  const handleEmployeeClick = (employee: Employee) => {
    if (employee._id) {
      router.push(`/employees/${employee._id}`);
    } else {
      console.warn("الموظف لا يملك _id، لا يمكن التنقل");
    }
  };

  // مسح جميع الفلاتر
  const clearFilters = () => {
    setFilters({ search: "", department: "", status: "" });
  };

  // مفتاح فريد لكل موظف (للاستخدام في القوائم)
  const getEmployeeKey = (emp: Employee, index: number): string =>
    emp?._id ?? emp?.JobInformation?.EmployeeCode ?? emp?.PersonalInformation?.NationalIDNumber ?? String(index);

  // إحصائيات سريعة
  const employeeStats = useMemo(() => {
    if (!employees.length) return null;
    const total = employees.length;
    const active = employees.filter(
      (emp) =>
        `${emp?.JobInformation?.EmploymentStatus ?? ""}`
          .toLowerCase()
          .includes("active") ||
        `${emp?.JobInformation?.EmploymentStatus ?? ""}`
          .toLowerCase()
          .includes("مفعل")
    ).length;
    const managers = employees.filter(
      (emp) =>
        `${emp?.JobInformation?.JobTitle ?? ""}`
          .toLowerCase()
          .includes("manager") ||
        `${emp?.JobInformation?.JobTitle ?? ""}`.toLowerCase().includes("مدير")
    ).length;
    return { total, active, managers };
  }, [employees]);

  // حالات التحميل والخطأ وعدم وجود بيانات
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">خطأ: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">لا توجد بيانات للموظفين</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                إدارة الموظفين
              </h1>
              <p className="text-gray-600">عرض وتصفية وإدارة بيانات الموظفين</p>
            </div>
            {employeeStats && (
              <div className="flex gap-3 text-sm text-gray-700">
                <div>
                  المجموع: <strong>{employeeStats.total}</strong>
                </div>
                <div>
                  نشط: <strong>{employeeStats.active}</strong>
                </div>
                <div>
                  مديرين: <strong>{employeeStats.managers}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <FilterComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredEmployees.length}
          totalCount={employees.length}
        />

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <EmployeeGridCard
                  key={getEmployeeKey(employee, index)}
                  employee={employee}
                  onClick={handleEmployeeClick}
                  viewMode={viewMode}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-gray-600 mb-4">
                  لم نتمكن من العثور على موظفين مطابقين لمعايير البحث
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      الموظف
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      الكود
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      الإدارة
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      الأرقام الشخصية
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      حالة التوظيف
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                      تاريخ التعيين
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee, index) => (
                      <EmployeeListItem
                        key={getEmployeeKey(employee, index)}
                        employee={employee}
                        onClick={handleEmployeeClick}
                        viewMode={viewMode}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-gray-600">
                            لا توجد نتائج مطابقة للبحث
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}