/**
 * In-house Shipment Management | AJ TECH
 * 
 * CORE ARCHITECTURE:
 * - State Management: React useState for local shipment queue and form data.
 * - Persistence: Currently transient (session-based). CSV Export is the primary data persistence.
 * - Design System: Custom Tailwind + Oklch tokens (see index.css). Glassmorphism & Framer Motion for UX.
 * 
 * DEVELOPMENT CONTEXT:
 * - This app generates a specific CSV format for FedEx batch imports.
 * - Dimension units: Inches (in) - auto-rounded up for logistics compatibility.
 * - Weight units: Pounds (lbs).
 * - Calculations: Volume (ft³) is UI-only to help load planning. 1 ft³ = 1728 in³.
 */

import React, { useState } from "react";
import { nanoid } from "nanoid";
import { Shipment, ShipmentFormData } from "@/types/shipment";
import { ShipmentCard } from "@/components/ShipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { generateCSV, downloadCSV } from "@/lib/csv";
import { toast } from "sonner";
import { LayoutGrid, Download, Plus, Package, FileText, ChevronRight, Calculator, Archive, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [globalReference, setGlobalReference] = useState<string>("");

  const [formData, setFormData] = useState<ShipmentFormData>({
    length: "",
    width: "",
    height: "",
    weight: "",
  });

  const handleInputChange = (field: keyof ShipmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const { length, width, height, weight } = formData;
    if (!length || !width || !height || !weight) {
      toast.error("All fields are required");
      return false;
    }
    const nums = [length, width, height, weight].map(parseFloat);
    if (nums.some(isNaN) || nums.some(n => n <= 0)) {
      toast.error("Enter valid positive numbers");
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
    };

    if (editingId) {
      setShipments((prev: Shipment[]) => prev.map((s: Shipment) => s.id === editingId ? newShipment : s));
      toast.success("Package updated");
      setEditingId(null);
    } else {
      setShipments((prev: Shipment[]) => [...prev, newShipment]);
      toast.success("Package added");
    }

    setFormData({ length: "", width: "", height: "", weight: "" });
    // Focus back to length for fast entry
    document.getElementById("length")?.focus();
  };

  const handleEdit = (shipment: Shipment) => {
    setFormData({
      length: shipment.length.toString(),
      width: shipment.width.toString(),
      height: shipment.height.toString(),
      weight: shipment.weight.toString(),
    });
    setEditingId(shipment.id);
  };

  const handleDelete = (id: string) => {
    setShipments((prev: Shipment[]) => prev.filter((s: Shipment) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleGenerateCSV = () => {
    if (shipments.length === 0) return toast.error("Add at least one package");
    if (!globalReference) return toast.error("Batch reference required");

    const csv = generateCSV(shipments, globalReference);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `fedex_shipments_${globalReference}_${timestamp}.csv`);
    toast.success("CSV generated successfully");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* Header */}
      <header className="relative pt-16 pb-12 overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 order-2 sm:order-1"
            >
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary transition-colors bg-background/50 backdrop-blur-sm border border-divider sm:border-transparent">
                  <LayoutGrid className="w-4 h-4" />
                  Back to Hub
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center order-1 sm:order-2"
            >
              <img
                src="https://www.ajtech.shop/web/image/website/1/logo/AJ%20TECH?unique=0d0ff7c"
                alt="AJ TECH Logo"
                className="h-16 lg:h-24 w-auto object-contain drop-shadow-md"
              />
            </motion.div>
          </div>
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black tracking-tight text-foreground"
            >
              In-house <span className="text-primary">Shipment Management</span>
            </motion.h1>
          </div>
        </div>
      </header>

      <main className="container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <Card className="p-8 glass shadow-2xl border-white/40">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{editingId ? 'Modify' : 'Quick Add'} Package</h2>
                  <p className="text-sm text-muted-foreground">Enter dimensions and weight below</p>
                </div>
              </div>

              <form onSubmit={handleAddShipment} className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'length', label: 'Length (in)', placeholder: '12' },
                    { id: 'width', label: 'Width (in)', placeholder: '8' },
                    { id: 'height', label: 'Height (in)', placeholder: '6' },
                    { id: 'weight', label: 'Weight (lbs)', placeholder: '5.5' },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        {field.label}
                      </Label>
                      <Input
                        id={field.id}
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-14 text-xl font-mono glass-card focus-visible:ring-primary shadow-none"
                        value={formData[field.id as keyof ShipmentFormData]}
                        onChange={(e) => handleInputChange(field.id as keyof ShipmentFormData, e.target.value)}
                        placeholder={field.placeholder}
                        autoFocus={field.id === 'length'}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingId ? 'Update Package' : 'Add to Batch'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setEditingId(null); setFormData({ length: "", width: "", height: "", weight: "" }); }}
                      className="h-14 px-8"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* CSV Data Preview Table */}
            <AnimatePresence>
              {shipments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-12 overflow-hidden rounded-2xl border border-divider glass"
                >
                  <div className="bg-primary/5 p-4 border-b border-divider flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Live CSV Preview
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 whitespace-nowrap tracking-wider">
                        {shipments.length} UNITS
                      </div>
                      <div className="text-xs font-black text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 border border-indigo-500 whitespace-nowrap tracking-wider animate-in-fade">
                        TOTAL BATCH WEIGHT: {shipments.reduce((sum, s) => sum + s.weight, 0).toFixed(2)} lbs
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-muted/50 text-muted-foreground font-semibold">
                          <th className="p-4">Package #</th>
                          <th className="p-4">SO/INV</th>
                          <th className="p-4 text-center">L (in)</th>
                          <th className="p-4 text-center">W (in)</th>
                          <th className="p-4 text-center">H (in)</th>
                          <th className="p-4 text-center">Weight (lb)</th>
                          <th className="p-4 text-center text-muted-foreground/50 font-medium">Vol (ft³)</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider">
                        {shipments.map((s: Shipment, i: number) => (
                          <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 font-mono font-bold text-primary">#{i + 1}</td>
                            <td className="p-4 text-muted-foreground italic">{globalReference || '—'}</td>
                            <td className="p-4 text-center font-mono">{s.length}</td>
                            <td className="p-4 text-center font-mono">{s.width}</td>
                            <td className="p-4 text-center font-mono">{s.height}</td>
                            <td className="p-4 text-center font-mono">{s.weight}</td>
                            <td className="p-4 text-center font-mono text-xs opacity-60">
                              {((s.length * s.width * s.height) / 1728).toFixed(3)}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(s)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(s.id)}
                                  className="h-8 w-8 p-0 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Sidebar / Batch Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 space-y-8"
          >
            <Card className="p-8 glass shadow-xl border-white/40">
              <div className="space-y-6">
                <div className="space-y-3 pb-6 border-b border-divider">
                  <Label htmlFor="batch-ref" className="text-sm font-black uppercase tracking-widest text-foreground">
                    Sales Order / Invoice
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Archive className="w-4 h-4" />
                    </span>
                    <Input
                      id="batch-ref"
                      className="h-14 pl-12 text-lg font-bold bg-background/50 border-2 border-primary/20 focus:border-primary shadow-none"
                      placeholder="SO / INV Number"
                      value={globalReference}
                      onChange={(e) => setGlobalReference(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground pl-1">This reference will be applied to every package in the CSV.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Package Queue
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Total Batch Mass</div>
                      <div className="text-lg font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border-2 border-primary/20 shadow-inner">
                        {shipments.reduce((sum, s) => sum + s.weight, 0).toFixed(1)} <span className="text-xs font-bold opacity-60">lbs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {shipments.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-12 text-center space-y-4"
                        >
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                            <Package className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground">Queue is empty</p>
                            <p className="text-xs text-muted-foreground/60">Ready for your first parcel</p>
                          </div>
                        </motion.div>
                      ) : (
                        shipments.map((shipment) => (
                          <ShipmentCard
                            key={shipment.id}
                            shipment={shipment}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-6 border-t border-divider flex flex-col gap-3">
                  <Button
                    onClick={handleGenerateCSV}
                    disabled={shipments.length === 0}
                    className="h-16 text-lg font-black bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/20"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    EXPORT CSV
                  </Button>
                  {shipments.length > 0 && (
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => { if (confirm("Clear batch?")) setShipments([]); }}
                    >
                      Clear All Records
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 opacity-70">
              {[
                { icon: Calculator, text: "Dimensions auto-rounded up" },
                { icon: FileText, text: "Standard FedEx Batch Format" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-divider">
                  <feature.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
