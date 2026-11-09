import { Schema, model, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  price: number;
  category: string; // e.g., 'Food', 'Beverage', 'Snack'
  isAvailable: boolean;
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, default: 'Food' },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const MenuItem = model<IMenuItem>('MenuItem', MenuItemSchema);