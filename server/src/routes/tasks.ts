import express from 'express';
import { TaskService } from '../services/TaskService';
import { ApiResponse, TaskListResponse } from '../../../shared/types';

const router = express.Router();

// Get all tasks
router.get('/', (req, res) => {
  try {
    const { workflowType, status, assignee } = req.query;

    const tasks = TaskService.getAllTasks({
      workflowType: workflowType as string,
      status: status as string,
      assignee: assignee as string
    });

    const response: ApiResponse<TaskListResponse> = {
      success: true,
      data: {
        tasks,
        total: tasks.length
      }
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

// Get task by ID
router.get('/:id', (req, res) => {
  try {
    const task = TaskService.getTaskById(req.params.id);

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: 'Task not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: task
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

// Delete task
router.delete('/:id', (req, res) => {
  try {
    const success = TaskService.deleteTask(req.params.id);

    const response: ApiResponse = {
      success,
      error: success ? undefined : 'Task not found'
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
