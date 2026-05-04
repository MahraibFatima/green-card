const express = require('express');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const router = express.Router();

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

const getSellerById = async (sellerId) => {
  const seller = await User.findById(sellerId).select('-password');

  if (!seller || seller.role !== 'seller') {
    return null;
  }

  return seller;
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

const buildSellerOrders = async (sellerId) => {
  const orders = await Order.find({ 'items.sellerId': sellerId }).sort({ createdAt: -1 });
  const fallbackOrders = await Order.find({ 'items.productId': { $exists: true } }).sort({ createdAt: -1 });

  const productIds = [...new Set(
    fallbackOrders.flatMap((order) => (order.items || []).map((item) => item.productId).filter(Boolean))
  )];
  const products = await Product.find({ _id: { $in: productIds } }).select('_id sellerId');
  const productSellerMap = new Map(products.map((product) => [String(product._id), String(product.sellerId || '')]));

  const orderMap = new Map(orders.map((order) => [String(order._id), order]));
  fallbackOrders.forEach((order) => {
    const hasMatchingItem = (order.items || []).some((item) => {
      const directSellerMatch = String(item.sellerId || '') === String(sellerId);
      const fallbackSellerMatch = !item.sellerId && String(productSellerMap.get(String(item.productId)) || '') === String(sellerId);
      return directSellerMatch || fallbackSellerMatch;
    });

    if (hasMatchingItem && !orderMap.has(String(order._id))) {
      orderMap.set(String(order._id), order);
    }
  });

  const enrichedOrders = [...orderMap.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  await Promise.all(enrichedOrders.map((order) => maybeAdvanceOrderStatus(order)));

  const userIds = [...new Set(enrichedOrders.map((order) => order.userId).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select('name email addresses');
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return enrichedOrders
    .map((orderDoc) => {
      const order = orderDoc.toObject();
      const sellerItems = (order.items || []).filter((item) => {
        const directSellerMatch = String(item.sellerId || '') === String(sellerId);
        const fallbackSellerMatch = !item.sellerId && String(productSellerMap.get(String(item.productId)) || '') === String(sellerId);
        return directSellerMatch || fallbackSellerMatch;
      });

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
};

router.get('/:sellerId/profile', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    return res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller profile',
      error: error.message,
    });
  }
});

router.put('/:sellerId/profile', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { name, email, shopName, shopDescription, shopPhone } = req.body;

    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    if (typeof email === 'string') {
      const normalizedEmail = email.trim();
      if (normalizedEmail && normalizedEmail !== seller.email) {
        const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: sellerId } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
        seller.email = normalizedEmail;
      }
    }

    if (typeof name === 'string') {
      seller.name = name.trim();
    }

    if (typeof shopName === 'string') {
      seller.shopName = shopName.trim();
    }

    if (typeof shopDescription === 'string') {
      seller.shopDescription = shopDescription.trim();
    }

    if (typeof shopPhone === 'string') {
      seller.shopPhone = shopPhone.trim();
    }

    await seller.save();

    const updatedSeller = seller.toObject();
    delete updatedSeller.password;

    return res.status(200).json({
      success: true,
      message: 'Seller profile updated successfully',
      seller: updatedSeller,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update seller profile',
      error: error.message,
    });
  }
});

router.get('/:sellerId/products', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await getSellerById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller products',
      error: error.message,
    });
  }
});

router.patch('/:sellerId/products/:productId/stock', async (req, res) => {
  try {
    const { sellerId, productId } = req.params;
    const { inStock } = req.body;

    if (typeof inStock !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'inStock(boolean) is required',
      });
    }

    const seller = await getSellerById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, sellerId },
      { inStock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product marked as ${inStock ? 'in stock' : 'out of stock'}`,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update product stock',
      error: error.message,
    });
  }
});

router.delete('/:sellerId/products/:productId', async (req, res) => {
  try {
    const { sellerId, productId } = req.params;

    const seller = await getSellerById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const deletedProduct = await Product.findOneAndDelete({ _id: productId, sellerId });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
});

router.get('/:sellerId/orders', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const orders = await buildSellerOrders(sellerId);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller orders',
      error: error.message,
    });
  }
});

router.get('/:sellerId/dashboard', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await getSellerById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const sellerOrders = await buildSellerOrders(sellerId);

    const productMap = new Map();
    const categoryMap = new Map();

    let totalPayment = 0;
    let totalItemsSold = 0;

    sellerOrders.forEach((order) => {
      const includeInPayment = order.status !== 'cancelled';
      if (includeInPayment) {
        totalPayment += Number(order.sellerAmount || 0);
      }

      (order.items || []).forEach((item) => {
        const quantity = Number(item.quantity || 0);
        const revenue = Number(item.price || item.product?.offerPrice || 0) * quantity;
        const productName = item.product?.name || 'Unknown Product';
        const categoryName = item.product?.category || 'Uncategorized';

        totalItemsSold += quantity;

        if (!productMap.has(productName)) {
          productMap.set(productName, { name: productName, quantity: 0, revenue: 0 });
        }
        const productAgg = productMap.get(productName);
        productAgg.quantity += quantity;
        productAgg.revenue += revenue;

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { category: categoryName, quantity: 0, revenue: 0 });
        }
        const categoryAgg = categoryMap.get(categoryName);
        categoryAgg.quantity += quantity;
        categoryAgg.revenue += revenue;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalOrders: sellerOrders.length,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalItemsSold,
        topProduct: topProducts[0] || null,
        topProducts,
        topCategory: topCategories[0] || null,
        topCategories,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller dashboard',
      error: error.message,
    });
  }
});

module.exports = router;