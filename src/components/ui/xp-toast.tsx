"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface XpToastProps {
  amount: number;
  /** Increment this value to trigger the toast */
  trigger: number;
}

export function XpToast({ amount, trigger }: XpToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={trigger}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-card px-5 py-3 shadow-lg"
        >
          <span
            className="text-sm font-bold"
            style={{ color: "#f5c842" }}
          >
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
