"use client";

import React from "react";
import { TrendingUp, Wallet, PiggyBank, ArrowUpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  income: number;
  investment: number;
  savings: number;
  top_expenses: Record<string, number>;
  charts?: Record<string, string>;
}

export default function AnalyticsCards({ data }: { data: AnalyticsData | null }) {
  if (!data) return null;

  const cards = [
    { label: "Total Income", value: data.income, icon: ArrowUpCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Investments", value: data.investment, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Savings", value: data.savings, icon: PiggyBank, color: "text-teal-500", bg: "bg-teal-50" },
  ];

  const topCategory = Object.entries(data.top_expenses).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            className="apple-card p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#86868B]">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-[#1D1D1F]">
                ${card.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </motion.div>
        ))}

        {topCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="apple-card p-6 bg-[#1D1D1F] text-white flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#86868B]">Top Category</span>
              <div className="p-2 rounded-xl bg-white/10">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{topCategory[0]}</h3>
              <p className="text-sm text-[#86868B] mt-1">
                ${topCategory[1].toLocaleString(undefined, { minimumFractionDigits: 2 })} spent
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {data.charts && Object.keys(data.charts).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.charts.income_vs_expenses && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="apple-card p-6 bg-white"
            >
              <h4 className="text-sm font-semibold text-[#86868B] mb-4 uppercase tracking-wider">Income vs Expenses</h4>
              <img src={data.charts.income_vs_expenses} alt="Income vs Expenses" className="w-full h-auto rounded-lg" />
            </motion.div>
          )}
          {data.charts.expenses_by_category && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="apple-card p-6 bg-white"
            >
              <h4 className="text-sm font-semibold text-[#86868B] mb-4 uppercase tracking-wider">Expenses by Category</h4>
              <img src={data.charts.expenses_by_category} alt="Expenses by Category" className="w-full h-auto rounded-lg" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
