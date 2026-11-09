import { Router, Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { generateDynamicQRIS } from '../utils/qris';

const router = Router();

// Sample static QRIS string (Owner's static QR)
const OWNER_STATIC_QRIS = "00020101021138580014ID.LINKAJA.WWW0118936009110021008741021520110410087410303UMI5204581253033605802ID5913KANTIN SEBLAK6007JAKARTA61051211062070703A016304382F";

// ==========================================
// 1. MENU ENDPOINTS
// ==========================================

// GET: Fetch all available menu items
router.get('/menu', async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// POST: Add a new menu item (This was the missing route!)
router.post('/menu', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, category } = req.body;
    const newItem = new MenuItem({ name, price, category });
    await newItem.save();
    res.status(201).json({ message: 'Menu item created', item: newItem });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create menu item' });
  }
});

// DELETE: Remove a menu item
router.delete('/menu/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ==========================================
// 2. ORDER ENDPOINTS
// ==========================================

// POST: Place a new order and generate QRIS
router.post('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, items, totalAmount } = req.body;

    if (!customerName || !items || items.length === 0 || !totalAmount) {
      res.status(400).json({ error: 'Invalid order payload' });
      return;
    }

    const dynamicQris = generateDynamicQRIS(OWNER_STATIC_QRIS, totalAmount);

    const newOrder = new Order({
      customerName,
      items,
      totalAmount,
      orderStatus: 'QUEUED',
      paymentStatus: 'UNPAID',
      rawQrisPayload: dynamicQris
    });

    await newOrder.save();
    res.status(201).json({ 
      message: 'Order created successfully', 
      order: newOrder,
      qrisPayload: dynamicQris 
    });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET: Fetch live FIFO queue for the kitchen
router.get('/orders/fifo', async (req: Request, res: Response) => {
  try {
    const queue = await Order.find({ orderStatus: { $in: ['QUEUED', 'COOKING'] } }).sort({ createdAt: 1 });
    res.status(200).json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order queue' });
  }
});

// GET: Fetch completed transaction history
router.get('/orders/completed', async (req: Request, res: Response) => {
  try {
    const history = await Order.find({ orderStatus: 'COMPLETED' }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// PATCH: Update order status (Cooking, Completed)
router.patch('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { ...(orderStatus && { orderStatus }), ...(paymentStatus && { paymentStatus }) },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;