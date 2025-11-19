import express from 'express';
import { TaskService } from '../services/TaskService';
import { MessageModel } from '../models/Message';
import { ApiResponse, MessageListResponse } from '../../../shared/types';

const router = express.Router();

// Get all messages
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = MessageModel.findAll(limit, offset);

    const response: ApiResponse<MessageListResponse> = {
      success: true,
      data: {
        messages,
        total: messages.length
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

// Post a new message (and process it)
router.post('/', async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId || !content) {
      const response: ApiResponse = {
        success: false,
        error: 'userId and content are required'
      };
      return res.status(400).json(response);
    }

    const result = await TaskService.processMessage(userId, content);

    const response: ApiResponse = {
      success: true,
      data: result
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
