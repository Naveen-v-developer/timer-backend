const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const protect = require("../middlewares/authMiddleware");

router.get("/", protect, taskController.getAllTasks);
router.post("/", protect, taskController.addTask);
router.put("/:id", protect, taskController.updateTask);
router.delete("/:id", protect, taskController.deleteTask);
router.patch("/:id/complete", protect, taskController.toggleCompletion);
module.exports = router;
