"use client";

import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import Image from "next/image";

export default function Login() {
  const router = useRouter();

  const [account, setAccount] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) return;

      try {
        await axios.get(`${process.env.NEXT_PUBLIC_API}/api/employee/profile`, {
          headers: { accessToken },
        });
        router.replace("/employee");
      } catch (err: unknown) {
        console.log(err);
        if (!refreshToken) {
          localStorage.clear();
          return;
        }

        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/api/employee/refresh-token`,
            { refreshToken },
          );

          if (res?.data?.accessToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            router.replace("/employee");
          } else {
            localStorage.clear();
          }
        } catch (err: unknown) {
          console.log(err);
          localStorage.clear();
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setAccount((prev) => ({ ...prev, [name]: value }));

    if (name === "email" || name === "password") {
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!account.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(account.email)) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/auth/login`,
        account,
      );

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      router.replace("/employee");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;

        if (status === 401) {
          setErrors((prev) => ({
            ...prev,
            password: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          }));
        } else if (status === 404) {
          setErrors((prev) => ({ ...prev, email: "المستخدم غير موجود" }));
        } else {
          alert("خطأ: " + (error.response.data?.message || status));
        }
      } else {
        alert("حدث خطأ أثناء تسجيل الدخول");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              autoComplete="on"
            >
              {/* Email */}
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
                    className="w-full px-6 py-3 border rounded-xl text-sm text-gray-800 border-gray-200"
                    placeholder="example@bluebird.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
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
                    className="w-full px-6 py-3 border rounded-xl text-sm text-gray-800 border-gray-200"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "اخفاء كلمة المرور" : "اظهار كلمة المرور"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}

                <div className="mt-3 text-left">
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
