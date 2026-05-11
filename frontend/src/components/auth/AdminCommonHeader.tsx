import { adminLoginStyles } from "@/pages/auth/config/auth.styles";
import logoImage from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { ADMIN_AUTH_TEXTS } from "@/constants/auth.text";

interface IProps {
  title: string;
  subtitle?: string;
}

const AdminCommonHeader = ({ title, subtitle }: Readonly<IProps>) => {
  return (
    <header className={adminLoginStyles.formHeader}>
      <Link to="/">
        <img
          src={logoImage}
          alt={ADMIN_AUTH_TEXTS.logoAlt}
          className="h-auto w-[245px] mb-2 ml-[28px] cursor-pointer"
        />
      </Link>
      <h4 className="text-2xl sm:text-3xl md:text-[32px] font-medium text-slate-800 text-center tracking-tight leading-tight sm:leading-[44px]">
        {title}
      </h4>

      {subtitle && (
        <p className="text-sm text-slate-600 text-center">{subtitle}</p>
      )}
    </header>
  );
};

export default AdminCommonHeader;
