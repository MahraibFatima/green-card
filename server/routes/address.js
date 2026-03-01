const router = require('express').Router();
const User = require('../models/user');

// Get all addresses for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ 
            success: true, 
            addresses: user.addresses || [] 
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
    }
});

// Add a new address
router.post('/add', async (req, res) => {
    try {
        const { userId, address } = req.body;

        if (!userId || !address) {
            return res.status(400).json({ success: false, message: 'User ID and address are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add the new address to the user's addresses array
        user.addresses.push(address);
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: 'Address added successfully',
            address: user.addresses[user.addresses.length - 1]
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
});

// Update an address
router.put('/:userId/:addressId', async (req, res) => {
    try {
        const { userId, addressId } = req.params;
        const { address } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Update the address
        user.addresses[addressIndex] = { ...user.addresses[addressIndex]._doc, ...address };
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Address updated successfully',
            address: user.addresses[addressIndex]
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ success: false, message: 'Failed to update address' });
    }
});

// Delete an address
router.delete('/:userId/:addressId', async (req, res) => {
    try {
        const { userId, addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Remove the address
        user.addresses.splice(addressIndex, 1);
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
});

module.exports = router;
