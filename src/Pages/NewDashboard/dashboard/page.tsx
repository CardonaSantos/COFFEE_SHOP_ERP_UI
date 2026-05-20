"use client";
import { useState } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/Transition/layout-transition";
import { useStore } from "@/components/Context/ContextSucursal";
import { useSocketEvent } from "@/Web/realtime/SocketProvider";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";
import { MetodoPagoMainPOS } from "@/Pages/POS/interfaces/methodPayment";
import TableAlertStocks from "@/Pages/Dashboard/TableAlertStocks";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import PurchasePaymentFormDialog from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";
import Authorizations from "../credit-authorizations/credit-autorizations-main-page";
import CreditCardList from "../credit-records-dashboard/credit-card-list";
import CxpCreditCardList from "../creditos-compras/CxpCreditCardList";
import { RepairCardList } from "../components/repair-card-list";
import { WarrantyCardList } from "../components/warranty-card-list";
import { PriceRequestList } from "../components/price-request-list";
import { TransferRequestList } from "../components/transfer-request-list";
import { UpdateWarrantyDialog } from "../components/update-warranty-dialog";
import { FinishWarrantyDialog } from "../components/finish-warranty-dialog";
import { createNewTimeLine } from "../components/API/api";
import { TimeLineDto } from "../components/API/interfaces.interfaces";
import { EstadoGarantia, GarantiaType } from "../types/newGarantyTypes";
import type { Solicitud, SolicitudTransferencia } from "../types/dashboard";
import type { NormalizedSolicitud } from "../credit-authorizations/interfaces/Interfaces.interfaces";
import type { PayloadAcceptCredito } from "../credit-authorizations/interfaces/accept-credito.dto";
import { ListResp, upsertIntoList } from "../helpers/UpserSocketEvent";
import { useCxpCreditosActivos } from "../creditos-compras/utils/useCxpActivos";
import {
  DashboardWarrantyFinishDto,
  RejectDashboardCreditDto,
  useAcceptDashboardCreditAuthorization,
  useAcceptDashboardPriceRequest,
  useAcceptDashboardTransferRequest,
  useDashboardCajasDisponibles,
  useDashboardCreditAuthorizations,
  useDashboardCuentasBancarias,
  useDashboardOpenedRepairs,
  useDashboardPriceRequests,
  useDashboardProveedores,
  useDashboardSimpleCredits,
  useDashboardTransferRequests,
  useDashboardWarranties,
  useFinishDashboardWarranty,
  useRejectDashboardCreditAuthorization,
  useRejectDashboardPriceRequest,
  useRejectDashboardTransferRequest,
  useUpdateDashboardWarranty,
} from "@/hooks/use-centro-acciones/use-centro-acciones";
import {
  DASHBOARD_AUTH_FILTERS,
  dashboardQkeys,
} from "@/hooks/use-centro-acciones/qk";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");

const estadoColor: Record<EstadoGarantia, string> = {
  [EstadoGarantia.RECIBIDO]: "bg-blue-500",
  [EstadoGarantia.DIAGNOSTICO]: "bg-yellow-500",
  [EstadoGarantia.EN_REPARACION]: "bg-orange-500",
  [EstadoGarantia.ESPERANDO_PIEZAS]: "bg-indigo-500",
  [EstadoGarantia.REPARADO]: "bg-green-500",
  [EstadoGarantia.REEMPLAZADO]: "bg-teal-500",
  [EstadoGarantia.RECHAZADO_CLIENTE]: "bg-red-500",
  [EstadoGarantia.CANCELADO]: "bg-gray-700",
  [EstadoGarantia.CERRADO]: "bg-gray-500",
};

function formatearFecha(fecha: string) {
  return dayjs(fecha).format("DD MMMM YYYY, hh:mm A");
}

function mapMetodoToPOS(m: MetodoPagoMainPOS | ""): MetodoPagoMainPOS {
  switch (m) {
    case "EFECTIVO":
    case "CONTADO":
      return MetodoPagoMainPOS.EFECTIVO;
    case "TRANSFERENCIA":
      return MetodoPagoMainPOS.TRANSFERENCIA;
    case "TARJETA":
      return MetodoPagoMainPOS.TARJETA;
    case "CHEQUE":
      return MetodoPagoMainPOS.CHEQUE;
    default:
      return MetodoPagoMainPOS.EFECTIVO;
  }
}

function getMontoEnganche(auth: NormalizedSolicitud | null): number {
  if (!auth) return 0;

  const enganche = auth.schedule.cuotas.find(
    (cuota) => cuota.etiqueta === "ENGANCHE",
  );

  return Number(enganche?.monto ?? 0);
}

function getNombreCliente(auth: NormalizedSolicitud | null) {
  if (!auth) return "…";

  return `${auth.cliente.nombre}${
    auth.cliente.apellidos ? ` ${auth.cliente.apellidos}` : ""
  }`;
}

function getResumenPlan(auth: NormalizedSolicitud | null) {
  if (!auth) return "";

  return `Plan: ${auth.economico.cuotasTotalesPropuestas} cuota${
    auth.economico.cuotasTotalesPropuestas === 1 ? "" : "s"
  } • Interés: ${auth.economico.interesTipo} ${
    auth.economico.interesPorcentaje
  }% • Primera cuota: ${
    auth.fechas.primeraCuotaISO
      ? new Date(auth.fechas.primeraCuotaISO).toLocaleDateString("es-GT", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "N/A"
  }`;
}

export default function DashboardPageMain() {
  const queryClient = useQueryClient();

  const sucursalId = useStore((s) => s.sucursalId) ?? 0;
  const userID = useStore((s) => s.userId) ?? 0;

  // ─────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────
  const proveedoresQ = useDashboardProveedores();
  const cuentasQ = useDashboardCuentasBancarias();
  const cajasQ = useDashboardCajasDisponibles(sucursalId);

  const { data: authorizations } = useDashboardCreditAuthorizations(
    DASHBOARD_AUTH_FILTERS,
  );

  const { data: creditsRecords } = useDashboardSimpleCredits();
  const { data: priceRequests } = useDashboardPriceRequests(sucursalId);
  const { data: transferRequests } = useDashboardTransferRequests(sucursalId);
  const { data: warrantiesResponse, refetch: refetchWarranties } =
    useDashboardWarranties();
  const { data: reparacionesResponse, refetch: refetchRepairs } =
    useDashboardOpenedRepairs();

  const { items: cxpItems, isLoading: isLoadingCxp } = useCxpCreditosActivos();

  const handleRefechRepairs = async () => {
    refetchRepairs();
  };

  // ─────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────
  const acceptCreditAuthMutation = useAcceptDashboardCreditAuthorization();
  const rejectCreditAuthMutation = useRejectDashboardCreditAuthorization();

  const acceptTransferMutation = useAcceptDashboardTransferRequest(sucursalId);

  const finishWarrantyMutation = useFinishDashboardWarranty();

  // Mutaciones dinámicas por ID en path
  const [priceActionId, setPriceActionId] = useState(0);
  const [transferRejectId, setTransferRejectId] = useState(0);

  const acceptPriceRequestMutation = useAcceptDashboardPriceRequest(
    priceActionId,
    userID,
    sucursalId,
  );

  const rejectPriceRequestMutation = useRejectDashboardPriceRequest(
    priceActionId,
    userID,
    sucursalId,
  );

  const rejectTransferMutation = useRejectDashboardTransferRequest(
    transferRejectId,
    userID,
    sucursalId,
  );

  // ─────────────────────────────────────────────
  // Datos normalizados
  // ─────────────────────────────────────────────
  const proveedores = proveedoresQ.data ?? [];
  const cuentasBancarias = cuentasQ.data ?? [];
  const cajasDisponibles = cajasQ.data ?? [];

  const authorizationsData = Array.isArray(authorizations?.data)
    ? authorizations.data
    : [];

  const credits = Array.isArray(creditsRecords) ? creditsRecords : [];

  const solicitudes: Solicitud[] = Array.isArray(priceRequests)
    ? priceRequests
    : [];

  const solicitudesTransferencia: SolicitudTransferencia[] = Array.isArray(
    transferRequests,
  )
    ? transferRequests
    : [];

  const warranties: GarantiaType[] = Array.isArray(warrantiesResponse)
    ? warrantiesResponse
    : [];

  const reparaciones = Array.isArray(reparacionesResponse)
    ? reparacionesResponse
    : [];

  // ─────────────────────────────────────────────
  // Dialog states
  // ─────────────────────────────────────────────
  const [openUpdateWarranty, setOpenUpdateWarranty] = useState(false);
  const [selectWarrantyUpdate, setSelectWarrantyUpdate] =
    useState<GarantiaType | null>(null);

  const [comentario, setComentario] = useState("");
  const [descripcionProblema, setDescripcionProblema] = useState("");
  const [estado, setEstado] = useState<EstadoGarantia | null>(null);
  const [productoIdW, setProductoIdW] = useState<number>(0);
  const [warrantyId, setWarrantyId] = useState<number>(0);

  const updateWarrantyMutation = useUpdateDashboardWarranty(
    selectWarrantyUpdate?.id ?? 0,
  );

  const [openFinishWarranty, setOpenFinishWarranty] = useState(false);
  const [estadoRegistFinishW, setEstadoFinishW] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [accionesRealizadas, setAccionesRealizadas] = useState("");

  const [openTimeLine, setOpenTimeLine] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState<NormalizedSolicitud | null>(
    null,
  );

  const [openReject, setOpenReject] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [observacionesPay, setObservacionesPay] = useState("");
  const [proveedorSelected, setProveedorSelected] = useState<
    string | undefined
  >(undefined);
  const [metodoPagoSel, setMetodoPagoSel] = useState<MetodoPagoMainPOS | "">(
    "",
  );
  const [cuentaBancariaSelected, setCuentaBancariaSelected] =
    useState<string>("");
  const [cajaSelected, setCajaSelected] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Socket events
  // ─────────────────────────────────────────────
  useSocketEvent("recibirSolicitud", () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQkeys.priceRequests.list(sucursalId),
    });
  });

  useSocketEvent("recibirSolicitudTransferencia", () => {
    queryClient.invalidateQueries({
      queryKey: dashboardQkeys.transferRequests.list(sucursalId),
    });
  });

  useSocketEvent(
    "credit:authorization.created",
    (payload: NormalizedSolicitud) => {
      queryClient.setQueriesData<ListResp<NormalizedSolicitud>>(
        {
          queryKey: dashboardQkeys.creditAuthorizations.root(),
        },
        (prev?: ListResp<NormalizedSolicitud>) =>
          upsertIntoList(prev, payload, { prepend: true }),
      );
    },
  );

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const toggleCard = (id: number) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  const handleReview = (auth: NormalizedSolicitud) => {
    setSelectedAuth(auth);
    setObservacionesPay("");
    setProveedorSelected(undefined);
    setMetodoPagoSel("");
    setCuentaBancariaSelected("");
    setCajaSelected(null);
    setDialogOpen(true);
  };

  const handleRejectCredit = async () => {
    const dto: RejectDashboardCreditDto = {
      authId: selectedAuth?.id,
      adminId: userID,
      sucursalId,
      motivoRechazo,
    };

    if (!dto.adminId || !dto.authId || !dto.sucursalId) {
      toast.info("Propiedades insuficientes, recargue la página");
      return;
    }

    await toast.promise(rejectCreditAuthMutation.mutateAsync(dto), {
      loading: "Rechazando crédito",
      success: () => {
        setOpenReject(false);
        setMotivoRechazo("");
        return "Registro denegado";
      },
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleAcceptCredit = async () => {
    if (!selectedAuth) return;

    const metodoPOS = mapMetodoToPOS(metodoPagoSel);

    const payload: PayloadAcceptCredito = {
      adminId: userID,
      comentario: observacionesPay || "Aprobación desde centro de operaciones",
      metodoPago: metodoPOS,
      authCreditoId: selectedAuth.id,
      cuentaBancariaId:
        metodoPOS === MetodoPagoMainPOS.TRANSFERENCIA ||
        metodoPOS === MetodoPagoMainPOS.TARJETA ||
        metodoPOS === MetodoPagoMainPOS.CHEQUE
          ? cuentaBancariaSelected
            ? Number(cuentaBancariaSelected)
            : null
          : null,
      cajaId:
        metodoPOS === MetodoPagoMainPOS.EFECTIVO
          ? cajaSelected
            ? Number(cajaSelected)
            : null
          : null,
    };

    await toast.promise(acceptCreditAuthMutation.mutateAsync(payload), {
      success: () => {
        setOpenPaymentDialog(false);
        setSelectedAuth(null);
        return "Crédito aceptado y registrado correctamente";
      },
      loading: "Registrando crédito...",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleAceptRequest = async (idSolicitud: number) => {
    setPriceActionId(idSolicitud);

    await toast.promise(acceptPriceRequestMutation.mutateAsync(), {
      loading: "Aceptando petición de precio",
      success: "Petición aceptada, precio concedido",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleRejectRequest = async (idSolicitud: number) => {
    setPriceActionId(idSolicitud);

    await toast.promise(rejectPriceRequestMutation.mutateAsync(), {
      loading: "Rechazando petición de precio",
      success: "Petición rechazada",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleAceptarTransferencia = async (
    idSolicitudTransferencia: number,
  ) => {
    await toast.promise(
      acceptTransferMutation.mutateAsync({
        idSolicitudTransferencia,
        userID,
      }),
      {
        loading: "Aceptando transferencia",
        success: "Transferencia completada",
        error: (error) => getApiErrorMessageAxios(error),
      },
    );
  };

  const handleRejectTransferencia = async (
    idSolicitudTransferencia: number,
  ) => {
    setTransferRejectId(idSolicitudTransferencia);

    await toast.promise(rejectTransferMutation.mutateAsync(), {
      loading: "Rechazando transferencia",
      success: "Solicitud de transferencia rechazada",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleUpdateRegistW = async () => {
    if (!selectWarrantyUpdate) return;

    await toast.promise(
      updateWarrantyMutation.mutateAsync({
        comentario,
        descripcionProblema,
        estado,
      }),
      {
        loading: "Actualizando garantía",
        success: () => {
          setOpenUpdateWarranty(false);
          return "Registro actualizado correctamente";
        },
        error: (error) => getApiErrorMessageAxios(error),
      },
    );
  };

  const handleSubmitFinishRegistW = async () => {
    if (!estadoRegistFinishW) {
      toast.warning("Debe seleccionar un estado");
      return;
    }

    if (!conclusion || !accionesRealizadas) {
      toast.warning("Debe llenar todos los campos");
      return;
    }

    const dtoFinishW: DashboardWarrantyFinishDto = {
      garantiaId: warrantyId,
      usuarioId: userID,
      estado: estadoRegistFinishW,
      productoId: productoIdW,
      conclusion,
      accionesRealizadas,
    };

    await toast.promise(finishWarrantyMutation.mutateAsync(dtoFinishW), {
      loading: "Finalizando garantía",
      success: () => {
        setOpenFinishWarranty(false);
        return "Registro finalizado";
      },
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  const handleCreateNewTimeLine = async (dto: TimeLineDto) => {
    try {
      await toast.promise(createNewTimeLine(dto), {
        loading: "Creando nuevo registro de timeline...",
        success: "Registro al historial agregado",
        error: "Error al insertar registro",
      });

      await refetchWarranties();
    } catch (error) {
      console.error("El error al crear timeline es:", error);
    }
  };

  const nombreClienteSel = getNombreCliente(selectedAuth);

  const montoSel = selectedAuth
    ? formattMonedaGT(selectedAuth.economico.totalPropuesto)
    : "…";

  const resumenPlan = getResumenPlan(selectedAuth);

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Centro de operaciones">
      <Authorizations
        authorizationsData={authorizationsData}
        onReview={handleReview}
      />

      <TableAlertStocks />

      <CxpCreditCardList
        credits={cxpItems}
        loading={isLoadingCxp}
        onRegistrarPago={() => {}}
      />

      <PurchasePaymentFormDialog
        open={openPaymentDialog}
        onOpenChange={setOpenPaymentDialog}
        title={
          getMontoEnganche(selectedAuth) > 0
            ? "Recepcionar enganche y asignar canal"
            : "Asignar canal de cobro para la venta a crédito"
        }
        description={
          getMontoEnganche(selectedAuth) > 0
            ? "Selecciona el método y canal donde se recibirá el enganche."
            : "Aunque no haya enganche, asigna el canal (caja o banco) que se ligará a la venta generada."
        }
        proveedores={proveedores}
        cuentasBancarias={cuentasBancarias}
        cajasDisponibles={cajasDisponibles}
        montoRecepcion={getMontoEnganche(selectedAuth)}
        formatMoney={formattMonedaGT}
        observaciones={observacionesPay}
        setObservaciones={setObservacionesPay}
        proveedorSelected={proveedorSelected}
        setProveedorSelected={setProveedorSelected}
        metodoPago={metodoPagoSel}
        setMetodoPago={(v) =>
          setMetodoPagoSel(v as unknown as MetodoPagoMainPOS)
        }
        cuentaBancariaSelected={cuentaBancariaSelected}
        setCuentaBancariaSelected={setCuentaBancariaSelected}
        cajaSelected={cajaSelected}
        setCajaSelected={setCajaSelected}
        requireProveedor={false}
        flow="IN"
        showProveedor={false}
        onContinue={handleAcceptCredit}
        continueLabel="Recepcionar y crear crédito"
      />

      <AdvancedDialog
        type="warning"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Aprobación de crédito"
        question="¿Deseas aprobar y registrar este crédito?"
        description={
          selectedAuth
            ? `Al aprobar el crédito para ${nombreClienteSel} por ${montoSel}, se creará el registro de crédito y su seguimiento con la información proporcionada por el solicitante. Podrás editar los datos posteriormente si es necesario. ${
                resumenPlan ? "\n" + resumenPlan : ""
              }`
            : "…"
        }
        cancelButton={{
          label: "No aprobar",
          onClick: () => {
            setDialogOpen(false);
            setOpenReject(true);
          },
          variant: "destructive",
        }}
        confirmButton={{
          label: "Confirmar crédito",
          onClick: () => {
            setDialogOpen(false);
            setOpenPaymentDialog(true);
          },
        }}
      >
        <Button
          className="w-full sm:w-full"
          onClick={() => setDialogOpen(false)}
        >
          Cerrar diálogo
        </Button>
      </AdvancedDialog>

      <AdvancedDialog
        type="warning"
        onOpenChange={setOpenReject}
        open={openReject}
        title="Rechazar autorización de crédito"
        description="Se rechazará este crédito y no se generará un registro del mismo."
        confirmButton={{
          label: "Sí, rechazar",
          loading: rejectCreditAuthMutation.isPending,
          loadingText: "Rechazando...",
          onClick: handleRejectCredit,
          disabled: rejectCreditAuthMutation.isPending,
        }}
        cancelButton={{
          disabled: rejectCreditAuthMutation.isPending,
          label: "Cancelar",
          onClick: () => {
            setDialogOpen(true);
            setOpenReject(false);
          },
        }}
        children={
          <div className="">
            <Textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Motivo del rechazo"
            />
          </div>
        }
      />

      <CreditCardList credits={credits} />

      <RepairCardList
        reparaciones={reparaciones}
        getReparacionesRegis={handleRefechRepairs}
        userID={userID ?? 0}
        sucursalId={sucursalId}
      />

      <WarrantyCardList
        warranties={warranties}
        formatearFecha={formatearFecha}
        estadoColor={estadoColor}
        toggleCard={toggleCard}
        expandedCard={expandedCard}
        setOpenUpdateWarranty={setOpenUpdateWarranty}
        setSelectWarrantyUpdate={setSelectWarrantyUpdate}
        setComentario={setComentario}
        setDescripcionProblema={setDescripcionProblema}
        setEstado={setEstado}
        setProductoIdW={setProductoIdW}
        setWarrantyId={setWarrantyId}
        setOpenFinishWarranty={setOpenFinishWarranty}
        openTimeLine={openTimeLine}
        setOpenTimeLine={setOpenTimeLine}
        warrantyId={warrantyId}
        handleCreateNewTimeLine={handleCreateNewTimeLine}
      />

      <PriceRequestList
        solicitudes={solicitudes}
        handleAceptRequest={handleAceptRequest}
        handleRejectRequest={handleRejectRequest}
        formatearFecha={formatearFecha}
      />

      <TransferRequestList
        solicitudesTransferencia={solicitudesTransferencia}
        handleAceptarTransferencia={handleAceptarTransferencia}
        handleRejectTransferencia={handleRejectTransferencia}
        formatearFecha={formatearFecha}
      />

      <UpdateWarrantyDialog
        open={openUpdateWarranty}
        onOpenChange={setOpenUpdateWarranty}
        selectWarrantyUpdate={selectWarrantyUpdate}
        comentario={comentario}
        setComentario={setComentario}
        descripcionProblema={descripcionProblema}
        setDescripcionProblema={setDescripcionProblema}
        estado={estado}
        setEstado={setEstado}
        handleUpdateRegistW={handleUpdateRegistW}
        setOpenFinishWarranty={setOpenFinishWarranty}
      />

      <FinishWarrantyDialog
        open={openFinishWarranty}
        onOpenChange={setOpenFinishWarranty}
        estadoRegistFinishW={estadoRegistFinishW}
        setEstadoFinishW={setEstadoFinishW}
        conclusion={conclusion}
        setConclusion={setConclusion}
        accionesRealizadas={accionesRealizadas}
        setAccionesRealizadas={setAccionesRealizadas}
        handleSubmitFinishRegistW={handleSubmitFinishRegistW}
      />
    </PageTransition>
  );
}
