import {
  BookOpen,
  FlaskConical,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  Package,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { Author, CatalogCategory, PostTag } from "@/types/hub";

const AUTHOR_ACCENTS = [
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#5eead4",
  "#fdba74",
];

const initialsFrom = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "HA";

export const displayNameFor = (
  user: { name?: string | null; email?: string | null } | null | undefined,
) => {
  const explicit = user?.name?.trim();
  if (explicit) return explicit;

  const emailName = user?.email?.split("@")[0];
  if (emailName) {
    const readable = emailName
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    if (readable) return readable;
  }

  return "Guest teammate";
};

export const authorFromName = (name: string): Author => {
  const normalized = name.trim() || "Guest teammate";
  const accentIndex = normalized
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0) % AUTHOR_ACCENTS.length;

  return {
    name: normalized,
    initials: initialsFrom(normalized),
    accent: AUTHOR_ACCENTS[accentIndex],
  };
};

export const formatRelative = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const todayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export const formatBookingDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  if (date === todayISO()) return "Today";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const POST_TAG_META: Record<
  PostTag,
  { label: string; icon: LucideIcon; className: string }
> = {
  update: {
    label: "Update",
    icon: MessageSquare,
    className: "border-cyan-300/25 bg-cyan-400/10 text-cyan-200",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    className: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  },
  question: {
    label: "Question",
    icon: MessageSquare,
    className: "border-violet-300/25 bg-violet-400/10 text-violet-200",
  },
  resource: {
    label: "Resource",
    icon: BookOpen,
    className: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  },
};

export const CATEGORY_META: Record<
  CatalogCategory,
  { label: string; icon: LucideIcon; accent: string; className: string }
> = {
  playbook: {
    label: "Playbook",
    icon: BookOpen,
    accent: "#22d3ee",
    className: "border-cyan-300/25 bg-cyan-400/10 text-cyan-200",
  },
  template: {
    label: "Template",
    icon: LayoutTemplate,
    accent: "#a78bfa",
    className: "border-violet-300/25 bg-violet-400/10 text-violet-200",
  },
  automation: {
    label: "Automation",
    icon: Workflow,
    accent: "#34d399",
    className: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  },
  equipment: {
    label: "Equipment",
    icon: Package,
    accent: "#fbbf24",
    className: "border-amber-300/25 bg-amber-400/10 text-amber-200",
  },
  research: {
    label: "Research",
    icon: FlaskConical,
    accent: "#60a5fa",
    className: "border-blue-300/25 bg-blue-400/10 text-blue-200",
  },
};

export const CATALOG_CATEGORIES = Object.keys(CATEGORY_META) as CatalogCategory[];

export const initialsFor = (name: string) => initialsFrom(name);
