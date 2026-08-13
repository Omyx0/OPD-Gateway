import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * MainContent — one decision per screen. Centered, generously spaced,
 * capped width so kiosk / tablet / desktop all stay readable.
 */
export function MainContent({
  children,
  animationKey,
  animate = true,
  className,
}: {
  children: ReactNode;
  animationKey?: string;
  animate?: boolean;
  className?: string;
}) {
  return (
    <motion.main
      id="kiosk-main"
      tabIndex={-1}
      key={animationKey}
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animate ? 0.25 : 0, ease: "easeOut" }}
      className={cn(
        "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-10 lg:py-14",
        className,
      )}
    >
      {children}
    </motion.main>
  );
}
