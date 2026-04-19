const router = require('express').Router();
const Product = require('../models/product');

router.post('/create', async (req, res) => {
  try {
    const { name, description, category, price, offerPrice, image, sellerId } = req.body;

    const parsedPrice = Number(price);
    const parsedOfferPrice = Number(offerPrice);

    if (!name || !category || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'name, category, price, offerPrice and sellerId are required',
      });
    }

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedOfferPrice) || parsedPrice < 0 || parsedOfferPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'price and offerPrice must be valid positive numbers',
      });
    }

    const normalizedDescription = Array.isArray(description)
      ? description.filter((line) => String(line).trim() !== '').map((line) => String(line).trim())
      : [];

    const normalizedImages = Array.isArray(image)
      ? image.filter((url) => String(url).trim() !== '').map((url) => String(url).trim())
      : [];

    const product = await Product.create({
      name: String(name).trim(),
      description: normalizedDescription,
      category: String(category).trim(),
      price: parsedPrice,
      offerPrice: parsedOfferPrice,
      image: normalizedImages,
      sellerId,
      inStock: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { inStock, sellerId } = req.query;

    const filter = {};
    if (inStock === 'true') {
      filter.inStock = true;
    }
    if (inStock === 'false') {
      filter.inStock = false;
    }
    if (sellerId) {
      filter.sellerId = sellerId;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

router.post('/stock', async (req, res) => {
  try {
    const { id, inStock } = req.body;

    if (!id || typeof inStock !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'id and inStock(boolean) are required',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product marked as ${inStock ? 'in stock' : 'out of stock'}`,
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message,
    });
  }
});

module.exports = router;
