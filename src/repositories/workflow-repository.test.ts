import { describe, expect, it, vi, beforeEach } from "vitest";
import { Types } from "mongoose";

vi.mock("@/lib/db/mongoose", () => ({
  connectToDatabase: vi.fn(),
}));

vi.mock("@/models/workflow-instance", () => ({
  WorkflowInstanceModel: {
    findOne: vi.fn(),
  },
}));

import { WorkflowInstanceModel } from "@/models/workflow-instance";
import { getWorkflowForPrincipal } from "@/repositories/workflow-repository";
import type { Principal } from "@/features/authorization/access-control";

describe("getWorkflowForPrincipal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes legacy tasks that do not define dependencies", async () => {
    const principal = {
      id: "507f1f77bcf86cd799439011",
      email: "admin@example.com",
      roleKeys: ["admin"],
      permissions: [],
      clientOrganizationIds: [],
      assignedEngagementIds: [],
    } as Principal;

    const workflowId = "507f1f77bcf86cd799439012";
    const mockWorkflow = {
      _id: new Types.ObjectId(workflowId),
      reference: "REF-100",
      clientName: "Example Client",
      serviceName: "Tax Advisory",
      templateName: "default",
      templateVersion: 1,
      status: "active",
      currentStageKey: "active_work",
      nextAction: "Continue",
      riskLevel: "low",
      riskReason: "",
      startDate: new Date(),
      dueDate: null,
      lastActivityAt: new Date(),
      team: [],
      stages: [],
      tasks: [
        {
          key: "task-1",
          stageKey: "active_work",
          title: "Review files",
          description: "",
          assignedRole: "consultant",
          priority: "medium",
          status: "ready",
          clientVisible: false,
          approvalRequired: false,
          reviewHistory: [],
          checklist: [],
          requiredDocuments: [],
        },
      ],
      milestones: [],
      approvals: [],
      clientActions: [],
      documents: [],
      financial: {
        invoiceStatus: "draft",
        paymentStatus: "pending",
        balanceDue: 0,
        currency: "KES",
        invoices: [],
      },
      completionChecklist: [],
      completion: {},
      archive: {},
      activity: [],
      internalNotes: [],
      archivedAt: null,
    };

    vi.mocked(WorkflowInstanceModel.findOne).mockReturnValue({
      lean: () => ({
        exec: async () => mockWorkflow,
      }),
    } as never);

    const result = await getWorkflowForPrincipal(principal, workflowId);

    expect(result).not.toBeNull();
    expect(result?.tasks[0].dependencies).toEqual([]);
  });
});
