const User = require('../models/User');
const Session = require('../models/Session');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const sessions = await Session.find({ userId: user._id });
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        sessionCount: sessions.length,
        totalFocusTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      };
    }));

    res.status(200).json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Session.deleteMany({ userId: userId });

    res.status(200).json({ message: 'User and associated sessions deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
