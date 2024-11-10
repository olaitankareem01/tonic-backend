import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([
    {
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ])
  products: {
    productId: Types.ObjectId;
    quantity: number;
  }[];

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: String, enum: ['Pending', 'Completed', 'Canceled'], default: 'Pending' })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
