/**
 * Groups API Routes
 */
const express = require('express');
const router = express.Router();
const groupsService = require('../../services/groups');

// Get user's groups
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    const groups = await groupsService.getUserGroups(userId);
    res.json({ data: groups });
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await groupsService.getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ data: group });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const groupData = req.body;
    const group = await groupsService.createGroup(groupData);
    res.status(201).json({ data: group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

