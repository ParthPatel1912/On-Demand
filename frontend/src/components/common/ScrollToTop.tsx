import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scroll({
      behavior: "smooth",
      top: 0,
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
