"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimesCircle,
  FaBuilding,
  FaUser,
  FaRoad,
} from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Loading from "@/app/components/Loading";

// تعريف الواجهات
interface Driver {
  _id: string;
  name: string;
  nameEN?: string;
  isActive: boolean;
}

interface Line {
  _id: string;
  name: string;
  company: {
    _id: string;
    Name: string;
  };
  isActive: boolean;
}

interface Assignment {
  _id: string;
  driver: Driver;
  line: Line;
  startDate: string;
  endDate: string | null;
}

export default function AssignmentsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API || "";

  // حالات البيانات
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // حالات الفلترة
  const [filterDriverId, setFilterDriverId] = useState<string>("");
  const [filterLineId, setFilterLineId] = useState<string>("");

  // حالات إنشاء تعيين جديد
  const [newDriverId, setNewDriverId] = useState("");
  const [newLineId, setNewLineId] = useState("");
  const [newStartDate, setNewStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [creating, setCreating] = useState(false);

  // جلب السائقين النشطين
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/driver/get-drivers`);
        setDrivers(res.data.drivers?.filter((d: Driver) => d.isActive) || []);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
      }
    };
    fetchDrivers();
  }, [API_BASE]);

  // جلب الخطوط النشطة
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/lines/get-lines`);
        setLines(res.data.lines?.filter((l: Line) => l.isActive) || []);
      } catch (error) {
        console.error("Failed to fetch lines", error);
      }
    };
    fetchLines();
  }, [API_BASE]);

  // جلب التعيينات بناءً على الفلتر
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterDriverId) params.append("driverId", filterDriverId);
        if (filterLineId) params.append("lineId", filterLineId);
        const url = `${API_BASE}/api/driver-assignments/get-assignments${
          params.toString() ? `?${params}` : ""
        }`;
        const res = await axios.get(url);
        setAssignments(res.data.assignments || []);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [API_BASE, filterDriverId, filterLineId]);

  // إنشاء تعيين جديد
  const createAssignment = async () => {
    if (!newDriverId || !newLineId || !newStartDate) return;
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/api/driver-assignments/create-assignment`, {
        driverId: newDriverId,
        lineId: newLineId,
        startDate: newStartDate,
      });
      // إعادة تعيين النموذج
      setNewDriverId("");
      setNewLineId("");
      setNewStartDate(new Date().toISOString().split("T")[0]);
      // إعادة جلب التعيينات
      const params = new URLSearchParams();
      if (filterDriverId) params.append("driverId", filterDriverId);
      if (filterLineId) params.append("lineId", filterLineId);
      const res = await axios.get(
        `${API_BASE}/api/driver-assignments/get-assignments${
          params.toString() ? `?${params}` : ""
        }`,
      );
      setAssignments(res.data.assignments || []);
    } catch (error) {
      console.error("Failed to create assignment", error);
    } finally {
      setCreating(false);
    }
  };

  // إنهاء تعيين (مصححة)
  const endAssignment = async (assignmentId: string) => {
    const endDate = new Date().toISOString().split("T")[0]; // تاريخ اليوم
    try {
      await axios.put(
        `${API_BASE}/api/driver-assignments/end-assignment/${assignmentId}`,
        {
          endDate,
        },
      );
      // إعادة جلب التعيينات
      const params = new URLSearchParams();
      if (filterDriverId) params.append("driverId", filterDriverId);
      if (filterLineId) params.append("lineId", filterLineId);
      const res = await axios.get(
        `${API_BASE}/api/driver-assignments/get-assignments${
          params.toString() ? `?${params}` : ""
        }`,
      );
      setAssignments(res.data.assignments || []);
    } catch (error) {
      console.error("Failed to end assignment", error);
    }
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBuilding className="text-blue-600" />
            إدارة التعيينات (سائق على خط)
          </h1>

          {/* نموذج إنشاء تعيين جديد */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">تعيين جديد</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السائق
                </label>
                <select
                  value={newDriverId}
                  onChange={(e) => setNewDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر سائق</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الخط
                </label>
                <select
                  value={newLineId}
                  onChange={(e) => setNewLineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر خط</option>
                  {lines.map((line) => (
                    <option key={line._id} value={line._id}>
                      {line.name} ({line.company?.Name || "شركة غير معروفة"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ البدء
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <button
                  onClick={createAssignment}
                  disabled={creating || !newDriverId || !newLineId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <FaPlus /> {creating ? "جاري..." : "تعيين"}
                </button>
              </div>
            </div>
          </div>

          {/* فلترة */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">تصفية التعيينات</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السائق
                </label>
                <select
                  value={filterDriverId}
                  onChange={(e) => setFilterDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">كل السائقين</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الخط
                </label>
                <select
                  value={filterLineId}
                  onChange={(e) => setFilterLineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">كل الخطوط</option>
                  {lines.map((line) => (
                    <option key={line._id} value={line._id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>
              {(filterDriverId || filterLineId) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterDriverId("");
                      setFilterLineId("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    إلغاء الفلتر
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* جدول التعيينات */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-right">السائق</th>
                  <th className="p-3 border text-right">الخط</th>
                  <th className="p-3 border text-right">الشركة</th>
                  <th className="p-3 border text-right">تاريخ البدء</th>
                  <th className="p-3 border text-right">تاريخ النهاية</th>
                  <th className="p-3 border text-right">الحالة</th>
                  <th className="p-3 border text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((ass) => (
                  <tr key={ass._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-gray-500" size={14} />
                        {ass.driver?.name || "غير معروف"}
                      </div>
                    </td>
                    <td className="p-3 border">
                      <div className="flex items-center gap-1">
                        <FaRoad className="text-gray-500" size={14} />
                        {ass.line?.name || "غير معروف"}
                      </div>
                    </td>
                    <td className="p-3 border">
                      {ass.line?.company?.Name || "-"}
                    </td>
                    <td className="p-3 border">
                      {new Date(ass.startDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3 border">
                      {ass.endDate
                        ? new Date(ass.endDate).toLocaleDateString("ar-EG")
                        : "-"}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          !ass.endDate
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {!ass.endDate ? "نشط" : "منتهي"}
                      </span>
                    </td>
                    <td className="p-3 border">
                      {!ass.endDate && (
                        <button
                          onClick={() => endAssignment(ass._id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          title="إنهاء التعيين"
                        >
                          <FaTimesCircle /> إنهاء
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-gray-500">
                      لا توجد تعيينات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
