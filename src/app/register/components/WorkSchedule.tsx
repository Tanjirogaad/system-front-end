import { WorkScheduleType } from "../Types/employee";
import { FaClock, FaBriefcaseMedical, FaUmbrellaBeach } from "react-icons/fa";

// أيام الأسبوع بالعربية
const WEEKDAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

type Props = {
  WorkSchedule: WorkScheduleType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  toggleTimeOff: (day: string) => void; // دالة لتبديل حالة اليوم
};

export default function WorkSchedule({
  WorkSchedule,
  handleChange,
  toggleTimeOff,
}: Props) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-500 inline-block">
        مواعيد العمل والإجازات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            بداية العمل
          </label>
          <div className="relative">
            <FaClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="time"
              name="StartTime"
              value={WorkSchedule.StartTime}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نهاية العمل
          </label>
          <div className="relative">
            <FaClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="time"
              name="EndTime"
              value={WorkSchedule.EndTime}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Sick Leave */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            رصيد الإجازات المرضية (أيام)
          </label>
          <div className="relative">
            <FaBriefcaseMedical className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="number"
              name="SickLeave"
              value={WorkSchedule.SickLeave}
              onChange={handleChange}
              min="0"
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="عدد الأيام"
            />
          </div>
        </div>

        {/* Annual Leave */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            رصيد الإجازات السنوية (أيام)
          </label>
          <div className="relative">
            <FaUmbrellaBeach className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="number"
              name="AnnualLeave"
              value={WorkSchedule.AnnualLeave}
              onChange={handleChange}
              min="0"
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="عدد الأيام"
            />
          </div>
        </div>

        {/* Time Off - أيام الإجازة الأسبوعية - أزرار */}
        <div className="md:col-span-2 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            أيام الإجازة الأسبوعية
          </label>

          <div className="flex flex-wrap gap-3">
            {WEEKDAYS.map((day) => {
              const isSelected = WorkSchedule.TimeOff.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleTimeOff(day)}
                  className={`px-4 py-2 rounded-lg border-2 transition font-medium ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            اختر أيام الإجازة الأسبوعية (يمكنك اختيار أكثر من يوم)
          </p>
        </div>
      </div>
    </div>
  );
}
