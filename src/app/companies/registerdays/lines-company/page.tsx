"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaBuilding,
} from "react-icons/fa";
import Navbar from "@/app/components/Navbar"
import Loading from "@/app/components/Loading";

// تعريف الواجهات
interface Company {
  _id: string;
  Name: string;
  NameEN?: string;
  isActive: boolean;
}

interface Line {
  _id: string;
  name: string;
  company: Company | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function LinesPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API || "";

  // حالات الشركات
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // حالات الخطوط
  const [lines, setLines] = useState<Line[]>([]);
  const [newLineName, setNewLineName] = useState("");
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [loadingLines, setLoadingLines] = useState(false);

  // جلب الشركات
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/companies/get-companies`);
        setCompanies(res.data.companies || []);
      } catch (error) {
        console.error("Failed to fetch companies", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [API_BASE]);

  // جلب الخطوط عند اختيار شركة
  useEffect(() => {
    if (!selectedCompanyId) {
      setLines([]);
      return;
    }
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/lines/get-lines?companyId=${selectedCompanyId}`,
        );
        setLines(res.data.lines || []);
      } catch (error) {
        console.error("Failed to fetch lines", error);
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
  }, [selectedCompanyId, API_BASE]);

  // إضافة خط جديد
  const addLine = async () => {
    if (!selectedCompanyId || !newLineName.trim()) return;
    try {
      await axios.post(`${API_BASE}/api/lines/create-line`, {
        name: newLineName,
        companyId: selectedCompanyId,
      });
      setNewLineName("");
      // إعادة جلب الخطوط
      const res = await axios.get(
        `${API_BASE}/api/lines/get-lines?companyId=${selectedCompanyId}`,
      );
      setLines(res.data.lines || []);
    } catch (error) {
      console.error("Failed to add line", error);
    }
  };

  // تحديث خط (بعد التعديل)
  const updateLine = async () => {
    if (!editingLine) return;
    try {
      await axios.put(`${API_BASE}/api/lines/update-line/${editingLine._id}`, {
        name: editingLine.name,
        isActive: editingLine.isActive,
      });
      setEditingLine(null);
      // إعادة جلب الخطوط
      const res = await axios.get(
        `${API_BASE}/api/lines/get-lines?companyId=${selectedCompanyId}`,
      );
      setLines(res.data.lines || []);
    } catch (error) {
      console.error("Failed to update line", error);
    }
  };

  // تبديل حالة الخط (تنشيط/تعطيل)
  const toggleLineActive = async (line: Line) => {
    try {
      await axios.put(`${API_BASE}/api/lines/update-line/${line._id}`, {
        isActive: !line.isActive,
      });
      // إعادة جلب الخطوط
      const res = await axios.get(
        `${API_BASE}/api/lines/get-lines?companyId=${selectedCompanyId}`,
      );
      setLines(res.data.lines || []);
    } catch (error) {
      console.error("Failed to toggle line", error);
    }
  };

  // حذف خط (تعطيل كامل) - يمكن استخدامها كبديل لـ toggleLineActive إذا أردت زر حذف منفصل
  // لكننا نستخدم toggleLineActive بدلاً من ذلك

  if (loadingCompanies) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBuilding className="text-blue-600" />
            إدارة الخطوط
          </h1>

          {/* اختيار الشركة */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <label className="block font-medium text-gray-700 mb-2">
              اختر الشركة
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- اختر شركة --</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.Name} {!company.isActive && "(غير نشط)"}
                </option>
              ))}
            </select>
          </div>

          {selectedCompanyId && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">الخطوط</h2>

              {/* إضافة خط جديد */}
              <div className="flex flex-wrap gap-2 mb-6">
                <input
                  type="text"
                  placeholder="اسم الخط الجديد"
                  value={newLineName}
                  onChange={(e) => setNewLineName(e.target.value)}
                  className="flex-1 min-w-[250px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addLine}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1 hover:bg-blue-700 transition"
                >
                  <FaPlus /> إضافة خط
                </button>
              </div>

              {/* جدول الخطوط */}
              {loadingLines ? (
                <Loading />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 border text-right">اسم الخط</th>
                        <th className="p-3 border text-right">الحالة</th>
                        <th className="p-3 border text-right">تاريخ الإنشاء</th>
                        <th className="p-3 border text-right">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr
                          key={line._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 border">
                            {editingLine?._id === line._id ? (
                              <input
                                type="text"
                                value={editingLine.name}
                                onChange={(e) =>
                                  setEditingLine({
                                    ...editingLine,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            ) : (
                              line.name
                            )}
                          </td>
                          <td className="p-3 border">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                line.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {line.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </td>
                          <td className="p-3 border text-sm text-gray-600">
                            {line.createdAt
                              ? new Date(line.createdAt).toLocaleDateString(
                                  "ar-EG",
                                )
                              : "-"}
                          </td>
                          <td className="p-3 border">
                            <div className="flex gap-3">
                              {editingLine?._id === line._id ? (
                                <>
                                  <button
                                    onClick={updateLine}
                                    className="text-green-600 hover:text-green-800 font-medium"
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => setEditingLine(null)}
                                    className="text-gray-600 hover:text-gray-800 font-medium"
                                  >
                                    إلغاء
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingLine(line)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="تعديل"
                                  >
                                    <FaEdit size={18} />
                                  </button>
                                  <button
                                    onClick={() => toggleLineActive(line)}
                                    className={`${
                                      line.isActive
                                        ? "text-red-600"
                                        : "text-green-600"
                                    } hover:opacity-80`}
                                    title={line.isActive ? "تعطيل" : "تفعيل"}
                                  >
                                    {line.isActive ? (
                                      <FaToggleOn size={20} />
                                    ) : (
                                      <FaToggleOff size={20} />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {lines.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center p-6 text-gray-500"
                          >
                            لا توجد خطوط لهذه الشركة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
