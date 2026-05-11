import { logo } from "@/assets";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "@/routes/config";

const Logo = () => {
  return (
    <Link to={APP_ROUTES.HOME}>
      <div className="flex items-center gap-2 cursor-pointer">
        <img src={logo} alt="" className="w-full max-w-46" />
      </div>
    </Link>
  );
}

export default Logo;
