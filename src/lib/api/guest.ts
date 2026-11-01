import type {
  MenuCategory,
  Order,
  PlaceOrderLine,
  ScanResponse,
  ServiceRequestType,
} from "../types";
import { api } from "./client";

export const scanTable = (qrToken: string) =>
  api<ScanResponse>(`/table/scan/${encodeURIComponent(qrToken)}`);

export const fetchMenu = (restaurantId: string, token: string) =>
  api<MenuCategory[]>(`/menu/dine-in/${restaurantId}`, { token });

export const placeOrder = (token: string, items: PlaceOrderLine[]) =>
  api<Order>("/orders/dine-in", { method: "POST", token, body: { items } });

export const fetchSessionOrders = (token: string) => api<Order[]>("/orders/dine-in/session", { token });

export const cancelOrder = (token: string, orderId: string) =>
  api<Order>(`/orders/${orderId}/cancel`, { method: "POST", token });

export const sendServiceAlert = (token: string, requestType: ServiceRequestType) =>
  api<{ ok: boolean }>("/table/service-alert", { method: "POST", token, body: { requestType } });
