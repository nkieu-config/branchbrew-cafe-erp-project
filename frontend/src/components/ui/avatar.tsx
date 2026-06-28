import { cn } from "@/lib/utils";

type AvatarProps = {
  className?: string;
  size?: "default" | "lg";
  children: React.ReactNode;
};

export function Avatar({ className, size = "default", children }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full uppercase select-none",
        size === "lg" ? "size-10 text-base" : "size-8 text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
