"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BarChart3, Receipt, LayoutDashboard, Bot, MessageCircle } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import ExpenseTable from "@/components/ExpenseTable";
import AnalyticsCards from "@/components/AnalyticsCards";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [summary, setSummary] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"upload" | "dashboard">("upload");

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload & Extract
      const uploadRes = await axios.post("http://localhost:8000/upload", formData);
      const rawData = uploadRes.data;

      // 2. Categorize
      const catRes = await axios.post("http://localhost:8000/categorize", rawData);
      const categorizedData = catRes.data;
      setTransactions(categorizedData);

      // 3. Analyze
      const analyzeRes = await axios.post("http://localhost:8000/analyze", categorizedData);
      const analyticsData = analyzeRes.data;
      setAnalytics(analyticsData);

      // 4. Summary
      const summaryRes = await axios.post("http://localhost:8000/summary", analyticsData);
      setSummary(summaryRes.data.summary);

      setActiveTab("dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process file. Check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const analysisContext = analytics ? (
    `Total Income: $${analytics.income}\n` +
    `Investments: $${analytics.investment}\n` +
    `Savings: $${analytics.savings}\n` +
    `Top Expenses: ${JSON.stringify(analytics.top_expenses)}\n` +
    `Summary: ${summary}`
  ) : "";

  return (
    <main className="min-h-screen bg-[#FBFBFB] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FBFBFB]/80 backdrop-blur-md border-b border-[#D2D2D7]/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">ExpenseFlow</h1>
          </div>
          
          <nav className="flex bg-[#F5F5F7] p-1 rounded-full">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "upload" ? "bg-white shadow-sm text-[#1D1D1F]" : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "dashboard" ? "bg-white shadow-sm text-[#1D1D1F]" : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-5xl font-bold tracking-tight text-[#1D1D1F]">
                  Financial clarity starts with a snap.
                </h2>
                <p className="text-xl text-[#86868B]">
                  Upload your receipts or CSV files and let our AI categorize and analyze your spending automatically.
                </p>
              </div>
              <UploadZone onUpload={handleUpload} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* AI Summary Section */}
              {summary && (
                <section className="apple-card p-8 bg-gradient-to-br from-[#1D1D1F] to-[#424245] text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold uppercase tracking-wider text-xs text-blue-400">AI Analysis</h3>
                  </div>
                  <p className="text-lg leading-relaxed font-medium">
                    {summary}
                  </p>
                </section>
              )}

              {/* Stats Grid & Charts */}
              <AnalyticsCards data={analytics} />

              {/* Transactions */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Recent Transactions</h3>
                  <button className="apple-button-secondary text-xs">Export CSV</button>
                </div>
                <ExpenseTable transactions={transactions} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatInterface context={analysisContext} />
    </main>
  );
}
