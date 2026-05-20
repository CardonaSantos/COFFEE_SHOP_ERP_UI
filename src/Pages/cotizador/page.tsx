import { PageTransition } from "@/components/Transition/layout-transition";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductoData, Stock } from "../POS/interfaces/newProductsPOSResponse";
import { toast } from "sonner";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { MetodoPagoMainPOS } from "../POS/interfaces/methodPayment";
import { TipoComprobante } from "../POS/interfaces";
import { imagenesProducto, Precios } from "../POS/PuntoVenta";
import { useStore } from "@/components/Context/ContextSucursal";
import { NewQueryDTO } from "../POS/interfaces/interfaces";
import { NewQueryPOS, useFetchVentas } from "@/hooks/use-ventas/use-ventas";
import { useClientes } from "@/hooks/use-clientes/use-clientes";
import { useTiposPresentaciones } from "@/hooks/use-tipos-presentaciones/use-tipos-presentaciones";
import { useGetCategorias } from "@/hooks/use-categorias/use-categorias";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMonedaGT } from "../Compras/compras.utils";
import CartCheckout, { CartItem } from "../POS/CartCheckout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Banknote,
  Box,
  CreditCard,
  Layers,
  MessageSquare,
  Package,
  Percent,
  Plus,
  ShoppingCart,
  SplitSquareHorizontal,
  Tag,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DialogImages from "../DialogImages";
import CotizacionPrint from "./components/cotizacion-print";
import { useReactToPrint } from "react-to-print";
import TablePOS from "../POS/table/header";
import { useGetSucursal } from "@/hooks/getSucursales/use-sucursales";
type SourceType = "producto" | "presentacion";

type ProductoPOS = {
  id: number;
  source: SourceType;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  codigoProducto: string;
  creadoEn: string;
  actualizadoEn: string;
  stock: Stock[];
  precios: Precios[];
  imagenesProducto: imagenesProducto[];
};

enum RolPrecio {
  PUBLICO = "PUBLICO",
  MAYORISTA = "MAYORISTA",
  ESPECIAL = "ESPECIAL",
  DISTRIBUIDOR = "DISTRIBUIDOR",
  PROMOCION = "PROMOCION",
  CLIENTE_ESPECIAL = "CLIENTE_ESPECIAL",
}

interface Customer {
  id: number;
  nombre: string;
  telefono?: string;
  dpi?: string;
  nit?: string;
}

export interface costoAdicional {
  id: string;
  costo: number;
  nombre_costo: string;
  descripcion: string;
}

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function CotizadorMainPage() {
  const [isScannerMode, setIsScannerMode] = useState(true);
  const [scanInput, setScanInput] = useState("");
  /** Ref al input del escáner para poder darle focus desde el padre */
  const scanInputRef = useRef<HTMLInputElement>(null);
  // STORE
  // ─────────────────────────────────────────────────────────────
  const userRol = useStore((state) => state.userRol) ?? "";
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cotizacion-${Date.now()}`,
  });

  const { data: sucursal } = useGetSucursal(sucursalId);
  //  CARRITO
  // ────────────────────────────────────────────const { data: sucursal } = useGetSucursal(sucursalId);─────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  // COTIZADOR (descuento, cuotas, enganche)
  // ─────────────────────────────────────────────────────────────

  const [costosAdicionales, setCostosAdicionales] = useState<
    Array<costoAdicional>
  >([]);

  const addCosto = () => {
    const id = crypto.randomUUID();
    const newCosto: costoAdicional = {
      costo: 0,
      id,
      nombre_costo: "NombreCosto",
      descripcion: "",
    };
    setCostosAdicionales([...costosAdicionales, newCosto]);
  };

  const [descuento, setDescuento] = useState<number>(0);
  const [cuotas, setCuotas] = useState<number>(0);
  const [enganche, setEnganche] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");

  const carritoResumen = useMemo(() => {
    const { totalCarrito, totalItems } = cart.reduce(
      (acc, item) => ({
        totalCarrito:
          acc.totalCarrito + (item.selectedPrice ?? 0) * (item.quantity ?? 1),
        totalItems: acc.totalItems + (item.quantity ?? 1),
      }),
      { totalCarrito: 0, totalItems: 0 },
    );
    const engancheSeguro = Number(enganche) || 0;

    const descuentoDecimal = Math.min(Math.max(descuento, 0), 100) / 100;
    const totalDescuento = r2(totalCarrito * descuentoDecimal);
    const totalConDescuento = r2(totalCarrito - totalDescuento);
    const cantidadPorCuota =
      cuotas > 0
        ? r2((totalConDescuento - Math.max(engancheSeguro ?? 0, 0)) / cuotas)
        : 0;

    const totalOtros = r2(
      costosAdicionales.reduce((acc, item) => acc + item.costo, 0),
    );

    return {
      totalCarrito: r2(totalCarrito),
      totalItems,
      cantidadItems: cart.length,
      totalDescuento,
      totalConDescuento,
      cantidadPorCuota,
      totalOtros,
    };
  }, [cart, descuento, cuotas, enganche, costosAdicionales]);

  //  PAGO & COMPROBANTE
  // ─────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<MetodoPagoMainPOS>(
    MetodoPagoMainPOS.EFECTIVO,
  );
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante | null>(TipoComprobante.RECIBO);
  const [referenciaPago, setReferenciaPago] = useState<string>("");

  const isCreditoVenta = paymentMethod === MetodoPagoMainPOS.CREDITO;

  // CLIENTE (seleccionado o ad-hoc)
  // ─────────────────────────────────────────────────────────────
  const [selectedCustomerID, setSelectedCustomerID] = useState<Customer | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("existing");

  const [nombre, setNombre] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [dpi, setDpi] = useState<string>("");
  const [nit, setNit] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [imei, setImei] = useState<string>("");

  // CRÉDITO
  // ─────────────────────────────────────────────────────────────

  //  BÚSQUEDA & PAGINACIÓN
  // ─────────────────────────────────────────────────────────────
  const [limit, setLimit] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);

  const [queryOptions, setQueryOptions] = useState<NewQueryDTO>({
    cats: [],
    codigoItem: "",
    codigoProveedor: "",
    nombreItem: "",
    priceRange: "",
    tipoEmpaque: [],
    sucursalId,
    limit,
    page,
  });

  useEffect(() => {
    setQueryOptions((prev) => ({ ...prev, sucursalId, limit, page }));
  }, [sucursalId, limit, page]);

  const apiParams = React.useMemo<NewQueryPOS>(() => {
    const p: Partial<NewQueryPOS> = {
      sucursalId,
      limit,
      page,
      q: debouncedSearch || undefined,
    };
    if (queryOptions.cats?.length) p.cats = queryOptions.cats;
    if (queryOptions.codigoProveedor)
      p.codigoProveedor = queryOptions.codigoProveedor;
    if (queryOptions.tipoEmpaque) p.tipoEmpaque = queryOptions.tipoEmpaque;
    if (queryOptions.priceRange) p.priceRange = queryOptions.priceRange;
    return p as NewQueryPOS;
  }, [
    debouncedSearch,
    sucursalId,
    limit,
    page,
    queryOptions.cats,
    queryOptions.codigoProveedor,
    queryOptions.tipoEmpaque,
    queryOptions.priceRange,
  ]);

  const handleSearchItemsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handlePageChange = (nextPage: number) =>
    setPage(Math.max(1, Math.min(nextPage, meta.totalPages || 1)));
  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  //  QUERIES (servidor)
  // ─────────────────────────────────────────────────────────────
  const {
    data: productsResponse = {
      data: [],
      meta: {
        limit: 10,
        page: 1,
        totalCount: 0,
        totalPages: 1,
        totals: { presentaciones: 0, productos: 0 },
      },
    },
    isFetching: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useFetchVentas(apiParams);

  const {
    data: customersResponse,
    isError: isErrorCustomers,
    error: errorCustomers,
  } = useClientes();

  const { data: tiposPresentacionesResponse } = useTiposPresentaciones();
  const { data: cats } = useGetCategorias();

  // Datos derivados de queries
  // ─────────────────────────────────────────────────────────────

  const productos = Array.isArray(productsResponse.data)
    ? productsResponse.data
    : [];
  const meta = productsResponse.meta ?? {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  };
  const categorias = Array.isArray(cats) ? cats : [];
  const tiposPresentacion = tiposPresentacionesResponse?.data ?? [];

  const customerOptions = useMemo(
    () =>
      (customersResponse ?? []).map((c) => ({
        value: c.id,
        label: `${c.nombre} ${c?.apellidos ?? ""} ${c.telefono ? `(${c.telefono})` : ""} ${c.dpi ? `DPI: ${c.dpi}` : "DPI: N/A"} ${c.nit ? `NIT: ${c.nit}` : "NIT: N/A"} ${c.iPInternet ? `IP: ${c.iPInternet}` : ""}`,
      })),
    [customersResponse],
  );

  useEffect(() => {
    if (isErrorProducts && errorProducts)
      toast.error(getApiErrorMessageAxios(errorProducts));
    if (isErrorCustomers && errorCustomers)
      toast.error(getApiErrorMessageAxios(errorCustomers));
  }, [isErrorProducts, errorProducts, isErrorCustomers, errorCustomers]);

  // UI STATE
  // ─────────────────────────────────────────────────────────────

  const [openImage, setOpenImage] = useState(false);
  const [imagesProduct, setImagesProduct] = useState<string[]>([]);

  //  HANDLERS DE CARRITO
  // ─────────────────────────────────────────────────────────────

  const makeUid = (s: SourceType, id: number) => `${s}-${id}`;

  const addToCart = (product: ProductoPOS) => {
    const uid = makeUid(product.source, product.id);
    const existing = cart.find((item) => item.uid === uid);

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.uid === uid ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
      return;
    }

    const initial = product.precios?.[0];
    setCart((prev) => [
      ...prev,
      {
        uid,
        id: product.id,
        source: product.source,
        nombre: product.nombre,
        precios: product.precios,
        stock: product.stock,
        quantity: 1,
        selectedPriceId: initial?.id ?? 0,
        selectedPrice: initial?.precio ?? 0,
        selectedPriceRole: (initial?.rol as RolPrecio) ?? RolPrecio.PUBLICO,
      },
    ]);
  };

  const updateQuantityByUid = (uid: string, qty: number) =>
    setCart((prev) =>
      prev.map((i) => (i.uid === uid ? { ...i, quantity: qty } : i)),
    );

  const updatePriceByUid = (
    uid: string,
    newPrice: number,
    newRole: RolPrecio,
  ) =>
    setCart((prev) =>
      prev.map((i) =>
        i.uid === uid
          ? {
              ...i,
              selectedPrice: newPrice,
              selectedPriceRole: newRole,
              selectedPriceId:
                i.precios.find(
                  (p) => p.precio === newPrice && p.rol === newRole,
                )?.id ?? i.selectedPriceId,
            }
          : i,
      ),
    );

  const handleToggleScannerMode = useCallback(() => {
    setIsScannerMode((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => scanInputRef.current?.focus(), 50);
      }
      return next;
    });
  }, []);

  const removeFromCartByUid = (uid: string) =>
    setCart((prev) => prev.filter((i) => i.uid !== uid));

  const getRemainingForRow = React.useCallback(
    (p: ProductoData) => {
      const source = (p.__source as SourceType) ?? "producto";
      const uid = makeUid(source, p.id);
      const total = (p.stocks ?? []).reduce((a, s) => a + s.cantidad, 0);
      const reserved = cart.find((i) => i.uid === uid)?.quantity ?? 0;
      return Math.max(0, total - reserved);
    },
    [cart],
  );

  const handleImageClick = (images: string[]) => {
    setOpenImage(true);
    setImagesProduct(images);
  };

  //  MAPPER: producto data → POS
  // ─────────────────────────────────────────────────────────────
  function defaultMapToCartProduct(p: ProductoData): ProductoPOS {
    return {
      id: p.id,
      source: (p.__source as SourceType) ?? "producto",
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precioVenta: 0,
      codigoProducto: p.codigoProducto,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      stock: (p.stocks ?? []).map((s) => ({
        id: s.id,
        cantidad: s.cantidad,
        fechaIngreso: s.fechaIngreso || "",
        fechaVencimiento: s.fechaVencimiento || "",
      })),
      precios: (p.precios ?? []).map((pr) => ({
        id: pr.id,
        precio: Number(pr.precio) || 0,
        rol: (pr.rol as RolPrecio) ?? RolPrecio.PUBLICO,
      })),
      imagenesProducto: (p.images ?? [])
        .filter((im) => !!im?.url)
        .map((im) => ({ id: im.id ?? 0, url: im.url ?? "" })),
    };
  }
  const list_items = [
    {
      icon: <Layers className="w-3.5 h-3.5" />,
      label: "Productos distintos",
      value: carritoResumen.cantidadItems,
      mono: false,
    },
    {
      icon: <Package className="w-3.5 h-3.5" />,
      label: "Total unidades",
      value: carritoResumen.totalItems,
      mono: false,
    },
    {
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
      label: "Subtotal carrito",
      value: formatMonedaGT(carritoResumen.totalCarrito),
      mono: true,
    },
    {
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
      label: "Subtotal con descuento",
      value: formatMonedaGT(carritoResumen.totalConDescuento),
      mono: true,
    },

    {
      icon: <Percent className="w-3.5 h-3.5" />,
      label: "Descuento aplicado",
      value: formatMonedaGT(carritoResumen.totalDescuento),
      mono: true,
      accent: "text-rose-500",
    },
    {
      icon: <Banknote className="w-3.5 h-3.5" />,
      label: "Enganche",
      value: enganche > 0 ? formatMonedaGT(enganche) : "—",
      mono: true,
    },

    {
      icon: <CreditCard className="w-3.5 h-3.5" />,
      label: "Cuota estimada",
      value: cuotas > 0 ? formatMonedaGT(carritoResumen.cantidadPorCuota) : "—",
      mono: true,
      highlight: true,
    },
    {
      icon: <Box className="w-3.5 h-3.5" />,
      label: "Subtotal adicionales",
      value: formatMonedaGT(carritoResumen.totalOtros),
      mono: true,
    },
  ];

  const handleChangeItem = (id: string, changes: Partial<costoAdicional>) => {
    setCostosAdicionales((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
  };

  if (!sucursal) return null;

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Cotizador">
      <div
        className="
  grid grid-cols-1 gap-4 items-start
  md:[grid-template-columns:minmax(0,1fr)_clamp(360px,40vw,420px)]
  xl:[grid-template-columns:minmax(0,1fr)_clamp(380px,32vw,440px)] 
"
      >
        <TablePOS
          isScannerMode={isScannerMode}
          scanInput={scanInput}
          onToggleScannerMode={handleToggleScannerMode}
          onScanInputChange={(value) => {
            setScanInput(value);
            // Sincronizar con el estado de búsqueda para que la tabla filtre
            setSearch(value);
            setPage(1);
          }}
          scanInputRef={scanInputRef}
          categorias={categorias}
          tiposPresentacion={tiposPresentacion}
          searchValue={search}
          defaultMapToCartProduct={defaultMapToCartProduct}
          addToCart={addToCart}
          handleImageClick={handleImageClick}
          isLoadingProducts={isLoadingProducts}
          handleSearchItemsInput={handleSearchItemsInput}
          queryOptions={queryOptions}
          setQueryOptions={setQueryOptions}
          data={productos}
          page={meta.page}
          limit={meta.limit}
          totalPages={meta.totalPages}
          totalCount={meta.totalCount}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          getRemainingFor={getRemainingForRow}
        />

        <div className="min-w-0">
          <CartCheckout
            nit={nit}
            setNit={setNit}
            userRol={userRol}
            isCreditoVenta={isCreditoVenta}
            apellidos={apellidos}
            setApellidos={setApellidos}
            cart={cart}
            setReferenciaPago={setReferenciaPago}
            referenciaPago={referenciaPago}
            tipoComprobante={tipoComprobante}
            setTipoComprobante={setTipoComprobante}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            imei={imei}
            setImei={setImei}
            selectedCustomerID={selectedCustomerID}
            setSelectedCustomerID={setSelectedCustomerID}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            nombre={nombre}
            setNombre={setNombre}
            telefono={telefono}
            setTelefono={setTelefono}
            dpi={dpi}
            setDpi={setDpi}
            direccion={direccion}
            setDireccion={setDireccion}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            customerOptions={customerOptions}
            onUpdateQuantity={updateQuantityByUid}
            onUpdatePrice={updatePriceByUid}
            onRemoveFromCart={removeFromCartByUid}
            onCompleteSale={() => {}}
            formatCurrency={(n) => formatMonedaGT(n)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* ── AJUSTES ─────────────────────────────────────────── */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Ajustes
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-4 space-y-3">
            {/* Descuento */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Percent className="w-3 h-3" /> Descuento global
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value) || 0)}
                  className="h-8 text-xs pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                  %
                </span>
              </div>
            </div>

            {/* Cuotas + Enganche */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <SplitSquareHorizontal className="w-3 h-3" /> N.º cuotas
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={cuotas}
                  onChange={(e) => setCuotas(Number(e.target.value) || 0)}
                  className="h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Banknote className="w-3 h-3" /> Enganche (Q)
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={enganche}
                  onChange={(e) => setEnganche(Number(e.target.value) || 0)}
                  className="h-8 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Costos adicionales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Costos adicionales
                  <span className="ml-1 text-[10px] opacity-50">opcional</span>
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCosto}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" /> Añadir
                </Button>
              </div>

              {costosAdicionales.length > 0 && (
                <div className="space-y-2">
                  {costosAdicionales.map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-center"
                    >
                      <Input
                        placeholder="Nombre"
                        className="h-7 text-xs"
                        onChange={(e) =>
                          handleChangeItem(c.id, {
                            nombre_costo: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Q 0.00"
                        type="number"
                        className="h-7 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) =>
                          handleChangeItem(c.id, {
                            costo: Number(e.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        placeholder="Descripción"
                        className="h-7 text-xs"
                        onChange={(e) =>
                          handleChangeItem(c.id, {
                            descripcion: e.target.value,
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() =>
                          setCostosAdicionales((prev) =>
                            prev.filter((item) => item.id !== c.id),
                          )
                        }
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comentario */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Comentario
                <span className="ml-auto text-[10px] opacity-50">opcional</span>
              </Label>
              <Textarea
                placeholder="Notas adicionales…"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="text-xs min-h-[60px] resize-none leading-snug"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── RESUMEN ──────────────────────────────────────────── */}
        <Card className="border border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Resumen
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-3 flex-1 space-y-0">
            {list_items.map(
              ({ icon, label, value, mono, accent, highlight }, i, arr) => (
                <div key={label}>
                  <div
                    className={`flex items-center justify-between py-1.5 ${highlight ? "rounded-md bg-muted/50 px-2 -mx-2" : ""}`}
                  >
                    <span
                      className={`flex items-center gap-1.5 text-xs ${highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      <span
                        className={
                          highlight
                            ? "text-foreground"
                            : "text-muted-foreground/70"
                        }
                      >
                        {icon}
                      </span>
                      {label}
                    </span>
                    <span
                      className={`text-xs font-medium tabular-nums ${accent ?? ""} ${highlight ? "text-sm font-semibold text-foreground" : ""} ${mono ? "font-mono" : ""}`}
                    >
                      {value}
                    </span>
                  </div>
                  {i < arr.length - 1 && !highlight && (
                    <Separator className="opacity-40" />
                  )}
                </div>
              ),
            )}
          </CardContent>

          <CardFooter className="px-4 pt-0 pb-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
            >
              Guardar borrador
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Generar cotización
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="hidden print:block">
        <CotizacionPrint
          ref={printRef}
          cart={cart}
          sucursal={sucursal}
          cliente={selectedCustomerID?.nombre ?? nombre}
          totalCarrito={carritoResumen.totalCarrito}
          totalDescuento={carritoResumen.totalDescuento}
          totalConDescuento={carritoResumen.totalConDescuento}
          cuotas={cuotas}
          cantidadPorCuota={carritoResumen.cantidadPorCuota}
          enganche={enganche}
          comentario={comentario}
          formatCurrency={formatMonedaGT}
          costos_adicionales={costosAdicionales}
        />
      </div>

      <DialogImages
        images={imagesProduct}
        openImage={openImage}
        setOpenImage={setOpenImage}
      />
    </PageTransition>
  );
}

export default CotizadorMainPage;
