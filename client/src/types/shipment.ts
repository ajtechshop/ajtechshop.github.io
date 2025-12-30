export interface Shipment {
  id: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  reference: string; // INV# or SO#
}

export interface ShipmentFormData {
  length: string;
  width: string;
  height: string;
  weight: string;
  reference: string;
}
