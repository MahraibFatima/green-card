const router = require('express').Router();
const User = require('../models/user');

// Get cart items for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            cartItems: user.cartItems || [] 
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
    }
});

// Add item to cart or update quantity
router.post('/add', async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: 'User ID and product ID are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if item already exists in cart
        const existingItemIndex = user.cartItems.findIndex(
            item => item.productId === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            user.cartItems[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            user.cartItems.push({ productId, quantity });
        }

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Item added to cart',
            cartItems: user.cartItems
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to add item to cart' });
    }
});

// Update cart item quantity
router.put('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const itemIndex = user.cartItems.findIndex(
            item => item.productId === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        user.cartItems[itemIndex].quantity = quantity;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Cart updated',
            cartItems: user.cartItems
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
});

// Remove item from cart
router.delete('/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.cartItems = user.cartItems.filter(
            item => item.productId !== productId
        );

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Item removed from cart',
            cartItems: user.cartItems
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
    }
});

// Clear entire cart
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.cartItems = [];
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear cart' });
    }
});

module.exports = router;
