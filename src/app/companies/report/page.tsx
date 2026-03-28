"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChartBar } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Loading from "@/app/components/Loading";

const API_BASE = process.env.NEXT_PUBLIC_API || "";

interface Company {
  _id: string;
  Name: string;
}

interface LineReport {
  lineId: string;
  lineName: string;
  totalShifts: number;
  workingDays: number;
  totalExtra: number;
  totalDeduction: number;
  totalOvertime: number;
}

export default function CompanyReportPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [report, setReport] = useState<LineReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/companies/get-companies`, {
          withCredentials: true,
        });

        const comps: Company[] = res.data.companies || [];
        setCompanies(comps);

        setSelectedCompanyId((prev) => prev || comps[0]?._id || "");
      } catch (error) {
        console.error("Failed to fetch companies", error);
      }
    };

    fetchCompanies();
  }, []);

  const fetchReport = async () => {
    if (!selectedCompanyId) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/reports/company-report`, {
        params: {
          companyId: selectedCompanyId,
          month: selectedMonth,
          year: selectedYear,
        },
        withCredentials: true,
      });

      const rpt: LineReport[] = res.data.report || [];
      setReport(rpt);

      const initialPrices: Record<string, string> = {};
      rpt.forEach((r, idx) => {
        const rowKey = `${r.lineId}-${idx}`;
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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i,
  );

  const handlePriceChange = (rowKey: string, value: string) => {
    let cleaned = value.replace(/[^0-9.]/g, "");
    const firstDotIndex = cleaned.indexOf(".");
    if (firstDotIndex !== -1) {
      cleaned =
        cleaned.slice(0, firstDotIndex + 1) +
        cleaned.slice(firstDotIndex + 1).replace(/\./g, "");
    }
    setPrices((prev) => ({
      ...prev,
      [rowKey]: cleaned,
    }));
  };

  const getPriceNumber = (rowKey: string) => {
    const s = prices[rowKey] ?? "";
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };

  const computeRowTotal = (item: LineReport, price: number) => {
    return (
      item.totalShifts * price +
      item.totalExtra +
      item.totalOvertime -
      item.totalDeduction
    );
  };

  const grandTotal = report.reduce((acc, item, idx) => {
    const rowKey = `${item.lineId}-${idx}`;
    const price = getPriceNumber(rowKey);
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
            تقرير الشركة - عدد الورديات لكل خط
          </h1>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشركة
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر شركة</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشهر
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(parseInt(e.target.value, 10))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      شهر {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السنة
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(parseInt(e.target.value, 10))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchReport}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  عرض التقرير
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      #
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      اسم الخط
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      عدد الورديات
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      أيام العمل
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      إضافات
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      خصومات
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      سهر
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      سعر الورديه
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">
                      الإجمالي
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {report.length > 0 ? (
                    report.map((item, index) => {
                      const rowKey = `${item.lineId}-${index}`;
                      const priceStr = prices[rowKey] ?? "";
                      const priceNum = getPriceNumber(rowKey);
                      const totalForLine = computeRowTotal(item, priceNum);

                      return (
                        <tr key={rowKey} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-600">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {item.lineName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {item.totalShifts}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.workingDays}
                          </td>
                          <td className="py-3 px-4 text-green-600 font-medium">
                            {item.totalExtra.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-red-600 font-medium">
                            {item.totalDeduction.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-purple-600 font-medium">
                            {item.totalOvertime.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              className="w-24 px-3 py-2 border rounded-lg text-left"
                              value={priceStr}
                              onChange={(e) =>
                                handlePriceChange(rowKey, e.target.value)
                              }
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*"
                              placeholder="0"
                              style={{ MozAppearance: "textfield" }}
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {totalForLine.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-8 text-center text-gray-500"
                      >
                        لا توجد بيانات للعرض
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex justify-end gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">الإجمالي الكلي</div>
                <div className="text-2xl font-bold">
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
