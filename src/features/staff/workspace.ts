import type { DashboardNavItem } from "@/components/layout/dashboard-shell";
import { ROLE_LABELS, type AppRole } from "@/features/authorization/roles";
import {
  STAFF_ACCOUNT_ROLES,
  type StaffAccountRole,
} from "@/features/staff/types";

export type StaffRouteKey =
  | "dashboard"
  | "profile"
  | "notifications"
  | "calendar"
  | "messages"
  | "requests"
  | "team-workload"
  | "engagements"
  | "tasks"
  | "clients"
  | "kyc"
  | "reviews"
  | "documents"
  | "notes"
  | "ai"
  | "invoices"
  | "quotations"
  | "payments"
  | "reports"
  | "templates"
  | "archive"
  | "audit"
  | "team";

type WorkspaceLink = {
  label: string;
  href: string;
  description: string;
};

export type StaffWorkspace = {
  role: StaffAccountRole;
  roleLabel: string;
  title: string;
  subtitle: string;
  description: string;
  priorities: readonly string[];
  primaryLinks: readonly WorkspaceLink[];
};

const routeAccess: Record<StaffAccountRole, readonly StaffRouteKey[]> = {
  engagement_manager: [
    "dashboard", "notifications", "calendar", "messages", "requests", "team-workload",
    "engagements", "tasks", "clients", "kyc", "documents", "notes", "ai", "reports",
    "templates", "archive",
  ],
  consultant: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "tasks", "clients",
    "documents", "notes", "ai", "reports", "templates", "archive",
  ],
  reviewer: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "tasks", "clients",
    "kyc", "reviews", "documents", "notes", "ai", "reports", "templates", "archive",
  ],
  finance_officer: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "clients", "invoices",
    "quotations", "tasks", "payments", "reports", "templates", "archive",
  ],
  document_controller: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "clients", "documents", "reports",
    "templates", "archive",
  ],
  support_staff: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "tasks", "clients",
    "documents",
  ],
  auditor: [
    "dashboard", "notifications", "calendar", "messages", "engagements", "clients", "kyc", "documents",
    "invoices", "reports", "templates", "archive", "audit", "team",
  ],
};

const workspaceDetails: Record<StaffAccountRole, Omit<StaffWorkspace, "role" | "roleLabel">> = {
  engagement_manager: {
    title: "Engagement manager",
    subtitle: "New requests, team and progress",
    description: "Accept new requests, give out work and keep every job moving.",
    priorities: ["Check new client requests", "Share work fairly across the team", "Unblock stuck engagements"],
    primaryLinks: [
      { label: "New requests", href: "/staff/requests", description: "Accept, ask questions or decline." },
      { label: "Team workload", href: "/staff/team-workload", description: "See who has time for more." },
      { label: "Engagements", href: "/staff/engagements", description: "Follow active work and deadlines." },
    ],
  },
  consultant: {
    title: "Consultant",
    subtitle: "Your clients, tasks and files",
    description: "Do your assigned work and keep clients updated.",
    priorities: ["Finish tasks that are due", "Prepare files for clients", "Note important decisions"],
    primaryLinks: [
      { label: "My engagements", href: "/staff/engagements", description: "Work assigned to you." },
      { label: "My tasks", href: "/staff/tasks", description: "Deadlines and blockers." },
      { label: "Documents", href: "/staff/documents", description: "Upload and check files." },
    ],
  },
  reviewer: {
    title: "Reviewer",
    subtitle: "Identity checks and quality checks",
    description: "Check what clients send, record your decision and flag risks.",
    priorities: ["Do your assigned identity checks", "Ask for missing documents", "Record your decisions"],
    primaryLinks: [
      { label: "Identity checks", href: "/staff/kyc", description: "Answers, documents and risk." },
      { label: "Reviews", href: "/staff/reviews", description: "Quality checks waiting for you." },
      { label: "Documents", href: "/staff/documents", description: "Files linked to each check." },
    ],
  },
  finance_officer: {
    title: "Finance",
    subtitle: "Quotations, invoices and payments",
    description: "Prepare quotations and invoices, and keep an eye on payments.",
    priorities: ["Prepare invoices for approval", "Check payments that come in", "Answer finance questions"],
    primaryLinks: [
      { label: "Quotations", href: "/staff/quotations", description: "Send prices to clients." },
      { label: "Invoices", href: "/staff/invoices", description: "Prepare invoices and follow approval." },
      { label: "Payments", href: "/staff/payments", description: "Payments waiting for approval." },
      { label: "Reports", href: "/staff/reports", description: "Billing and payment totals." },
    ],
  },
  document_controller: {
    title: "Documents",
    subtitle: "Files, templates and records",
    description: "Keep documents tidy, correct and stored for the right time.",
    priorities: ["Sort new documents", "Fix document problems", "Keep records up to date"],
    primaryLinks: [
      { label: "Documents", href: "/staff/documents", description: "Check, sort and manage files." },
      { label: "Templates", href: "/staff/templates", description: "Keep approved templates current." },
      { label: "Archive", href: "/staff/archive", description: "Finished and stored records." },
    ],
  },
  support_staff: {
    title: "Client support",
    subtitle: "Questions and follow-ups",
    description: "Answer clients and keep routine requests moving.",
    priorities: ["Answer client messages", "Follow up open tasks", "Collect requested documents"],
    primaryLinks: [
      { label: "Messages", href: "/staff/messages", description: "Reply to your conversations." },
      { label: "Tasks", href: "/staff/tasks", description: "Follow-ups to do." },
      { label: "Clients", href: "/staff/clients", description: "Client details you need." },
    ],
  },
  auditor: {
    title: "Audit",
    subtitle: "View-only records and history",
    description: "Look at records and activity without changing anything.",
    priorities: ["Look into unusual activity", "Check stored evidence", "Export audit reports"],
    primaryLinks: [
      { label: "Activity log", href: "/staff/audit", description: "Who changed what, and when." },
      { label: "Reports", href: "/staff/reports", description: "Summaries of the work." },
      { label: "Archive", href: "/staff/archive", description: "Stored records and holds." },
    ],
  },
};

function link(label: string, href: string, icon: DashboardNavItem["icon"], symbol: string, badge?: string) {
  return { label, href, icon, symbol, ...(badge ? { badge } : {}) } satisfies DashboardNavItem;
}

const roleNavigation: Record<StaffAccountRole, DashboardNavItem> = {
  engagement_manager: {
    label: "My work", icon: "briefcase", defaultOpen: true,
    children: [
      link("New requests", "/staff/requests", "inbox", "R"),
      link("All engagements", "/staff/engagements", "briefcase", "E"),
      link("Team workload", "/staff/team-workload", "staff", "W"),
      link("Tasks", "/staff/tasks", "listTodo", "T"),
      link("Clients", "/staff/clients", "users", "C"),
      link("Identity checks", "/staff/kyc", "fileCheck", "K"),
    ],
  },
  consultant: {
    label: "My work", icon: "briefcase", defaultOpen: true,
    children: [
      link("My engagements", "/staff/engagements", "briefcase", "E"),
      link("My tasks", "/staff/tasks", "listTodo", "T"),
      link("Clients", "/staff/clients", "users", "C"),
      link("Documents", "/staff/documents", "documents", "D"),
      link("Internal notes", "/staff/notes", "fileClock", "N"),
      link("AI workspace", "/staff/ai", "sparkles", "AI"),
    ],
  },
  reviewer: {
    label: "My work", icon: "clipboard", defaultOpen: true,
    children: [
      link("Identity checks", "/staff/kyc", "fileCheck", "K"),
      link("Reviews", "/staff/reviews", "clipboard", "R"),
      link("Review tasks", "/staff/tasks", "listTodo", "T"),
      link("Documents", "/staff/documents", "documents", "D"),
      link("Clients", "/staff/clients", "users", "C"),
      link("Assigned engagements", "/staff/engagements", "briefcase", "E"),
      link("Internal notes", "/staff/notes", "fileClock", "N"),
      link("AI workspace", "/staff/ai", "sparkles", "AI"),
    ],
  },
  finance_officer: {
    label: "My work", icon: "finance", defaultOpen: true,
    children: [
      link("Quotations", "/staff/quotations", "money", "Q"),
      link("Tasks", "/staff/tasks", "listTodo", "T"),
      link("Invoices", "/staff/invoices", "invoice", "I"),
      link("Payments", "/staff/payments", "money", "P"),
      link("Reports", "/staff/reports", "reports", "R"),
      link("Clients", "/staff/clients", "users", "C"),
      link("Engagements", "/staff/engagements", "briefcase", "E"),
      link("Invoice layouts", "/staff/templates", "fileText", "T"),
      link("Archive", "/staff/archive", "archive", "A"),
    ],
  },
  document_controller: {
    label: "My work", icon: "documents", defaultOpen: true,
    children: [
      link("Documents", "/staff/documents", "documents", "D"),
      link("Templates", "/staff/templates", "fileText", "T"),
      link("Archive", "/staff/archive", "archive", "A"),
      link("Reports", "/staff/reports", "reports", "R"),
      link("Engagements", "/staff/engagements", "briefcase", "E"),
      link("Clients", "/staff/clients", "users", "C"),
    ],
  },
  support_staff: {
    label: "My work", icon: "users", defaultOpen: true,
    children: [
      link("Clients", "/staff/clients", "users", "C"),
      link("Support tasks", "/staff/tasks", "listTodo", "T"),
      link("Engagements", "/staff/engagements", "briefcase", "E"),
      link("Documents", "/staff/documents", "documents", "D"),
    ],
  },
  auditor: {
    label: "My work", icon: "activity", defaultOpen: true,
    children: [
      link("Activity log", "/staff/audit", "activity", "AL"),
      link("Reports", "/staff/reports", "reports", "R"),
      link("Archive", "/staff/archive", "archive", "A"),
      link("Identity checks", "/staff/kyc", "fileCheck", "K"),
      link("Invoices", "/staff/invoices", "invoice", "I"),
      link("Clients", "/staff/clients", "users", "C"),
      link("Staff", "/staff/team", "staff", "S"),
      link("Engagements", "/staff/engagements", "briefcase", "E"),
      link("Documents", "/staff/documents", "documents", "D"),
      link("Templates", "/staff/templates", "fileText", "T"),
    ],
  },
};

export function getPrimaryStaffRole(roleKeys: readonly AppRole[]) {
  return STAFF_ACCOUNT_ROLES.find((role) => roleKeys.includes(role)) ?? null;
}

export function canAccessStaffRoute(roleKeys: readonly AppRole[], route: StaffRouteKey) {
  if (route === "profile") {
    return Boolean(getPrimaryStaffRole(roleKeys));
  }

  return roleKeys.some(
    (role) => STAFF_ACCOUNT_ROLES.includes(role as StaffAccountRole) && routeAccess[role as StaffAccountRole].includes(route),
  );
}

export function getStaffWorkspace(role: StaffAccountRole): StaffWorkspace {
  return { role, roleLabel: ROLE_LABELS[role], ...workspaceDetails[role] };
}

export function getStaffNavItems(role: StaffAccountRole): DashboardNavItem[] {
  // One flat, short list: Home, then the few things this role does every day.
  // Everything occasional (alerts, calendar, profile, reference pages) sits under "More".
  const canMessage = routeAccess[role].includes("messages");
  const roleChildren = (roleNavigation[role].children ?? []).filter((item) => item.href !== "/staff/messages");

  const supportingChildren: DashboardNavItem[] = [];
  const hasSupporting = role !== "finance_officer" && role !== "document_controller" && role !== "auditor";
  if (hasSupporting && routeAccess[role].includes("reports")) supportingChildren.push(link("Reports", "/staff/reports", "reports", "R"));
  if (hasSupporting && routeAccess[role].includes("templates")) supportingChildren.push(link("Templates", "/staff/templates", "fileText", "T"));
  if (hasSupporting && routeAccess[role].includes("archive")) supportingChildren.push(link("Archive", "/staff/archive", "archive", "A"));

  const primarySlots = canMessage ? 5 : 6;
  const primary = roleChildren.slice(0, primarySlots);
  const more: DashboardNavItem[] = [
    ...roleChildren.slice(primarySlots),
    ...supportingChildren,
    link("Notifications", "/staff/notifications", "bell", "N"),
    link("Calendar", "/staff/calendar", "calendar", "CA"),
    link("My profile", "/staff/profile", "profile", "P"),
  ];

  return [
    link("Home", "/staff", "gauge", "H"),
    ...primary,
    ...(canMessage ? [link("Messages", "/staff/messages", "message", "M")] : []),
    { label: "More", icon: "folderArchive" as const, children: more },
  ];
}
