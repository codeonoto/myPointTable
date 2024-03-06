const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  teamTotalMatch: {
    type: Number,
  },
  teamWon: {
    type: Number,
    required: true,
  },
  teamLost: {
    type: Number,
    required: true,
  },
  teamDraw: {
    type: Number,
    required: true,
  },
  teamPenalty: {
    type: Number,
  },
  teamPoints: {
    type: Number,
  },
  teamWinPercentage: {
    type: Number,
  },
});

module.exports = mongoose.model('Team', teamSchema);
