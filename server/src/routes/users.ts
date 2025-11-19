import express from 'express';
import { UserModel } from '../models/User';
import { ApiResponse } from '../../../shared/types';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  try {
    const users = UserModel.findAll();

    const response: ApiResponse = {
      success: true,
      data: users
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

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = UserModel.findById(req.params.id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: user
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

// Create user
router.post('/', (req, res) => {
  try {
    const { id, name, email, avatar } = req.body;

    if (!id || !name || !email) {
      const response: ApiResponse = {
        success: false,
        error: 'id, name, and email are required'
      };
      return res.status(400).json(response);
    }

    const user = UserModel.create({ id, name, email, avatar });

    const response: ApiResponse = {
      success: true,
      data: user
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
