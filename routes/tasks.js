const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { getCachedTasks, setCachedTasks, invalidateTasksCache } = require('../lib/redis');

const router = express.Router();

router.use(auth);

// GET /api/tasks — List tasks for the logged-in user
router.get('/', async (req, res) => {
  const userId = req.user._id.toString();

  const cached = await getCachedTasks(userId);
  if (cached) {
    return res.json(cached);
  }

  const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
  await setCachedTasks(userId, tasks);
  res.json(tasks);
});

// POST /api/tasks — Create a new task
router.post('/', async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const task = await Task.create({
    title,
    description,
    status,
    dueDate,
    owner: req.user._id,
  });

  await invalidateTasksCache(req.user._id.toString());
  res.status(201).json(task);
});

// PUT /api/tasks/:id — Update a task
router.put('/:id', async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await task.save();
  await invalidateTasksCache(req.user._id.toString());
  res.json(task);
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await invalidateTasksCache(req.user._id.toString());
  res.json({ message: 'Task deleted' });
});

module.exports = router;
