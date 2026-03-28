"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaChartBar } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Loading from "@/app/components/Loading";

const API_BASE = process.env.NEXT_PUBLIC_API || "";

interface Driver {
  _id: string;
  name: string;
}

interface DriverReportItem {
  lineId: string;
  companyName: string;
  lineName: string;
  totalShifts: number;
  workingDays: number;
  totalExtra: number;
  totalDeduction: number;
  totalAdvance: number;
  totalOvertime: number;
}

export default function DriverReportPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [report, setReport] = useState<DriverReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/driver/get-drivers`, {
          withCredentials: true,
        });
        setDrivers(res.data.drivers || []);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
      }
    };

    fetchDrivers();
  }, []);

  const fetchReport = async () => {
    if (!selectedDriverId) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/reports/driver-report`, {
        params: {
          driverId: selectedDriverId,
          month: selectedMonth,
          year: selectedYear,
        },
        withCredentials: true,
      });

      const data: DriverReportItem[] = res.data.report || [];
      setReport(data);

      const initialPrices: Record<string, string> = {};
      data.forEach((item, idx) => {
        const rowKey = `${item.lineId}-${idx}`;
        initialPrices[rowKey] = "";
      });
      setPrices(initialPrices);
    } catch (error) {
      console.error("Failed to fetch report", error);
      setReport([]);
      setPrices({});
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (rowKey: string, value: string) => {
    let cleaned = value.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    setPrices((prev) => ({ ...prev, [rowKey]: cleaned }));
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i,
  );

  const parsePrice = (s: string) => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };

  const computeRowTotal = (item: DriverReportItem, price: number) => {
    return (
      item.totalShifts * price +
      item.totalExtra +
      item.totalOvertime -
      item.totalDeduction -
      item.totalAdvance
    );
  };

  const grandTotal = report.reduce((acc, item, idx) => {
    const rowKey = `${item.lineId}-${idx}`;
    const price = parsePrice(prices[rowKey] ?? "");
    return acc + computeRowTotal(item, price);
  }, 0);

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            تقرير السائق - عدد الورديات لكل شركة وخط
          </h1>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">اختر سائق</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    شهر {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchReport}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
              >
                عرض التقرير
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-auto">
            <table className="w-full min-w-[900px] text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">الشركة</th>
                  <th className="py-2 px-3">الخط</th>
                  <th className="py-2 px-3">الورديات</th>
                  <th className="py-2 px-3">أيام العمل</th>
                  <th className="py-2 px-3">إضافات</th>
                  <th className="py-2 px-3">خصومات</th>
                  <th className="py-2 px-3">سلف</th>
                  <th className="py-2 px-3">سهر</th>
                  <th className="py-2 px-3">السعر</th>
                  <th className="py-2 px-3">الإجمالي</th>
                </tr>
              </thead>

              <tbody>
                {report.length > 0 ? (
                  report.map((item, index) => {
                    const rowKey = `${item.lineId}-${index}`;
                    const priceStr = prices[rowKey] ?? "";
                    const priceNum = parsePrice(priceStr);
                    const total = computeRowTotal(item, priceNum);

                    return (
                      <tr key={rowKey} className="odd:bg-white even:bg-gray-50">
                        <td className="py-2 px-3">{index + 1}</td>
                        <td className="py-2 px-3">{item.companyName}</td>
                        <td className="py-2 px-3">{item.lineName}</td>
                        <td className="py-2 px-3">{item.totalShifts}</td>
                        <td className="py-2 px-3">{item.workingDays}</td>
                        <td className="py-2 px-3 text-green-600 font-medium">
                          {item.totalExtra.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-red-600 font-medium">
                          {item.totalDeduction.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-orange-600 font-medium">
                          {item.totalAdvance.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-purple-600 font-medium">
                          {item.totalOvertime.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            className="border px-2 py-1 rounded appearance-none w-24"
                            value={priceStr}
                            onChange={(e) =>
                              handlePriceChange(rowKey, e.target.value)
                            }
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            style={{ MozAppearance: "textfield" }}
                          />
                        </td>
                        <td className="py-2 px-3">{total.toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center py-6">
                      لا توجد بيانات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="p-4 border-t flex justify-end gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">الإجمالي الكلي</div>
                <div className="text-xl font-bold">
                  {grandTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
