"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaIdCard,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";

type formData = {
  email: string;
  SocialInsuranceNumber: string;
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<formData>({
    email: "",
    SocialInsuranceNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: "",
    type: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // التحقق من صحة النموذج
  useEffect(() => {
    const validateForm = () => {
      // تحقق من أن جميع الحقول مملوءة
      if (
        !formData.email ||
        !formData.SocialInsuranceNumber ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        return false;
      }

      // تحقق من صحة البريد الإلكتروني
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        return false;
      }

      // تحقق من طول رقم التأمين الاجتماعي
      if (formData.SocialInsuranceNumber.trim().length < 5) {
        return false;
      }

      // تحقق من طول كلمة المرور
      if (formData.password.length < 6) {
        return false;
      }

      // تحقق من تطابق كلمات المرور
      if (formData.password !== formData.confirmPassword) {
        return false;
      }

      // تحقق من عدم وجود أخطاء
      if (Object.keys(errors).length > 0) {
        return false;
      }

      return true;
    };

    setIsFormValid(validateForm());
  }, [formData, errors]);

  // التحقق من قوة كلمة المرور
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 6) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "ضعيفة";
    if (passwordStrength < 75) return "متوسطة";
    return "قوية";
  };

  const validateField = useCallback(
    (name: string, value: string) => {
      const newErrors = { ...errors };

      switch (name) {
        case "email":
          if (!value) {
            newErrors.email = "البريد الإلكتروني مطلوب";
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            newErrors.email = "البريد الإلكتروني غير صالح";
          } else {
            delete newErrors.email;
          }
          break;

        case "SocialInsuranceNumber":
          if (!value.trim()) {
            newErrors.SocialInsuranceNumber = "رقم التأمين الاجتماعي مطلوب";
          } else if (value.trim().length < 5) {
            newErrors.SocialInsuranceNumber = "رقم التأمين الاجتماعي غير صالح";
          } else {
            delete newErrors.SocialInsuranceNumber;
          }
          break;

        case "password":
          if (!value) {
            newErrors.password = "كلمة المرور مطلوبة";
          } else if (value.length < 6) {
            newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
          } else {
            delete newErrors.password;
          }
          break;

        case "confirmPassword":
          if (!value) {
            newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
          } else if (value !== formData.password) {
            newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
          } else {
            delete newErrors.confirmPassword;
          }
          break;
      }

      setErrors(newErrors);
    },
    [errors, formData.password],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // التحقق الفوري عند التغيير (لكن ليس في أول render)
    if (value.trim() !== "") {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // التحقق النهائي قبل الإرسال
    const finalValidation = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.email) {
        newErrors.email = "البريد الإلكتروني مطلوب";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صالح";
      }

      if (!formData.SocialInsuranceNumber) {
        newErrors.SocialInsuranceNumber = "رقم التأمين الاجتماعي مطلوب";
      } else if (formData.SocialInsuranceNumber.trim().length < 5) {
        newErrors.SocialInsuranceNumber = "رقم التأمين الاجتماعي غير صالح";
      }

      if (!formData.password) {
        newErrors.password = "كلمة المرور مطلوبة";
      } else if (formData.password.length < 6) {
        newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setMessage({
          text: "يرجى تصحيح الأخطاء في النموذج",
          type: "error",
        });
        return false;
      }

      return true;
    };

    if (!finalValidation()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/api/employee/forgot-password`,
        {
          email: formData.email,
          SocialInsuranceNumber: formData.SocialInsuranceNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      );

      setMessage({
        text: response.data?.message || "تمت إعادة تعيين كلمة المرور بنجاح",
        type: "success",
      });

      // إعادة تعيين النموذج بعد النجاح
      setFormData({
        email: "",
        SocialInsuranceNumber: "",
        password: "",
        confirmPassword: "",
      });

      // إعادة التوجيه بعد 3 ثواني
      setTimeout(() => {
        router.replace("/");
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // الآن TypeScript يعرف أن error هو AxiosError
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "حدث خطأ أثناء إعادة تعيين كلمة المرور";

        setMessage({
          text: errorMessage,
          type: "error",
        });

        if (error.response?.status === 404) {
          setErrors((prev) => ({
            ...prev,
            email: "البريد الإلكتروني غير مسجل",
            SocialInsuranceNumber: "رقم التأمين الاجتماعي غير صحيح",
          }));
        }
      } else if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: "error",
        });
      } else {
        setMessage({
          text: "حدث خطأ غير معروف",
          type: "error",
        });
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
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-600 text-sm font-medium"
            >
              <FaArrowLeft />
              العودة لتسجيل الدخول
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-2xl text-blue-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                استعادة كلمة المرور
              </h1>
              <p className="text-gray-600 text-sm">
                أدخل بياناتك لإعادة تعيين كلمة المرور الخاصة بحسابك
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" />
                    البريد الإلكتروني المسجل
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                    placeholder="example@bluebird.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-sm" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* رقم التأمين الاجتماعي */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FaIdCard className="text-blue-500" />
                    رقم التأمين الاجتماعي
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="SocialInsuranceNumber"
                    value={formData.SocialInsuranceNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 ${
                      errors.SocialInsuranceNumber
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                    placeholder="أدخل رقم التأمين الاجتماعي"
                  />
                </div>
                {errors.SocialInsuranceNumber && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-sm" />
                    {errors.SocialInsuranceNumber}
                  </p>
                )}
              </div>

              {/* كلمة المرور الجديدة */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FaLock className="text-blue-500" />
                    كلمة المرور الجديدة
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                    placeholder="أدخل كلمة مرور جديدة"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {showPassword ? "إخفاء" : "عرض"}
                  </button>
                </div>

                {/* مؤشر قوة كلمة المرور */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">قوة كلمة المرور:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength < 50
                            ? "text-red-600"
                            : passwordStrength < 75
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، رقم، ورمز خاص
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-sm" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-3 border rounded-xl text-sm text-gray-800 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {showConfirmPassword ? "إخفاء" : "عرض"}
                  </button>
                </div>

                {/* تحقق من التطابق */}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <FaCheckCircle className="text-sm" />
                      كلمتا المرور متطابقتان
                    </p>
                  )}

                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-sm" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* رسائل النجاح/الخطأ */}
              {message.text && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {message.type === "success" ? (
                      <FaCheckCircle className="text-lg" />
                    ) : (
                      <FaExclamationTriangle className="text-lg" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              )}

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري إعادة تعيين كلمة المرور...
                  </span>
                ) : (
                  "إعادة تعيين كلمة المرور"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
