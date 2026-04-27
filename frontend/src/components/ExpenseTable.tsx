"use client";

import React from "react";
import { motion } from "framer-motion";

interface Transaction {
  transaction_id: string;
  description: string;
  amount_spent: number;
  date: string;
  category?: string;
  transaction_type?: string;
}

interface ExpenseTableProps {
  transactions: Transaction[];
}

const categoryColors: Record<string, string> = {
  Food: "bg-orange-100 text-orange-600",
  Travel: "bg-blue-100 text-blue-600",
  Entertainment: "bg-purple-100 text-purple-600",
  Utilities: "bg-yellow-100 text-yellow-700",
  Health: "bg-green-100 text-green-600",
  Education: "bg-indigo-100 text-indigo-600",
  Shopping: "bg-pink-100 text-pink-600",
  Others: "bg-gray-100 text-gray-600",
  Income: "bg-emerald-100 text-emerald-600",
  Investment: "bg-cyan-100 text-cyan-600",
  Savings: "bg-teal-100 text-teal-600",
};

export default function ExpenseTable({ transactions }: ExpenseTableProps) {
  if (transactions.length === 0) return null;

  return (
    <div className="apple-card mt-8 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#F5F5F7]">
            <th className="px-6 py-4 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Description</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#86868B] uppercase tracking-wider text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => (
            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={t.transaction_id || idx}
              className="group hover:bg-[#F5F5F7]/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-[#1D1D1F] font-medium">{t.date}</td>
              <td className="px-6 py-4 text-sm text-[#1D1D1F]">{t.description}</td>
              <td className="px-6 py-4 text-sm">
                {t.category && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[t.category] || "bg-gray-100 text-gray-600"}`}>
                    {t.category}
                  </span>
                )}
              </td>
              <td className={`px-6 py-4 text-sm font-semibold text-right ${t.transaction_type === 'income' ? 'text-emerald-600' : 'text-[#1D1D1F]'}`}>
                {t.transaction_type === 'income' ? '+' : ''}${t.amount_spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
