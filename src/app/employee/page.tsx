"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import Navbar from "../components/Navbar";
import { FaUser, FaIdCard, FaCalendar } from "react-icons/fa";

type Employee = {
  FullName: string;
  EmployeeCode: number;
  AnnualLeave: number;
  role: string;
};

export default function Profile() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.push("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/employee/profile`,
          {
            headers: { accesstoken: accessToken },
          },
        );

        setEmployee(res.data.employee);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.data.message === "access token expired") {
            try {
              const refresh = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
                { refreshToken: localStorage.getItem("refreshToken") },
              );

              localStorage.setItem("accessToken", refresh.data.accessToken);

              // إعادة طلب البيانات بعد تحديث التوكن
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/api/employee/profile`,
                {
                  headers: { accesstoken: refresh.data.accessToken },
                },
              );

              setEmployee(res.data.employee);
            } catch {
              localStorage.clear();
              router.push("/");
            }
          } else if (error.response?.data.message === "refresh token expired") {
            localStorage.clear();
            router.push("/");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading || !employee) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="w-full p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* اسم الموظف */}
          <div className="flex items-center gap-4 rounded-xl bg-white shadow-md p-5 hover:shadow-lg transition">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600">
              <FaUser className="text-white text-xl" />
            </div>

            <div>
              <p className="text-sm text-gray-500">اسم الموظف</p>
              <p className="text-lg font-semibold text-gray-800">
                {employee.FullName}
              </p>
            </div>
          </div>

          {/* رقم الموظف */}
          <div className="flex items-center gap-4 rounded-xl bg-white shadow-md p-5 hover:shadow-lg transition">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-700">
              <FaIdCard className="text-white text-xl" />
            </div>

            <div>
              <p className="text-sm text-gray-500">رقم الموظف</p>
              <p className="text-lg font-semibold text-gray-800">
                {employee.EmployeeCode}
              </p>
            </div>
          </div>

          {/* رصيد الاجازات */}
          <div className="flex items-center gap-4 rounded-xl bg-white shadow-md p-5 hover:shadow-lg transition">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600">
              <FaCalendar className="text-white text-xl" />
            </div>

            <div>
              <p className="text-sm text-gray-500">رصيد الإجازات</p>
              <p className="text-lg font-semibold text-gray-800">
                {employee.AnnualLeave ?? 0} يوم
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
