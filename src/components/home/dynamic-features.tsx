"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

// Create a loading component that uses theme
const LoadingPlaceholder = () => {
  const { theme } = useTheme();
  return (
    <div
      className={`h-32 ${
        theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
      } rounded-lg animate-pulse`}
    />
  );
};

// Lazy load heavy components with loading states
const TrendingProtocols = dynamic(
  () => import("@/components/features/trending-protocols"),
  {
    loading: () => <LoadingPlaceholder />,
    ssr: false,
  }
);

const PWAInstaller = dynamic(
  () => import("@/components/features/pwa-installer"),
  {
    loading: () => null,
    ssr: false,
  }
);

interface DynamicFeaturesProps {
  refreshBalance?: () => void;
  renderFeedbackButton?: () => React.ReactNode;
}

export default function DynamicFeatures({
  refreshBalance,
  renderFeedbackButton,
}: DynamicFeaturesProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Trending */}
      <div className="mb-[60px]">
        <TrendingProtocols
          refreshBalance={refreshBalance}
          renderFeedbackButton={renderFeedbackButton}
        />
      </div>

      {/* PWA Installer */}
      <PWAInstaller />
    </>
  );
}
