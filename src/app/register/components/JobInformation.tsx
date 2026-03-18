import { DEPARTMENTS, EMPLOYEE_STATUS } from "@/data";
import { JobInformationType } from "../Types/employee";
import {
  FaBarcode,
  FaBuilding,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarCheck,
  FaToggleOn,
  FaUsers,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

type Props = {
  JobInformation: JobInformationType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleManagerChange: (index: number, value: string) => void;
  addManager: () => void;
  removeManager: (index: number) => void;
};

export default function JobInformation({
  JobInformation,
  handleChange,
  handleManagerChange,
  addManager,
  removeManager,
}: Props) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-500 inline-block">
        معلومات الوظيفة
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee Code */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            كود الموظف
          </label>
          <div className="relative">
            <FaBarcode className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="EmployeeCode"
              value={JobInformation.EmployeeCode}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل كود الموظف"
            />
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            القسم
          </label>
          <div className="relative">
            <FaBuilding className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="Department"
              value={JobInformation.Department}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر القسم</option>
              {DEPARTMENTS.map((department: string) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            المسمى الوظيفي
          </label>
          <div className="relative">
            <FaBriefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="JobTitle"
              value={JobInformation.JobTitle}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل المسمى الوظيفي"
            />
          </div>
        </div>

        {/* Work Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            مكان العمل
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              name="WorkLocation"
              value={JobInformation.WorkLocation}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="أدخل مكان العمل"
            />
          </div>
        </div>

        {/* Hiring Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاريخ التعيين
          </label>
          <div className="relative">
            <FaCalendarCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="date"
              name="HiringDate"
              value={JobInformation.HiringDate}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Employment Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الحالة الوظيفية
          </label>
          <div className="relative">
            <FaToggleOn className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="EmploymentStatus"
              value={JobInformation.EmploymentStatus}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر الحالة</option>
              {EMPLOYEE_STATUS.map((status: string) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Direct Managers - متعدد */}
        <div className="md:col-span-2 lg:col-span-3 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            المدراء المباشرون
          </label>

          <div className="space-y-3">
            {JobInformation.DirectManagers.map((manager, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <FaUsers className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => handleManagerChange(index, e.target.value)}
                    className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="أدخل اسم المدير المباشر"
                  />
                </div>
                {JobInformation.DirectManagers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeManager(index)}
                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="حذف المدير"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addManager}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <FaPlus />
            <span>إضافة مدير مباشر</span>
          </button>
          <p className="text-xs text-gray-500 mt-1">
            يمكنك إضافة أكثر من مدير مباشر
          </p>
        </div>
      </div>
    </div>
  );
}
