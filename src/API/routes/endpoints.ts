export const erpEndpoints = {
  auth: {
    login: "/auth/login-user",
  },

  productos: {
    solicitar: "/solicitud-transferencia-producto",

    delete_image: (key: number) => `/products/images/${key}`,

    inventary: "products/products/for-inventary",

    get_to_transfer: (sucursalId: number) =>
      `/products/products/to-transfer/${sucursalId}`,

    delete_product: (id: number) => `/products/${id}`,
  },
  stock: {
    get_to_edit: (id: number) => `/stock/get-stock-to-edit/${id}`,
    update: "/stock/update-stock-dates",
  },

  sucursales: {
    todas_sucursales: "/sucursales",
    sucursal: (id: number) => `/sucursales/get-info-sucursal/${id}`,
    get_to_transfer: "/sucursales/sucursales-to-transfer",
  },

  transferencias: {
    solicitar: "/solicitud-transferencia-producto",
  },

  users: {
    get_users_select: "/user",
  },

  costos_presupuestales: {
    presupuestos: `/presupuestos`,
    presupuestos_select: `/presupuestos/select`,

    byId: (id: number) => `/presupuestos/details/${id}`,
    ajustar: (id: number) => `/presupuestos/${id}`, // PATCH
    comprometer: (id: number) => `/presupuestos/${id}/comprometer`,
    ejercer: (id: number) => `/presupuestos/${id}/ejercer`,
    liberar: (id: number) => `/presupuestos/${id}/liberar`,

    // Catálogos
    partidas: `/partidas`,
    periodos: `/periodos`,
    centros_costos: `/centros-costo`,
    movimientos_presupuestales: `/movimientos`,
  },
  // REQUISICIONES
  requisiciones: {
    create: `/requisicion`,
    findAll: `/requisicion`,
    generate_purchase: `/compra-requisicion/generar-compra`,
    delete: (id: number) => `/requisicion/${id}`,
    get_one: (id: number) => `/requisicion/one-requisicion/${id}`,
    make_requisicion: (id: number) => `/requisicion/one-requisicion/${id}`,
    get_requisicion_to_edit: (id: number) =>
      `/requisicion/requisicion-to-edit/${id}`,
    update_requisicion: () => `requisicion/update`,
    candidates: `/requisicion/candidatos-requisicion`,

    recepcion_sin_cargo: `/compra-requisicion/requisicion/sin-cargo/recepcionar`,
  },

  //COMPRAS
  compras: {
    get_compras: `/compra-requisicion/get-registros-compras-con-detalle`,
    get_compra_details: (id: number) =>
      `/compra-requisicion/get-registro/${id}`,

    detalles: (id: number) => `/compra-requisicion/get-registro/${id}`,
    recepcionable: "compras/get-data-compra-parcial",
    recepcionar: (id: number) => `/compra-requisicion/${id}/recepcionar`,
    recepcionar_parcial: "compras/create-recepcion-parcial",
  },

  proveedores: "/proveedor",

  cuentas_bancarias: "cuentas-bancarias/get-simple-select",
  cajas: {
    disponibles: (sucursalId: number) =>
      `/caja/cajas-disponibles/${sucursalId}`,
    cerrar_caja: `/caja/cerrar-v3`,

    iniciar_caja: `/caja/iniciar-caja`,

    caja_previa_data: `/caja/previa-cierre`,
    ultima_caja_abierta: (sucursalId: number, userId: number) =>
      `/caja/find-cash-regist-open/${sucursalId}/${userId}`,

    ultimo_saldo_sucursal: (sucursalId: number, userId: number) =>
      `/caja/get-ultimo-saldo-usuario/${sucursalId}/${userId}`,

    list_registros: `/caja/list-cajas`,
  },

  movimiento: {
    delete_movimiento: (movimientoId: number) =>
      `/movimiento-caja/delete-movimiento/${movimientoId}`,
    create_movimiento: `/movimiento-financiero`,
    list_movimientos: `/movimientos-cajas`,
  },

  creditos: {
    documento_compra: (id: number) => `/credito-documento-compra/${id}`,
  },

  tickets_boleta: {
    byId: (id: number) => `/tickets-soporte/get-ticket-boleta/${id}`,
  },
  excel: {
    cajas: `/excel-reports/cajas`,

    cajas_report_range: `/excel-reports/reports-by-range`,

    libro_diario: `/excel-reports/libro-diario`,

    libro_mayor: `/excel-reports/libro-mayor`,

    balance_comprobacion: `/excel-reports/balance-comprobacion`,
    estado_resultados: `/excel-reports/estado-resultados`,
    flujo_caja: `/excel-reports/flujo-caja`,

    estado_caja_turno: `/excel-reports/estado-caja-turno`,
    estado_cuenta_contable: `/excel-reports/estado-cuenta-contable`,
    estado_cuenta_cliente: `/excel-reports/estado-cuenta-cliente`,

    estado_cuenta_proveedor: `/excel-reports/estado-cuenta-proveedor`,
    ventas_reportes: `/excel-reports/ventas-2`,
    gastos: `/excel-reports/gastos`,

    reglas_contables: `/excel-reports/reglas-contables`,

    movimientos_sin_asiento: `/excel-reports/movimientos-sin-asiento`,

    estado_bancario: `/excel-reports/estado-bancario`,
  },

  // CONTABILIDAD
  contabilidad: {
    cuentas: {
      get_all: "/cuentas-contables",
      create: "/cuentas-contables",
      update: (id: number) => `/cuentas-contables/${id}`,
      delete: (id: number) => `/cuentas-contables/${id}`,
    },
    reglas: {
      get_all: "/reglas-contables",
      create: "/reglas-contables",
      update: (id: number) => `/reglas-contables/${id}`,
      delete: (id: number) => `/reglas-contables/${id}`,
      resolver: "/reglas-contables/resolver",
    },
    asientos: {
      get_all: "/asientos-contables",
      get_one: (id: number) => `/asientos-contables/${id}`,
      create: "/asientos-contables",
      anular: (id: number) => `/asientos-contables/${id}/anular`,
    },
  },

  // CENTRO DE ACCIONES
  dashboard: {
    proveedores: "/proveedor",

    cuentas_bancarias: "cuentas-bancarias/get-simple-select",

    credit_authorizations: {
      list: "credito-authorization",
      accept: "credito-authorization/create-credito-from-auth",
      reject: "credito-authorization/reject-credito-from-auth",
    },

    credit_records: {
      simple_dashboard: "credito/simple-credit-dashboard",
    },

    price_requests: {
      list: "price-request",

      // Si tu backend sigue usando params en path:
      accept: (idSolicitud: number, userId: number) =>
        `price-request/acept-request-price/${idSolicitud}/${userId}`,

      reject: (idSolicitud: number, userId: number) =>
        `price-request/reject-request-price/${idSolicitud}/${userId}`,
    },

    transfer_requests: {
      list: "solicitud-transferencia-producto",
      accept: "solicitud-transferencia-producto/aceptar",

      reject: (idSolicitudTransferencia: number, userId: number) =>
        `solicitud-transferencia-producto/rechazar/${idSolicitudTransferencia}/${userId}`,
    },

    warranties: {
      list: "warranty/get-regists-warranties",
      update: (id: number) => `warranty/${id}`,
      finish: "warranty/create-regist-warranty",
    },

    repairs: {
      opened: "repair/get-regist-open-repair",
    },
  },
  dashboard_analitycs: {
    dashboard: "/analytics/dashboard-ventas",
  },
} as const;
