/**
 * Design: Swiss Modernism meets Digital Utility
 * Ultra-simplified form: only dimensions (L×W×H), weight, and INV#/SO# reference
 * Asymmetric layout: sidebar (shipment list) + main panel (form)
 */

import { useState } from "react";
import { nanoid } from "nanoid";
import { Shipment, ShipmentFormData } from "@/types/shipment";
import { ShipmentCard } from "@/components/ShipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { generateCSV, downloadCSV } from "@/lib/csv";
import { toast } from "sonner";
import { Download, Plus, Package, FileText } from "lucide-react";

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ShipmentFormData>({
    length: "",
    width: "",
    height: "",
    weight: "",
    reference: "",
  });

  const handleInputChange = (field: keyof ShipmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { length, width, height, weight } = formData;
    
    if (!length || !width || !height || !weight) {
      toast.error("Please fill in all dimension and weight fields");
      return false;
    }
    
    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);
    const wt = parseFloat(weight);
    
    if (isNaN(l) || isNaN(w) || isNaN(h) || isNaN(wt)) {
      toast.error("Dimensions and weight must be valid numbers");
      return false;
    }
    
    if (l <= 0 || w <= 0 || h <= 0 || wt <= 0) {
      toast.error("Dimensions and weight must be greater than zero");
      return false;
    }
    
    return true;
  };

  const handleAddShipment = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    const newShipment: Shipment = {
      id: editingId || nanoid(),
      length: Math.ceil(parseFloat(formData.length)),
      width: Math.ceil(parseFloat(formData.width)),
      height: Math.ceil(parseFloat(formData.height)),
      weight: parseFloat(formData.weight),
      reference: formData.reference,
    };
    
    if (editingId) {
      setShipments(prev => prev.map(s => s.id === editingId ? newShipment : s));
      toast.success("Package updated");
      setEditingId(null);
    } else {
      setShipments(prev => [...prev, newShipment]);
      toast.success("Package added");
    }
    
    // Reset form
    setFormData({
      length: "",
      width: "",
      height: "",
      weight: "",
      reference: "",
    });
  };

  const handleEdit = (shipment: Shipment) => {
    setFormData({
      length: shipment.length.toString(),
      width: shipment.width.toString(),
      height: shipment.height.toString(),
      weight: shipment.weight.toString(),
      reference: shipment.reference,
    });
    setEditingId(shipment.id);
    toast.info("Editing package");
  };

  const handleDelete = (id: string) => {
    setShipments(prev => prev.filter(s => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
    toast.success("Package removed");
  };

  const handleGenerateCSV = () => {
    if (shipments.length === 0) {
      toast.error("Add at least one package to generate CSV");
      return;
    }
    
    const csv = generateCSV(shipments);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `fedex_shipments_${timestamp}.csv`);
    toast.success(`CSV downloaded with ${shipments.length} package${shipments.length > 1 ? 's' : ''}`);
  };

  const handleClearAll = () => {
    if (shipments.length === 0) return;
    
    if (confirm(`Clear all ${shipments.length} package${shipments.length > 1 ? 's' : ''}?`)) {
      setShipments([]);
      setEditingId(null);
      toast.success("All packages cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">FedEx CSV Generator</h1>
              <p className="text-sm text-muted-foreground mt-1">Quick package entry for batch shipping</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Asymmetric Two-Column Layout */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Package List */}
          <aside className="lg:col-span-4 space-y-4">
            <Card className="p-4 bg-sidebar border-sidebar-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Packages</h2>
                  <span className="text-xs font-mono text-muted-foreground">
                    ({shipments.length})
                  </span>
                </div>
                {shipments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {shipments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No packages added yet</p>
                  <p className="text-xs mt-1">Fill the form to add your first package</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {shipments.map((shipment) => (
                    <ShipmentCard
                      key={shipment.id}
                      shipment={shipment}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
              
              {shipments.length > 0 && (
                <Button
                  onClick={handleGenerateCSV}
                  className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate CSV ({shipments.length})
                </Button>
              )}
            </Card>
          </aside>

          {/* Right Panel - Input Form */}
          <main className="lg:col-span-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {editingId ? "Edit Package" : "Add New Package"}
              </h2>
              
              <form onSubmit={handleAddShipment} className="space-y-6">
                {/* Package Dimensions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Dimensions & Weight
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length (in) *</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.length}
                        onChange={(e) => handleInputChange("length", e.target.value)}
                        placeholder="12"
                        className="font-mono text-lg"
                        autoFocus
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (in) *</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.width}
                        onChange={(e) => handleInputChange("width", e.target.value)}
                        placeholder="8"
                        className="font-mono text-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in) *</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        placeholder="6"
                        className="font-mono text-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lb) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="5.5"
                      className="font-mono text-lg max-w-xs"
                    />
                  </div>
                </div>

                {/* Reference */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Reference
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference">INV# / SO# (Optional)</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => handleInputChange("reference", e.target.value)}
                      placeholder="INV-12345 or SO-67890"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingId ? "Update Package" : "Add Package"}
                  </Button>
                  
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          length: "",
                          width: "",
                          height: "",
                          weight: "",
                          reference: "",
                        });
                        toast.info("Editing cancelled");
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
