import { AddressType } from "../Types/employee";
import { GOVERNORATES, AREAS_BY_GOVERNORATE } from "@/data";
import {
  FaCity,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaTrash,
  FaHome,
} from "react-icons/fa";

type Props = {
  Address: AddressType;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handlePhoneChange: (index: number, value: string) => void;
  addPhone: () => void;
  removePhone: (index: number) => void;
};

export default function Address({
  Address,
  handleChange,
  handlePhoneChange,
  addPhone,
  removePhone,
}: Props) {
  const areas = AREAS_BY_GOVERNORATE[Address.Governorate] || [];

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b-2 border-blue-500 inline-block">
        العنوان وبيانات الاتصال
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Governorate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            المحافظة
          </label>
          <div className="relative">
            <FaCity className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="Governorate"
              value={Address.Governorate}
              onChange={handleChange}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="">اختر المحافظة</option>
              {GOVERNORATES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            المنطقة
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
            <select
              name="Area"
              value={Address.Area}
              onChange={handleChange}
              disabled={!Address.Governorate}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">اختر المنطقة</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Address - full width */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            العنوان بالتفصيل
          </label>
          <div className="relative">
            <FaHome className="absolute right-3 top-4 text-gray-400 text-lg" />
            <textarea
              name="DetailedAddress"
              value={Address.DetailedAddress}
              onChange={handleChange}
              rows={3}
              className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="اكتب العنوان بالتفصيل..."
            />
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="md:col-span-2 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            أرقام الهاتف
          </label>

          <div className="space-y-3">
            {Address.PhoneNumbers.map((phone, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                {Address.PhoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="حذف الرقم"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPhone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <FaPlus />
            <span>إضافة رقم هاتف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
