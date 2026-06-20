"use client";

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
  CalendarDays,
  Clock,
  CreditCard,
  FileText,
  Layers,
  MessageSquare,
  Package,
  Percent,
  Plus,
  ShieldCheck,
  ShoppingCart,
  SplitSquareHorizontal,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DialogImages from "../DialogImages";
import CotizacionPrint from "./components/cotizacion-print";
import { useReactToPrint } from "react-to-print";
import TablePOS from "../POS/table/header";
import { useGetSucursal } from "@/hooks/getSucursales/use-sucursales";

type SourceType = "producto" | "presentacion";
type FrecuenciaPago = "SEMANAL" | "QUINCENAL" | "MENSUAL";
type EstadoCotizacion = "BORRADOR" | "GENERADA" | "ENVIADA" | "ACEPTADA";

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
  financiable: boolean;
  obligatorio: boolean;
}

type CreditoConfig = {
  cuotas: number;
  enganche: number;
  tasaInteres: number;
  gastosAdministrativos: number;
  frecuenciaPago: FrecuenciaPago;
  fechaPrimerPago: string;
  incluirCostosEnCredito: boolean;
  requiereAprobacion: boolean;
};

type CotizacionConfig = {
  numeroCotizacion: string;
  fechaEmision: string;
  validezDias: number;
  estado: EstadoCotizacion;
  tiempoEntrega: string;
  garantia: string;
  condiciones: string;
  comentario: string;
};

type SummaryItem = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: string;
  highlight?: boolean;
};

const frecuenciaLabel: Record<FrecuenciaPago, string> = {
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const addDaysISO = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

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
  const scanInputRef = useRef<HTMLInputElement>(null);

  const userRol = useStore((state) => state.userRol) ?? "";
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cotizacion-${Date.now()}`,
  });

  const { data: sucursal } = useGetSucursal(sucursalId);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [costosAdicionales, setCostosAdicionales] = useState<costoAdicional[]>(
    [],
  );

  const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

  const [descuento, setDescuento] = useState<number>(0);

  const [creditoConfig, setCreditoConfig] = useState<CreditoConfig>({
    cuotas: 0,
    enganche: 0,
    tasaInteres: 0,
    gastosAdministrativos: 0,
    frecuenciaPago: "MENSUAL",
    fechaPrimerPago: addDaysISO(30),
    incluirCostosEnCredito: true,
    requiereAprobacion: true,
  });

  const [cotizacionConfig, setCotizacionConfig] = useState<CotizacionConfig>({
    numeroCotizacion: `COT-${Date.now()}`,
    fechaEmision: toISODate(new Date()),
    validezDias: 7,
    estado: "BORRADOR",
    tiempoEntrega: "Entrega inmediata salvo falta de stock.",
    garantia: "Garantía según políticas de la empresa.",
    condiciones:
      "Cotización sujeta a disponibilidad de inventario. Precios válidos únicamente durante el período indicado.",
    comentario: "",
  });

  const updateCreditoConfig = <K extends keyof CreditoConfig>(
    key: K,
    value: CreditoConfig[K],
  ) => {
    setCreditoConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateCotizacionConfig = <K extends keyof CotizacionConfig>(
    key: K,
    value: CotizacionConfig[K],
  ) => {
    setCotizacionConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addCosto = () => {
    const newCosto: costoAdicional = {
      id: crypto.randomUUID(),
      costo: 0,
      nombre_costo: "Costo adicional",
      descripcion: "",
      financiable: true,
      obligatorio: false,
    };

    setCostosAdicionales((prev) => [...prev, newCosto]);
  };

  const handleChangeItem = (id: string, changes: Partial<costoAdicional>) => {
    setCostosAdicionales((prev) =>
      prev.map((costo) => (costo.id === id ? { ...costo, ...changes } : costo)),
    );
  };

  const [paymentMethod, setPaymentMethod] = useState<MetodoPagoMainPOS>(
    MetodoPagoMainPOS.EFECTIVO,
  );
  const [tipoComprobante, setTipoComprobante] =
    useState<TipoComprobante | null>(TipoComprobante.RECIBO);
  const [referenciaPago, setReferenciaPago] = useState<string>("");

  const isCreditoVenta = paymentMethod === MetodoPagoMainPOS.CREDITO;

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

  const apiParams = useMemo<NewQueryPOS>(() => {
    const params: Partial<NewQueryPOS> = {
      sucursalId,
      limit,
      page,
      q: debouncedSearch || undefined,
    };

    if (queryOptions.cats?.length) params.cats = queryOptions.cats;
    if (queryOptions.codigoProveedor) {
      params.codigoProveedor = queryOptions.codigoProveedor;
    }
    if (queryOptions.tipoEmpaque?.length) {
      params.tipoEmpaque = queryOptions.tipoEmpaque;
    }
    if (queryOptions.priceRange) params.priceRange = queryOptions.priceRange;

    return params as NewQueryPOS;
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
      (customersResponse ?? []).map((customer) => ({
        value: customer.id,
        label: `${customer.nombre} ${customer?.apellidos ?? ""} ${
          customer.telefono ? `(${customer.telefono})` : ""
        } ${customer.dpi ? `DPI: ${customer.dpi}` : "DPI: N/A"} ${
          customer.nit ? `NIT: ${customer.nit}` : "NIT: N/A"
        } ${customer.iPInternet ? `IP: ${customer.iPInternet}` : ""}`,
      })),
    [customersResponse],
  );

  useEffect(() => {
    if (isErrorProducts && errorProducts) {
      toast.error(getApiErrorMessageAxios(errorProducts));
    }

    if (isErrorCustomers && errorCustomers) {
      toast.error(getApiErrorMessageAxios(errorCustomers));
    }
  }, [isErrorProducts, errorProducts, isErrorCustomers, errorCustomers]);

  const [openImage, setOpenImage] = useState(false);
  const [imagesProduct, setImagesProduct] = useState<string[]>([]);

  const makeUid = (source: SourceType, id: number) => `${source}-${id}`;

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

    const initialPrice = product.precios?.[0];

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
        selectedPriceId: initialPrice?.id ?? 0,
        selectedPrice: initialPrice?.precio ?? 0,
        selectedPriceRole:
          (initialPrice?.rol as RolPrecio) ?? RolPrecio.PUBLICO,
      },
    ]);
  };

  const updateQuantityByUid = (uid: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.uid === uid ? { ...item, quantity: Math.max(1, qty) } : item,
      ),
    );
  };

  const updatePriceByUid = (
    uid: string,
    newPrice: number,
    newRole: RolPrecio,
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.uid === uid
          ? {
              ...item,
              selectedPrice: newPrice,
              selectedPriceRole: newRole,
              selectedPriceId:
                item.precios.find(
                  (price) => price.precio === newPrice && price.rol === newRole,
                )?.id ?? item.selectedPriceId,
            }
          : item,
      ),
    );
  };

  const removeFromCartByUid = (uid: string) => {
    setCart((prev) => prev.filter((item) => item.uid !== uid));
  };

  const handleToggleScannerMode = useCallback(() => {
    setIsScannerMode((prev) => {
      const next = !prev;

      if (next) {
        setTimeout(() => scanInputRef.current?.focus(), 50);
      }

      return next;
    });
  }, []);

  const getRemainingForRow = useCallback(
    (product: ProductoData) => {
      const source = (product.__source as SourceType) ?? "producto";
      const uid = makeUid(source, product.id);
      const totalStock = (product.stocks ?? []).reduce(
        (acc, stock) => acc + stock.cantidad,
        0,
      );
      const reserved = cart.find((item) => item.uid === uid)?.quantity ?? 0;

      return Math.max(0, totalStock - reserved);
    },
    [cart],
  );

  const handleImageClick = (images: string[]) => {
    setOpenImage(true);
    setImagesProduct(images);
  };

  const defaultMapToCartProduct = (product: ProductoData): ProductoPOS => {
    return {
      id: product.id,
      source: (product.__source as SourceType) ?? "producto",
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      precioVenta: 0,
      codigoProducto: product.codigoProducto,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      stock: (product.stocks ?? []).map((stock) => ({
        id: stock.id,
        cantidad: stock.cantidad,
        fechaIngreso: stock.fechaIngreso || "",
        fechaVencimiento: stock.fechaVencimiento || "",
      })),
      precios: (product.precios ?? []).map((price) => ({
        id: price.id,
        precio: Number(price.precio) || 0,
        rol: (price.rol as RolPrecio) ?? RolPrecio.PUBLICO,
      })),
      imagenesProducto: (product.images ?? [])
        .filter((image) => Boolean(image?.url))
        .map((image) => ({
          id: image.id ?? 0,
          url: image.url ?? "",
        })),
    };
  };

  const handleSearchItemsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, meta.totalPages || 1)));
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const fechaVencimientoCotizacion = useMemo(() => {
    const date = new Date(cotizacionConfig.fechaEmision);

    if (Number.isNaN(date.getTime())) {
      return addDaysISO(cotizacionConfig.validezDias);
    }

    date.setDate(date.getDate() + cotizacionConfig.validezDias);
    return toISODate(date);
  }, [cotizacionConfig.fechaEmision, cotizacionConfig.validezDias]);

  const carritoResumen = useMemo(() => {
    const subtotalProductos = cart.reduce(
      (acc, item) => acc + (item.selectedPrice ?? 0) * (item.quantity ?? 1),
      0,
    );

    const totalItems = cart.reduce(
      (acc, item) => acc + (item.quantity ?? 1),
      0,
    );

    const descuentoDecimal = clampNumber(Number(descuento) || 0, 0, 100) / 100;
    const totalDescuento = r2(subtotalProductos * descuentoDecimal);
    const subtotalConDescuento = r2(subtotalProductos - totalDescuento);

    const totalCostosAdicionales = r2(
      costosAdicionales.reduce(
        (acc, item) => acc + (Number(item.costo) || 0),
        0,
      ),
    );

    const totalCostosFinanciables = r2(
      costosAdicionales
        .filter((item) => item.financiable)
        .reduce((acc, item) => acc + (Number(item.costo) || 0), 0),
    );

    const totalCostosNoFinanciables = r2(
      totalCostosAdicionales - totalCostosFinanciables,
    );

    const totalContado = r2(subtotalConDescuento + totalCostosAdicionales);

    const engancheSolicitado = Math.max(Number(creditoConfig.enganche) || 0, 0);
    const gastosAdministrativos = Math.max(
      Number(creditoConfig.gastosAdministrativos) || 0,
      0,
    );

    const baseFinanciable = isCreditoVenta
      ? r2(
          subtotalConDescuento +
            (creditoConfig.incluirCostosEnCredito
              ? totalCostosFinanciables
              : 0),
        )
      : 0;

    const engancheAplicado = isCreditoVenta
      ? r2(clampNumber(engancheSolicitado, 0, baseFinanciable))
      : 0;

    const costosPagoInmediato = isCreditoVenta
      ? creditoConfig.incluirCostosEnCredito
        ? totalCostosNoFinanciables
        : totalCostosAdicionales
      : 0;

    const saldoAntesInteres = isCreditoVenta
      ? r2(
          Math.max(baseFinanciable - engancheAplicado, 0) +
            gastosAdministrativos,
        )
      : 0;

    const tasaDecimal =
      clampNumber(Number(creditoConfig.tasaInteres) || 0, 0, 100) / 100;

    const totalInteres = isCreditoVenta
      ? r2(saldoAntesInteres * tasaDecimal)
      : 0;

    const totalFinanciado = isCreditoVenta
      ? r2(saldoAntesInteres + totalInteres)
      : 0;

    const cantidadPorCuota =
      isCreditoVenta && creditoConfig.cuotas > 0
        ? r2(totalFinanciado / creditoConfig.cuotas)
        : 0;

    const pagoInicialTotal = isCreditoVenta
      ? r2(engancheAplicado + costosPagoInmediato)
      : 0;

    const totalCreditoEstimado = isCreditoVenta
      ? r2(pagoInicialTotal + totalFinanciado)
      : 0;

    return {
      subtotalProductos: r2(subtotalProductos),
      totalItems,
      cantidadItems: cart.length,

      totalDescuento,
      subtotalConDescuento,
      totalCostosAdicionales,
      totalCostosFinanciables,
      totalCostosNoFinanciables,

      totalContado,

      baseFinanciable,
      engancheAplicado,
      gastosAdministrativos,
      costosPagoInmediato,
      saldoAntesInteres,
      totalInteres,
      totalFinanciado,
      cantidadPorCuota,
      pagoInicialTotal,
      totalCreditoEstimado,
    };
  }, [cart, descuento, costosAdicionales, creditoConfig, isCreditoVenta]);

  const validateCotizacionBeforePrint = () => {
    if (!cart.length) {
      toast.error("Agrega al menos un producto a la cotización");
      return false;
    }

    if (!selectedCustomerID && !nombre.trim()) {
      toast.error("Selecciona un cliente o ingresa el nombre del cliente");
      return false;
    }

    if (descuento < 0 || descuento > 100) {
      toast.error("El descuento debe estar entre 0% y 100%");
      return false;
    }

    const invalidCost = costosAdicionales.some(
      (cost) => !cost.nombre_costo.trim() || Number(cost.costo) < 0,
    );

    if (invalidCost) {
      toast.error(
        "Revisa los costos adicionales: nombre requerido y monto válido",
      );
      return false;
    }

    if (isCreditoVenta) {
      if (creditoConfig.cuotas <= 0) {
        toast.error("Para crédito debes indicar el número de cuotas");
        return false;
      }

      if (creditoConfig.enganche < 0) {
        toast.error("El enganche no puede ser negativo");
        return false;
      }

      if (creditoConfig.enganche > carritoResumen.baseFinanciable) {
        toast.error("El enganche no puede superar el monto financiable");
        return false;
      }

      if (creditoConfig.tasaInteres < 0 || creditoConfig.tasaInteres > 100) {
        toast.error("El recargo debe estar entre 0% y 100%");
        return false;
      }

      if (!creditoConfig.fechaPrimerPago) {
        toast.error("Indica la fecha del primer pago");
        return false;
      }
    }

    return true;
  };

  const handleGenerateCotizacion = () => {
    if (!validateCotizacionBeforePrint()) return;

    setCotizacionConfig((prev) => ({
      ...prev,
      estado: "GENERADA",
    }));

    handlePrint();
  };

  const listItems: SummaryItem[] = [
    {
      icon: <Layers className="w-3.5 h-3.5" />,
      label: "Productos distintos",
      value: carritoResumen.cantidadItems,
    },
    {
      icon: <Package className="w-3.5 h-3.5" />,
      label: "Total unidades",
      value: carritoResumen.totalItems,
    },
    {
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
      label: "Subtotal productos",
      value: formatMonedaGT(carritoResumen.subtotalProductos),
      mono: true,
    },
    {
      icon: <Percent className="w-3.5 h-3.5" />,
      label: "Descuento aplicado",
      value: `- ${formatMonedaGT(carritoResumen.totalDescuento)}`,
      mono: true,
      accent: "text-rose-500",
    },
    {
      icon: <Box className="w-3.5 h-3.5" />,
      label: "Costos adicionales",
      value: formatMonedaGT(carritoResumen.totalCostosAdicionales),
      mono: true,
    },
    {
      icon: <Banknote className="w-3.5 h-3.5" />,
      label: "Total contado",
      value: formatMonedaGT(carritoResumen.totalContado),
      mono: true,
      highlight: !isCreditoVenta,
    },
    ...(isCreditoVenta
      ? [
          {
            icon: <Banknote className="w-3.5 h-3.5" />,
            label: "Pago inicial",
            value: formatMonedaGT(carritoResumen.pagoInicialTotal),
            mono: true,
          },
          {
            icon: <SplitSquareHorizontal className="w-3.5 h-3.5" />,
            label: "Saldo antes de recargo",
            value: formatMonedaGT(carritoResumen.saldoAntesInteres),
            mono: true,
          },
          {
            icon: <Percent className="w-3.5 h-3.5" />,
            label: "Interés / recargo",
            value: formatMonedaGT(carritoResumen.totalInteres),
            mono: true,
          },
          {
            icon: <CreditCard className="w-3.5 h-3.5" />,
            label: "Total financiado",
            value: formatMonedaGT(carritoResumen.totalFinanciado),
            mono: true,
          },
          {
            icon: <CreditCard className="w-3.5 h-3.5" />,
            label: `${creditoConfig.cuotas || 0} cuota(s) ${frecuenciaLabel[
              creditoConfig.frecuenciaPago
            ].toLowerCase()}`,
            value:
              creditoConfig.cuotas > 0
                ? formatMonedaGT(carritoResumen.cantidadPorCuota)
                : "—",
            mono: true,
            highlight: true,
          },
        ]
      : []),
  ];

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

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Ajustes de cotización
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  No. cotización
                </Label>
                <Input
                  value={cotizacionConfig.numeroCotizacion}
                  onChange={(e) =>
                    updateCotizacionConfig("numeroCotizacion", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Fecha emisión
                </Label>
                <Input
                  type="date"
                  value={cotizacionConfig.fechaEmision}
                  onChange={(e) =>
                    updateCotizacionConfig("fechaEmision", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Validez días
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={cotizacionConfig.validezDias}
                  onChange={(e) =>
                    updateCotizacionConfig(
                      "validezDias",
                      Number(e.target.value) || 1,
                    )
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Válida hasta
                </Label>
                <Input
                  value={fechaVencimientoCotizacion}
                  readOnly
                  className="h-8 text-xs bg-muted/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Descuento global
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={descuento}
                    onChange={(e) => setDescuento(Number(e.target.value) || 0)}
                    className="h-8 text-xs pr-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Tiempo de entrega
                </Label>
                <Input
                  value={cotizacionConfig.tiempoEntrega}
                  onChange={(e) =>
                    updateCotizacionConfig("tiempoEntrega", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Garantía
                </Label>
                <Input
                  value={cotizacionConfig.garantia}
                  onChange={(e) =>
                    updateCotizacionConfig("garantia", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {isCreditoVenta && (
              <div className="rounded-md border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Condiciones de crédito
                  </Label>

                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={creditoConfig.requiereAprobacion}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "requiereAprobacion",
                          e.target.checked,
                        )
                      }
                    />
                    Sujeto a aprobación
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Enganche
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={creditoConfig.enganche}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "enganche",
                          Number(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Cuotas
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={creditoConfig.cuotas}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "cuotas",
                          Number(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Recargo %
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={creditoConfig.tasaInteres}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "tasaInteres",
                          Number(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Gastos adm.
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={creditoConfig.gastosAdministrativos}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "gastosAdministrativos",
                          Number(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Frecuencia
                    </Label>
                    <select
                      value={creditoConfig.frecuenciaPago}
                      onChange={(e) =>
                        updateCreditoConfig(
                          "frecuenciaPago",
                          e.target.value as FrecuenciaPago,
                        )
                      }
                      className="h-8 w-full rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="SEMANAL">Semanal</option>
                      <option value="QUINCENAL">Quincenal</option>
                      <option value="MENSUAL">Mensual</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Primer pago
                    </Label>
                    <Input
                      type="date"
                      value={creditoConfig.fechaPrimerPago}
                      onChange={(e) =>
                        updateCreditoConfig("fechaPrimerPago", e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex h-8 w-full items-center gap-2 rounded-md border px-2 text-[11px] text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={creditoConfig.incluirCostosEnCredito}
                        onChange={(e) =>
                          updateCreditoConfig(
                            "incluirCostosEnCredito",
                            e.target.checked,
                          )
                        }
                      />
                      Financiar costos adicionales
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Costos adicionales
                </Label>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCosto}
                  className="h-6 px-2 text-xs gap-1"
                  type="button"
                >
                  <Plus className="w-3 h-3" />
                  Añadir
                </Button>
              </div>

              {costosAdicionales.length > 0 && (
                <div className="space-y-2">
                  {costosAdicionales.map((costo) => (
                    <div
                      key={costo.id}
                      className="rounded-md border bg-background/60 p-2 space-y-2"
                    >
                      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-[1fr_110px_1fr_auto] md:items-center">
                        <Input
                          value={costo.nombre_costo}
                          placeholder="Nombre"
                          className="h-7 text-xs"
                          onChange={(e) =>
                            handleChangeItem(costo.id, {
                              nombre_costo: e.target.value,
                            })
                          }
                        />

                        <Input
                          value={costo.costo}
                          placeholder="Q 0.00"
                          type="number"
                          className="h-7 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onChange={(e) =>
                            handleChangeItem(costo.id, {
                              costo: Number(e.target.value) || 0,
                            })
                          }
                        />

                        <Input
                          value={costo.descripcion}
                          placeholder="Descripción"
                          className="h-7 text-xs"
                          onChange={(e) =>
                            handleChangeItem(costo.id, {
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
                              prev.filter((item) => item.id !== costo.id),
                            )
                          }
                          type="button"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pl-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={costo.financiable}
                            onChange={(e) =>
                              handleChangeItem(costo.id, {
                                financiable: e.target.checked,
                              })
                            }
                          />
                          Financiable
                        </label>

                        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={costo.obligatorio}
                            onChange={(e) =>
                              handleChangeItem(costo.id, {
                                obligatorio: e.target.checked,
                              })
                            }
                          />
                          Obligatorio
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Comentario para cliente
                </Label>

                <Textarea
                  placeholder="Notas adicionales…"
                  value={cotizacionConfig.comentario}
                  onChange={(e) =>
                    updateCotizacionConfig("comentario", e.target.value)
                  }
                  className="text-xs min-h-[70px] resize-none leading-snug"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Condiciones generales
                </Label>

                <Textarea
                  value={cotizacionConfig.condiciones}
                  onChange={(e) =>
                    updateCotizacionConfig("condiciones", e.target.value)
                  }
                  className="text-xs min-h-[70px] resize-none leading-snug"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              Resumen
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-3 flex-1 space-y-0">
            <div className="rounded-md border bg-muted/20 px-2 py-1.5 mb-2 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>No. {cotizacionConfig.numeroCotizacion}</span>
                <span>{cotizacionConfig.estado}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vence: {fechaVencimientoCotizacion}</span>
                <span>{isCreditoVenta ? "Crédito" : "Contado"}</span>
              </div>
            </div>

            {listItems.map(
              ({ icon, label, value, mono, accent, highlight }, index, arr) => (
                <div key={label}>
                  <div
                    className={`flex items-center justify-between py-1.5 ${
                      highlight ? "rounded-md bg-muted/50 px-2 -mx-2" : ""
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 text-xs ${
                        highlight
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
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
                      className={`text-xs font-medium tabular-nums ${
                        accent ?? ""
                      } ${
                        highlight ? "text-sm font-semibold text-foreground" : ""
                      } ${mono ? "font-mono" : ""}`}
                    >
                      {value}
                    </span>
                  </div>

                  {index < arr.length - 1 && !highlight && (
                    <Separator className="opacity-40" />
                  )}
                </div>
              ),
            )}

            {isCreditoVenta && creditoConfig.requiereAprobacion && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
                Crédito sujeto a revisión y aprobación.
              </div>
            )}

            {isCreditoVenta && (
              <div className="mt-2 rounded-md border bg-muted/20 px-2 py-1.5 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Primer pago</span>
                  <span>{creditoConfig.fechaPrimerPago || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frecuencia</span>
                  <span>{frecuenciaLabel[creditoConfig.frecuenciaPago]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total estimado crédito</span>
                  <span>
                    {formatMonedaGT(carritoResumen.totalCreditoEstimado)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="px-4 pt-0 pb-3 flex gap-2">
            <Button
              onClick={handleGenerateCotizacion}
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
              type="button"
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
          totalCarrito={carritoResumen.subtotalProductos}
          totalDescuento={carritoResumen.totalDescuento}
          totalConDescuento={carritoResumen.subtotalConDescuento}
          cuotas={creditoConfig.cuotas}
          cantidadPorCuota={carritoResumen.cantidadPorCuota}
          enganche={carritoResumen.engancheAplicado}
          comentario={cotizacionConfig.comentario}
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
