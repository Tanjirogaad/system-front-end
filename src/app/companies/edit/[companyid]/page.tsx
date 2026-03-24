"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import {
  FaArrowRight,
  FaSave,
  FaPlus,
  FaTrash,
  FaUserPlus,
} from "react-icons/fa";

// تعريف نوع بيانات الموظف
type Employee = {
  role: string;
  name: string;
  number: string[];
};

// تعريف نوع بيانات الشركة
type CompanyFormData = {
  Name: string;
  NameEN: string;
  Customercode: string;
  TaxRegistration: string;
  isActive: boolean;
  GPS: {
    Address: string;
    mapLink: string;
  };
  employees: Employee[];
};

export default function EditCompanyPage() {
  const { companyid } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyFormData>({
    Name: "",
    NameEN: "",
    Customercode: "",
    TaxRegistration: "",
    isActive: false,
    GPS: {
      Address: "",
      mapLink: "",
    },
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // جلب بيانات الشركة الحالية
  useEffect(() => {
    if (!companyid) return;

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/companies/get-company/${companyid}`,
        );
        const company = res.data.company;
        setFormData({
          Name: company.Name || "",
          NameEN: company.NameEN || "",
          Customercode: company.Customercode || "",
          TaxRegistration: company.TaxRegistration || "",
          isActive: company.isActive || false,
          GPS: {
            Address: company.GPS?.Address || "",
            mapLink: company.GPS?.mapLink || "",
          },
          employees: company.employees || [], // تأكد من أن API يعيد employees كمصفوفة
        });
        setError(null);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
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

    fetchCompany();
  }, [companyid]);

  // دوال إدارة الموظفين
  const addEmployee = () => {
    setFormData((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        { role: "", name: "", number: [] }, // موظف جديد فارغ
      ],
    }));
  };

  const removeEmployee = (empIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      employees: prev.employees.filter((_, i) => i !== empIndex),
    }));
  };

  const handleEmployeeChange = (
    empIndex: number,
    field: keyof Omit<Employee, "number">,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.employees];
      updated[empIndex] = { ...updated[empIndex], [field]: value };
      return { ...prev, employees: updated };
    });
  };

  // دوال إدارة أرقام الهواتف لكل موظف
  const addPhoneNumber = (empIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.employees];
      updated[empIndex] = {
        ...updated[empIndex],
        number: [...updated[empIndex].number, ""],
      };
      return { ...prev, employees: updated };
    });
  };

  const removePhoneNumber = (empIndex: number, phoneIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.employees];
      updated[empIndex] = {
        ...updated[empIndex],
        number: updated[empIndex].number.filter((_, i) => i !== phoneIndex),
      };
      return { ...prev, employees: updated };
    });
  };

  const handlePhoneChange = (
    empIndex: number,
    phoneIndex: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.employees];
      const newNumbers = [...updated[empIndex].number];
      newNumbers[phoneIndex] = value;
      updated[empIndex] = { ...updated[empIndex], number: newNumbers };
      return { ...prev, employees: updated };
    });
  };

  // التعامل مع التغييرات في الحقول الأساسية والـ GPS
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("GPS.")) {
      const gpsField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        GPS: {
          ...prev.GPS,
          [gpsField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/companies/edit-company/${companyid}`,
        formData,
      );
      setSuccess("تم تحديث البيانات بنجاح");
      setTimeout(() => {
        router.push(`/companies/${companyid}`);
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "حدث خطأ أثناء التحديث");
      } else {
        setError("حدث خطأ غير معروف");
      }
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    router.push(`/companies/${companyid}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <FaArrowRight />
            <span>العودة إلى تفاصيل الشركة</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white">
              <h1 className="text-2xl font-bold">تعديل بيانات الشركة</h1>
              <p className="text-blue-100 mt-1">قم بتحديث المعلومات أدناه</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {success}
                </div>
              )}

              {/* الحقول الأساسية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الشركة (عربي) *
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الشركة (إنجليزي) *
                </label>
                <input
                  type="text"
                  name="NameEN"
                  value={formData.NameEN}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كود العميل *
                </label>
                <input
                  type="text"
                  name="Customercode"
                  value={formData.Customercode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التسجيل الضريبي *
                </label>
                <input
                  type="text"
                  name="TaxRegistration"
                  value={formData.TaxRegistration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  الشركة نشطة
                </label>
              </div>

              {/* قسم الموقع الجغرافي */}
              <div className="border-t pt-4 mt-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  الموقع الجغرافي
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العنوان
                    </label>
                    <input
                      type="text"
                      name="GPS.Address"
                      value={formData.GPS.Address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مثال: شارع النيل، القاهرة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الخريطة
                    </label>
                    <input
                      type="url"
                      name="GPS.mapLink"
                      value={formData.GPS.mapLink}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* قسم الموظفين */}
              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    قائمة الموظفين
                  </h3>
                  <button
                    type="button"
                    onClick={addEmployee}
                    className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaUserPlus />
                    <span>إضافة موظف</span>
                  </button>
                </div>

                {formData.employees.length === 0 && (
                  <p className="text-gray-500 text-sm py-2">
                    لا يوجد موظفين مضافين. اضغط إضافة موظف لإضافة موظف جديد.
                  </p>
                )}

                {formData.employees.map((employee, empIdx) => (
                  <div
                    key={empIdx}
                    className="border border-gray-200 rounded-lg p-4 mb-4 relative bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => removeEmployee(empIdx)}
                      className="absolute text-lg top-[-10] right-[-15] text-red-500 hover:text-red-700"
                      aria-label="حذف الموظف"
                    >
                      <FaTrash /> 
                    </button>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الدور الوظيفي
                        </label>
                        <input
                          type="text"
                          value={employee.role}
                          onChange={(e) =>
                            handleEmployeeChange(empIdx, "role", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="مثال: مدير مبيعات"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الموظف
                        </label>
                        <input
                          type="text"
                          value={employee.name}
                          onChange={(e) =>
                            handleEmployeeChange(empIdx, "name", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="مثال: أحمد محمد"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          أرقام الهواتف
                        </label>
                        {employee.number.map((phone, phoneIdx) => (
                          <div key={phoneIdx} className="flex gap-2 mb-2">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) =>
                                handlePhoneChange(
                                  empIdx,
                                  phoneIdx,
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`رقم الهاتف ${phoneIdx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removePhoneNumber(empIdx, phoneIdx)
                              }
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              aria-label="حذف الرقم"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPhoneNumber(empIdx)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                          <FaPlus />
                          <span>إضافة رقم هاتف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
