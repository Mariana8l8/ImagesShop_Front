export interface Category {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  title: string;
  description: string;
  price: number;
  watermarkedUrl: string;
  originalUrl: string;
  categoryId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  wishlistIds: string[];
}

export interface CartItem {
  imageId: string;
  image: Image;
}

export interface CartItemWithCount {
  imageId: string;
  image: Image;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  imageId: string;
}

export interface Order {
  id: string;
  userId: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  notes: string;
  items: OrderItem[];
}

export const OrderStatus = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 4,
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface PurchaseHistory {
  id: string;
  userName: string;
  userEmail: string;
  imageId: string;
  imagePrice: number;
  imageTitle: string;
  purchasedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}
