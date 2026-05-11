import Logo from "../common/Logo";

export const adminLoginStyles = {
  formContainer: "w-full max-w-[350px]",
  formHeader: "flex flex-col items-center gap-4 mb-[24px] text-center",
} as const;

export default function CustomerCommonHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className={adminLoginStyles.formHeader}>
      <Logo />
      <h4 className="text-center mt-2 text-ink-muted font-alexandria text-xl leading-11 font-normal tracking-[0.25%]">
        {title}
      </h4>

      {subtitle && (
        <p className="text-sm text-slate-600 text-center">{subtitle}</p>
      )}
    </header>
  );
}
