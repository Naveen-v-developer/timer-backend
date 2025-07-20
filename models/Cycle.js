// models/Cycle.js
const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['focus', 'break'],
    required: true
  },
  duration: Number,
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'pending'
  },
  startTime: Date,
  endTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Cycle', cycleSchema);
