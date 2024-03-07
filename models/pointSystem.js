const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
  wonPoint: {
    type: Number,
    required: true,
  },
  drawPoint: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Points', pointSchema);
