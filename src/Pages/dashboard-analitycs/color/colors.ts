export const dashboardColors = {
  summary: {
    wrapper: "overflow-hidden border border-border bg-background",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  },

  shell: {
    page: "w-full bg-background text-foreground",

    section: "border border-border bg-background",
    sectionHeader: "border-b border-border px-4 py-3",
    sectionBody: "px-4 py-4",

    chartBox: "h-[300px] w-full",
    chartBoxLarge: "h-[360px] w-full",

    emptyBox: "flex h-[300px] items-center justify-center border border-border",
    emptyBoxLarge:
      "flex h-[360px] items-center justify-center border border-border",
  },

  card: {
    base: "min-h-[112px] border-r border-border px-5 py-4 last:border-r-0",
    soft: "border border-border bg-zinc-50 px-4 py-3 dark:bg-zinc-950/40",
  },

  text: {
    label:
      "text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground",
    miniLabel:
      "text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground",

    value:
      "truncate text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl",
    chartValue:
      "text-center text-2xl font-bold leading-none text-foreground md:text-3xl",

    description: "text-xs text-muted-foreground",
    descriptionStrong: "font-medium text-foreground",

    error: "text-sm text-destructive",
    empty: "text-sm text-muted-foreground",
  },

  dots: {
    totalIngresos: "bg-zinc-500 dark:bg-zinc-400",
    mejorMes: "bg-emerald-600 dark:bg-emerald-500",
    mejorDia: "bg-red-500 dark:bg-red-400",
    categoriaTop: "bg-yellow-500 dark:bg-yellow-400",
    transacciones: "bg-violet-500 dark:bg-violet-400",

    comparativoMes: "bg-zinc-500 dark:bg-zinc-400",
    ventasDiaSemana: "bg-zinc-500 dark:bg-zinc-400",
    tendenciaDiaria: "bg-zinc-500 dark:bg-zinc-400",
    topProductos: "bg-zinc-500 dark:bg-zinc-400",
    topCategorias: "bg-zinc-500 dark:bg-zinc-400",

    topFechas: "bg-zinc-500 dark:bg-zinc-400",
  },

  accents: {
    totalIngresos: "text-foreground",
    mejorMes: "text-foreground",
    mejorDia: "text-foreground",
    categoriaTop: "text-foreground",
    transacciones: "text-foreground",
  },

  chart: {
    /**
     * Textos de ejes / labels de Recharts
     */
    text: "#71717a",
    textDark: "#a1a1aa",

    /**
     * Líneas de grid
     */
    grid: "#e4e4e7",
    gridDark: "#27272a",

    /**
     * Barras normales
     */
    bar: "#18181b",
    barDark: "#e4e4e7",

    /**
     * Barras secundarias / mes actual / dato menos destacado
     */
    barMuted: "#a1a1aa",
    barMutedDark: "#52525b",

    /**
     * Línea para AreaChart / LineChart
     */
    line: "#18181b",
    lineDark: "#e4e4e7",

    /**
     * Área debajo de la línea
     */
    area: "rgba(24, 24, 27, 0.10)",
    areaDark: "rgba(228, 228, 231, 0.10)",

    /**
     * Puntos de la línea
     */
    dot: "#18181b",
    dotDark: "#e4e4e7",

    /**
     * Hover/cursor en charts
     */
    cursor: "rgba(113, 113, 122, 0.12)",
    cursorDark: "rgba(161, 161, 170, 0.10)",

    /**
     * Tooltip
     */
    tooltipBg: "hsl(var(--background))",
    tooltipBorder: "hsl(var(--border))",
    tooltipText: "hsl(var(--foreground))",
  },
} as const;
// export const dashboardColors = {
//   summary: {
//     wrapper:
//       "overflow-hidden border border-[#ead7e8] bg-[#fff9fc] dark:border-[#2b1b2d] dark:bg-[#0d080f]",
//     grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
//   },

//   shell: {
//     page: "w-full bg-[#fff9fc] text-[#2f1b2f] dark:bg-[#070507] dark:text-[#f8eaf3]",

//     section:
//       "border border-[#ead7e8] bg-[#fffefe] dark:border-[#2b1b2d] dark:bg-[#0d080f]",
//     sectionHeader: "border-b border-[#ead7e8] px-4 py-3 dark:border-[#2b1b2d]",
//     sectionBody: "px-4 py-4",

//     chartBox: "h-[300px] w-full",
//     chartBoxLarge: "h-[360px] w-full",

//     emptyBox:
//       "flex h-[300px] items-center justify-center border border-[#ead7e8] dark:border-[#2b1b2d]",
//     emptyBoxLarge:
//       "flex h-[360px] items-center justify-center border border-[#ead7e8] dark:border-[#2b1b2d]",
//   },

//   card: {
//     base: "min-h-[112px] border-r border-[#ead7e8] px-5 py-4 last:border-r-0 dark:border-[#2b1b2d]",
//     soft: "border border-[#ead7e8] bg-[#fff4fa] px-4 py-3 dark:border-[#2b1b2d] dark:bg-[#160d18]",
//   },

//   text: {
//     label:
//       "text-[11px] font-medium uppercase tracking-[0.28em] text-[#8b6f86] dark:text-[#b99bb5]",
//     miniLabel:
//       "text-[10px] font-medium uppercase tracking-[0.24em] text-[#8b6f86] dark:text-[#b99bb5]",

//     value:
//       "truncate text-3xl font-bold leading-tight tracking-tight text-[#3a1c3d] md:text-4xl dark:text-[#fff0f8]",
//     chartValue:
//       "text-center text-2xl font-bold leading-none text-[#3a1c3d] md:text-3xl dark:text-[#fff0f8]",

//     description: "text-xs text-[#8b6f86] dark:text-[#b99bb5]",
//     descriptionStrong: "font-medium text-[#3a1c3d] dark:text-[#fff0f8]",

//     error: "text-sm text-[#c2415d] dark:text-[#fb7185]",
//     empty: "text-sm text-[#8b6f86] dark:text-[#b99bb5]",
//   },

//   dots: {
//     totalIngresos: "bg-[#8a3f8f] dark:bg-[#d99ad3]",
//     mejorMes: "bg-[#c77aa8] dark:bg-[#f3a8d2]",
//     mejorDia: "bg-[#e9a3aa] dark:bg-[#ffb6c1]",
//     categoriaTop: "bg-[#d6a35d] dark:bg-[#f4cf8b]",
//     transacciones: "bg-[#7b2f7f] dark:bg-[#c77ad1]",

//     comparativoMes: "bg-[#8a3f8f] dark:bg-[#d99ad3]",
//     ventasDiaSemana: "bg-[#c77aa8] dark:bg-[#f3a8d2]",
//     tendenciaDiaria: "bg-[#e9a3aa] dark:bg-[#ffb6c1]",
//     topProductos: "bg-[#7b2f7f] dark:bg-[#c77ad1]",
//     topCategorias: "bg-[#d6a35d] dark:bg-[#f4cf8b]",
//     topFechas: "bg-[#9a5b35] dark:bg-[#d6a176]",
//   },

//   accents: {
//     totalIngresos: "text-[#7b2f7f] dark:text-[#e7b4df]",
//     mejorMes: "text-[#8a3f8f] dark:text-[#f0b7e7]",
//     mejorDia: "text-[#b85f70] dark:text-[#ffb6c1]",
//     categoriaTop: "text-[#9a6a24] dark:text-[#f4cf8b]",
//     transacciones: "text-[#7b2f7f] dark:text-[#d99ad3]",
//   },

//   chart: {
//     /**
//      * Textos de ejes / labels de Recharts
//      */
//     text: "#8b6f86",
//     textDark: "#b99bb5",

//     /**
//      * Líneas de grid
//      */
//     grid: "#ead7e8",
//     gridDark: "#2b1b2d",

//     /**
//      * Barras normales
//      * Morado principal de la marca
//      */
//     bar: "#8a3f8f",
//     barDark: "#d99ad3",

//     /**
//      * Barras secundarias / mes actual / dato menos destacado
//      * Rosa pastel
//      */
//     barMuted: "#e9a3aa",
//     barMutedDark: "#f3a8d2",

//     /**
//      * Línea para AreaChart / LineChart
//      */
//     line: "#8a3f8f",
//     lineDark: "#f0b7e7",

//     /**
//      * Área debajo de la línea
//      */
//     area: "rgba(138, 63, 143, 0.14)",
//     areaDark: "rgba(217, 154, 211, 0.14)",

//     /**
//      * Puntos de la línea
//      */
//     dot: "#7b2f7f",
//     dotDark: "#f0b7e7",

//     /**
//      * Hover/cursor en charts
//      */
//     cursor: "rgba(138, 63, 143, 0.10)",
//     cursorDark: "rgba(217, 154, 211, 0.12)",

//     /**
//      * Tooltip
//      */
//     tooltipBg: "#fff9fc",
//     tooltipBgDark: "#160d18",
//     tooltipBorder: "#ead7e8",
//     tooltipBorderDark: "#3a253d",
//     tooltipText: "#3a1c3d",
//     tooltipTextDark: "#fff0f8",
//   },
// } as const;
