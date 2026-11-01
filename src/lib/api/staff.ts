import type { LoginResponse, MenuCategory, Order, OrderStatus } from "../types";
import { api } from "./client";

export const staffLogin = (email: string, password: string) =>
  api<LoginResponse>("/api/v1/auth/staff/login", { method: "POST", body: { email, password } });

export const fetchKitchenQueue = (token: string) => api<Order[]>("/api/v1/orders/kds/active", { token });

export const updateOrderStatus = (token: string, orderId: string, status: OrderStatus, voidReason?: string) =>
  api<Order>(`/api/v1/orders/${orderId}/status`, { method: "PATCH", token, body: { status, voidReason } });

/** Needs the small backend addition GET /menu/staff (see BACKEND_PATCH.md). */
export const fetchStaffMenu = (token: string) => api<MenuCategory[]>("/api/v1/menu/staff", { token });

export const set86 = (token: string, itemId: string, isAvailable: boolean) =>
  api<{ id: string; name: string; isAvailable: boolean }>(`/api/v1/menu/items/${itemId}/86`, {
    method: "PATCH",
    token,
    body: { isAvailable },
  });
