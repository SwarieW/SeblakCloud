import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'VERIFIED';
  orderStatus: 'QUEUED' | 'COOKING' | 'COMPLETED' | 'CANCELLED';
  rawQrisPayload?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  customerName: { type: String, required: true },
  items: [
    {
      menuItemId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['UNPAID', 'VERIFIED'], 
    default: 'UNPAID' 
  },
  orderStatus: { 
    type: String, 
    enum: ['QUEUED', 'COOKING', 'COMPLETED', 'CANCELLED'], 
    default: 'QUEUED' // Enables FIFO sorting by sorting by createdAt ASC
  },
  rawQrisPayload: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Order = model<IOrder>('Order', OrderSchema);