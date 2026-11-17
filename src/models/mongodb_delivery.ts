
import mongoose, { Schema } from "mongoose";

export interface IDelivery {
    customerName: string;
    address: string;
    phone: string;
    tankSize: number;
    quantity: number;
    deliveryDate: string;
    status: "Pending" | "Delivered";
}

const deliverySchema = new Schema<IDelivery>({
    customerName: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    tankSize: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    deliveryDate: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Delivered"],
        default: "Pending"
    }
}, {
    timestamps: true
});

const DeliveryModel = mongoose.model<IDelivery>(
    "Delivery",
    deliverySchema
);

export default DeliveryModel;
