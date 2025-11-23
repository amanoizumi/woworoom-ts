export interface Product {
  id: string;
  title: string;
  origin_price: number;
  price: number;
  images: string;
  category: string;
}

export interface ProductsResponse {
  products: Product[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface CartsResponse {
  carts: CartItem[];
  finalTotal: number;
}

export interface OrderUser {
  name: string;
  tel: string;
  email: string;
  address: string;
  payment: string;
}

export interface PostOrderRequest {
  data: {
    user: OrderUser;
  };
}

export interface PostCartRequest {
  data: {
    productId: string;
    quantity: number;
  };
}

export interface PatchCartQuantityRequest {
  data: {
    id: string;
    quantity: number;
  };
}

export type ApiMessage = { message?: string };

// Admin orders
export interface AdminOrderProduct {
  title: string;
  category: string;
  quantity: number;
  price: number;
}

export interface AdminOrderUser {
  name: string;
  tel: string;
  address: string;
  email: string;
}

export interface AdminOrder {
  id: string;
  createdAt: number;
  paid: boolean;
  products: AdminOrderProduct[];
  user: AdminOrderUser;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
}


