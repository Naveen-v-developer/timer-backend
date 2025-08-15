const Task = require("../models/Task");

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }); // 🔄 fixed
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.addTask = async (req, res) => {
  const { text, estimatedTime } = req.body;

  try {
    const task = new Task({
      userId: req.user._id, // ✅ Corrected here
      text,
      estimatedTime,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Task creation error:", error);

    // 🔍 Send detailed error message to help debug validation issues
    res.status(400).json({
      message: "Error creating task",
      error: error.message,
    });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // 🔄 fixed
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

// controllers/taskController.js

exports.toggleCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed; // Toggle completion
    await task.save();

    res.json({ message: "Task completion status updated", task });
  } catch (error) {
    console.error("Toggle error:", error);
    res.status(500).json({ message: "Error toggling task completion" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // 🔄 fixed
    });
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

// controllers/taskController.js
exports.getNextTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      userId: req.user._id,
      completed: false
    }).sort({ createdAt: 1 });

    if (!task) return res.status(404).json({ message: "No pending tasks found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching next task" });
  }
};
