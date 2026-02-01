import { useState, useEffect } from "react";

export function useSupporter() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const status = localStorage.getItem("user_status");
    if (status === "pro") {
      setIsPro(true);
    }
  }, []);

  const upgradeToPro = () => {
    localStorage.setItem("user_status", "pro");
    setIsPro(true);
  };

  return { isPro, upgradeToPro };
}
