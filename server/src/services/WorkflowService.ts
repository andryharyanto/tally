import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '../../../shared/types';
import { WorkflowModel } from '../models/Workflow';

export class WorkflowService {
  static initializeDefaultWorkflows(): void {
    const workflows = this.getDefaultWorkflows();

    for (const workflow of workflows) {
      const existing = WorkflowModel.findByName(workflow.name);
      if (!existing) {
        WorkflowModel.create(workflow);
        console.log(`Created workflow: ${workflow.name}`);
      }
    }
  }

  private static getDefaultWorkflows(): Omit<Workflow, 'createdAt' | 'updatedAt'>[] {
    return [
      // Invoice Generation Tracking
      {
        id: uuidv4(),
        name: 'Invoice Generation',
        description: 'Track invoice generation for multiple customers and batch operations',
        stages: [
          { id: uuidv4(), name: 'Draft', order: 1 },
          { id: uuidv4(), name: 'Review', order: 2 },
          { id: uuidv4(), name: 'Sent', order: 3 },
          { id: uuidv4(), name: 'Paid', order: 4 }
        ],
        fields: [
          { id: uuidv4(), name: 'Invoice Number', type: 'text', required: true },
          { id: uuidv4(), name: 'Customer Name', type: 'text', required: true },
          { id: uuidv4(), name: 'Amount', type: 'number', required: true },
          { id: uuidv4(), name: 'Due Date', type: 'date', required: true },
          { id: uuidv4(), name: 'Notes', type: 'text', required: false }
        ]
      },

      // Payment Reconciliation
      {
        id: uuidv4(),
        name: 'Payment Reconciliation',
        description: 'Match and reconcile invoices with payments received',
        stages: [
          { id: uuidv4(), name: 'Pending', order: 1 },
          { id: uuidv4(), name: 'Matching', order: 2 },
          { id: uuidv4(), name: 'Reconciled', order: 3 },
          { id: uuidv4(), name: 'Exception', order: 4 }
        ],
        fields: [
          { id: uuidv4(), name: 'Invoice Number', type: 'text', required: true },
          { id: uuidv4(), name: 'Expected Amount', type: 'number', required: true },
          { id: uuidv4(), name: 'Received Amount', type: 'number', required: false },
          { id: uuidv4(), name: 'Payment Date', type: 'date', required: false },
          { id: uuidv4(), name: 'Variance', type: 'number', required: false }
        ]
      },

      // Monthly Close Checklist
      {
        id: uuidv4(),
        name: 'Monthly Close',
        description: 'Recurring checklist for monthly financial close process',
        stages: [
          { id: uuidv4(), name: 'Not Started', order: 1 },
          { id: uuidv4(), name: 'In Progress', order: 2 },
          { id: uuidv4(), name: 'Review', order: 3 },
          { id: uuidv4(), name: 'Complete', order: 4 }
        ],
        fields: [
          { id: uuidv4(), name: 'Month', type: 'text', required: true },
          { id: uuidv4(), name: 'Year', type: 'number', required: true },
          { id: uuidv4(), name: 'Close Date', type: 'date', required: true },
          { id: uuidv4(), name: 'Checklist Items', type: 'text', required: false }
        ]
      },

      // Annual Planning
      {
        id: uuidv4(),
        name: 'Annual Planning',
        description: 'Project workflow for annual planning with milestones',
        stages: [
          { id: uuidv4(), name: 'Planning', order: 1 },
          { id: uuidv4(), name: 'Draft', order: 2 },
          { id: uuidv4(), name: 'Review', order: 3 },
          { id: uuidv4(), name: 'Approved', order: 4 },
          { id: uuidv4(), name: 'Published', order: 5 }
        ],
        fields: [
          { id: uuidv4(), name: 'Year', type: 'number', required: true },
          { id: uuidv4(), name: 'Budget Owner', type: 'text', required: true },
          { id: uuidv4(), name: 'Department', type: 'text', required: false },
          { id: uuidv4(), name: 'Milestone', type: 'text', required: false }
        ]
      },

      // Model Change Control
      {
        id: uuidv4(),
        name: 'Model Change Control',
        description: 'Track changes to financial models with version control and approvals',
        stages: [
          { id: uuidv4(), name: 'Draft', order: 1 },
          { id: uuidv4(), name: 'Testing', order: 2 },
          { id: uuidv4(), name: 'Approval', order: 3 },
          { id: uuidv4(), name: 'Deployed', order: 4 }
        ],
        fields: [
          { id: uuidv4(), name: 'Model Name', type: 'text', required: true },
          { id: uuidv4(), name: 'Version', type: 'text', required: true },
          { id: uuidv4(), name: 'Change Description', type: 'text', required: true },
          { id: uuidv4(), name: 'Impact Areas', type: 'multiselect',
            options: ['Revenue', 'Expenses', 'Headcount', 'Cash Flow', 'Other'],
            required: false },
          { id: uuidv4(), name: 'Approvers', type: 'multiselect', required: true }
        ]
      },

      // Vendor Onboarding
      {
        id: uuidv4(),
        name: 'Vendor Onboarding',
        description: 'Manage vendor onboarding and setup process',
        stages: [
          { id: uuidv4(), name: 'Initial Contact', order: 1 },
          { id: uuidv4(), name: 'Documentation', order: 2 },
          { id: uuidv4(), name: 'Review', order: 3 },
          { id: uuidv4(), name: 'Approved', order: 4 },
          { id: uuidv4(), name: 'Active', order: 5 }
        ],
        fields: [
          { id: uuidv4(), name: 'Vendor Name', type: 'text', required: true },
          { id: uuidv4(), name: 'Contact Person', type: 'text', required: true },
          { id: uuidv4(), name: 'Category', type: 'select',
            options: ['Software', 'Services', 'Supplies', 'Consulting', 'Other'],
            required: true },
          { id: uuidv4(), name: 'Contract Value', type: 'number', required: false },
          { id: uuidv4(), name: 'Payment Terms', type: 'text', required: false }
        ]
      }
    ];
  }
}
