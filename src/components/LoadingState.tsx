"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loading } from "@/data/contenido";

export default function LoadingState() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (loading.steps.length <= 1) return;
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < loading.steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-sk-900 via-sk-800 to-sk-950"
    >
      <div className="max-w-md mx-auto text-center py-16">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-white/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-cta-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF7A66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16 20.75l.155-.677a2.25 2.25 0 0 0 1.636-1.637l.677-.155-.677.155a2.25 2.25 0 0 0-1.636 1.637l-.155.677Z" />
            </svg>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="font-display font-semibold text-2xl text-white mb-2"
          >
            {loading.title}
          </motion.p>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-sm text-sk-300 mb-8 max-w-sm mx-auto"
        >
          {loading.subtitle}
        </motion.p>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8 ring-1 ring-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cta-500 via-celeste-400 to-cta-500"
            animate={{
              width: `${((stepIdx + 1) / loading.steps.length) * 100}%`,
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              width: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              backgroundPosition: { duration: 2.5, repeat: Infinity, ease: "linear" },
            }}
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          {loading.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                opacity: i <= stepIdx ? 1 : 0.3,
                x: i <= stepIdx ? 0 : -8,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <motion.div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  i < stepIdx
                    ? "bg-celeste-500 text-white"
                    : i === stepIdx
                      ? "bg-cta-500 text-white ring-2 ring-cta-400/40"
                      : "bg-white/15 text-white/50"
                }`}
                animate={i === stepIdx ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.5, repeat: i === stepIdx ? Infinity : 0, ease: "easeInOut" }}
              >
                {i < stepIdx ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </motion.div>
              <span className={`text-sm font-medium ${i <= stepIdx ? "text-sk-200" : "text-white/40"}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
