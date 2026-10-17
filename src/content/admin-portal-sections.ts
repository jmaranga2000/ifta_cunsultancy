import type { AdminPortalSectionConfig } from "@/components/dashboard/admin/admin-portal-section";

export const adminPortalSections = {
  pricing: {
    eyebrow: "Pricing",
    title: "Service pricing",
    description:
      "Check service prices, how clients are charged and which are ready.",
    code: "PRICING",
    metrics: [
      { label: "Price options", value: "4", helper: "Prices currently listed for review." },
      { label: "Available to clients", value: "2", helper: "Prices clients can currently use." },
      { label: "Needs a decision", value: "2", helper: "Changes waiting for approval." },
    ],
    table: {
      title: "Service prices",
      description: "Compare each service's price, status and owner.",
      columns: ["Service", "Model", "Status", "Owner"],
      rows: [
        ["Tax advisory", "Fixed scope", "Published", "Finance officer"],
        ["Compliance review", "Milestone", "Review", "Engagement manager"],
        ["Document preparation", "Per document", "Published", "Admin"],
        ["AI research support", "Usage based", "Draft", "AI admin"],
      ],
    },
    panel: {
      title: "Pricing controls",
      description: "What to do before a price goes live.",
      items: ["Choose how to charge", "Check tax details", "Confirm what clients can see", "Save the approved price"],
    },
    workflow: ["Prepare price", "Check details", "Approve", "Make available"],
  },
  activeEngagements: {
    eyebrow: "Admin engagements",
    title: "Active engagements",
    description:
      "Follow live engagements, staff, stage, blockers and readiness to finish.",
    code: "ACTIVE-WORK",
    metrics: [
      { label: "Active workspaces", value: "0", helper: "Live engagements show here once requests are converted." },
      { label: "Blocked", value: "0", helper: "Engagements waiting on the client or staff." },
      { label: "Due this week", value: "0", helper: "Milestones requiring admin attention." },
    ],
    table: {
      title: "Engagement register",
      description: "Stage, owner and next step for each active engagement.",
      columns: ["Engagement", "Client", "Stage", "Owner"],
      rows: [
        ["Corporate tax planning", "Pending client", "KYC", "Engagement manager"],
        ["Transfer pricing review", "Pending client", "Active work", "Consultant"],
        ["Payroll compliance", "Pending client", "Client review", "Reviewer"],
      ],
    },
    panel: {
      title: "Engagement controls",
      description: "Admin oversight areas for active work.",
      items: ["Staff assignment", "Stage transition review", "Client action tracking", "Completion approval"],
    },
    workflow: ["Request accepted", "Workspace opened", "Work delivered", "Archive"],
  },
  workflowTemplates: {
    eyebrow: "Admin workflows",
    title: "Workflow templates",
    description:
      "Manage workflow templates that set stages, tasks, dependencies and client labels.",
    code: "WORKFLOW-TEMPLATES",
    metrics: [
      { label: "Templates", value: "4", helper: "Workflow patterns available to engagements." },
      { label: "Published", value: "2", helper: "Templates available for new workspaces." },
      { label: "Drafts", value: "2", helper: "Templates still under configuration." },
    ],
    table: {
      title: "Workflow templates",
      description: "Template owner, status and task volume.",
      columns: ["Template", "Owner", "Status", "Tasks"],
      rows: [
        ["Client onboarding", "Engagement manager", "Published", "8"],
        ["Tax advisory", "Consultant", "Draft", "12"],
        ["KYC review", "Reviewer", "Published", "7"],
        ["Finance closeout", "Finance officer", "Review", "6"],
      ],
    },
    panel: {
      title: "Template structure",
      description: "What each workflow template should cover.",
      items: ["Stages", "Task dependencies", "Client-visible labels", "Archive criteria"],
    },
    workflow: ["Draft", "Review dependencies", "Approve", "Publish"],
  },
  tasks: {
    eyebrow: "Admin tasks",
    title: "Task management",
    description:
      "Follow task queues by person, due date, blocker and stage.",
    code: "TASKS",
    metrics: [
      { label: "Open tasks", value: "0", helper: "Tasks pending staff or admin action." },
      { label: "Blocked", value: "0", helper: "Tasks waiting on the client or another task." },
      { label: "Overdue", value: "0", helper: "Tasks past target completion date." },
    ],
    table: {
      title: "Task queue",
      description: "Representative admin task types and ownership.",
      columns: ["Task", "Type", "Priority", "Owner"],
      rows: [
        ["Review KYC submission", "Compliance", "High", "Reviewer"],
        ["Assign consultant", "Operations", "Medium", "Engagement manager"],
        ["Approve invoice", "Finance", "Medium", "Finance officer"],
        ["Prepare archive pack", "Closeout", "Low", "Document controller"],
      ],
    },
    panel: {
      title: "Task controls",
      description: "Useful task actions for admin oversight.",
      items: ["Assign owner", "Set priority", "Mark blocked", "Escalate overdue work"],
    },
    workflow: ["Created", "Assigned", "In progress", "Closed"],
  },
  documents: {
    eyebrow: "Documents",
    title: "Client and engagement documents",
    description:
      "See uploaded files, check what needs review, ask for replacements and control who can view each file.",
    code: "DOCUMENTS",
    metrics: [
      { label: "All documents", value: "0", helper: "Files currently held in the portal." },
      { label: "Needs review", value: "0", helper: "Files waiting for a staff decision." },
      { label: "Needs replacement", value: "0", helper: "Files the client must submit again." },
    ],
    table: {
      title: "Document queue",
      description: "Each document, its status and who is responsible.",
      columns: ["Document", "Category", "Status", "Owner"],
      rows: [
        ["Client KYC file", "KYC", "Review", "Reviewer"],
        ["Engagement letter", "Legal", "Draft", "Engagement manager"],
        ["Tax schedules", "Workpaper", "Received", "Consultant"],
        ["Final deliverable", "Archive", "Pending", "Document controller"],
      ],
    },
    panel: {
      title: "Document controls",
      description: "What admins can do on the document page.",
      items: ["Open and review a file", "Ask the client for a replacement", "Choose who can view it", "Move completed files to archive"],
    },
    workflow: ["File received", "Category chosen", "Reviewed", "Approved"],
  },
  messages: {
    eyebrow: "Admin messages",
    title: "Message oversight",
    description:
      "Follow client and staff conversations linked to engagements and actions.",
    code: "MESSAGES",
    metrics: [
      { label: "Open threads", value: "0", helper: "Unresolved client or staff conversations." },
      { label: "Needs response", value: "0", helper: "Threads waiting on the firm." },
      { label: "Resolved", value: "0", helper: "Threads closed in the current period." },
    ],
    table: {
      title: "Message queues",
      description: "Thread type, status and responsible team.",
      columns: ["Thread", "Type", "Status", "Owner"],
      rows: [
        ["Client clarification", "Client", "Needs response", "Support staff"],
        ["Document feedback", "Engagement", "Open", "Reviewer"],
        ["Invoice question", "Finance", "Open", "Finance officer"],
        ["Internal handoff", "Staff", "Resolved", "Engagement manager"],
      ],
    },
    panel: {
      title: "Message controls",
      description: "Admin visibility and response workflow.",
      items: ["Assign response owner", "Link to engagement", "Create action item", "Close thread"],
    },
    workflow: ["Received", "Assigned", "Responded", "Resolved"],
  },
  letterTemplates: {
    eyebrow: "Admin letters",
    title: "Letter templates",
    description:
      "Manage ready-made client letters, engagement letters, approval notices and closing messages.",
    code: "LETTER-TEMPLATES",
    metrics: [
      { label: "Letters", value: "4", helper: "Reusable letter templates available to staff." },
      { label: "Published", value: "2", helper: "Approved templates ready for use." },
      { label: "Review", value: "2", helper: "Letter templates awaiting approval." },
    ],
    table: {
      title: "Letter template library",
      description: "Template status, owner and use case.",
      columns: ["Template", "Use case", "Status", "Owner"],
      rows: [
        ["Engagement letter", "Client onboarding", "Published", "Admin"],
        ["KYC approval letter", "Compliance", "Published", "Reviewer"],
        ["Clarification request", "Client action", "Review", "Support staff"],
        ["Closeout letter", "Archive", "Draft", "Engagement manager"],
      ],
    },
    panel: {
      title: "Letter controls",
      description: "Approval checks before templates are published.",
      items: ["Brand review", "Legal wording review", "Variable checks", "Publish version"],
    },
    workflow: ["Draft", "Review", "Approve", "Publish"],
  },
  invoiceTemplates: {
    eyebrow: "Admin invoices",
    title: "Invoice templates",
    description:
      "Set up invoice layouts, line groups, payment instructions and approval notes.",
    code: "INVOICE-TEMPLATES",
    metrics: [
      { label: "Templates", value: "3", helper: "Invoice layouts available to finance users." },
      { label: "Published", value: "2", helper: "Templates available for live invoice creation." },
      { label: "Draft", value: "1", helper: "Templates still being prepared." },
    ],
    table: {
      title: "Invoice template library",
      description: "Template type, status and finance ownership.",
      columns: ["Template", "Billing use", "Status", "Owner"],
      rows: [
        ["Fixed fee invoice", "Fixed scope", "Published", "Finance officer"],
        ["Milestone invoice", "Progress billing", "Published", "Finance officer"],
        ["Retainer invoice", "Recurring billing", "Draft", "Admin"],
      ],
    },
    panel: {
      title: "Invoice controls",
      description: "Fields every invoice template needs.",
      items: ["Line item structure", "Tax display", "Payment instructions", "Approval footer"],
    },
    workflow: ["Draft", "Finance review", "Approve", "Publish"],
  },
  payments: {
    eyebrow: "Payments",
    title: "Client payments",
    description:
      "Check incoming payments, match them to invoices and follow up on mismatches.",
    code: "PAYMENTS",
    metrics: [
      { label: "Needs review", value: "0", helper: "Payments waiting for finance to check." },
      { label: "Matched", value: "0", helper: "Payments linked to the correct invoice." },
      { label: "Needs attention", value: "0", helper: "Payments that do not match clearly." },
    ],
    table: {
      title: "Payment queue",
      description: "Each payment, its invoice and who is checking it.",
      columns: ["Payment", "Invoice", "Status", "Owner"],
      rows: [
        ["Bank transfer", "INV-001", "Pending review", "Finance officer"],
        ["Card payment", "INV-002", "Reconciled", "Finance officer"],
        ["Manual reference", "INV-003", "Exception", "Admin"],
      ],
    },
    panel: {
      title: "Payment controls",
      description: "Finance actions available from this page.",
      items: ["Check payment details", "Match it to an invoice", "Record the receipt", "Mark the payment as complete"],
    },
    workflow: ["Payment received", "Finance checks", "Match invoice", "Send receipt"],
  },
  aiUsage: {
    eyebrow: "AI activity",
    title: "AI activity and review",
    description:
      "See how AI is used, review saved instructions and check answers before clients see them.",
    code: "AI-USAGE",
    metrics: [
      { label: "AI actions", value: "0", helper: "AI activity recorded for this period." },
      { label: "Saved instructions", value: "0", helper: "Reusable questions managed by administrators." },
      { label: "Needs review", value: "0", helper: "Answers waiting for a person to check." },
    ],
    table: {
      title: "Recent AI activity",
      description: "Where AI is used, its status and who is responsible.",
      columns: ["Area", "How it is used", "Status", "Responsible person"],
      rows: [
        ["Client summaries", "Read-only summary", "Allowed", "Admin"],
        ["Research notes", "Staff draft", "Allowed", "Consultant"],
        ["Prompt library", "Admin managed", "Review", "AI admin"],
        ["Exported answers", "Client-facing", "Restricted", "Reviewer"],
      ],
    },
    panel: {
      title: "AI controls",
      description: "Governance actions for AI-assisted workflows.",
      items: ["Review saved instructions", "Check recent activity", "Mark a sensitive answer", "Approve a client summary"],
    },
    workflow: ["Question asked", "Draft created", "A person reviews", "Share approved answer"],
  },
  notifications: {
    eyebrow: "Admin notifications",
    title: "Notifications",
    description:
      "Manage alert rules for KYC, documents, tasks, invoices, messages and workflow updates.",
    code: "NOTIFICATIONS",
    metrics: [
      { label: "Rules", value: "6", helper: "Notification rules configured for portal events." },
      { label: "Enabled", value: "4", helper: "Rules currently active." },
      { label: "Draft", value: "2", helper: "Rules still waiting for review." },
    ],
    table: {
      title: "Notification rules",
      description: "Portal event, channel and status.",
      columns: ["Rule", "Channel", "Status", "Owner"],
      rows: [
        ["KYC submitted", "Email", "Enabled", "Reviewer"],
        ["Invoice issued", "Email", "Enabled", "Finance officer"],
        ["Task overdue", "Portal", "Enabled", "Engagement manager"],
        ["Document returned", "Email", "Draft", "Document controller"],
      ],
    },
    panel: {
      title: "Notification controls",
      description: "Settings that keep alerts useful and traceable.",
      items: ["Choose channel", "Set recipient role", "Define trigger", "Review delivery log"],
    },
    workflow: ["Draft rule", "Test", "Approve", "Enable"],
  },
  integrations: {
    eyebrow: "Connected services",
    title: "Connected services",
    description:
      "See if email, payments, AI and other services work or still need setup.",
    code: "INTEGRATIONS",
    metrics: [
      { label: "Working", value: "1", helper: "Services that are ready to use." },
      { label: "Needs setup", value: "3", helper: "Services still missing information." },
      { label: "Needs checking", value: "1", helper: "Services waiting for an administrator to test them." },
    ],
    table: {
      title: "Service connections",
      description: "What each connection does and whether it is ready.",
      columns: ["Service", "What it does", "Status", "Responsible person"],
      rows: [
        ["MongoDB", "Application database", "Connected", "Admin"],
        ["Email provider", "Verification and notices", "Pending", "Admin"],
        ["Payment provider", "Invoice settlement", "Pending", "Finance officer"],
        ["AI provider", "Workspace assistance", "Review", "AI admin"],
      ],
    },
    panel: {
      title: "Integration controls",
      description: "Readiness checks before production use.",
      items: ["Check login details", "Run a test", "Review what happens if it fails", "Confirm the setup"],
    },
    workflow: ["Add details", "Run a test", "Approve", "Keep checking"],
  },
} satisfies Record<string, AdminPortalSectionConfig>;
