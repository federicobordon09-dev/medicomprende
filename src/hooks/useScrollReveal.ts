"use client";

import { useEffect } from "react";

export function useScrollReveal(selectors = ".reveal, .reveal-left, .reveal-right", options?: { threshold?: number; rootMargin?: string }) {
  useEffect(() => {
    const threshold = options?.threshold ?? 0.1;
    const rootMargin = options?.rootMargin ?? "0px";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    const elements = document.querySelectorAll(selectors);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
