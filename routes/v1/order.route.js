const express = require('express');

const orderController = require('../../controllers/order.controller');

const router = express.Router();


// Using express router.param middleware to check wheather an orderId is valid or not
router.param('OId', orderController.checkOId)

router
  .route('/')
  .get( orderController.getAllOrders)
  .post( orderController.createOrder);

router
  .route('/:OId')
  .get(orderController.getOrderById)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;