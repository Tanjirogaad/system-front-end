"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { IoLogOut, IoClose, IoMenu } from "react-icons/io5";
import {
  FaBookReader,
  FaBuilding,
  FaCarSide,
  FaRegCalendarAlt,
  FaUser,
  FaUsers,
} from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      const refreshToken = localStorage.getItem("refreshToken") ?? "";
      const accessToken = localStorage.getItem("accessToken") ?? "";
      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/auth/logout`, {
        refreshToken,
        accessToken,
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.clear();
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.push("/");
    }
  };

  return (
    <>
      <nav className="w-full h-16 flex items-center justify-between px-2 sm:px-4 md:px-6 bg-linear-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
        {/* الجهة اليسرى: رابط السائقين + هامبرغر */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
          {/* زر القائمة للجوال */}
          <button
            type="button"
            aria-label={showMobileMenu ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={showMobileMenu}
            aria-controls="mobile-menu"
            className="p-2 mr-1 sm:hidden rounded-md text-white hover:bg-white/10 transition"
            onClick={() => setShowMobileMenu((s) => !s)}
          >
            {showMobileMenu ? <IoClose size={20} /> : <IoMenu size={20} />}
          </button>

          {/* رابط /employees/drivers (يظهر في جميع الأحجام) */}
          <Link
            href="/employee"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaUser aria-hidden />
            <span className="hidden sm:inline">الملف الشخصي</span>
          </Link>
          <Link
            href="/employees"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaUsers aria-hidden />
            <span className="hidden sm:inline">الموظفين</span>
          </Link>
          <Link
            href="/drivers"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaCarSide aria-hidden />
            <span className="hidden sm:inline">الموردين</span>
          </Link>
          <Link
            href="/companies"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaBuilding aria-hidden />
            <span className="hidden sm:inline">العملاء</span>
          </Link>
          <Link
            href="/companies/registerdays"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaRegCalendarAlt aria-hidden />
            <span className="hidden sm:inline">ايام التسجيل</span>
          </Link>
          <Link
            href="/drivers/report"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaCarSide aria-hidden />
            <span className="hidden sm:inline">تقرير المورد</span>
          </Link>
          <Link
            href="/companies/report"
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            <FaBuilding aria-hidden />
            <span className="hidden sm:inline">تقرير العميل</span>
          </Link>
        </div>

        {/* زر تسجيل الخروج */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2"
            aria-haspopup="dialog"
          >
            <IoLogOut aria-hidden />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </nav>

      {/* القائمة الجانبية للجوال */}
      {showMobileMenu && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
          className="sm:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0 rtl:translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                القائمة
              </h4>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="إغلاق"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="flex flex-col p-2">
              {/* رابط السائقين في القائمة الجانبية */}
              <Link
                href="/employee"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>الملف الشخصي</span>
                <FaUser aria-hidden />
              </Link>
              <Link
                href="/rules"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>سياسة الشركة</span>
                <FaBookReader aria-hidden />
              </Link>
              <Link
                href="/drivers"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>السائقين</span>
                <FaCarSide aria-hidden />
              </Link>
              <Link
                href="/companies"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>الشركات</span>
                <FaBuilding aria-hidden />
              </Link>
              <Link
                href="/companies/registerdays"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>ايام التسجيل</span>
                <FaRegCalendarAlt aria-hidden />
              </Link>
              <Link
                href="/employees"
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                <span>الموظفين</span>
                <FaUsers aria-hidden />
              </Link>
              <hr className="my-3 border-gray-200 dark:border-gray-700" />

              {/* زر تسجيل الخروج في القائمة الجانبية */}
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <span>تسجيل الخروج</span>
                <IoLogOut />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد تسجيل الخروج (بدون تغيير) */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3
                id="logout-title"
                className="text-xl font-bold text-gray-800 dark:text-gray-100"
              >
                تأكيد تسجيل الخروج
              </h3>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                aria-label="إغلاق"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 text-right">
              هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-3 rounded-lg bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <IoLogOut />
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
