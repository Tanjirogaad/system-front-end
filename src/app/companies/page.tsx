"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import { FaBuilding, FaSearch, FaFileAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";

type Company = {
  _id: string; // ✅ إضافة _id
  Name: string;
  NameEN: string;
  Customercode: string;
  TaxRegistration: string;
};

export default function Companies() {
  const router = useRouter(); // ✅ إنشاء كائن router
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/companies/get-companies`,
      );
      setCompanies(res.data.companies || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to fetch companies:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (comp) =>
      comp.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.NameEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.Customercode || "").includes(searchTerm) ||
      (comp.TaxRegistration || "").includes(searchTerm),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaBuilding className="w-8 h-8 text-blue-600" />
              إدارة الشركات
            </h1>
            <p className="text-gray-600 mt-2">
              قم بإدارة وتنظيم بيانات الشركات المسجلة في النظام
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    قائمة الشركات
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    إجمالي الشركات: {companies.length}
                  </p>
                </div>

                <div className="relative w-full md:w-auto">
                  <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الشركة أو كود العميل أو التسجيل الضريبي..."
                    className="w-full md:w-80 py-3 pr-10 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "لا توجد نتائج للبحث"
                      : "لا توجد شركات مسجلة بعد"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          #
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          اسم الشركة
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          اسم الشركة بالانجليزية
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          كود العميل
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          التسجيل الضريبي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCompanies.map((comp, index) => (
                        <tr
                          key={comp._id} // ✅ استخدام _id كمفتاح
                          onClick={() => router.push(`/companies/${comp._id}`)} // ✅ التنقل عند النقر
                          className="cursor-pointer hover:bg-gray-50"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              router.push(`/companies/${comp._id}`);
                            }
                          }}
                        >
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {comp.Name}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {comp.NameEN || "-"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {comp.Customercode || "-"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {comp.TaxRegistration || "-"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              • الحقول المطلوبة مع علامة * إلزامية (اسم الشركة، اسم الشركة
              بالانجليزية، والتسجيل الضريبي)
            </p>
            <p>• كود العميل اختياري حالياً</p>
            <p>• تم إزالة خيارات التعديل والحذف من الواجهة كما طلبت</p>
          </div>
        </div>
      </div>
    </>
  );
}
