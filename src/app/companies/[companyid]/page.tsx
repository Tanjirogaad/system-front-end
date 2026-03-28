"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import {
  FaBuilding,
  FaArrowRight,
  FaBarcode,
  FaFileInvoice,
  FaEdit,
  FaMapMarkerAlt,
  FaLink,
  FaUsers,
  FaUser,
  FaPhoneAlt,
} from "react-icons/fa";

// تعريف نوع بيانات الموظف
type Employee = {
  role: string;
  name: string;
  number: string[];
};

type CompanyDetails = {
  _id: string;
  Name: string;
  NameEN: string;
  Customercode?: string;
  TaxRegistration: string;
  isActive?: boolean;
  GPS?: {
    Address?: string;
    mapLink?: string;
  };
  employees?: Employee[]; // مصفوفة الموظفين
};

export default function CompanyDetailsPage() {
  const { companyid } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyid) return;

    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/companies/get-company/${companyid}`,
          {
            withCredentials: true,
          },
        );
        setCompany(res.data.company);
        setError(null);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Failed to fetch company details:", err);
          setError(
            err.response?.data?.message || "حدث خطأ في جلب بيانات الشركة",
          );
        } else {
          setError("حدث خطأ غير معروف");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyid]);

  const goBack = () => {
    router.push("/companies");
  };

  const goToEdit = () => {
    router.push(`/companies/edit/${companyid}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
            >
              <FaArrowRight />
              <span>العودة إلى قائمة الشركات</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-red-500 text-xl mb-4">⚠️ خطأ</div>
              <p className="text-gray-700">
                {error || "لم يتم العثور على الشركة"}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowRight />
              <span>العودة إلى القائمة</span>
            </button>
            <button
              onClick={goToEdit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaEdit />
              <span>تعديل البيانات</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaBuilding className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">بيانات الشركة</h1>
                  <p className="text-blue-100 mt-1">عرض كامل تفاصيل الشركة</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaBuilding className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      اسم الشركة (عربي)
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.Name}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaBuilding className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      اسم الشركة (إنجليزي)
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.NameEN || "—"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaBarcode className="w-5 h-5" />
                    <span className="text-sm font-medium">كود العميل</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.Customercode || "—"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaFileInvoice className="w-5 h-5" />
                    <span className="text-sm font-medium">التسجيل الضريبي</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.TaxRegistration}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <span className="text-sm font-medium">حالة النشاط</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {company.isActive ? "نشط" : "غير نشط"}
                  </p>
                </div>

                {/* حقل GPS */}
                {company.GPS &&
                  (company.GPS.Address || company.GPS.mapLink) && (
                    <div className="bg-gray-50 p-4 rounded-lg border md:col-span-2">
                      <div className="flex items-center gap-1 text-gray-600 mb-3">
                        <span className="text-sm font-medium">الموقع</span>
                        <FaMapMarkerAlt className="w-5 h-5" />
                      </div>
                      {company.GPS.Address && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-500 pl-2">
                            العنوان:
                          </span>
                          <span className="text-gray-900">
                            {company.GPS.Address}
                          </span>
                        </div>
                      )}
                      {company.GPS.mapLink && (
                        <div>
                          <span className="text-sm text-gray-500 pl-2">
                            رابط الخريطة:
                          </span>
                          <a
                            href={company.GPS.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                          >
                            <FaLink className="w-4 h-4" />
                            {company.GPS.mapLink}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* قسم الموظفين - تصميم محسن */}
              {company.employees && company.employees.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      قائمة الموظفين
                    </h2>
                    <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {company.employees.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {company.employees.map((employee, idx) => (
                      <div
                        key={idx}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                      >
                        {/* رأس البطاقة */}
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 p-1.5 rounded-full">
                                <FaUser className="w-4 h-4 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-gray-800">
                                الموظف {idx + 1}
                              </h3>
                            </div>
                            {employee.role && (
                              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full">
                                {employee.role}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* محتوى البطاقة */}
                        <div className="p-5 space-y-4">
                          {/* اسم الموظف */}
                          <div className="flex items-start gap-3">
                            <div className="text-gray-400 mt-0.5">
                              <FaUser className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-0.5">
                                الاسم
                              </div>
                              <div className="text-gray-800 font-medium">
                                {employee.name || "—"}
                              </div>
                            </div>
                          </div>

                          {/* أرقام الهواتف */}
                          {employee.number && employee.number.length > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="text-gray-400 mt-0.5">
                                <FaPhoneAlt className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500 mb-1">
                                  أرقام الهواتف
                                </div>
                                <ul className="space-y-1">
                                  {employee.number.map((phone, phoneIdx) => (
                                    <li
                                      key={phoneIdx}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                      <span
                                        dir="ltr"
                                        className="text-gray-700 text-sm"
                                      >
                                        {phone}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* في حال عدم وجود أي بيانات */}
                          {!employee.name &&
                            (!employee.number ||
                              employee.number.length === 0) && (
                              <div className="text-center text-gray-400 text-sm py-2">
                                لا توجد بيانات إضافية
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 text-sm text-gray-500 border-t pt-6">
                <p>• جميع البيانات معروضة كما هي في قاعدة البيانات</p>
                <p>• يمكنك العودة إلى القائمة أو تعديل البيانات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
