const express = require('express');
const orderRoute = require('./order.route');

const router = express.Router();
const defaultRoutes = [
  {
    path: '/orders',
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});


module.exports = router;