const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Task = require('../models/Task');
const auth = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');

// GET /api/session/today-stats - Final working version
router.get('/today-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Get today's date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('📅 Date range:', { today: today.toISOString(), tomorrow: tomorrow.toISOString() });
    
    // Get today's sessions
    const todaySessions = await Session.find({
      user: userObjectId,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ date: -1 });
    
    console.log('📊 Found sessions today:', todaySessions.length);
    
    // Calculate total time by computing from startTime and endTime
    let totalTime = 0;
    let calculatedSessions = 0;
    
    todaySessions.forEach((session, index) => {
      let sessionDuration = 0;
      
      // First try the stored durationMinutes if it's valid
      if (session.durationMinutes && session.durationMinutes > 0) {
        sessionDuration = session.durationMinutes;
        console.log(`📊 Session ${index + 1}: Using stored duration: ${sessionDuration} minutes`);
      }
      // If stored duration is 0 or missing, calculate from start/end times
      else if (session.startTime && session.endTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const durationMs = end - start;
        sessionDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
        console.log(`📊 Session ${index + 1}: Calculated duration: ${sessionDuration} minutes (${durationMs}ms)`);
      }
      
      if (sessionDuration > 0) {
        totalTime += sessionDuration;
        calculatedSessions++;
      }
    });
    
    console.log('📊 Total time calculated:', totalTime, 'minutes from', calculatedSessions, 'sessions');
    
    // Calculate streak
    const streak = await calculateStreakOptimized(userObjectId);
    
    // Since you have no tasks, let's return 0 but also provide a way to add tasks
    const completedTasks = 0; // Will be 0 since taskCount is 0
    
    // Return the stats
    const result = {
      sessions: todaySessions.length,
      totalTime,
      streak,
      completedTasks,
      debug: {
        calculatedSessions,
        avgSessionTime: calculatedSessions > 0 ? Math.round(totalTime / calculatedSessions) : 0,
        sampleCalculation: todaySessions.length > 0 ? {
          startTime: todaySessions[0].startTime,
          endTime: todaySessions[0].endTime,
          storedDuration: todaySessions[0].durationMinutes,
          calculatedDuration: todaySessions[0].startTime && todaySessions[0].endTime ? 
            Math.round((new Date(todaySessions[0].endTime) - new Date(todaySessions[0].startTime)) / (1000 * 60)) : 0
        } : null
      }
    };
    
    res.json(result);

  } catch (error) {
    console.error('❌ Error fetching today stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching today stats',
      error: error.message 
    });
  }
});

// Optimized streak calculation using aggregation
async function calculateStreakOptimized(userId) {
  try {
    // Get unique dates with sessions, sorted by date descending
    const sessionsGroupedByDate = await Session.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
          "_id.day": -1
        }
      }
    ]);

    if (sessionsGroupedByDate.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let expectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const dayData of sessionsGroupedByDate) {
      const sessionDate = new Date(dayData._id.year, dayData._id.month - 1, dayData._id.day);
      
      // Check if this session date matches our expected date
      if (sessionDate.toDateString() === expectedDate.toDateString()) {
        streak++;
        // Move expected date to previous day
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Gap found, break the streak
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('❌ Error calculating streak:', error);
    return 0;
  }
}

// Endpoint to fix stored durations (run this once to fix your data)
router.post('/fix-durations', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    // Find sessions with 0 duration but valid start/end times
    const sessionsToFix = await Session.find({
      user: userObjectId,
      durationMinutes: { $lte: 0 },
      startTime: { $exists: true },
      endTime: { $exists: true }
    });
    
    console.log('🔧 Found sessions to fix:', sessionsToFix.length);
    
    let fixedCount = 0;
    
    for (const session of sessionsToFix) {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const durationMs = end - start;
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      if (durationMinutes > 0) {
        await Session.updateOne(
          { _id: session._id },
          { durationMinutes: durationMinutes }
        );
        fixedCount++;
        console.log(`🔧 Fixed session ${session._id}: ${durationMinutes} minutes`);
      }
    }
    
    res.json({
      message: `Fixed ${fixedCount} sessions`,
      totalChecked: sessionsToFix.length,
      fixedCount
    });
    
  } catch (error) {
    console.error('❌ Error fixing durations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to create sample tasks for testing
router.post('/create-sample-tasks', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    
    const sampleTasks = [
      {
        user: userObjectId,
        title: 'Complete project documentation',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user: userObjectId,
        title: 'Review code changes',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user: userObjectId,
        title: 'Plan next sprint',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const createdTasks = await Task.insertMany(sampleTasks);
    
    res.json({
      message: `Created ${createdTasks.length} sample tasks`,
      tasks: createdTasks
    });
    
  } catch (error) {
    console.error('❌ Error creating sample tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;