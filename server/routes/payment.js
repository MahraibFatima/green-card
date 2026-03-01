const router = require('express').Router();
const User = require('../models/user');

// Get all payment methods for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            paymentMethods: user.paymentMethods || [] 
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
    }
});

// Add a new payment method
router.post('/add', async (req, res) => {
    try {
        const { userId, paymentMethod } = req.body;

        if (!userId || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'User ID and payment method are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If this is set as default, unset all other defaults
        if (paymentMethod.isDefault) {
            user.paymentMethods.forEach(pm => {
                pm.isDefault = false;
            });
        }

        // Add the new payment method to the user's payment methods array
        user.paymentMethods.push(paymentMethod);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: 'Payment method added successfully',
            paymentMethod: user.paymentMethods[user.paymentMethods.length - 1]
        });
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({ success: false, message: 'Failed to add payment method' });
    }
});

// Update a payment method
router.put('/:userId/:paymentMethodId', async (req, res) => {
    try {
        const { userId, paymentMethodId } = req.params;
        const { paymentMethod } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const pmIndex = user.paymentMethods.findIndex(
            pm => pm._id.toString() === paymentMethodId
        );

        if (pmIndex === -1) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }

        // If this is set as default, unset all other defaults
        if (paymentMethod.isDefault) {
            user.paymentMethods.forEach((pm, idx) => {
                if (idx !== pmIndex) {
                    pm.isDefault = false;
                }
            });
        }

        // Update the payment method
        user.paymentMethods[pmIndex] = { ...user.paymentMethods[pmIndex]._doc, ...paymentMethod };
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Payment method updated successfully',
            paymentMethod: user.paymentMethods[pmIndex]
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment method' });
    }
});

// Delete a payment method
router.delete('/:userId/:paymentMethodId', async (req, res) => {
    try {
        const { userId, paymentMethodId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const pmIndex = user.paymentMethods.findIndex(
            pm => pm._id.toString() === paymentMethodId
        );

        if (pmIndex === -1) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }

        // Remove the payment method
        user.paymentMethods.splice(pmIndex, 1);
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete payment method' });
    }
});

module.exports = router;
