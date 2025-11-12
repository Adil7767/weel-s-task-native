export type DeliveryType = "IN_STORE" | "DELIVERY" | "CURBSIDE";

export type Order = {
  id: string;
  userId: string;
  deliveryType: DeliveryType;
  scheduledTime: string;
  deliveryAddress?: string | null;
  pickupPerson?: string | null;
  curbsideVehicleInfo?: string | null;
  contactPhone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderInput = {
  deliveryType: DeliveryType;
  scheduledTime: string;
  contactPhone: string;
  deliveryAddress?: string | null;
  pickupPerson?: string | null;
  curbsideVehicleInfo?: string | null;
  notes?: string | null;
};

