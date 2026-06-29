import { Award, Crown, Star, User } from "lucide-react";
import { customerTierIconClassName } from "@/lib/theme/hub-crm";

export function TierIcon({ tier }: { tier: string }) {
  const className = customerTierIconClassName(tier, "w-4 h-4");
  switch (tier?.toUpperCase()) {
    case "PLATINUM":
      return <Crown className={className} aria-hidden />;
    case "GOLD":
      return <Award className={className} aria-hidden />;
    case "SILVER":
      return <Star className={className} aria-hidden />;
    default:
      return <User className={className} aria-hidden />;
  }
}
