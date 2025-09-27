import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAuth';
import { storage } from '../storage';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Register new user (admin only)
router.post('/register', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, password, fullName, role = 'user' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role,
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.user) {
      // Create user in our database
      await storage.upsertUser({
        id: data.user.id,
        email: data.user.email!,
        fullName: fullName,
        role: role,
      });
    }

    res.json({ 
      message: 'User created successfully',
      user: data.user 
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fullName, profileImageUrl } = req.body;

    // Update user in our database
    const updatedUser = await storage.upsertUser({
      id: req.user.id,
      email: req.user.email,
      fullName: fullName || undefined,
      role: req.user.role,
      profileImageUrl: profileImageUrl || undefined,
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // This would require implementing getAllUsers in storage
    // For now, return a placeholder
    res.json({ message: 'Admin users endpoint - implement getAllUsers in storage' });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
