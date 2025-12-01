"use client";

import { useState, useEffect } from "react";

export function useStickyOffsets() {
  const [offsets, setOffsets] = useState({
    headerHeight: 0,
    subHeaderHeight: 0,
  });

  useEffect(() => {
    const calculateHeights = () => {
      const header = document.getElementById("main-header");
      const subHeader = document.getElementById("products-subheader");

      setOffsets({
        headerHeight: header?.offsetHeight || 0,
        subHeaderHeight: subHeader?.offsetHeight || 0,
      });
    };

    calculateHeights();

    window.addEventListener("resize", calculateHeights);
    return () => window.removeEventListener("resize", calculateHeights);
  }, []);

  return offsets;
}