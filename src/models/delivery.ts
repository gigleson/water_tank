
export interface Delivery {
    id: number;
    customerName: string;
    address: string;
    phone: string;
    tankSize: number;
    quantity: number;
    deliveryDate: string;
    status: "Pending" | "Delivered";
}
