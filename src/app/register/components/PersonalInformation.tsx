import { PersonalInformationType } from "../Types/employee";
import { MARITAL_STATUS } from "@/data";
import {
  FaUser,
  FaIdCard,
  FaCalendarAlt,
  FaVenusMars,
  FaFlag,
  FaPrayingHands,
  FaHeart,
  FaCamera,
} from "react-icons/fa";

type Props = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  PersonalInformation: PersonalInformationType;
};

export default function PersonalInformation({
  PersonalInformation,
  handleChange,
}: Props) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-500 inline-block">
        البيانات الشخصية
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الاسم بالكامل
          </label>
          <div className="relative">
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="FullName"
              value={PersonalInformation.FullName}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل الاسم بالكامل"
            />
          </div>
        </div>

        {/* National ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            رقم الهوية
          </label>
          <div className="relative">
            <FaIdCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="NationalIDNumber"
              value={PersonalInformation.NationalIDNumber}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل الرقم القومي"
            />
          </div>
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاريخ الميلاد
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="date"
              name="DateOfBirth"
              value={PersonalInformation.DateOfBirth}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الجنس
          </label>
          <div className="relative">
            <FaVenusMars className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="Gender"
              value={PersonalInformation.Gender}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر الجنس</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الجنسية
          </label>
          <div className="relative">
            <FaFlag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="Nationality"
              value={PersonalInformation.Nationality}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Religion */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الديانة
          </label>
          <div className="relative">
            <FaPrayingHands className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="Religion"
              value={PersonalInformation.Religion}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الحالة الاجتماعية
          </label>
          <div className="relative">
            <FaHeart className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="MaritalStatus"
              value={PersonalInformation.MaritalStatus}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر الحالة الاجتماعية</option>
              {MARITAL_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Photo */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            الصورة الشخصية
          </label>
          <div className="relative">
            <FaCamera className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="file"
              name="PersonalPhoto"
              onChange={handleChange}
              className="w-full pr-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
