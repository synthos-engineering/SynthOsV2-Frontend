"use client";

import { Home, Award, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useActiveAccount } from "thirdweb/react";
import { usePoints } from "@/contexts/PointsContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();
  const account = useActiveAccount();
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const { lastRefresh } = usePoints();
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!account?.address) return;
      try {
        setIsLoadingPoints(true);
        const params = new URLSearchParams();
        if (account.address) params.append("address", account.address);
        const res = await fetch(`/api/points?${params.toString()}`);
        const data = await res.json();
        if (data.user) {
          const u = data.user;
          setTotalPoints(
            (u.pointsLogin || 0) +
              (u.pointsDeposit || 0) +
              (u.pointsFeedback || 0) +
              (u.pointsShareX || 0) +
              (u.pointsTestnetClaim || 0)
          );
        } else {
          setTotalPoints(null);
        }
      } catch (e) {
        setTotalPoints(null);
      } finally {
        setIsLoadingPoints(false);
      }
    };
    fetchPoints();
  }, [account, lastRefresh]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div
      className={`relative border-t xl:hidden z-[999] ${
        theme === "dark"
          ? "border-gray-800 bg-[#0f0b22]"
          : "border-gray-200 bg-[#f0eef9]"
      } transition-all duration-200 ${
        isScrolled ? "shadow-lg" : ""
      } rounded-t-[2rem]`}
    >
      <div className="flex justify-between items-end pt-5 pb-8 max-w-md mx-auto px-16 relative">
        {/* Home */}
        <Link
          href="/home"
          className={`flex flex-col items-center ${
            isActive("/home")
              ? "text-[#8266E6"
              : theme === "dark"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          <Home
            className={`h-6 w-6 ${isActive("/home") ? "text-[#8266E6]" : ""}`}
          />
          <span
            className={`text-xs mt-1 font-semibold ${
              isActive("/home")
                ? "text-[#8266E6]"
                : theme === "dark"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Home
          </span>
        </Link>
        {/* Points */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex flex-col items-center z-20">
          <div
            className={`rounded-full border-2 border-[#8266E6] shadow-lg shadow-[#8266E6]/50 flex flex-col items-center justify-center w-24 h-24 p-2 ${
              theme === "dark" ? "bg-gray-800" : "bg-purple-100"
            }`}
          >
            <Award className="h-8 w-8 text-[#8266E6]" />
            {isLoadingPoints || totalPoints === null ? (
              <div className="flex flex-col items-center mt-2 w-full">
                <Skeleton
                  className={`w-12 h-6 rounded mb-2 ${
                    theme === "dark" ? "bg-gray-700" : "bg-purple-200"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  Pts
                </span>
              </div>
            ) : (
              <>
                <span
                  className={`text-lg font-bold mt-2 ${
                    theme === "dark" ? "text-purple-300" : "text-[#573faf]"
                  }`}
                >
                  {totalPoints}
                </span>
                <span className="text-sm font-semibold text-[#8266E6]">
                  Pts
                </span>
              </>
            )}
          </div>
        </div>
        {/* Holdings */}
        <Link
          href="/holding"
          className={`flex flex-col items-center ${
            isActive("/holding")
              ? "text-[#8266E6]"
              : theme === "dark"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          <Wallet
            className={`h-6 w-6 ${
              isActive("/holding") ? "text-[#8266E6]" : ""
            }`}
          />
          <span
            className={`text-xs mt-1 font-semibold ${
              isActive("/holding")
                ? "text-[#8266E6]"
                : theme === "dark"
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            Holdings
          </span>
        </Link>
      </div>
    </div>
  );
}
