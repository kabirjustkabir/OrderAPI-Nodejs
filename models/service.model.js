const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    serviceId: Number,
    name: String,
  });
  
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;