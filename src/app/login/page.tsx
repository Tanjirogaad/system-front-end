"use client";

import axios from "axios";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import Image from "next/image";
import Loading from "@/app/components/Loading";
// نوع بيانات الأخطاء
type FormErrors = {
  email: string;
  password: string;
  general?: string;
};

export default function Login() {
  const router = useRouter();
  const [account, setAccount] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "" });
  const [networkError, setNetworkError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // التحقق من صحة البريد الإلكتروني (تحسين الـ regex)
  const isValidEmail = (email: string) => {
    // يسمح بالبريد الإلكتروني القياسي، مع منع المسافات البادئة أو اللاحقة
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  // التحقق من صحة النموذج
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = { email: "", password: "" };
    let isValid = true;

    if (!account.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
      isValid = false;
    } else if (!isValidEmail(account.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
      isValid = false;
    }

    if (!account.password) {
      newErrors.password = "كلمة المرور مطلوبة";
      isValid = false;
    } else if (account.password.length < 6) {
      newErrors.password = "كلمة المرور قصيرة جداً (على الأقل 6 أحرف)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [account.email, account.password]);

  // تغيير الحقول
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAccount((prev) => ({ ...prev, [name]: value }));
      // مسح الخطأ الخاص بالحقل عند التعديل
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      // مسح الخطأ العام عند التعديل
      if (networkError) setNetworkError(null);
    },
    [errors, networkError],
  );

  // التحقق من حالة المصادقة عند تحميل الصفحة
  useEffect(() => {
    // إنشاء AbortController لإلغاء الطلبات عند إلغاء تحميل المكون
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const checkAuth = async () => {
      try {
        // محاولة جلب البروفايل
        await axios.get(`${process.env.NEXT_PUBLIC_API}/api/employee/profile`, {
          withCredentials: true,
          signal: abortController.signal,
        });
        // إذا نجح، المستخدم مسجل الدخول بالفعل
        router.replace("/employee");
        return;
      } catch (err) {
        // إذا كان الخطأ بسبب إلغاء الطلب، نتوقف
        if (axios.isCancel(err)) return;

        // إذا كان الخطأ 401 (غير مصرح) نحاول تجديد التوكن
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API}/api/employee/refresh-token`,
              {},
              { withCredentials: true, signal: abortController.signal },
            );
            // نجح التجديد - نوجه المستخدم
            router.replace("/employee");
            return;
          } catch (refreshErr) {
            // فشل التجديد - المستخدم غير مسجل
            if (axios.isCancel(refreshErr)) return;
            // نستمر في عرض صفحة تسجيل الدخول
          }
        }
        // أي خطأ آخر (شبكة، خادم، ...) نعتبر أن المستخدم غير مسجل
        // لكننا لا نعرض خطأ هنا لأنها مجرد فحص أولي
      } finally {
        // إنهاء حالة التحقق
        if (!abortController.signal.aborted) {
          setIsAuthChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      abortController.abort();
    };
  }, [router]);

  // دالة تسجيل الدخول
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setNetworkError(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/auth/login`,
        account,
        {
          withCredentials: true,
        },
      );

      // بعد نجاح تسجيل الدخول، السيرفر يضع الـ cookies
      // نوجه المستخدم إلى لوحة التحكم
      router.replace("/employee");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setNetworkError("لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك.");
        } else if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message;

          if (status === 401) {
            setErrors((prev) => ({
              ...prev,
              password: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            }));
          } else if (status === 404) {
            setErrors((prev) => ({ ...prev, email: "المستخدم غير موجود" }));
          } else {
            // عرض رسالة الخطأ العامة من الخادم أو رسالة افتراضية
            setNetworkError(
              typeof message === "string"
                ? message
                : "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.",
            );
          }
        } else {
          setNetworkError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
        }
      } else {
        setNetworkError("حدث خطأ غير معروف. يرجى المحاولة لاحقاً.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return <Loading />;
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-100/50 border border-white/20 overflow-hidden">
          <div className="h-2 bg-linear-to-r from-blue-600 to-indigo-600"></div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <Image
                src="/LOGOBLUEBIRD.png"
                alt="Blue Bird logo"
                width={320}
                height={120}
                priority
                className="mx-auto h-auto w-full max-w-[220px]"
              />

              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                تسجيل الدخول
              </h1>
              <p className="text-gray-600 text-sm">
                مرحباً بعودتك! يرجى إدخال بيانات حسابك
              </p>
            </div>

            {/* عرض الخطأ العام (مثل الشبكة) */}
            {networkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {networkError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              autoComplete="on"
              noValidate
            >
              {/* حقل البريد الإلكتروني */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" /> البريد الإلكتروني
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={account.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 transition-colors ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-1 disabled:opacity-60`}
                    placeholder="example@bluebird.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* حقل كلمة المرور */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <FaLock className="text-blue-500" /> كلمة المرور
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={account.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 transition-colors ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-1 disabled:opacity-60`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "اخفاء كلمة المرور" : "اظهار كلمة المرور"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}

                <div className="mt-3 text-left">
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
