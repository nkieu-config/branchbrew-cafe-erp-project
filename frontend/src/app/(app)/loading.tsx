import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

export default function AppLoading() {
  return (
    <div className={cn("flex-1 flex items-center justify-center min-h-[50vh] font-medium", text.muted)}>
      Loading workspace…
    </div>
  );
}
