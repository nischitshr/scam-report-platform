import {
  TrendingUp,
  Fish,
  Briefcase,
  Heart,
  ShoppingCart,
  Monitor,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const SCAM_TYPE_OPTIONS: {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    value: "phishing",
    label: "Phishing",
    icon: Fish,
    color: "badge-red",
  },
  {
    value: "fake_job",
    label: "Fake Job",
    icon: Briefcase,
    color: "badge-blue",
  },
  {
    value: "catfish",
    label: "Romance / Catfish",
    icon: Heart,
    color: "badge-amber",
  },
  {
    value: "investment",
    label: "Investment Fraud",
    icon: TrendingUp,
    color: "badge-red",
  },
  {
    value: "shopping",
    label: "Online Shopping",
    icon: ShoppingCart,
    color: "badge-blue",
  },
  {
    value: "tech_support",
    label: "Tech Support",
    icon: Monitor,
    color: "badge-amber",
  },
  {
    value: "other",
    label: "Other",
    icon: HelpCircle,
    color: "badge-amber",
  },
];

export const getScamTypeBadgeClass = (type: string) =>
  SCAM_TYPE_OPTIONS.find((opt) => opt.value === type)?.color ?? "badge-amber";

export const getScamTypeLabel = (type: string) =>
  SCAM_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? "Other";

export const getScamTypeIcon = (type: string): LucideIcon =>
  SCAM_TYPE_OPTIONS.find((opt) => opt.value === type)?.icon ?? HelpCircle;