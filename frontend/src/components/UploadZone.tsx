"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, Loader2, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/") || file.type === "text/csv") {
        setSelectedFile(file);
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative apple-card p-12 transition-all duration-300 border-dashed border-2 flex flex-col items-center justify-center gap-4 ${
          dragActive ? "border-[#0071E3] bg-[#0071E3]/5" : "border-[#D2D2D7]/50"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/*,.csv"
          disabled={isLoading}
        />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <Loader2 className="w-10 h-10 text-[#0071E3] animate-spin" />
              <p className="text-sm font-medium text-[#86868B]">Analyzing receipt with Gemini...</p>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <FileImage className="w-10 h-10 text-[#0071E3]" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#86868B]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Drop your receipt here</p>
                <p className="text-sm text-[#86868B]">or click to browse photo or csv file</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
