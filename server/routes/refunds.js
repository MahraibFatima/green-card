const router = require('express').Router();
const Refund = require('../models/refund');
const Order = require('../models/order');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const refunds = await Refund.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch refunds',
    });
  }
});

router.post('/request', async (req, res) => {
  try {
    const { userId, orderId, reason } = req.body;

    if (!userId || !orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'User ID, order ID, and reason are required',
      });
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const existingRefund = await Refund.findOne({ orderId });
    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: 'Refund request already exists for this order',
      });
    }

    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Refunds are only allowed for delivered or cancelled orders',
      });
    }

    const refund = await Refund.create({
      userId,
      orderId,
      amount: order.amount,
      reason,
      status: 'Processing',
      paymentType: order.paymentType || 'COD',
    });

    return res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      refund,
    });
  } catch (error) {
    console.error('Request refund error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to request refund',
    });
  }
});

router.patch('/:refundId/status', async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status, adminNote } = req.body;

    if (!['Processing', 'Refunded', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund status',
      });
    }

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found',
      });
    }

    refund.status = status;
    if (typeof adminNote === 'string') {
      refund.adminNote = adminNote;
    }

    await refund.save();

    return res.status(200).json({
      success: true,
      message: 'Refund status updated successfully',
      refund,
    });
  } catch (error) {
    console.error('Update refund status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update refund status',
    });
  }
});

module.exports = router;