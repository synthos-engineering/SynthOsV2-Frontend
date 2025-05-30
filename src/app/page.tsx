"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import CustomConnectWallet from "@/components/CustomConnectWallet";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

// Define onboarding steps
type OnboardingStep = "welcome" | "wallet-analysis" | "preferences";

// Define API response types
interface AnalysisDetails {
  totalTransactions: number;
  patterns: string;
  recommendations: string;
}

interface ProfileData {
  experienceLevel: string;
  investmentStrategy: string;
  managementStyle: string;
  profileType: string;
  standardDescription: string;
  personalizedDescription: string;
}

interface WalletAnalysis {
  walletAddress: string;
  analysis: {
    summary: string;
    details: AnalysisDetails;
  };
  profile: ProfileData;
  timestamp: string;
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, address } = useAuth();
  const { theme } = useTheme();
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>("welcome");
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const [profile, setProfile] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [walletAnalysis, setWalletAnalysis] = useState<WalletAnalysis | null>(
    null
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);

  // Check authentication state and onboarding status on initial load
  useEffect(() => {
    if (isAuthenticated) {
      // Check if this user has completed onboarding before
      const completedAddresses = JSON.parse(
        localStorage.getItem("completed_onboarding_addresses") || "[]"
      );

      // Only redirect to home if they've completed onboarding before AND they're on the initial welcome step
      if (
        address &&
        completedAddresses.includes(address) &&
        onboardingStep === "welcome"
      ) {
        // If this wallet address has completed onboarding, redirect to home
        router.replace("/home");
      }
    }
    setInitialAuthChecked(true);
  }, [isAuthenticated, router, address, onboardingStep]);

  // Log authentication state changes
  useEffect(() => {
  }, [isAuthenticated, address]);

  // Fetch wallet analysis when needed
  useEffect(() => {
    if (onboardingStep === "wallet-analysis" && address) {
      fetchWalletAnalysis(address);
    }
  }, [onboardingStep, address]);

  // Update profile when wallet analysis is received
  useEffect(() => {
    if (walletAnalysis && walletAnalysis.profile) {
      setProfile({
        title: walletAnalysis.profile.profileType || "New to DeFi",
        description:
          walletAnalysis.profile.personalizedDescription ||
          "You're just getting started with DeFi. We'll help you navigate the ecosystem safely.",
      });
    }
  }, [walletAnalysis]);

  // Save profile to localStorage when it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem("investor_profile", JSON.stringify(profile));
    }
  }, [profile]);

  // Fetch wallet analysis from API
  const fetchWalletAnalysis = async (walletAddress: string) => {
    try {
      setAnalysisError(null);
      setAnalysisProgress(0);
      setEstimatedTimeLeft(5); // Start with 5 seconds estimate

      // Start progress animation
      const startTime = Date.now();
      const estimatedDuration = 5000; // 5 seconds estimate

      // Update progress periodically
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / estimatedDuration) * 100, 95); // Cap at 95% until complete
        setAnalysisProgress(progress);

        const remainingTime = Math.max(
          Math.ceil((estimatedDuration - elapsed) / 1000),
          0
        );
        setEstimatedTimeLeft(remainingTime);
      }, 100);

      // Call the API
      const response = await fetch(`/api/ai-analyser?address=${walletAddress}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      clearInterval(progressInterval);

      // Set progress to 100% when complete
      setAnalysisProgress(100);
      setWalletAnalysis(data);

      // Proceed to preferences after a short delay
      setTimeout(() => {
        setOnboardingStep("preferences");
      }, 500);
    } catch (error) {
      console.error("Error analyzing wallet:", error);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze wallet"
      );

      // Fallback to basic profile if analysis fails
      setProfile({
        title: "New to DeFi",
        description:
          "You're just getting started with DeFi. We'll help you navigate the ecosystem safely.",
      });

      // Still proceed to preferences after a delay
      setTimeout(() => {
        setOnboardingStep("preferences");
      }, 1500);
    }
  };

  // Handle wallet connected
  const handleWalletConnected = () => {
    // If wallet is connected, proceed with wallet analysis
    setOnboardingStep("wallet-analysis");
  };

  // Handle back button click
  const handleBackClick = () => {
    if (onboardingStep === "wallet-analysis") {
      setOnboardingStep("welcome");
    }
  };

  // Determine what to render based on current step
  const renderContent = () => {
    // Check if user needs to connect wallet for steps that require authentication
    if (
      (onboardingStep === "wallet-analysis" ||
        onboardingStep === "preferences") &&
      !isAuthenticated
    ) {
      // Force wallet connection if not authenticated
      return renderWelcome();
    }

    switch (onboardingStep) {
      case "welcome":
        return renderWelcome();
      case "wallet-analysis":
        return renderWalletAnalysis();
      case "preferences":
        return renderPreferences();
      default:
        return renderWelcome();
    }
  };

  // Render welcome screen with wallet connection
  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Image
          src="/SynthOS-transparent.png"
          alt="SynthOS Logo"
          width={120}
          height={120}
          className="mb-6"
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className={`text-5xl font-bold mb-4 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        SynthOS
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className={`text-xl font-bold mb-8 max-w-md text-center ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        Invest with confidence using personalized yield plans.
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-2"
      >
        <CustomConnectWallet onConnected={handleWalletConnected} />
      </motion.div>
    </motion.div>
  );

  // Show loading state if we haven't checked auth yet
  if (!initialAuthChecked) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark" ? "bg-[#0f0b22]" : "bg-white"
        }`}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`text-xl ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  // Render wallet analysis step
  const renderWalletAnalysis = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center max-w-md"
    >
      <div
        className={`text-xl mb-4 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        Analyzing your wallet...
      </div>
      <div className="w-full max-w-sm">
        <div
          className={`h-2 w-full rounded-full ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${analysisProgress}%` }}
          ></div>
        </div>
      </div>
      <div
        className={`mt-4 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {analysisError ? (
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <span className="animate-pulse">⚠️</span>
            <span>Error: {analysisError}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="animate-spin">⚡</span>
              <span>
                Analyzing your wallet activity and investment patterns...
              </span>
            </div>
            {estimatedTimeLeft < 100 ? (
              <div className="mt-2 flex items-center space-x-2 font-medium text-purple-500 animate-pulse">
                <span>🤖</span>
                <span>AI analysis in progress...</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render preferences step
  const renderPreferences = () => {
    const currentProfile = profile || {
      title: "New to DeFi",
      description:
        "You're just getting started with DeFi. We'll help you navigate the ecosystem safely.",
    };

    const handleContinueToDashboard = () => {
      if (address) {
        // Get existing completed addresses
        const completedAddresses = JSON.parse(
          localStorage.getItem("completed_onboarding_addresses") || "[]"
        );

        // Add current address if not already included
        if (!completedAddresses.includes(address)) {
          completedAddresses.push(address);
          localStorage.setItem(
            "completed_onboarding_addresses",
            JSON.stringify(completedAddresses)
          );
        }
      }

      // Navigate to dashboard
      router.push("/home");
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div
          className={`text-lg md:text-xl font-bold mb-6 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Here's what we found from your{" "}
          {walletAnalysis?.analysis.details.totalTransactions} transactions :
        </div>

        {/* Profile Information Card */}
        <div
          className={`p-6 rounded-xl mb-4 w-full ${
            theme === "dark"
              ? "bg-purple-900/40 text-white"
              : "bg-purple-100 text-black"
          }`}
        >
          <p className="mb-3 text-xl font-medium">
            You are a{" "}
            <span className="text-purple-500 font-bold">
              {walletAnalysis?.profile?.profileType || currentProfile.title}
            </span>
          </p>
          <p className="text-md">
            {walletAnalysis?.profile?.personalizedDescription ||
              currentProfile.description}
          </p>
        </div>

        {/* Profile Details Card */}
        {walletAnalysis?.profile && (
          <div
            className={`p-6 rounded-xl mb-5 w-full ${
              theme === "dark"
                ? "bg-purple-800/30 text-white"
                : "bg-purple-50/70 text-purple-900"
            }`}
          >
            <p className="mb-3 text-lg font-bold text-left">Profile Details:</p>
            <div className="grid grid-cols-2 gap-y-3 text-sm text-left">
              <div>
                <p className="font-bold">Experience Level:</p>
                <p>{walletAnalysis.profile.experienceLevel}</p>
              </div>
              <div>
                <p className="font-bold">Investment Strategy:</p>
                <p>{walletAnalysis.profile.investmentStrategy}</p>
              </div>
              <div>
                <p className="font-bold">Management Style:</p>
                <p>{walletAnalysis.profile.managementStyle}</p>
              </div>
              <div>
                <p className="font-bold">Profile Type:</p>
                <p>{walletAnalysis.profile.profileType}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm mb-8 text-gray-500 dark:text-gray-400">
          AI-powered results tailored to your wallet activity
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleContinueToDashboard}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-8 rounded-xl w-64"
        >
          Continue to Dashboard
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 ${
        theme === "dark" ? "bg-[#0f0b22]" : "bg-white"
      }`}
    >
      {/* Only show logo on wallet analysis and preferences steps */}
      {onboardingStep !== "welcome" && (
        <Image
          src="/SynthOS-transparent.png"
          alt="SynthOS Logo"
          width={64}
          height={64}
          className="mb-4"
        />
      )}

      {/* Dynamic content based on current onboarding step */}
      {renderContent()}
    </div>
  );
}
