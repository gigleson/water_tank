
import { Delivery } from "../models/delivery.js";

export const deliveries: Delivery[] = [
    {
        id: 1,
        customerName: "Ram Sharma",
        address: "Kathmandu",
        phone: "9800000001",
        tankSize: 1000,
        quantity: 2,
        deliveryDate: "2026-11-18",
        status: "Pending"
    },
    {
        id: 2,
        customerName: "Hari Thapa",
        address: "Lalitpur",
        phone: "9800000002",
        tankSize: 500,
        quantity: 1,
        deliveryDate: "2026-11-19",
        status: "Delivered"
    }
];
