"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import {
  FaUser,
  FaArrowRight,
  FaBarcode,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaMoneyBill,
  FaPhone,
  FaIdCard,
  FaImage,
} from "react-icons/fa";
import Image from "next/image";

type DriverDetails = {
  _id: string;
  name: string;
  nameEN: string;
  Customercode: string;
  isActive: boolean;
  BankAccountNumber?: string;
  PhoneNumbers?: string[];
  VehicleImages?: string[];
  VehicleLicense?: string;
};

export default function DriverDetailsPage() {
  const { driverid } = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverid) return;

    const fetchDriver = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/driver/get-driver/${driverid}`,
        );
        setDriver(res.data.driver);
        setError(null);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Failed to fetch driver details:", err);
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

  const goBack = () => {
    router.push("/drivers");
  };

  const goToEdit = () => {
    router.push(`/drivers/edit/${driverid}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !driver) {
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
              <span>العودة إلى قائمة السائقين</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-red-500 text-xl mb-4">⚠️ خطأ</div>
              <p className="text-gray-700">
                {error || "لم يتم العثور على السائق"}
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
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaUser className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">بيانات السائق</h1>
                  <p className="text-blue-100 mt-1">عرض كامل تفاصيل السائق</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم عربي */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaUser className="w-5 h-5" />
                    <span className="text-sm font-medium">الاسم (عربي)</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {driver.name}
                  </p>
                </div>

                {/* الاسم إنجليزي */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaUser className="w-5 h-5" />
                    <span className="text-sm font-medium">الاسم (إنجليزي)</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {driver.nameEN || "—"}
                  </p>
                </div>

                {/* كود العميل */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    <FaBarcode className="w-5 h-5" />
                    <span className="text-sm font-medium">كود العميل</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {driver.Customercode}
                  </p>
                </div>

                {/* حالة النشاط */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 text-gray-600 mb-2">
                    {driver.isActive ? (
                      <FaToggleOn className="w-5 h-5 text-green-600" />
                    ) : (
                      <FaToggleOff className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">حالة النشاط</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {driver.isActive ? "نشط" : "غير نشط"}
                  </p>
                </div>

                {/* رقم الحساب البنكي */}
                {driver.BankAccountNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <FaMoneyBill className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        رقم الحساب البنكي
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {driver.BankAccountNumber}
                    </p>
                  </div>
                )}

                {/* أرقام الهاتف */}
                {driver.PhoneNumbers && driver.PhoneNumbers.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <FaPhone className="w-5 h-5" />
                      <span className="text-sm font-medium">أرقام الهاتف</span>
                    </div>
                    <div className="space-y-1">
                      {driver.PhoneNumbers.map((phone, idx) => (
                        <p key={idx} className="text-gray-900">
                          {phone}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* رخصة المركبة */}
                {driver.VehicleLicense && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <FaIdCard className="w-5 h-5" />
                      <span className="text-sm font-medium">رخصة المركبة</span>
                    </div>
                    <a
                      href={driver.VehicleLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {driver.VehicleLicense}
                    </a>
                  </div>
                )}

                {/* صور المركبة */}
                {driver.VehicleImages && driver.VehicleImages.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border md:col-span-2">
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <FaImage className="w-5 h-5" />
                      <span className="text-sm font-medium">صور المركبة</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {driver.VehicleImages.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block border rounded-lg overflow-hidden hover:opacity-80 transition"
                        >
                          <Image
                            src={img}
                            alt={`Vehicle ${idx + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
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
