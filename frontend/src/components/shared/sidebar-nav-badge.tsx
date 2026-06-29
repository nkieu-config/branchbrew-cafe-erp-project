import { formatSidebarBadgeCount, type SidebarNavBadgeTone } from "@/lib/sidebar-badges";
import { sidebarNavBadgeClassName, sidebarRailBadgeDotClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type SidebarNavBadgeProps = {
  count: number;
  tone?: SidebarNavBadgeTone;
  label: string;
  variant?: "inline" | "dot";
  className?: string;
};

export function SidebarNavBadge({
  count,
  tone = "warning",
  label,
  variant = "inline",
  className,
}: SidebarNavBadgeProps) {
  if (count <= 0) return null;

  if (variant === "dot") {
    return (
      <span
        className={cn(sidebarRailBadgeDotClassName(tone), className)}
        aria-label={label}
        title={label}
      />
    );
  }

  return (
    <span className={cn(sidebarNavBadgeClassName(tone), className)} aria-label={label} title={label}>
      {formatSidebarBadgeCount(count)}
    </span>
  );
}
