export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentGateway = 'manual' | 'vnpay' | 'momo' | 'stripe';

export interface Plan {
  id: string;
  name: string;
  price_vnd: number;
  description: string;
  features: string[];
  is_active: boolean;
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  plan_id?: string;
  amount_vnd: number;
  gateway: PaymentGateway;
  gateway_txn_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

export interface CreateOrderRequest {
  course_id: string;
  gateway: PaymentGateway;
}

export interface CreateOrderResponse {
  order_id: string;
  payment_url?: string;
  instructions?: string;
  status: PaymentStatus;
}
