import React, { useState, useEffect } from "react";

// قائمة بالنصوص التي ستظهر وتتغير أثناء التحميل لمحاكاة عمليات النقل الذكي
const loadingMessages = [
  "جاري الاتصال بشبكة النقل الذكي...",
  "تحليل البيانات المرورية الحية...",
  "حساب أفضل المسارات والبدائل...",
  "تهيئة النظام اللوجستي للأسطول...",
  "مزامنة إحداثيات الخرائط النشطة...",
];

export default function App() {
  const [messageIndex, setMessageIndex] = useState(0);

  // تغيير النص كل 2.5 ثانية لإعطاء شعور بالتقدم والعمل المستمر
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white selection:bg-blue-500/30"
    >
      {/* منطقة المؤشرات الدوارة (Radar & Spinner) */}
      <div className="relative flex items-center justify-center mb-12 w-36 h-36">
        {/* موجات الرادار الخلفية (تعبر عن تتبع المركبات) */}
        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div
          className="absolute inset-4 rounded-full border border-purple-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* الدائرة الخارجية الدوارة */}
        <div
          className="absolute inset-2 rounded-full border-t-4 border-l-4 border-transparent border-t-blue-500 opacity-90 animate-spin"
          style={{ animationDuration: "1.5s" }}
        ></div>

        {/* الدائرة الداخلية المعاكسة */}
        <div
          className="absolute inset-5 rounded-full border-b-4 border-r-4 border-transparent border-b-purple-500 opacity-80 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        ></div>

        {/* الدائرة المركزية مع أيقونة الملاحة/المسار */}
        <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] z-10 relative overflow-hidden">
          {/* تأثير لمعان داخل الدائرة */}
          <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 to-purple-500/10 animate-pulse"></div>

          <svg
            className="w-9 h-9 text-blue-400 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* أيقونة خريطة/مسار مع دبوس موقع */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>

      {/* النصوص التوضيحية */}
      <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
        منصة النقل الذكي
      </h2>

      {/* حاوية النص المتغير بارتفاع ثابت لمنع اهتزاز الصفحة عند تغير النص */}
      <div className="h-8 flex items-center justify-center mb-8">
        <p
          key={messageIndex}
          className="text-slate-300 text-lg font-medium animate-[fadeIn_0.5s_ease-in-out]"
        >
          {loadingMessages[messageIndex]}
        </p>
      </div>

      {/* شريط التحميل المستمر (Indeterminate) + نقاط نبضية */}
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {/* شريط ذو إضاءة متحركة */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner relative">
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-linear-to-r from-transparent via-blue-500 to-transparent w-[200%] animate-[pulse_2s_ease-in-out_infinite] -translate-x-1/2"></div>
        </div>

        {/* نقاط تحميل سفلية */}
        <div className="flex gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full bg-blue-500/50 animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 rounded-full bg-purple-500/50 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 rounded-full bg-blue-500/50 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
