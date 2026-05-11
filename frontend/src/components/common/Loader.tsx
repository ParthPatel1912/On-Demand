interface IProps {
  isLoading: boolean;
}

export function FullPageLoader({ isLoading }: IProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-white/40 backdrop-blur-xs transition-all animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center justify-center">
        {/* Status text with minimalist high-end typography */}
        <div className="mt-8 flex flex-col items-center">
          <span className="text-sm font-black text-ink-rich uppercase tracking-[0.35em] animate-pulse opacity-80">
            Processing
          </span>
          <div className="flex gap-2 mt-3">
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
