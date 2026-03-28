"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import { FaArrowRight, FaSave, FaPlus, FaTrash } from "react-icons/fa";

type DriverFormData = {
  name: string;
  nameEN: string;
  Customercode: string;
  isActive: boolean;
  BankAccountNumber: string;
  PhoneNumbers: string[];
  VehicleImages: string[];
  VehicleLicense: string;
};

export default function EditDriverPage() {
  const { driverid } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    nameEN: "",
    Customercode: "",
    isActive: false,
    BankAccountNumber: "",
    PhoneNumbers: [],
    VehicleImages: [],
    VehicleLicense: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // جلب بيانات السائق الحالية
  useEffect(() => {
    if (!driverid) return;

    const fetchDriver = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/driver/get-driver/${driverid}`,
          {
            withCredentials: true,
          },
        );
        const driver = res.data.driver;
        setFormData({
          name: driver.name || "",
          nameEN: driver.nameEN || "",
          Customercode: driver.Customercode || "",
          isActive: driver.isActive || false,
          BankAccountNumber: driver.BankAccountNumber || "",
          PhoneNumbers: driver.PhoneNumbers || [],
          VehicleImages: driver.VehicleImages || [],
          VehicleLicense: driver.VehicleLicense || "",
        });
        setError(null);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "حدث خطأ في جلب بيانات السائق",
          );
        } else {
          setError("حدث خطأ غير معروف");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverid]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // إدارة PhoneNumbers
  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...formData.PhoneNumbers];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, PhoneNumbers: updated }));
  };
  const addPhone = () => {
    setFormData((prev) => ({
      ...prev,
      PhoneNumbers: [...prev.PhoneNumbers, ""],
    }));
  };
  const removePhone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      PhoneNumbers: prev.PhoneNumbers.filter((_, i) => i !== index),
    }));
  };

  // إدارة VehicleImages
  const handleImageChange = (index: number, value: string) => {
    const updated = [...formData.VehicleImages];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, VehicleImages: updated }));
  };
  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      VehicleImages: [...prev.VehicleImages, ""],
    }));
  };
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      VehicleImages: prev.VehicleImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/driver/edit-driver/${driverid}`,
        formData,
      );
      setSuccess("تم تحديث البيانات بنجاح");
      setTimeout(() => {
        router.push(`/drivers/${driverid}`);
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
    router.push(`/drivers/${driverid}`);
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
            <span>العودة إلى تفاصيل السائق</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white">
              <h1 className="text-2xl font-bold">تعديل بيانات السائق</h1>
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
                  الاسم (عربي) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم (إنجليزي) *
                </label>
                <input
                  type="text"
                  name="nameEN"
                  value={formData.nameEN}
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
                  السائق نشط
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الحساب البنكي
                </label>
                <input
                  type="text"
                  name="BankAccountNumber"
                  value={formData.BankAccountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* أرقام الهاتف */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أرقام الهاتف
                </label>
                {formData.PhoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`رقم ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhone}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaPlus /> إضافة رقم هاتف
                </button>
              </div>

              {/* رخصة المركبة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رخصة المركبة (رابط)
                </label>
                <input
                  type="url"
                  name="VehicleLicense"
                  value={formData.VehicleLicense}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/license.pdf"
                />
              </div>

              {/* صور المركبة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صور المركبة (روابط)
                </label>
                {formData.VehicleImages.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`رابط الصورة ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaPlus /> إضافة صورة
                </button>
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
