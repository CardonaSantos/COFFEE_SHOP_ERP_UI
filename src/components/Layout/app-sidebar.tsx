import {
  Home,
  ShieldCheck,
  Wallet,
  CreditCard,
  ChevronDown,
  Target,
  Goal,
  NotebookPen,
  ListOrdered,
  Boxes,
  Truck,
  ArrowLeftRight,
  Send,
  UserCheck,
  Factory,
  Shield,
  BarChart3,
  Wrench,
  Settings,
  ChartPie,
  ReceiptText,
  ClipboardList,
  HandCoins,
  Landmark,
  Calculator,
  Store,
  MonitorSmartphone,
  FileText,
  PackagePlus,
  CalendarClock,
  LineChart,
  TrendingUp,
  FileSignature,
  ChartScatter,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ShoppingCart, Package, Users, Building, History } from "lucide-react";
import { useStore } from "../Context/ContextSucursal";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useMemo } from "react";
import { WhatsappIcon } from "../icons/WhatsappIcon";
import { MetaIcon } from "../icons/MetaIcon";
import { MessageIcon } from "../icons/MessageIcon";

export const menuVendedor = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    icon: Store,
    label: "Ventas",
    submenu: [
      {
        icon: MonitorSmartphone,
        label: "Punto de Venta",
        href: "/punto-venta",
      },
      { icon: FileText, label: "Cotizador", href: "/cotizador" },

      { icon: CreditCard, label: "Gestión de Créditos", href: "/creditos" },
      {
        icon: History,
        label: "Historial de Ventas",
        href: "/historial/ventas",
      },
    ],
  },

  // 2. CONSULTAS RÁPIDAS
  { icon: Package, label: "Inventario General", href: "/inventario-stock" },

  {
    icon: Wallet,
    label: "Caja Operativa",
    submenu: [
      {
        icon: NotebookPen,
        label: "Apertura / Registro",
        href: "/registro-caja",
      },
    ],
  },

  { icon: Users, label: "Directorio de Clientes", href: "/clientes-manage" },

  // 3. RENDIMIENTO PERSONAL
  { icon: Goal, label: "Mis Metas", href: "/mis-metas" },
];

const menuItemsAdmin = [
  // 1. OPERACIONES DIARIAS (Lo más usado)
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Home, label: "Centro de Acciones", href: "/centro-acciones" },

  {
    icon: Store,
    label: "Ventas",
    submenu: [
      {
        icon: MonitorSmartphone,
        label: "Punto de Venta",
        href: "/punto-venta",
      },
      { icon: FileText, label: "Cotizador", href: "/cotizador" },
      {
        icon: History,
        label: "Historial de Ventas",
        href: "/historial/ventas",
      },
    ],
  },

  {
    icon: Wallet,
    label: "Caja Operativa",
    submenu: [
      {
        icon: NotebookPen,
        label: "Apertura / Registro",
        href: "/registro-caja",
      },
      {
        icon: ListOrdered,
        label: "Movimientos de Caja",
        href: "/movimientos-financieros",
      },
    ],
  },

  { icon: CreditCard, label: "Gestión de Créditos", href: "/creditos" },

  // ==========================================
  // 2. CADENA DE SUMINISTRO Y PRODUCTOS
  // ==========================================
  {
    icon: Package,
    label: "Inventario y Stock",
    submenu: [
      { icon: Boxes, label: "Inventario General", href: "/inventario-stock" },
      { icon: PackagePlus, label: "Crear Producto", href: "/crear-producto" },
      { icon: Truck, label: "Entregas de Stock", href: "/entregas-stock" },
      { icon: CalendarClock, label: "Vencimientos", href: "/vencimientos" }, // Movido aquí por contexto
    ],
  },

  {
    icon: ArrowLeftRight,
    label: "Transferencias",
    submenu: [
      { icon: Send, label: "Transferir Productos", href: "/transferencia" },
      {
        icon: History,
        label: "Historial de Transferencias",
        href: "/transferencia-historial",
      },
    ],
  },

  {
    icon: ShoppingCart,
    label: "Compras",
    submenu: [
      { icon: ClipboardList, label: "Requisiciones", href: "/requisiciones" },
      { icon: ReceiptText, label: "Historial de Compras", href: "/compras" },
    ],
  },

  // ==========================================
  // 3. CONTACTOS Y SERVICIOS POST-VENTA
  // ==========================================
  {
    icon: Users,
    label: "Directorio",
    submenu: [
      { icon: UserCheck, label: "Clientes", href: "/clientes-manage" },
      { icon: Factory, label: "Proveedores", href: "/agregar-proveedor" },
    ],
  },

  {
    icon: ShieldCheck,
    label: "Servicios y Post-Venta",
    submenu: [
      { icon: Shield, label: "Garantías", href: "/garantia/manage" },
      { icon: Wrench, label: "Reparaciones", href: "/reparaciones" }, // Agrupado con garantías
    ],
  },

  // ==========================================
  // 4. FINANZAS Y ADMINISTRACIÓN (Nivel Gerencial)
  // ==========================================
  {
    icon: Landmark,
    label: "Finanzas y Cuentas",
    submenu: [
      {
        icon: Landmark,
        label: "Cuentas Bancarias",
        href: "/cuentas-bancarias",
      },
      {
        icon: Calculator,
        label: "Costos Presupuestales",
        href: "/costos-presupuestales",
      },

      {
        icon: ChartScatter,
        label: "Contabilidad",
        href: "/contabilidad",
      },

      {
        icon: HandCoins,
        label: "Flujo de Efectivo",
        href: "/caja-administrativo/flujo-efectivo",
      },
    ],
  },

  {
    icon: BarChart3,
    label: "Analíticas y Reportes",
    submenu: [
      { icon: ChartPie, label: "Resumen Diario", href: "/admin/caja/diario" },
      { icon: History, label: "Histórico General", href: "/admin/historicos" },
      {
        icon: LineChart,
        label: "Histórico Flujo de Caja",
        href: "/caja-administrativo/efectivo-banco",
      },
      {
        icon: TrendingUp,
        label: "Histórico Costo Ventas",
        href: "/caja-administrativo/costos-ventas-historicos",
      },
      {
        icon: BarChart3,
        label: "Histórico Gastos",
        href: "/caja-administrativo/gastos-operativos-historicos",
      },
    ],
  },

  // ==========================================
  // 5. GESTIÓN INTERNA Y CONFIGURACIÓN
  // ==========================================
  {
    icon: Target,
    label: "Rendimiento y Metas",
    submenu: [
      { icon: Target, label: "Metas Generales", href: "/metas" },
      { icon: Goal, label: "Mis Metas", href: "/mis-metas" },
    ],
  },

  {
    icon: WhatsappIcon,
    label: "Campañas WhatsApp",
    submenu: [
      {
        icon: MetaIcon,
        label: "Plantillas Meta",
        href: "/whatsapp-campaign-templates",
      },
      {
        icon: MessageIcon,
        label: "Enviar campaña",
        href: "/whatsapp-campaign-messaging",
      },
    ],
  },

  // Rutas directas para administración
  { icon: Building, label: "Sucursales", href: "/sucursal" },
  {
    icon: FileSignature,
    label: "Plantillas Legales",
    href: "/plantillas-legales",
  },

  // Siempre al final
  { icon: Settings, label: "Configuración", href: "/config/user" },
];

export function AppSidebar() {
  const rolUser = useStore((state) => state.userRol);

  const allRoutes = useMemo(() => {
    if (rolUser === "ADMIN" || rolUser === "SUPER_ADMIN") return menuItemsAdmin;
    return menuVendedor;
  }, [rolUser]);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <div className="overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Secciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allRoutes.map((item) => {
                  // Si el item tiene submenú, lo mostramos como un SidebarMenuSub dentro de un Collapsible
                  if (item.submenu) {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <Collapsible defaultOpen className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span>{item.label}</span>
                              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                  <SidebarMenuSubButton className="py-5">
                                    <Link
                                      to={subItem.href}
                                      className="flex items-center gap-2"
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <subItem.icon className="h-4 w-4 shrink-0" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{subItem.label}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    );
                  } else {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.href}
                            className="flex items-center gap-2"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <item.icon className="h-4 w-4 shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
