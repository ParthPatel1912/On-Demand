export const adminLoginStyles = {
  formContainer: "w-full",
  formHeader: "flex flex-col items-center gap-4 mb-[24px] text-center",
  serverError:
    "rounded-md border border-red-500/60 bg-red-50 px-3 py-2 text-left text-xs text-red-700 mb-4",
  form: "space-y-4",
  field: "space-y-1.5",
  label: "block text-left text-xs font-medium text-slate-700",
  fieldError: "text-left text-xs text-red-500",
  input:
    "h-10 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-600",
  inputError: "border-red-500 focus-visible:ring-red-500",
  passwordInput:
    "h-10 border-slate-200 bg-white pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-600",
  passwordToggle:
    "absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700",
  forgotRow: "flex items-center justify-end cursor-pointer",
  forgotButton:
    "text-sm font-medium text-ink-muted hover:text-slate-700 cursor-pointer",
  submitButton: "mt-1 w-full cursor-pointer",
} as const;
