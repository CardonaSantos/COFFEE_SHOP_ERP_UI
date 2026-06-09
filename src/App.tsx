import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "sonner";

import Login from "./Pages/Auth/Login";
import RegisterView from "./Pages/Auth/Register";
import CrmRegist from "./Crm/CrmAuth/CrmRegist";
import CrmLogin from "./Crm/CrmAuth/CrmLogin";

import Layout2 from "./components/Layout/Layout";
import NotFoundPage from "./Pages/NotFount/NotFoundPage";

import { useAuthStore } from "./components/Auth/AuthState";
import { useAuthStoreCRM } from "./Crm/CrmAuthRoutes/AuthStateCRM";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { ProtectRouteAdmin } from "./components/Auth/ProtectRouteAdmin";

import DashboardEmpleado from "./Pages/Dashboard/DashboardEmpleado";
import DashboardPageMain from "./Pages/NewDashboard/dashboard/page";
import DashboardAnalitycs from "./Pages/dashboard-analitycs/page";

import PuntoVenta from "./Pages/POS/PuntoVenta";
import HistorialVentasMain from "./Pages/HistorialVentas/HistorialVentas";
import SalesDeleted from "./Pages/SalesDeleted/SalesDeleted";

import Invoice from "./components/PDF/Invoice";
import TicketPage from "./components/PDF/TicketPage";
import GarantiaPage from "./components/PDF/GarantiaPage";
import WarrantyPage from "./components/PDF/PDF-Warranty/WarrantyPage";
import WarrantyFinalPage from "./components/PDF/WarrantyFinal/WarrantyFinalPDFPage";
import CuotasPage from "./components/PDF/Cuotas/CuotasPage";
import ReparacionPage1 from "./components/PDF/ReparacionesPDF/ReparacionPage1";
import ReparacionPdfPageFinal from "./components/PDF/ReparacionesPDF/ReparacionPdfPageFinal";

import CreateSucursal from "./Pages/Sucursal/CreateSucursal";
import Sucursales from "./Pages/Sucursal/Sucursales";
import SucursalesSumary from "./Pages/Sumary/SucursalesSumary";

import CreateCustomer from "./Pages/Customers/CreateCustomer";
import ClientHistorialPurchase from "./Pages/Client/ClientHistorialPurchase";

import InventarioStockPage from "./Pages/InventarioYStock/InventarioStockPage";
import StockEditing from "./Pages/InventarioYStock/EditStock/EditingStock";
import EntregasStock from "./Pages/EntregasStock";
import Vencimientos from "./Pages/Vencimientos";
import TransferenciaProductos from "./Pages/Transferencia/TransferenciaProductos";
import TransferenciaProductosHistorial from "./Pages/Transferencia/TransferenciaHistorial";
import HistorialCambiosPrecio from "./Pages/HistorialPrecios/HistorialCambiosPrecio";
import MovimientosStock from "./Pages/HistorialCambiosStock/HistorialCambiosStock";
import StockEliminaciones from "./Pages/Eliminaciones/StockEliminaciones";

import ProductEditorContainer from "./Pages/newCreateProduct/ProductEditorContainer";
import CategoriasMainPage from "./Pages/Categorias/CategoriasMainPage";
import TiposPresentaciones from "./Pages/tipos-presentaciones/tipos-presentaciones-main-page";

import Caja from "./Pages/Caja/Caja";
import CajaRegistros from "./Pages/CajaRegistros/CajaRegistros";
import CajaDetalle from "./Pages/CajaDetalle/caja-detalle";
import MovimientoCajaDetalle from "./Pages/movimientoCajaDetalle/movimientoCajaDetalle";
import RegistroDeposito from "./Pages/CashRegister/RegistroDeposito";
import ResumenDiarioPage from "./Pages/resumenes-admin/page";
import HistoricoSucursal from "./Pages/resumenes-admin/_historico_sucursal/page";

import FlujoCajaHistoricoMain from "./Pages/CajaAdministrativo/flujo-caja-historico";
import CostosVentaHistoricoPage from "./Pages/CajaAdministrativo/_costo-ventas-historicos/CostosVentaHistoricoPage";
import GastoOperativoHistoricoPage from "./Pages/CajaAdministrativo/_gastos-operativos-historicos/GastoOperativoHistoricoPage";
import FlujoEfectivoPage from "./Pages/CajaAdministrativo/_flujoEfectivo/FlujoEfectivoPage";

import CuentasBancariasPage from "./Pages/cuentas-bancarias/CuentasBancariasPage";
import ContabilidadPage from "./Pages/contabilidad/contabilidad-page";
import CostoPresupuestalMainPage from "./Pages/costo_presupuestal/page";
import { PresupuestoDetallePage } from "./Pages/costo_presupuestal/components/presupuestos/details/page";
import { CreatePresupuestoForm } from "./Pages/costo_presupuestal/components/presupuestos/form/presupuesto-form";

import CompraDetalle from "./Pages/Compras/compra-detalle";
import ProveedoresPage from "./Pages/Provider/AgregarProveedor";

import EditPedido from "./Pages/Pedidos/_componentsEdit/EditPedido";
import PedidoDetails from "./Pages/Pedidos/_componentsPedidoDetails/PedidoDetails";

import RequisitionBuilder from "./Pages/requisiciones/requisicion-main";
import RequisicionPDF from "./Pages/requisiciones/PDF/Pdf";
import { RequisitionEditor } from "./Pages/requisiciones/requisicion-edit";

import ReportesExcel from "./Pages/Reports/Ventas/ReportesExcel";
import { SummarySales } from "./Pages/SummarySales/SummarySales";

import TicketManage from "./Pages/TicketManage/TicketManage";
import ReceiveWarrantyPage from "./Pages/Warranty/ReceiveWarrantyPage";

import RepairOrderForm from "./Pages/Reparaciones/RepairOrder";

import UserConfig from "./Pages/Config/UserConfig";

import Metas from "./Pages/Metas/Metas";
import MyGoals from "./Pages/Metas/MyGoals";

import CreatePlaceholder from "./Pages/VentaCuotas/CreatePlaceholder";
import ContratoCredito from "./Pages/VentaCuotas/ContratoCredito";
import EditPlaceHolder from "./Pages/VentaCuotas/EditPlaceHolder";

import CreditoMainPageManage from "./Pages/creditos/credito-main-page";
import CreditoDetails from "./Pages/creditos/components/credito-details";
import ComprobanteCuota from "./Pages/creditos/components/comprobante-cuota";

import PlantillasLegales from "./Pages/plantillas-legales-credito/page";
import {
  PlantillaLegalForm,
  PlantillaLegalFormEdit,
} from "./Pages/plantillas-legales-credito/components/plantilla-legal-form";
import ContratoImprimible from "./Pages/plantillas-legales-credito/components/render-plantilla";

import CotizadorMainPage from "./Pages/cotizador/page";

import WhatsappTemplatesPage from "./Pages/whatsapp-campaing/page";
import { WhatsappTemplateCreatePage } from "./Pages/whatsapp-campaing/create-templates/create-templates";
import { WhatsappMessaginCapaing } from "./Pages/whatsapp-campaing/send-messages/page";
import { ComprasMainPage } from "./Pages/Compras/ComprasMainPage";

function App() {
  const { checkAuth } = useAuthStore();
  const { checkAuthCRM } = useAuthStoreCRM();

  useEffect(() => {
    checkAuth();
    checkAuthCRM();
  }, [checkAuth, checkAuthCRM]);

  const adminRoute = (element: JSX.Element) => (
    <ProtectRouteAdmin>{element}</ProtectRouteAdmin>
  );

  const userRoute = (element: JSX.Element) => (
    <ProtectedRoute>{element}</ProtectedRoute>
  );

  return (
    <Router>
      <Toaster
        richColors
        expand={true}
        closeButton={true}
        position="top-right"
        duration={3000}
      />

      <Routes>
        {/* ========================= */}
        {/* RUTAS PÚBLICAS / AUTH */}
        {/* ========================= */}

        <Route path="/" element={adminRoute(<Navigate to="/dashboard" />)} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/crm/regist" element={<CrmRegist />} />
        <Route path="/crm/login" element={<CrmLogin />} />

        {/* ========================= */}
        {/* RUTAS CON LAYOUT PRINCIPAL */}
        {/* ========================= */}

        <Route element={<Layout2 />}>
          {/* ========================= */}
          {/* DASHBOARDS */}
          {/* ========================= */}

          <Route
            path="/dashboard"
            element={adminRoute(<DashboardAnalitycs />)}
          />

          <Route
            path="/centro-acciones"
            element={adminRoute(<DashboardPageMain />)}
          />

          <Route
            path="/dashboard-empleado"
            element={userRoute(<DashboardEmpleado />)}
          />

          {/* ========================= */}
          {/* POS / VENTAS */}
          {/* ========================= */}

          <Route path="/punto-venta" element={userRoute(<PuntoVenta />)} />

          <Route
            path="/historial/ventas"
            element={userRoute(<HistorialVentasMain />)}
          />

          <Route
            path="/historial/ventas-eliminaciones"
            element={userRoute(<SalesDeleted />)}
          />

          <Route
            path="/venta/generar-factura/:id"
            element={userRoute(<Invoice />)}
          />

          <Route path="/cotizador" element={userRoute(<CotizadorMainPage />)} />

          {/* ========================= */}
          {/* CLIENTES */}
          {/* ========================= */}

          <Route
            path="/clientes-manage"
            element={userRoute(<CreateCustomer />)}
          />

          <Route
            path="/cliente-historial-compras/:id"
            element={userRoute(<ClientHistorialPurchase />)}
          />

          {/* ========================= */}
          {/* SUCURSALES */}
          {/* ========================= */}

          <Route path="/add-sucursal" element={userRoute(<CreateSucursal />)} />

          <Route path="/sucursal" element={adminRoute(<Sucursales />)} />

          <Route path="/sumary" element={adminRoute(<SucursalesSumary />)} />

          {/* ========================= */}
          {/* INVENTARIO / STOCK */}
          {/* ========================= */}

          <Route
            path="/inventario-stock"
            element={userRoute(<InventarioStockPage />)}
          />

          <Route
            path="/crear-producto"
            element={adminRoute(<ProductEditorContainer mode="product" />)}
          />

          <Route
            path="/editar-producto/:productId"
            element={adminRoute(<ProductEditorContainer mode="product" />)}
          />

          <Route
            path="/editar-presentacion/:presentationId"
            element={adminRoute(<ProductEditorContainer mode="presentation" />)}
          />

          <Route
            path="/stock-edit/:id"
            element={adminRoute(<StockEditing />)}
          />

          <Route
            path="/entregas-stock"
            element={adminRoute(<EntregasStock />)}
          />

          <Route path="/vencimientos" element={userRoute(<Vencimientos />)} />

          <Route
            path="/movimientos-stock"
            element={adminRoute(<MovimientosStock />)}
          />

          <Route
            path="/historial-cambios-precio"
            element={userRoute(<HistorialCambiosPrecio />)}
          />

          <Route
            path="/stock-eliminaciones"
            element={userRoute(<StockEliminaciones />)}
          />

          {/* ========================= */}
          {/* CATEGORÍAS / PRESENTACIONES */}
          {/* ========================= */}

          <Route
            path="/categorias"
            element={adminRoute(<CategoriasMainPage />)}
          />

          <Route
            path="/tipos-presentaciones"
            element={adminRoute(<TiposPresentaciones />)}
          />

          {/* ========================= */}
          {/* TRANSFERENCIAS */}
          {/* ========================= */}

          <Route
            path="/transferencia"
            element={adminRoute(<TransferenciaProductos />)}
          />

          <Route
            path="/transferencia-historial"
            element={adminRoute(<TransferenciaProductosHistorial />)}
          />

          {/* ========================= */}
          {/* COMPRAS / PROVEEDORES / PEDIDOS */}
          {/* ========================= */}

          <Route
            path="/agregar-proveedor"
            element={adminRoute(<ProveedoresPage />)}
          />

          <Route path="/compras" element={adminRoute(<ComprasMainPage />)} />

          <Route path="/compra/:id" element={adminRoute(<CompraDetalle />)} />

          <Route path="/pedido-edit/:id" element={adminRoute(<EditPedido />)} />

          <Route
            path="/pedido-detalles/:id"
            element={adminRoute(<PedidoDetails />)}
          />

          {/* ========================= */}
          {/* REQUISICIONES */}
          {/* ========================= */}

          <Route
            path="/requisiciones"
            element={adminRoute(<RequisitionBuilder />)}
          />

          <Route
            path="/requisicion-edit/:requisicionID"
            element={adminRoute(<RequisitionEditor />)}
          />

          <Route
            path="/pdf-requisicion/:id"
            element={adminRoute(<RequisicionPDF />)}
          />

          {/* ========================= */}
          {/* CAJA / MOVIMIENTOS FINANCIEROS */}
          {/* ========================= */}

          <Route path="/registro-caja" element={userRoute(<Caja />)} />

          <Route
            path="/depositos-egresos/"
            element={userRoute(<RegistroDeposito />)}
          />

          <Route
            path="/movimientos-financieros"
            element={adminRoute(<CajaRegistros />)}
          />

          <Route path="/caja/:id" element={adminRoute(<CajaDetalle />)} />

          <Route
            path="/movimiento-caja/:id"
            element={adminRoute(<MovimientoCajaDetalle />)}
          />

          <Route
            path="/admin/caja/diario"
            element={adminRoute(<ResumenDiarioPage />)}
          />

          <Route
            path="/admin/historicos"
            element={adminRoute(<HistoricoSucursal />)}
          />

          {/* ========================= */}
          {/* CAJA ADMINISTRATIVA */}
          {/* ========================= */}

          <Route
            path="/caja-administrativo/efectivo-banco"
            element={adminRoute(<FlujoCajaHistoricoMain />)}
          />

          <Route
            path="/caja-administrativo/costos-ventas-historicos"
            element={adminRoute(<CostosVentaHistoricoPage />)}
          />

          <Route
            path="/caja-administrativo/gastos-operativos-historicos"
            element={adminRoute(<GastoOperativoHistoricoPage />)}
          />

          <Route
            path="/caja-administrativo/flujo-efectivo"
            element={adminRoute(<FlujoEfectivoPage />)}
          />

          {/* ========================= */}
          {/* CONTABILIDAD / BANCOS / PRESUPUESTOS */}
          {/* ========================= */}

          <Route
            path="/contabilidad"
            element={adminRoute(<ContabilidadPage />)}
          />

          <Route
            path="/cuentas-bancarias"
            element={adminRoute(<CuentasBancariasPage />)}
          />

          <Route
            path="/costos-presupuestales"
            element={adminRoute(<CostoPresupuestalMainPage />)}
          />

          <Route
            path="/presupuestos/detalle/:id"
            element={adminRoute(<PresupuestoDetallePage />)}
          />

          <Route
            path="/crear-presupuesto"
            element={adminRoute(<CreatePresupuestoForm />)}
          />

          {/* ========================= */}
          {/* REPORTES / RESÚMENES */}
          {/* ========================= */}

          <Route path="/reportes" element={adminRoute(<ReportesExcel />)} />

          <Route
            path="/resumen-ventas"
            element={adminRoute(<SummarySales />)}
          />

          {/* ========================= */}
          {/* GARANTÍAS / TICKETS / REPARACIONES */}
          {/* ========================= */}

          <Route
            path="/garantía/generar-garantía/:id"
            element={userRoute(<GarantiaPage />)}
          />

          <Route
            path="/ticket/generar-ticket/:id"
            element={userRoute(<TicketPage />)}
          />

          <Route path="/ticket/manage" element={adminRoute(<TicketManage />)} />

          <Route
            path="/garantia/manage"
            element={userRoute(<ReceiveWarrantyPage />)}
          />

          <Route
            path="/ticket-garantia/:id"
            element={userRoute(<WarrantyPage />)}
          />

          <Route
            path="/garantia/comprobante-uso/:id"
            element={userRoute(<WarrantyFinalPage />)}
          />

          <Route
            path="/reparaciones"
            element={userRoute(<RepairOrderForm />)}
          />

          <Route
            path="/reparacion-comprobante/:id"
            element={userRoute(<ReparacionPage1 />)}
          />

          <Route
            path="/reparacion-comprobante-final/:id"
            element={userRoute(<ReparacionPdfPageFinal />)}
          />

          {/* ========================= */}
          {/* CRÉDITOS / CUOTAS / CONTRATOS */}
          {/* ========================= */}

          <Route
            path="/plantillas-venta-cuotas"
            element={adminRoute(<CreatePlaceholder />)}
          />

          <Route
            path="/creditos"
            element={userRoute(<CreditoMainPageManage />)}
          />

          <Route
            path="/credito-details/:id"
            element={userRoute(<CreditoDetails />)}
          />

          <Route
            path="/creditos/:ventaCuotaId/cuota/:cuotaId/comprobante"
            element={userRoute(<ComprobanteCuota />)}
          />

          <Route
            path="/creditos/:ventaCuotaId/contrato/:plantillaId"
            element={userRoute(<ContratoImprimible />)}
          />

          <Route
            path="/imprimir/contrato/:recordId/:plantillaId"
            element={userRoute(<ContratoCredito />)}
          />

          <Route
            path="/edit/plantilla/:id"
            element={adminRoute(<EditPlaceHolder />)}
          />

          <Route
            path="/cuota/comprobante/:id"
            element={userRoute(<CuotasPage />)}
          />

          {/* ========================= */}
          {/* PLANTILLAS LEGALES */}
          {/* ========================= */}

          <Route
            path="/plantillas-legales"
            element={adminRoute(<PlantillasLegales />)}
          />

          <Route
            path="/plantillas-legales/nueva"
            element={adminRoute(<PlantillaLegalForm />)}
          />

          <Route
            path="/plantillas-legales/:id/editar"
            element={adminRoute(<PlantillaLegalFormEdit />)}
          />

          {/* ========================= */}
          {/* METAS */}
          {/* ========================= */}

          <Route path="/metas" element={adminRoute(<Metas />)} />

          <Route path="/mis-metas" element={userRoute(<MyGoals />)} />

          {/* ========================= */}
          {/* CONFIGURACIÓN */}
          {/* ========================= */}

          <Route path="/config/user" element={adminRoute(<UserConfig />)} />

          {/* ========================= */}
          {/* WHATSAPP CAMPAIGNS */}
          {/* ========================= */}

          <Route
            path="/whatsapp-campaign-templates"
            element={adminRoute(<WhatsappTemplatesPage />)}
          />

          <Route
            path="/whatsapp-campaing-create-templates"
            element={adminRoute(<WhatsappTemplateCreatePage />)}
          />

          <Route
            path="/whatsApp-campaign-messaging"
            element={adminRoute(<WhatsappMessaginCapaing />)}
          />
        </Route>

        {/* ========================= */}
        {/* FALLBACK */}
        {/* ========================= */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
