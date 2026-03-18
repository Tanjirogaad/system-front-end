import { EducationalQualificationsType } from "../Types/employee";
import { QUALIFICATION } from "@/data";
import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaCalendarAlt,
} from "react-icons/fa";

type Props = {
  EducationalQualifications: EducationalQualificationsType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
};

export default function EducationalQualifications({
  EducationalQualifications,
  handleChange,
}: Props) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-500 inline-block">
        المؤهلات الدراسية
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualification */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            المؤهل
          </label>
          <div className="relative">
            <FaGraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="Qualification"
              value={EducationalQualifications.Qualification}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر المؤهل</option>
              {QUALIFICATION.map((qualification) => (
                <option key={qualification} value={qualification}>
                  {qualification}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* University */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الجامعة
          </label>
          <div className="relative">
            <FaUniversity className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="University"
              value={EducationalQualifications.University}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="اسم الجامعة"
            />
          </div>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            التخصص
          </label>
          <div className="relative">
            <FaBookOpen className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="Specialization"
              value={EducationalQualifications.Specialization}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="التخصص الدراسي"
            />
          </div>
        </div>

        {/* Graduation Year */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            سنة التخرج
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="number"
              name="GraduationYear"
              value={EducationalQualifications.GraduationYear}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="مثال: 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
