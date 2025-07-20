// routes/timerRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware'); // ✅ Use the correct path and name

const {
  startSession,
  endSession,
  getCurrentSession,
  getSessionHistory
} = require('../controllers/timerController');

// Use the correct middleware name
router.use(protect); // ✅ Use 'protect' here since that's what you imported

// Route handlers
router.post('/start', startSession);
router.put('/end', endSession);
router.get('/current', getCurrentSession);
router.get('/history', getSessionHistory);

module.exports = router;
