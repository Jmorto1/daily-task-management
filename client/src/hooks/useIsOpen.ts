import { useState, useEffect } from "react";

export function useIsOpen(navlistRef: React.RefObject<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = (e: MouseEvent) => {
      if (
        navlistRef.current &&
        !navlistRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll=()=>{
        setIsOpen(false)
    }

    window.addEventListener("mousedown", handleOpen);
    document.addEventListener("scroll",handleScroll,true);
    return () => {
      window.removeEventListener("mousedown", handleOpen);
      document.removeEventListener("scroll",handleScroll,true);
    };
  }, [navlistRef]);

  return { isOpen, setIsOpen };
}
