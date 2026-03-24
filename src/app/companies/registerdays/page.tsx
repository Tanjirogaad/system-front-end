"use client";

import axios from "axios";
import { useState, useMemo, useEffect, useCallback } from "react";
import { FaBuilding } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Loading from "@/app/components/Loading";
import Link from "next/link";

// تعريف الواجهات (Types)
interface Action {
  type:
    | "extra"
    | "deduction"
    | "advance"
    | "cover"
    | "driverChange"
    | "overtime";
  reason?: string;
  amount: number;
  newDriverName?: string;
}
interface ShiftData {
  checkin: boolean;
  checkout: boolean;
  actions: Action[];
}
interface DayData {
  shifts: ShiftData[];
  note: string;
  lineId?: string;
}
interface Driver {
  id: number;
  _id: string;
  name: string;
  daysDataMap: Record<string, DayData[]>;
}
interface Company {
  _id: string;
  Name: string;
  NameEN?: string;
  isActive: boolean;
}
interface Line {
  _id: string;
  name: string;
  company: string;
  isActive: boolean;
}
interface Assignment {
  _id: string;
  driver: { _id: string; name: string };
  line: Line;
  startDate: string;
  endDate: string | null;
}
// واجهة للبيانات المستلمة من API الحضور
interface AttendanceDriver {
  driverId: {
    _id: string;
    name: string;
  };
  daysData: DayData[];
}

/* Popup types */
interface NotePopup {
  driverIndex: number;
  dayIndex: number;
  type: "note";
  noteText: string;
}
interface ActionPopup {
  driverIndex: number;
  dayIndex: number;
  shiftIndex: number;
  type:
    | "extra"
    | "deduction"
    | "advance"
    | "cover"
    | "driverChange"
    | "overtime";
  reason?: string;
  amount?: string;
  newDriverName?: string; // خاص للسائق البديل
}
type PopupData = NotePopup | ActionPopup | null;

/* Type guards */
const isNotePopup = (p: PopupData): p is NotePopup =>
  p !== null && p.type === "note";
const isActionPopup = (p: PopupData): p is ActionPopup =>
  p !== null && p.type !== "note";

// دوال مساعدة
const SHIFT_COUNT = 3;
const makeKey = (year: number, month: number) => `${year}-${month}`;

const createDefaultDaysData = (year: number, month: number): DayData[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, () => ({
    shifts: Array.from({ length: SHIFT_COUNT }, () => ({
      checkin: false,
      checkout: false,
      actions: [],
    })),
    note: "",
    // lineId غير محدد افتراضياً
  }));
};

const calculateDayValue = (day: DayData): number => {
  let total = 0;
  if (day.shifts) {
    day.shifts.forEach((shift) => {
      if (shift.checkin) total += 0.5;
      if (shift.checkout) total += 0.5;
    });
  }
  return total;
};

const calculateDriverTotals = (daysData: DayData[]) => {
  let totalDays = 0;
  let totalMoney = 0;
  daysData.forEach((day) => {
    totalDays += calculateDayValue(day);
    day.shifts?.forEach((shift) => {
      shift.actions?.forEach((a) => {
        if (a.type === "extra" || a.type === "overtime") totalMoney += a.amount;
        if (a.type === "deduction") totalMoney -= a.amount;
        if (a.type === "advance") totalMoney -= a.amount;
        if (a.type === "cover") totalMoney += a.amount;
      });
    });
  });
  return { totalDays: totalDays.toFixed(1), totalMoney };
};

const getActionStyle = (type: Action["type"]): string => {
  switch (type) {
    case "extra":
      return "bg-green-100 text-green-800";
    case "deduction":
      return "bg-red-100 text-red-800";
    case "advance":
      return "bg-orange-100 text-orange-800";
    case "cover":
      return "bg-blue-100 text-blue-800";
    case "driverChange":
      return "bg-purple-100 text-purple-800";
    case "overtime":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const getActionIcon = (type: Action["type"]): string => {
  switch (type) {
    case "extra":
      return "🟢";
    case "deduction":
      return "🔴";
    case "advance":
      return "🟠";
    case "cover":
      return "🔵";
    case "driverChange":
      return "🔄";
    case "overtime":
      return "⏰";
    default:
      return "⚪";
  }
};

// ===== CompanyRegister component =====
function CompanyRegister({
  companyId,
  companyName,
  month,
  year,
  disabled = false,
}: {
  companyId: string;
  companyName: string;
  month: number;
  year: number;
  disabled?: boolean;
}) {
  const API_BASE = process.env.NEXT_PUBLIC_API || "";
  const daysInMonth = new Date(year, month, 0).getDate();

  const weekDays = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  // الحالات الأساسية
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<PopupData>(null);

  // جلب خطوط الشركة
  useEffect(() => {
    if (!companyId) return;
    const fetchLines = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/lines/get-lines?companyId=${companyId}`,
        );
        setLines(res.data.lines || []);
      } catch (error) {
        console.error("Failed to fetch lines", error);
      }
    };
    fetchLines();
  }, [companyId, API_BASE]);

  // جلب التعيينات الخاصة بالشركة (من خلال الخطوط)
  useEffect(() => {
    if (!companyId || lines.length === 0) return;
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/driver-assignments/get-assignments`,
        );
        const allAssignments = res.data.assignments || [];
        // فلترة التعيينات التي تنتمي إلى خطوط هذه الشركة
        const lineIds = lines.map((l) => l._id);
        const filtered = allAssignments.filter((a: Assignment) =>
          lineIds.includes(a.line._id),
        );
        setAssignments(filtered);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      }
    };
    fetchAssignments();
  }, [companyId, lines, API_BASE]);

  // دالة مساعدة لاستخراج السائقين النشطين في هذا الشهر/السنة
  const getDriversForCurrentMonth = useCallback((): Driver[] => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const activeAssignments = assignments.filter((a) => {
      const start = new Date(a.startDate);
      const end = a.endDate ? new Date(a.endDate) : null;
      return start <= endOfMonth && (!end || end >= startOfMonth);
    });
    // استخدام Map لمنع التكرار، مع تعيين id مؤقت باستخدام index
    const driverMap = new Map();
    activeAssignments.forEach((a) => {
      if (!driverMap.has(a.driver._id)) {
        driverMap.set(a.driver._id, {
          id: driverMap.size, // معرف مؤقت (سيتم استبداله عند التحميل)
          _id: a.driver._id,
          name: a.driver.name,
          daysDataMap: {},
        });
      }
    });
    return Array.from(driverMap.values());
  }, [assignments, year, month]);

  // جلب بيانات الحضور المحفوظة من قاعدة البيانات
  const fetchAttendance = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/attendance/get-attendance`, {
        params: { companyId, month, year },
      });
      const saved = res.data.attendance;
      if (saved && saved.driversAttendance) {
        // تحويل البيانات المخزنة إلى state باستخدام الواجهة AttendanceDriver
        const loadedDrivers = saved.driversAttendance.map(
          (da: AttendanceDriver, index: number) => ({
            id: index, // مؤقت
            _id: da.driverId._id,
            name: da.driverId.name,
            daysDataMap: { [makeKey(year, month)]: da.daysData },
          }),
        );
        setDrivers(loadedDrivers);
      } else {
        // لا توجد بيانات سابقة، نبدأ بالسائقين النشطين فقط
        const activeDrivers = getDriversForCurrentMonth().map((d, index) => ({
          ...d,
          id: index, // إعادة تعيين المعرف المؤقت
          daysDataMap: {
            [makeKey(year, month)]: createDefaultDaysData(year, month),
          },
        }));
        setDrivers(activeDrivers);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // لا توجد بيانات، نبدأ بالسائقين النشطين
        const activeDrivers = getDriversForCurrentMonth().map((d, index) => ({
          ...d,
          id: index,
          daysDataMap: {
            [makeKey(year, month)]: createDefaultDaysData(year, month),
          },
        }));
        setDrivers(activeDrivers);
      } else {
        console.error("Failed to load attendance", error);
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, month, year, API_BASE, getDriversForCurrentMonth]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // حفظ البيانات
  const saveAttendance = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      const driversAttendance = drivers.map((driver) => ({
        driverId: driver._id,
        daysData: driver.daysDataMap[makeKey(year, month)] || [],
      }));
      await axios.post(`${API_BASE}/api/attendance/save-attendance`, {
        companyId,
        month,
        year,
        driversAttendance,
      });
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  // دوال التعديل على الأيام
  const toggleCheck = (
    driverIndex: number,
    dayIndex: number,
    shiftIndex: number,
    type: "checkin" | "checkout",
  ) => {
    if (disabled) return;
    setDrivers((prev) =>
      prev.map((driver, idx) => {
        if (idx !== driverIndex) return driver;
        const key = makeKey(year, month);
        const days =
          driver.daysDataMap[key] ?? createDefaultDaysData(year, month);
        const newDays = days.map((d, di) =>
          di !== dayIndex
            ? d
            : {
                ...d,
                shifts:
                  d.shifts?.map((s, si) =>
                    si !== shiftIndex ? s : { ...s, [type]: !s[type] },
                  ) ?? [],
              },
        );
        return {
          ...driver,
          daysDataMap: { ...driver.daysDataMap, [key]: newDays },
        };
      }),
    );
  };

  const openPopup = (
    driverIndex: number,
    dayIndex: number,
    shiftIndex: number | null,
    type:
      | "extra"
      | "deduction"
      | "advance"
      | "cover"
      | "note"
      | "driverChange"
      | "overtime",
  ) => {
    if (disabled) return;
    if (type === "note") {
      const driver = drivers[driverIndex];
      const key = makeKey(year, month);
      const days = driver?.daysDataMap[key] ?? [];
      setPopup({
        driverIndex,
        dayIndex,
        type: "note",
        noteText: days[dayIndex]?.note ?? "",
      });
      return;
    }
    if (shiftIndex === null) return;
    setPopup({
      driverIndex,
      dayIndex,
      shiftIndex,
      type,
      reason: type === "cover" ? "تغطية للمكتب" : "",
      amount: "",
      newDriverName: "",
    });
  };

  const saveAction = () => {
    if (disabled) return;
    if (!isActionPopup(popup)) return;
    const actionPopup = popup;

    const newAction: Action = {
      type: actionPopup.type,
      reason: actionPopup.reason,
      amount: Number(actionPopup.amount) || 0,
    };
    if (actionPopup.type === "driverChange") {
      newAction.newDriverName = actionPopup.newDriverName || "غير محدد";
      newAction.amount = 0;
    }

    setDrivers((prev) =>
      prev.map((driver, idx) => {
        if (idx !== actionPopup.driverIndex) return driver;
        const key = makeKey(year, month);
        const days =
          driver.daysDataMap[key] ?? createDefaultDaysData(year, month);
        const newDays = days.map((d, di) =>
          di !== actionPopup.dayIndex
            ? d
            : {
                ...d,
                shifts:
                  d.shifts?.map((s, si) =>
                    si !== actionPopup.shiftIndex
                      ? s
                      : { ...s, actions: [...(s.actions || []), newAction] },
                  ) ?? [],
              },
        );
        return {
          ...driver,
          daysDataMap: { ...driver.daysDataMap, [key]: newDays },
        };
      }),
    );
    setPopup(null);
  };

  const saveNote = () => {
    if (disabled) return;
    if (!isNotePopup(popup)) return;
    const notePopup = popup;

    setDrivers((prev) =>
      prev.map((driver, idx) => {
        if (idx !== notePopup.driverIndex) return driver;
        const key = makeKey(year, month);
        const days =
          driver.daysDataMap[key] ?? createDefaultDaysData(year, month);
        const newDays = days.map((d, di) =>
          di !== notePopup.dayIndex
            ? d
            : { ...d, note: notePopup.noteText || "" },
        );
        return {
          ...driver,
          daysDataMap: { ...driver.daysDataMap, [key]: newDays },
        };
      }),
    );
    setPopup(null);
  };

  const removeDriver = (driverIndex: number) => {
    if (disabled) return;
    setDrivers((prev) => prev.filter((_, i) => i !== driverIndex));
  };

  // حساب الإجماليات
  const grandTotals = useMemo(() => {
    let totalDays = 0;
    let totalMoney = 0;
    drivers.forEach((driver) => {
      const days = driver.daysDataMap[makeKey(year, month)] ?? [];
      const driverTotals = calculateDriverTotals(days);
      totalDays += parseFloat(driverTotals.totalDays);
      totalMoney += driverTotals.totalMoney;
    });
    return { totalDays: totalDays.toFixed(1), totalMoney };
  }, [drivers, year, month]);

  // دالة للحصول على اسم الخط من معرفه
  const getLineName = (lineId?: string) => {
    if (!lineId) return "بدون خط";
    return lines.find((l) => l._id === lineId)?.name || "خط غير معروف";
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 font-sans bg-gray-50" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {companyName} - شهر {month}، سنة {year}
          {disabled && (
            <span className="mr-3 text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded">
              (عرض فقط)
            </span>
          )}
        </h3>
        <button
          onClick={saveAttendance}
          disabled={saving || disabled}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
        >
          {saving ? "جاري الحفظ..." : "💾 حفظ البيانات"}
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm mb-6 flex gap-6 font-semibold text-gray-800">
        <span>إجمالي الأيام: {grandTotals.totalDays}</span>
        <span>صافي المبلغ: {grandTotals.totalMoney} ج</span>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-sm">
        <table className="w-full border-collapse bg-white min-w-[1400px]">
          <thead>
            <tr>
              <th className="border border-gray-200 p-3 bg-gray-100 text-gray-700 font-semibold text-sm">
                م
              </th>
              <th className="border border-gray-200 p-3 bg-gray-100 text-gray-700 font-semibold text-sm">
                اسم السائق
              </th>
              <th className="border border-gray-200 p-3 bg-gray-100 text-gray-700 font-semibold text-sm">
                الخط الحالي
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayName =
                  weekDays[new Date(year, month - 1, day).getDay()];
                return (
                  <th
                    key={i}
                    className="border border-gray-200 p-2 bg-gray-50 min-w-[300px] text-gray-700 text-sm"
                  >
                    <div>{day}</div>
                    <div className="text-xs">{dayName}</div>
                  </th>
                );
              })}
              <th className="border border-gray-200 p-3 bg-gray-100 text-gray-700 font-semibold text-sm">
                إجمالي السائق
              </th>
              <th className="border border-gray-200 p-3 bg-gray-100 text-gray-700 font-semibold text-sm">
                حذف
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, driverIndex) => {
              const days = driver.daysDataMap[makeKey(year, month)] ?? [];
              const driverTotals = calculateDriverTotals(days);
              return (
                <tr key={driver.id}>
                  <td className="border border-gray-200 p-2 align-top bg-white">
                    {driverIndex + 1}
                  </td>
                  <td className="border border-gray-200 p-2 align-top bg-white">
                    {driver.name}
                  </td>
                  <td className="border border-gray-200 p-2 align-top bg-white">
                    {(() => {
                      const activeAssignment = assignments.find(
                        (a) =>
                          a.driver._id === driver._id &&
                          (!a.endDate ||
                            new Date(a.endDate) >=
                              new Date(year, month - 1, 1)),
                      );
                      return activeAssignment
                        ? activeAssignment.line.name
                        : "-";
                    })()}
                  </td>

                  {days.map((day, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="border border-gray-200 p-2 align-top bg-white min-w-[300px]"
                    >
                      <div className="flex flex-col gap-2">
                        {/* عرض اسم الخط لهذا اليوم إذا كان متاحاً */}
                        <div className="text-xs text-blue-600 font-semibold">
                          خط: {getLineName(day.lineId)}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {day.shifts?.map((shift, shiftIndex) => (
                            <div
                              key={shiftIndex}
                              className="border-l last:border-l-0 border-gray-200 pl-1 pr-1"
                            >
                              <div className="text-xs font-bold mb-1 text-center">
                                وردية {["اولة", "ثانية", "ثالثة"][shiftIndex]}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <button
                                  className={`border-none text-white py-1 px-0 rounded text-xs font-medium transition-opacity ${
                                    shift.checkin
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                  onClick={() =>
                                    toggleCheck(
                                      driverIndex,
                                      dayIndex,
                                      shiftIndex,
                                      "checkin",
                                    )
                                  }
                                  disabled={disabled}
                                >
                                  ذهاب
                                </button>
                                <button
                                  className={`border-none text-white py-1 px-0 rounded text-xs font-medium transition-opacity ${
                                    shift.checkout
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                  onClick={() =>
                                    toggleCheck(
                                      driverIndex,
                                      dayIndex,
                                      shiftIndex,
                                      "checkout",
                                    )
                                  }
                                  disabled={disabled}
                                >
                                  عودة
                                </button>

                                <div className="flex flex-col gap-1 mt-1">
                                  <button
                                    className={`border-none bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "extra",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    إضافي
                                  </button>
                                  <button
                                    className={`border-none bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "deduction",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    خصم
                                  </button>
                                  <button
                                    className={`border-none bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "advance",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    سلفة
                                  </button>
                                  <button
                                    className={`border-none bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "cover",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    تغطية
                                  </button>
                                  <button
                                    className={`border-none bg-purple-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "driverChange",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    تغيير السائق
                                  </button>
                                  <button
                                    className={`border-none bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-medium ${
                                      disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      openPopup(
                                        driverIndex,
                                        dayIndex,
                                        shiftIndex,
                                        "overtime",
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    سهر / عودة إضافية
                                  </button>
                                </div>

                                {shift.actions?.map((a, i) => (
                                  <div
                                    key={i}
                                    className={`text-xs px-1 py-0.5 rounded mt-0.5 ${getActionStyle(a.type)}`}
                                  >
                                    {getActionIcon(a.type)}{" "}
                                    {a.type === "driverChange"
                                      ? a.newDriverName
                                      : a.reason}
                                    {a.amount > 0 && ` (${a.amount} ج)`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {day.note && (
                          <div className="text-xs px-1.5 py-1 rounded mt-1 bg-gray-100 text-gray-700">
                            📌 ملاحظة: {day.note}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <button
                            className={`border-none bg-gray-400 text-white px-2 py-0.5 rounded text-xs font-medium ${
                              disabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() =>
                              openPopup(driverIndex, dayIndex, null, "note")
                            }
                            disabled={disabled}
                          >
                            📝 ملاحظة
                          </button>
                          <div className="text-xs font-bold text-gray-800">
                            اليوم = {calculateDayValue(day)}
                          </div>
                        </div>
                      </div>
                    </td>
                  ))}

                  <td className="border border-gray-200 p-2 align-top bg-white">
                    <div className="flex flex-col gap-1 text-sm font-semibold text-gray-800">
                      <div>أيام: {driverTotals.totalDays}</div>
                      <div>صافي: {driverTotals.totalMoney} ج</div>
                    </div>
                  </td>

                  <td className="border border-gray-200 p-2 align-top bg-white">
                    <button
                      onClick={() => removeDriver(driverIndex)}
                      disabled={disabled}
                      className={`border-none bg-red-500 text-white px-3 py-1 rounded text-xs font-medium ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={3}
                className="border border-gray-200 p-3 bg-gray-100 font-semibold text-gray-700 text-center"
              >
                الإجمالي العام
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <td
                  key={i}
                  className="border border-gray-200 p-3 bg-gray-100"
                ></td>
              ))}
              <td className="border border-gray-200 p-3 bg-gray-100">
                <div className="flex flex-col gap-1 text-sm font-semibold text-gray-800">
                  <div>أيام: {grandTotals.totalDays}</div>
                  <div>صافي: {grandTotals.totalMoney} ج</div>
                </div>
              </td>
              <td className="border border-gray-200 p-3 bg-gray-100"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* popups (نفس الكود السابق) */}
      {isNotePopup(popup) && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              إضافة ملاحظة
            </h4>
            <textarea
              placeholder="اكتب ملاحظتك هنا..."
              value={popup.noteText}
              onChange={(e) =>
                setPopup((p) =>
                  isNotePopup(p) ? { ...p, noteText: e.target.value } : p,
                )
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3 min-h-[80px] resize-y"
            />
            <div className="flex gap-2.5">
              <button
                onClick={saveNote}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold"
              >
                حفظ
              </button>
              <button
                onClick={() => setPopup(null)}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isActionPopup(popup) && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-2xl">
            <h4 className="text-lg font-bold text-gray-800 mb-4">
              {popup.type === "driverChange" && "تغيير السائق"}
              {popup.type === "overtime" && "سهر / عودة إضافية"}
              {!["driverChange", "overtime"].includes(popup.type) &&
                "إضافة عملية"}{" "}
              - الوردية {popup.shiftIndex + 1}
            </h4>

            {popup.type !== "driverChange" && (
              <input
                placeholder="السبب"
                value={popup.reason ?? ""}
                disabled={popup.type === "cover"}
                onChange={(e) =>
                  setPopup((p) =>
                    isActionPopup(p) ? { ...p, reason: e.target.value } : p,
                  )
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3"
              />
            )}

            {popup.type !== "driverChange" && (
              <input
                placeholder="المبلغ"
                type="number"
                value={popup.amount ?? ""}
                onChange={(e) =>
                  setPopup((p) =>
                    isActionPopup(p) ? { ...p, amount: e.target.value } : p,
                  )
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3"
              />
            )}

            {popup.type === "driverChange" && (
              <input
                placeholder="اسم السائق البديل"
                value={popup.newDriverName ?? ""}
                onChange={(e) =>
                  setPopup((p) =>
                    isActionPopup(p)
                      ? { ...p, newDriverName: e.target.value }
                      : p,
                  )
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm mb-3"
              />
            )}

            <div className="flex gap-2.5">
              <button
                onClick={saveAction}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold"
              >
                حفظ
              </button>
              <button
                onClick={() => setPopup(null)}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// الصفحة الرئيسية (نفسها تقريباً مع إضافة companyId)
export default function RegisterDays() {
  const API_BASE = process.env.NEXT_PUBLIC_API || "";
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/api/companies/get-companies`;
        const response = await axios.get<{ companies: Company[] }>(url, {
          signal: controller.signal,
        });
        setCompanies(response.data.companies || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          const lowerMsg = error.message.toLowerCase();
          if (
            error.name === "CanceledError" ||
            lowerMsg.includes("canceled") ||
            lowerMsg.includes("cancelled")
          ) {
            return;
          }
        }
        console.error("Failed to fetch companies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
    return () => controller.abort();
  }, [API_BASE]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.NameEN?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        );
      if (!matchesSearch) return false;
      if (filterActive === "active") return company.isActive === true;
      if (filterActive === "inactive") return company.isActive === false;
      return true;
    });
  }, [companies, filterActive, searchTerm]);

  if (loading) return <Loading />;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FaBuilding className="text-blue-600" />
            سجل حضور الشركات
          </h1>
          <div className="flex justify-between">
            <p className="text-gray-600 mb-6">
              اضغط على اسم الشركة لعرض جدول الحضور والانصراف
            </p>
            <div>
              <Link
                className="mx-2 p-2 bg-blue-500 rounded text-white hover:bg-blue-500/90"
                href="/companies/registerdays/lines-company"
              >
                الخطوط
              </Link>
              <Link
                className="mx-2 p-2 bg-blue-500 rounded text-white hover:bg-blue-500/90"
                href="/companies/registerdays/driver-company"
              >
                الموردين
              </Link>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">الشهر:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    شهر {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">السنة:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">الحالة:</label>
              <select
                value={filterActive}
                onChange={(e) =>
                  setFilterActive(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              >
                <option value="all">الكل</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="بحث باسم الشركة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <details
                key={company._id}
                className={`rounded-xl shadow-sm border border-gray-200 open:shadow-lg transition-all ${
                  company.isActive ? "bg-white" : "bg-red-100 border-red-300 hover:bg-red-200"
                }`}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-blue-500" />
                    <div>
                      <span className="font-bold text-gray-800">
                        {company.Name}
                      </span>
                      {company.NameEN && (
                        <span className="text-sm text-gray-500 mr-2">
                          ({company.NameEN})
                        </span>
                      )}
                      <span
                        className={`mr-3 text-xs px-2 py-0.5 rounded ${
                          company.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {company.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-gray-100">
                  <CompanyRegister
                    companyId={company._id}
                    companyName={company.Name}
                    month={selectedMonth}
                    year={selectedYear}
                    disabled={!company.isActive}
                  />
                </div>
              </details>
            ))}

            {filteredCompanies.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-500">
                لا توجد شركات تطابق معايير البحث
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
