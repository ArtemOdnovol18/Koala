const mongoose = require('mongoose');

const miningSchema = new mongoose.Schema({
    reward: Number,
    percentage: Number,
});

const Mining = mongoose.model('Mining', miningSchema);

module.exports = Mining;