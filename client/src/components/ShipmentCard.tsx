/**
 * Design: Swiss Modernism meets Digital Utility
 * Compact card displaying shipment dimensions with edit/delete actions
 */

import { Shipment } from "@/types/shipment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Pencil, Trash2 } from "lucide-react";

interface ShipmentCardProps {
  shipment: Shipment;
  onEdit: (shipment: Shipment) => void;
  onDelete: (id: string) => void;
}

export function ShipmentCard({ shipment, onEdit, onDelete }: ShipmentCardProps) {
  return (
    <Card className="p-3 bg-card hover:bg-accent/5 transition-colors border-border">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
          <Package className="w-4 h-4 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-sm text-foreground">
              {shipment.length}×{shipment.width}×{shipment.height}"
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {shipment.weight} lb
            </span>
          </div>
          
          {shipment.reference && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Ref:</span> {shipment.reference}
            </div>
          )}
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(shipment)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(shipment.id)}
            className="h-7 w-7 p-0 hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
