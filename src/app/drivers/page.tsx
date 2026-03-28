"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // ✅ إضافة
import Loading from "@/app/components/Loading";
import { FaUser, FaSearch, FaFileAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";

type Driver = {
  _id: string;
  name: string;
  nameEN: string;
  Customercode: string;
};

export default function Drivers() {
  const router = useRouter(); // ✅
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/driver/get-drivers`,
        {
          withCredentials: true,
        },
      );
      setDrivers(res.data.drivers || []);
      setError(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to fetch drivers:", err);
        setError(
          err.response?.data?.message || "حدث خطأ في جلب بيانات الموردين",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const name = driver.name || "";
    const nameEN = driver.nameEN || "";
    const customerCode = driver.Customercode || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nameEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerCode.toString().includes(searchTerm)
    );
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* العنوان */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaUser className="w-8 h-8 text-blue-600" />
              إدارة الموردين
            </h1>
            <p className="text-gray-600 mt-2">
              قم بإدارة وتنظيم بيانات الموردين المسجلين في النظام
            </p>
          </div>

          {/* الرسائل */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* بطاقة قائمة الموردين */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              {/* شريط البحث والإحصائيات */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    قائمة الموردين
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    إجمالي الموردين: {drivers.length}
                  </p>
                </div>

                <div className="relative w-full md:w-auto">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم المورد أو كود العميل..."
                    className="w-full md:w-80 py-3 pr-10 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {filteredDrivers.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "لا توجد نتائج للبحث"
                      : "لا توجد سائقين مسجلين بعد"}
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
                          اسم المورد (عربي)
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          اسم المورد (إنجليزي)
                        </th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                          كود العميل
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDrivers.map((driver) => (
                        <tr
                          key={driver._id}
                          onClick={() => router.push(`/drivers/${driver._id}`)}
                          className="cursor-pointer hover:bg-gray-50"
                          role="button"
                          tabIndex={0}
                        >
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {filteredDrivers.findIndex(
                              (d) => d._id === driver._id,
                            ) + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.name}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.nameEN}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {driver.Customercode}
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

          {/* ملاحظات */}
          <div className="mt-8 text-sm text-gray-500">
            <p>• جميع الحقول مطلوبة وملزمة</p>
            <p>• كود العميل يجب أن يكون فريداً ولا يتكرر</p>
            <p>• تم تصميم الواجهة بنفس نمط إدارة الشركات كما طلبت</p>
          </div>
        </div>
      </div>
    </>
  );
}
