import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

import { Button } from "./Button";

export function Modal({ children, open, title, onClose, width = "max-w-lg" }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`glass-panel w-full ${width} rounded-lg`}
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close dialog">
                <FiX className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

