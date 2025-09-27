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

// Register new user endpoint removed - users register through Supabase Auth directly

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
      profileImageUrl: profileImageUrl || undefined,
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin users endpoint removed - no role-based access needed

export default router;
