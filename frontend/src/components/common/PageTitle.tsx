import type { TitleProps } from "@/types/common.interface";

const PageTitle = ({ title, className, children }: TitleProps) => {
  return (
    <div className={`flex justify-between items-center pb-3 ${className}`}>
      <h1 className="text-start font-alexandria text-xl font-semibold text-ink truncate max-w-full">
        {title}
      </h1>
      {children}
    </div>
  );
};

export default PageTitle;
