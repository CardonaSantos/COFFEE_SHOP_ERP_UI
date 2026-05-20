"use client";

import { useMemo } from "react";
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import SelectM from "react-select";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { TipoComprobante } from "./interfaces";
import { MetodoPagoMainPOS } from "./interfaces/methodPayment";
import type {
  CartItem,
  Customer,
  CustomerOption,
  RolPrecio,
} from "@/Types/POS/interfaces";

export type { CartItem, Customer, CustomerOption };

interface CartCheckoutProps {
  isCreditoVenta: boolean;
  cart: CartItem[];
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<MetodoPagoMainPOS>>;
  imei: string;
  setImei: (imei: string) => void;
  selectedCustomerID: Customer | null;
  setSelectedCustomerID: (customer: Customer | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  nombre: string;
  setNombre: (nombre: string) => void;
  telefono: string;
  setTelefono: (telefono: string) => void;
  dpi: string;
  setDpi: (dpi: string) => void;
  direccion: string;
  setDireccion: (direccion: string) => void;
  observaciones: string;
  setObservaciones: (observaciones: string) => void;
  customerOptions: CustomerOption[];
  onCompleteSale: () => void;
  formatCurrency: (amount: number) => string;
  tipoComprobante: TipoComprobante | null;
  setTipoComprobante: React.Dispatch<
    React.SetStateAction<TipoComprobante | null>
  >;
  setReferenciaPago: React.Dispatch<React.SetStateAction<string>>;
  referenciaPago: string;
  setApellidos: React.Dispatch<React.SetStateAction<string>>;
  apellidos: string;
  onUpdateQuantity: (uid: string, newQuantity: number) => void;
  onUpdatePrice: (uid: string, newPrice: number, newRole: RolPrecio) => void;
  onRemoveFromCart: (uid: string) => void;
  userRol: string;
  setNit: React.Dispatch<React.SetStateAction<string>>;
  nit: string;
}

export default function CartCheckout({
  isCreditoVenta,
  apellidos,
  setApellidos,
  cart,
  paymentMethod,
  setPaymentMethod,
  imei,
  setImei,
  selectedCustomerID,
  setSelectedCustomerID,
  activeTab,
  setActiveTab,
  nombre,
  setNombre,
  telefono,
  setTelefono,
  dpi,
  setDpi,
  direccion,
  setDireccion,
  observaciones,
  setObservaciones,
  customerOptions,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveFromCart,
  onCompleteSale,
  formatCurrency,
  referenciaPago,
  setReferenciaPago,
  userRol,
  nit,
  setNit,
}: CartCheckoutProps) {
  // ── Helpers ─────────────────────────────────────────────────────────────
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.selectedPrice * item.quantity, 0);

  const handleChange = (selectedOption: CustomerOption | null) => {
    if (selectedOption) {
      const opt = customerOptions.find((o) => o.value === selectedOption.value);
      if (opt) {
        setSelectedCustomerID({
          id: opt.value,
          nombre: opt.label.split(" (")[0],
        });
        return;
      }
    }
    setSelectedCustomerID(null);
  };

  const hasNewCustomerData = () =>
    nombre.trim() !== "" ||
    telefono.trim() !== "" ||
    dpi.trim() !== "" ||
    direccion.trim() !== "" ||
    observaciones.trim() !== "";

  const hasSelectedCustomer = () => selectedCustomerID !== null;

  const clearNewCustomerData = () => {
    setNombre("");
    setTelefono("");
    setDpi("");
    setDireccion("");
    setObservaciones("");
  };

  const handleTabChange = (value: string) => {
    if (value === "existing" && hasNewCustomerData()) clearNewCustomerData();
    else if (value === "new" && hasSelectedCustomer())
      setSelectedCustomerID(null);
    setActiveTab(value);
  };

  // ── Cart processing ──────────────────────────────────────────────────────
  const processedCart = useMemo(() => {
    return cart.map((item) => {
      const preciosVisibles =
        userRol === "VENDEDOR"
          ? item.precios.filter(
              (p) =>
                p.rol !== ("DISTRIBUIDOR" as RolPrecio) &&
                p.rol !== ("PROMOCION" as RolPrecio) &&
                Number(p.precio) >= 0,
            )
          : item.precios.filter((p) => Number(p.precio) >= 0);

      return { ...item, preciosVisibles };
    });
  }, [cart, userRol]);

  const truncateButton = cart.length <= 0 || isCreditoVenta;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 min-w-[360px] max-w-[440px]">
      {/* ── Carrito ─────────────────────────────────────────────────────── */}
      <Card className="border-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-background">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-medium">Carrito</span>
            {cart.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={`text-xs h-7 ${
                  imei.length >= 15
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }`}
              >
                {imei.length >= 15 ? "IMEI AÑADIDO" : "AÑADIR IMEI"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="center">
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground">
                  Puedes ingresar varios IMEIs separados por comas.
                </p>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="imei-input" className="col-span-1 text-xs">
                    IMEI
                  </Label>
                  <Input
                    id="imei-input"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="Ej. 123456789012345"
                    className="col-span-3 h-7 text-xs"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="border-t">
          {/* Encabezados */}
          <div className="grid px-4 py-1.5 text-xs text-muted-foreground border-b grid-cols-[minmax(0,1fr)_72px_100px_96px]">
            <div>Producto</div>
            <div className="text-center">Cant.</div>
            <div className="text-center">Precio</div>
            <div className="text-center">Total</div>
          </div>

          {/* Items */}
          <div className="overflow-y-auto max-h-[calc(100vh-430px)]">
            {processedCart.length > 0 ? (
              <div className="divide-y">
                {processedCart.map((item) => (
                  <div
                    key={item.uid}
                    className="grid items-center gap-x-2 px-4 py-2 grid-cols-[minmax(0,1fr)_72px_100px_96px]"
                  >
                    <div className="text-xs pr-2 min-w-0">
                      <div className="truncate">{item.nombre}</div>
                    </div>

                    <div className="flex justify-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value);
                          if (!isNaN(val) && val > 0)
                            onUpdateQuantity(item.uid, val);
                        }}
                        min="1"
                        max={item.stock.reduce((t, s) => t + s.cantidad, 0)}
                        className="h-7 w-[72px] text-center text-xs"
                      />
                    </div>

                    <div className="flex justify-center">
                      <Select
                        value={item.selectedPriceId.toString()}
                        onValueChange={(newPriceId) => {
                          const p = item.precios.find(
                            (x) => x.id === Number(newPriceId),
                          );
                          if (p) onUpdatePrice(item.uid, p.precio, p.rol);
                        }}
                      >
                        <SelectTrigger className="h-7 w-[100px] justify-between text-xs">
                          <SelectValue
                            placeholder={formatCurrency(item.selectedPrice)}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {item.preciosVisibles.map((precio) => (
                            <SelectItem
                              key={precio.id}
                              value={precio.id.toString()}
                              className="text-xs"
                            >
                              <div className="flex w-full items-center justify-between">
                                <span className="tabular-nums">
                                  {formatCurrency(precio.precio)}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {precio.rol.toLowerCase()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tabular-nums">
                        {formatCurrency(item.selectedPrice * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => onRemoveFromCart(item.uid)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs">No hay productos en el carrito</span>
              </div>
            )}
          </div>

          {/* Total + botón */}
          <div className="px-4 py-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Total: {formatCurrency(calculateTotal())}
              </span>
              <span className="text-xs text-muted-foreground">
                {cart.reduce((acc, total) => acc + total.quantity, 0)} items
              </span>
            </div>
            <Button
              className="w-full h-9 text-sm font-semibold"
              disabled={truncateButton}
              onClick={onCompleteSale}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Completar venta
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Método de pago & cliente ─────────────────────────────────────── */}
      <Card className="border-0">
        <div className="p-4">
          <div className="flex flex-row gap-4">
            {/* Método de Pago */}
            <div className="flex-1">
              <Label className="text-xs font-medium block mb-1.5">
                Método de Pago
              </Label>
              <Select
                disabled={!!referenciaPago}
                value={paymentMethod}
                onValueChange={(e: MetodoPagoMainPOS) => setPaymentMethod(e)}
              >
                <SelectTrigger className="w-full h-8 py-1 px-2 text-xs">
                  <SelectValue placeholder="Método de Pago" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem
                    className="text-xs"
                    value={MetodoPagoMainPOS.EFECTIVO}
                  >
                    Contado
                  </SelectItem>
                  <SelectItem
                    className="text-xs"
                    value={MetodoPagoMainPOS.TARJETA}
                  >
                    Tarjeta
                  </SelectItem>
                  <SelectItem
                    className="text-xs"
                    value={MetodoPagoMainPOS.TRANSFERENCIA}
                  >
                    Transferencia Bancaria
                  </SelectItem>
                  <SelectItem
                    className="text-xs"
                    value={MetodoPagoMainPOS.CREDITO}
                  >
                    Credito
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selección de Cliente */}
            <div className="flex-1">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full h-8">
                  <TabsTrigger
                    value="existing"
                    disabled={hasNewCustomerData()}
                    className="flex items-center justify-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <User className="h-3 w-3" />
                    Existente
                  </TabsTrigger>
                  <TabsTrigger
                    value="new"
                    disabled={hasSelectedCustomer()}
                    className="flex items-center justify-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="h-3 w-3" />
                    Nuevo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Seleccionar Cliente</Label>
                    <SelectM
                      className="bg-transparent w-full text-xs text-black px-2 py-1"
                      options={customerOptions}
                      onChange={handleChange}
                      placeholder="Buscar cliente..."
                      isClearable
                      value={
                        selectedCustomerID
                          ? {
                              value: selectedCustomerID.id,
                              label: selectedCustomerID.nombre,
                            }
                          : null
                      }
                    />
                    {selectedCustomerID && (
                      <div className="text-xs font-semibold text-green-600 bg-green-50 p-2 rounded">
                        Cliente: {selectedCustomerID.nombre}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="new" className="mt-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="nombre" className="text-xs">
                          Nombre
                        </Label>
                        <Input
                          id="nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Nombre"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellidos" className="text-xs">
                          Apellidos
                        </Label>
                        <Input
                          id="apellidos"
                          value={apellidos}
                          onChange={(e) => setApellidos(e.target.value)}
                          placeholder="Apellidos"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="dpi" className="text-xs">
                          DPI
                        </Label>
                        <Input
                          id="dpi"
                          value={dpi}
                          onChange={(e) => setDpi(e.target.value)}
                          placeholder="DPI (opcional)"
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nit" className="text-xs">
                          NIT
                        </Label>
                        <Input
                          id="nit"
                          value={nit}
                          onChange={(e) => setNit(e.target.value)}
                          placeholder="NIT (opcional)"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="telefono" className="text-xs">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+502 5060 7080"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="observaciones" className="text-xs">
                        Observaciones
                      </Label>
                      <Textarea
                        id="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Observaciones (opcional)"
                        className="text-xs h-14"
                      />
                    </div>
                    {hasNewCustomerData() && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Creando nuevo cliente...
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {paymentMethod === "TRANSFERENCIA" && (
            <div className="mt-3">
              <Label className="text-xs" htmlFor="referenciaPago">
                Núm. boleta / transferencia
              </Label>
              <Input
                className="h-7 mt-1 text-xs"
                id="referenciaPago"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                placeholder="457278567843"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
