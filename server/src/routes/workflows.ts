import express from 'express';
import { WorkflowModel } from '../models/Workflow';
import { ApiResponse } from '../../../shared/types';

const router = express.Router();

// Get all workflows
router.get('/', (req, res) => {
  try {
    const workflows = WorkflowModel.findAll();

    const response: ApiResponse = {
      success: true,
      data: workflows
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// Get workflow by ID
router.get('/:id', (req, res) => {
  try {
    const workflow = WorkflowModel.findById(req.params.id);

    if (!workflow) {
      const response: ApiResponse = {
        success: false,
        error: 'Workflow not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: workflow
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

export default router;
