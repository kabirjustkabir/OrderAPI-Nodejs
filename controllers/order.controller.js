const CustomError = require('../utils/CustomError');
const asyncErrorHandler = require('../utils/catchAsync')

const { Order } = require('../models');


// check if an order is exist in DB or not
const checkOId = async(req,res,next,value)=>{
    const order = await Order.findById(value);

    if (!order) {
    return res.status(404).json({ error: 'Order not found' });
    }
    next()
}

// getAllOrders
const getAllOrders = asyncErrorHandler(async (req, res) => {
      const orders = await Order.find();
      res.status(200).json(orders);
  });

// Create An order
const createOrder = asyncErrorHandler(async (req, res,next) => {
        const { datetime, totalfee, services } = req.body;
        if(services && services.length){
            // Check if there's a pre-existing order within 3 hours with any of the same services
            const existingOrder = await Order.findOne({
                datetime: { $gte: new Date(datetime).getTime() - 3 * 60 * 60 * 1000 },
                $or: services.map(service => ({ 'services.serviceId': service.serviceId })),
              });
              
              if (existingOrder) {
                  const err =  new CustomError('An order already exists within 3 hours',400)
                  return next(err)
              }
          
              // Create a new order
              const order = new Order({  datetime, totalfee, services });
              await order.save();
              res.status(201).json(order);
        }else{
            const err =  new CustomError('There should be at least one service ID',400)
            return next(err)
        }
        
        
  })  


const getOrderById = asyncErrorHandler(async (req, res) => {
        const orderId = req.params.OId;
        const order = await Order.findById(orderId);
        res.status(200).json(order);
    });
  
const updateOrder = asyncErrorHandler(async (req, res,next) => {
      const orderId = req.params.OId;
      const { datetime, totalfee, services } = req.body;
  
      // Find the current order
      const currentOrder = await Order.findById(orderId);
  
      // Check if there's a pre-existing order within 3 hours with any of the same services
      const existingOrder = await Order.findOne({
        _id: { $ne: orderId },
        datetime: { $gte: new Date(datetime).getTime() - 3 * 60 * 60 * 1000 },
        'services.serviceId': { $in: services.map(service => service.serviceId) },
      });
      if (existingOrder) {
        const err =  new CustomError('An order already exists within 3 hours',400)
        return next(err)
      }
  
      // Check if the current order was created within 3 hours
      const currentOrderTime = currentOrder.datetime.getTime();
      const updatedOrderTime = new Date(datetime).getTime();
      const timeDifferenceInHours = Math.abs(updatedOrderTime - currentOrderTime) / (60 * 60 * 1000);
  
      if (timeDifferenceInHours <= 3) {
        const err =  new CustomError('An order already exists within 3 hours',400)
        return next(err)
      }
  
      // Update the order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { datetime, totalfee, services },
        { new: true }
      );
      res.status(200).json(updatedOrder);
  }) ;

const deleteOrder =asyncErrorHandler(async (req, res) => {
        await Order.findByIdAndDelete(req.params.OId);
        res.status(200).json({ message: 'Order deleted successfully' });

    });

module.exports = {
    getAllOrders,
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    checkOId
};