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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        // First attempt to get profile
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/employee/profile`,
          {
            withCredentials: true, // sends cookies (access & refresh tokens)
          },
        );

        if (isMounted) {
          setEmployee(res.data.employee);
          setError(null);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;

          // Access token expired – try to refresh
          if (message === "access token expired") {
            try {
              // Refresh token request – the refresh token is automatically sent via cookie
              await axios.post(
                `${process.env.NEXT_PUBLIC_API}/api/auth/refresh-token`,
                {}, // empty body; token comes from cookie
                { withCredentials: true },
              );

              // Retry the original request after successful refresh
              const retryRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/api/employee/profile`,
                { withCredentials: true },
              );

              if (isMounted) {
                setEmployee(retryRes.data.employee);
                setError(null);
              }
            } catch (refreshError) {
              console.log(refreshError);
              if (isMounted) {
                setError("Session expired. Please log in again.");
                // Optionally redirect after a short delay
                setTimeout(() => router.push("/"), 2000);
              }
            }
          } else if (message === "refresh token expired") {
            // Refresh token is invalid or missing
            if (isMounted) {
              setError("Session expired. Please log in again.");
              setTimeout(() => router.push("/"), 2000);
            }
          } else {
            // Other errors (e.g., network, server error)
            if (isMounted) {
              router.push("/");
            }
          }
        } else {
          // Non-Axios error (shouldn't happen often)
          if (isMounted) {
            setError("An unexpected error occurred.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }
  if (!employee) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="w-full p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Name */}
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

          {/* Employee Code */}
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

          {/* Annual Leave Balance */}
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
