// One set of types for REST responses AND socket payloads.
// They mirror the JSON built by the backend (src/orders/order.view.ts, src/menu/menu.module.ts).

export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "SERVED" | "CLOSED" | "CANCELLED";
export type DietaryType = "VEG" | "NON_VEG" | "VEGAN";
export type CourseType = "APPETIZER" | "ENTREE" | "DESSERT" | "BEVERAGE";
export type Station = "HOT" | "COLD" | "BAR";
export type ServiceRequestType = "CALL_WAITER" | "WATER" | "BILL";
export type StaffRole = "ADMIN" | "CHEF" | "CAPTAIN" | "WAITER";

export interface ModifierOption {
  name: string;
  cost: number;
}
export interface ModifierGroup {
  name: string;
  required?: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  dietaryType: DietaryType | null;
  courseType: CourseType | null;
  station: Station | null;
  allergens: string[];
  modifierGroups: ModifierGroup[];
}
export interface MenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface AppliedModifier {
  name: string;
  option: string;
  cost: number;
}
export interface OrderLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: AppliedModifier[];
  prepNotes: string | null;
  courseType: CourseType | null;
  station: Station | null;
}
export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  status: OrderStatus;
  items: OrderLine[];
  stations: Station[];
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  totalAmount: number;
  voidReason: string | null;
  placedAt: string;
  acceptedAt: string | null;
  servedAt: string | null;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
}
export interface TableInfo {
  id: string;
  tableNumber: string;
  status: string;
}
export interface ScanResponse {
  sessionToken: string;
  restaurant: Restaurant;
  table: TableInfo;
  orders: Order[];
}

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  restaurantId: string;
}
export interface LoginResponse {
  accessToken: string;
  user: StaffUser;
}

// Socket payloads
export interface MenuAvailabilityEvent {
  itemId: string;
  isAvailable: boolean;
}
export interface WaiterBellEvent {
  tableId: string;
  tableNumber: string;
  requestType: ServiceRequestType;
  timestamp: string;
}

// Request payload for POST /orders/dine-in
export interface PlaceOrderLine {
  menuItemId: string;
  quantity: number;
  modifiers?: { name: string; option: string }[];
  prepNotes?: string;
}
