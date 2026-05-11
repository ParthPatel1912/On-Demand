import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type IProps = PropsWithChildren<{
  className?: string;
}>;

export function Container({ className, children }: IProps) {
  return (
    <div className={cn("mx-auto w-full max-w-300 px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
