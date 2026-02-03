export interface Category {
  id: string;
  name: string | null;
}

export interface Image {
  id: string;
  title: string | null;
  description: string | null;
  price: number;
  watermarkedUrl: string | null;
  originalUrl: string | null;
  categoryId: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  balance: number;
  role: UserRole;
  wishlistIds: string[] | null;
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
  currency: string | null;
  notes: string | null;
  items: OrderItem[] | null;
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
  userName: string | null;
  userEmail: string | null;
  imageId: string;
  imagePrice: number;
  imageTitle: string | null;
  purchasedAt: string;
}

export interface Tag {
  id: string;
  name: string | null;
}

export interface RegisterRequest {
  name?: string | null;
  email?: string | null;
  password?: string | null;
}

export interface LoginRequest {
  email?: string | null;
  password?: string | null;
}

export interface RefreshRequest {
  refreshToken?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string | null;
}

export interface AddToCartRequest {
  imageId: string;
}

export interface CartItemResponse {
  imageId?: string;
  image?: Image;
  quantity?: number;
}

export type CartResponse =
  | CartItemResponse[]
  | { items: CartItemResponse[] }
  | string[];

export interface UserTransaction {
  [key: string]: unknown;
}

export interface DecodedJwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: keyof typeof UserRole | number | string;
  exp?: number;
  [key: string]: unknown;
}

export const UserRole = {
  User: 0,
  Admin: 1,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
