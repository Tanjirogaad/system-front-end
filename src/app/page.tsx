import {
  FaMoneyBillWave,
  FaClock,
  FaFingerprint,
  FaExclamationTriangle,
  FaClipboardList,
} from "react-icons/fa";
import Link from "next/link";

export default function CompanyRules() {
  const rules = [
    {
      title: "سياسة السلف",
      description:
        "لا تُصرف أي سلفة إلا بعد اليوم 15 من الشهر، وبموافقة مجلس الإدارة. ويُحدد مبلغ السلفة وفقًا لما يقرره المجلس.",
      icon: <FaMoneyBillWave className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "الوقت الإضافي",
      description: "لا يُحتسب أي وقت إضافي إلا بموافقة المدير المباشر.",
      icon: <FaClock className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "تسجيل الحضور",
      description:
        "في حال نسيان تسجيل بصمة الحضور أو الانصراف، يُحتسب الموظف غائبًا.",
      icon: <FaFingerprint className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "سياسة التأخير",
      description:
        "مدة التأخير المسموح بها هي 30 دقيقة. أي تأخير عن 30 دقيقة في الحضور أو الانصراف يُحتسب متأخر.",
      icon: <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mb-3 sm:mb-4">
              <FaClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              📋 سياسة الشركة
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              هذه القواعد والإجراءات تساعدنا على الحفاظ على بيئة عمل منظمة
              وفعالة
            </p>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="group relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/80 p-4 sm:p-6 transform hover:-translate-y-1 hover:border-blue-200"
              >
                {/* linear overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/20 to-indigo-50/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex items-start gap-3 sm:gap-4">
                  {/* Icon Container */}
                  <div
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${rule.bgColor} ${rule.textColor} shadow-md shrink-0`}
                  >
                    {rule.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                        {rule.title}
                      </h3>
                      <span className="text-xs font-medium px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                        #{index + 1}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed text-justify">
                      {rule.description}
                    </p>

                    {/* Decorative Element */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/60">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="truncate">
                          الالتزام بهذه القواعد إلزامي لجميع الموظفين
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Link
            href={"/login"}
            className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>تسجيل الدخول للنظام</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
