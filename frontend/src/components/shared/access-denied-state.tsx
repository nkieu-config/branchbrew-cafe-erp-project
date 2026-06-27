import Link from "next/link";
import { ShieldOff } from "lucide-react";

type AccessDeniedStateProps = {
  title?: string;
  description?: string;
  showBackLink?: boolean;
};

export function AccessDeniedState({
  title = "Access denied",
  description = "You don't have permission to view this page.",
  showBackLink = true,
}: AccessDeniedStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center max-w-lg mx-auto">
      <ShieldOff className="w-10 h-10 text-rose-500 mx-auto mb-4" />
      <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>
      {showBackLink && (
        <Link
          href="/"
          className="inline-flex mt-6 h-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      )}
    </div>
  );
}
