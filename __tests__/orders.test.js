const request = require("supertest");
const app = require("../server");
const Order = require("../models/order.model");

describe("Orders", () => {
  describe("Create Order", () => {
    beforeEach(async () => {
      // Clear the database before each test
      await Order.deleteMany({});
    });

    it("should create a new order with valid data", async () => {
      const orderData = {
        datetime: "2023-07-08T09:00:02.000Z",
        totalfee: 150,
        services: [{ serviceId: 456 }],
      };

      const res = await request(app).post("/v1/orders").send(orderData);

      expect(res.status).toBe(201);
      expect(res.body.totalfee).toBe(150);
    });

    it("should return an error if the services array is empty", async () => {
      const orderData = {
        datetime: "2023-07-08T09:00:02.000Z",
        totalfee: 150,
        services: [],
      };

      const res = await request(app).post("/v1/orders").send(orderData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("There should be at least one service ID");
    });

    it("should return an error if an existing order with the same service within 3 hours is found", async () => {
      // Create a sample existing order within 3 hours with the same service
      const existingOrder = new Order({
        datetime: new Date().getTime() - 2 * 60 * 60 * 1000, // Within 3 hours
        totalfee: 100,
        services: [{ serviceId: 456 }],
      });
      await existingOrder.save();

      const orderData = {
        datetime: new Date().getTime(),
        totalfee: 200,
        services: [{ serviceId: 456 }],
      };

      const res = await request(app).post("/v1/orders").send(orderData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("An order already exists within 3 hours");

      // Clean up the test data
      await Order.deleteOne({ _id: existingOrder._id });
    });

  });
  describe("Update Order", () => {
    it("should update an existing order with valid data", async () => {
      // Create a sample order
      const order = new Order({
        datetime: '2023-07-08T09:00:00.000Z',
        totalfee: 100,
        services: [{ serviceId: 123 }],
      });
      await order.save();
  
      const updatedData = {
        datetime: "2023-07-08T12:01:00.000Z",
        totalfee: 200,
        services: [{ serviceId: 123 }],
      };
  
      const res = await request(app)
        .patch(`/v1/orders/${order._id}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.datetime).toBe(updatedData.datetime);
      expect(res.body.totalfee).toBe(updatedData.totalfee);
      expect(res.body.services[0].serviceId).toBe(updatedData.services[0].serviceId);
  
      // Clean up the test data
      await Order.findByIdAndDelete(order._id);
    });
  
    it("should return an error if an existing order with the same service within 3 hours is found", async () => {
      // Create a sample order within 3 hours with the same service
      const existingOrder = new Order({
        datetime: new Date().getTime() - 2 * 60 * 60 * 1000, // Within 3 hours
        totalfee: 100,
        services: [{ serviceId: 456 }],
      });
      await existingOrder.save();
  
      // Create an order to update with conflicting data
      const order = new Order({
        datetime: new Date(),
        totalfee: 200,
        services: [{ serviceId: 789 }],
      });
      await order.save();
  
      const updatedData = {
        datetime: new Date(),
        totalfee: 300,
        services: [{ serviceId: 456 }],
      };
  
      const res = await request(app)
        .patch(`/v1/orders/${order._id}`)
        .send(updatedData);
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("An order already exists within 3 hours");
  
      // Clean up the test data
      await Order.findByIdAndDelete(order._id);
      await Order.findByIdAndDelete(existingOrder._id);
    });
  
    it("should return an error if the updated order was created within 3 hours", async () => {
      // Create a sample order within 3 hours
      const order = new Order({
        datetime: '2023-07-08T09:00:00.000Z', // Within 3 hours
        totalfee: 100,
        services: [{ serviceId: 123 }],
      });
      await order.save();
  
      const updatedData = {
        datetime: '2023-07-08T09:05:00.000Z',
        totalfee: 200,
        services: [{ serviceId: 456 }],
      };
  
      const res = await request(app)
        .patch(`/v1/orders/${order._id.toString()}`)
        .send(updatedData);
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("An order already exists within 3 hours");
  
      // Clean up the test data
      await Order.findByIdAndDelete(order._id);
    });
  });
  it("should return all orders", async () => {
    // Create sample orders
    const order1 = new Order({
      datetime: "2023-07-08T09:00:00.000Z",
      totalfee: 100,
      services: [{ serviceId: 123 }],
    });
    await order1.save();
  
    const order2 = new Order({
      datetime: "2023-07-08T10:00:00.000Z",
      totalfee: 200,
      services: [{ serviceId: 456 }],
    });
    await order2.save();
  
    const res = await request(app).get("/v1/orders");
  
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2); // Assuming two orders were created
    expect(res.body[0].totalfee).toBe(order1.totalfee);
    expect(res.body[1].totalfee).toBe(order2.totalfee);
  
    // Clean up the test data
    await Order.deleteMany();
  });
});
