const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_INTERVAL_MS = 12 * 60 * 60 * 1000;

const STEP_LABELS = {
  placed: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const maybeAdvanceOrderStatus = async (order) => {
  if (!order) return;

  if (!Array.isArray(order.statusHistory)) {
    order.statusHistory = [];
  }

  if (order.statusHistory.length === 0) {
    order.statusHistory.push({
      status: order.status || 'placed',
      note: 'Order created',
      timestamp: order.createdAt || new Date(),
    });
  }

  if (order.status === 'cancelled' || order.status === 'delivered') {
    return;
  }

  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const elapsedMs = Date.now() - createdAt.getTime();
  const expectedIndex = Math.min(
    Math.floor(elapsedMs / STATUS_INTERVAL_MS),
    STATUS_FLOW.length - 1
  );

  let currentIndex = STATUS_FLOW.indexOf(order.status);
  if (currentIndex === -1) {
    currentIndex = STATUS_FLOW.indexOf('placed');
    order.status = 'placed';
  }

  if (expectedIndex <= currentIndex) {
    return;
  }

  for (let i = currentIndex + 1; i <= expectedIndex; i += 1) {
    const nextStatus = STATUS_FLOW[i];
    order.statusHistory.push({
      status: nextStatus,
      note: `Auto-updated to ${STEP_LABELS[nextStatus]} after 12 hours`,
      timestamp: new Date(createdAt.getTime() + i * STATUS_INTERVAL_MS),
    });
  }

  order.status = STATUS_FLOW[expectedIndex];
  order.updatedAt = new Date();
  await order.save();
};

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, address, paymentType, amount, status, customer } = req.body;
    const initialStatus = status || 'placed';

    console.log('Received order data:', JSON.stringify(req.body, null, 2));

    if (!userId || !items || !address || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const order = new Order({
      userId,
      items,
      address,
      customer,
      paymentType: paymentType || 'COD',
      amount,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          note: 'Order created',
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    console.log('Order created successfully:', order._id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
});

// Get tracking details for a specific order
router.get('/:userId/:orderId/tracking', async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await maybeAdvanceOrderStatus(order);

    const timeline = (order.statusHistory || []).map((entry) => ({
      status: entry.status,
      label: STEP_LABELS[entry.status] || entry.status,
      note: entry.note || '',
      timestamp: entry.timestamp,
    }));

    return res.status(200).json({
      success: true,
      tracking: {
        orderId: order._id,
        userId: order.userId,
        status: order.status,
        amount: order.amount,
        address: order.address,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        timeline,
      },
    });
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking details',
      error: error.message,
    });
  }
});

// Get all orders containing products that belong to a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ 'items.sellerId': sellerId }).sort({ createdAt: -1 });

    await Promise.all(orders.map((order) => maybeAdvanceOrderStatus(order)));

    const userIds = [...new Set(orders.map((order) => order.userId).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('name email addresses');
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const sellerOrders = orders
      .map((orderDoc) => {
        const order = orderDoc.toObject();
        const sellerItems = (order.items || []).filter(
          (item) => String(item.sellerId || '') === String(sellerId)
        );

        if (sellerItems.length === 0) {
          return null;
        }

        const user = userMap.get(String(order.userId));
        const fallbackAddress = user?.addresses?.[0] || {};

        const customerName =
          order.customer?.name ||
          user?.name ||
          [order.address?.firstName, order.address?.lastName].filter(Boolean).join(' ').trim() ||
          'Customer';

        const customerEmail = order.customer?.email || user?.email || order.address?.email || '';
        const customerPhone = order.customer?.phone || order.address?.phone || fallbackAddress.phone || '';

        return {
          ...order,
          items: sellerItems,
          sellerAmount: sellerItems.reduce(
            (sum, item) => sum + Number(item.price || item.product?.offerPrice || 0) * Number(item.quantity || 0),
            0
          ),
          customer: {
            userId: order.userId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          address: {
            street: order.address?.street || fallbackAddress.street || '',
            city: order.address?.city || fallbackAddress.city || '',
            state: order.address?.state || fallbackAddress.state || '',
            zipCode:
              order.address?.zipCode ||
              order.address?.zipcode ||
              (fallbackAddress.zipcode ? String(fallbackAddress.zipcode) : ''),
            country: order.address?.country || fallbackAddress.country || '',
            phone: order.address?.phone || fallbackAddress.phone || '',
          },
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      orders: sellerOrders,
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller orders',
      error: error.message,
    });
  }
});

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    await Promise.all(orders.map((order) => maybeAdvanceOrderStatus(order)));

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get a specific order
router.get('/:userId/:orderId', async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await maybeAdvanceOrderStatus(order);

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== status) {
      order.statusHistory.push({
        status,
        note: `Order moved to ${status}`,
        timestamp: new Date(),
      });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

module.exports = router;
