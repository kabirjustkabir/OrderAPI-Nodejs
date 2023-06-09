const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    datetime: {
      type:Date,
      required : [true, 'Date is a required field']
    },
    totalfee: {
      type:Number,
      required : [true, 'totalfee is a required field']
    },
    services: [{ serviceId: Number }],
  });
  
  const Order = mongoose.model('Order', orderSchema);

module.exports = Order;