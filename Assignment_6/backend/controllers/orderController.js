import Order from '../models/Order.js';
import Vehicle from '../models/Vehicle.js';

// Buyer: Place a purchase request (pays details, vehicle reserved)
export const placeOrder = async (req, res) => {
  try {
    const { id } = req.params; // vehicle ID
    const { buyerName, buyerPhone, buyerAddress } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'approved') {
      return res.status(400).json({ message: 'Vehicle is not available for purchase.' });
    }
    if (vehicle.seller.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot buy your own vehicle.' });
    }

    // Create the Order
    const order = await Order.create({
      vehicle: vehicle._id,
      buyer: req.userId,
      seller: vehicle.seller,
      buyerName,
      buyerPhone,
      buyerAddress,
      agreedPrice: vehicle.price,
      status: 'requested',
    });

    // Mark vehicle as reserved so it hides from marketplace
    vehicle.status = 'reserved';
    await vehicle.save();

    res.status(201).json({ message: 'Purchase request placed. Waiting for seller confirmation.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong placing order.' });
  }
};

// Seller: Confirm the deal is done
export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('vehicle');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the seller of the vehicle can confirm
    if (order.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the seller can confirm this deal.' });
    }
    if (order.status !== 'requested') {
      return res.status(400).json({ message: 'Order is not in a confirmable state.' });
    }

    order.status = 'completed';
    await order.save();

    // Mark vehicle as permanently sold
    await Vehicle.findByIdAndUpdate(order.vehicle._id, { status: 'sold' });

    res.status(200).json({ message: 'Deal confirmed! Vehicle marked as sold.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong confirming the order.' });
  }
};

// Seller: Cancel / decline the purchase request (releases vehicle back to approved)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('vehicle');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isSeller = order.seller.toString() === req.userId;
    const isBuyer = order.buyer.toString() === req.userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ message: 'Not authorized to cancel this order.' });
    }
    if (order.status !== 'requested') {
      return res.status(400).json({ message: 'Order cannot be cancelled.' });
    }

    order.status = 'cancelled';
    await order.save();

    // Release vehicle back to approved listing
    await Vehicle.findByIdAndUpdate(order.vehicle._id, { status: 'approved' });

    res.status(200).json({ message: 'Order cancelled. Vehicle is available again.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong cancelling the order.' });
  }
};

// Buyer: Get all orders placed by this buyer
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId })
      .populate('vehicle', 'title type image price')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your purchases.' });
  }
};

// Seller: Get incoming purchase requests for seller's vehicles
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.userId })
      .populate('vehicle', 'title type image price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incoming requests.' });
  }
};

// Admin: Get ALL completed transactions
export const getAllTransactions = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('vehicle', 'title type image price description')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions.' });
  }
};
