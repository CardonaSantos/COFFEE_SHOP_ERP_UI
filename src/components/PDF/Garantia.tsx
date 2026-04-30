import React from "react";
import {
  Image,
  Text,
  View,
  Page,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import logo from "@/assets/NOVAPOSPNG.png";

import { VentaHistorialPDF } from "@/Types/PDF/VentaHistorialPDF";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);
dayjs.locale("es");
const colors = {
  primary: "#2ECC9A",
  primaryDark: "#1FA97A",
  textDark: "#1E1E1E",
  textGray: "#666666",
  borderLight: "#DDEEE8",
  backgroundSoft: "#F7F9F9",
};

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const formatearFecha = (fecha: string) => {
  return dayjs(fecha).format("DD/MM/YYYY");
};

interface GarantiaProps {
  venta: VentaHistorialPDF | undefined;
}
const Garantia: React.FC<GarantiaProps> = ({ venta }) => {
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Roboto",
      fontSize: 10,
      padding: 30,
      backgroundColor: "#FFFFFF",
      lineHeight: 1.4,
      color: colors.textDark,
    },
    header: {
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 10,
    },
    logo: {
      width: 90,
      height: 50,
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 12,
      color: colors.textGray,
      textAlign: "center",
      marginBottom: 5,
    },
    section: {
      marginBottom: 10,
      borderLeft: 3,
      borderColor: colors.primary,
      paddingLeft: 8,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "bold",
      marginBottom: 3,
      color: colors.primaryDark,
      textAlign: "left",
      backgroundColor: colors.backgroundSoft,
      padding: 4,
    },
    row: {
      flexDirection: "row",
      marginBottom: 2,
    },
    label: {
      fontWeight: "bold",
      width: "40%",
      color: colors.textGray,
    },
    value: {
      width: "60%",
      color: colors.textDark,
    },
    terms: {
      marginTop: 4,
      fontSize: 9,
      lineHeight: 1.4,
      color: colors.textDark,
    },
    signatureSection: {
      marginTop: 15,
      alignItems: "center",
      textAlign: "center",
    },
    signatureLine: {
      marginTop: 15,
      borderTopWidth: 1,
      borderColor: colors.textDark,
      width: "70%",
      alignSelf: "center",
    },
    footer: {
      marginTop: 10,
      fontSize: 9,
      textAlign: "center",
      color: colors.textGray,
    },
    divider: {
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
      marginVertical: 8,
    },
    warrantyBox: {
      border: 1,
      borderColor: colors.primary,
      padding: 8,
      marginTop: 5,
      backgroundColor: colors.backgroundSoft,
    },
  });

  return (
    <Document>
      {venta?.productos.map((producto: any, index: number) => (
        <Page key={index} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image src={logo || "/placeholder.svg"} style={styles.logo} />
            <Text style={styles.title}>CERTIFICADO DE GARANTÍA</Text>
            <Text style={styles.subtitle}>{venta?.sucursal?.nombre}</Text>
          </View>

          <View style={styles.divider} />

          {/* Detalles de la Venta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DETALLES DE LA VENTA</Text>
            <View style={styles.row}>
              <Text style={styles.label}>No. Garantía:</Text>
              <Text style={styles.value}>
                {venta?.id ? `#${venta.id}` : "No disponible"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha de Compra:</Text>
              <Text style={styles.value}>
                {venta?.fechaVenta
                  ? formatearFecha(venta.fechaVenta)
                  : "No disponible"}
              </Text>
            </View>
          </View>

          {/* Información del Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL PRODUCTO</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Producto:</Text>
              <Text style={styles.value}>
                {producto?.producto?.nombre || "No disponible"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Descripción:</Text>
              <Text style={styles.value}>
                {producto?.producto?.descripcion || "No disponible"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Cantidad:</Text>
              <Text style={styles.value}>{producto?.cantidad || "1"}</Text>
            </View>
          </View>

          {/* Información del Cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>
                {venta?.cliente?.nombre ||
                  venta?.nombreClienteFinal ||
                  "No disponible"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>DPI/NIT:</Text>
              <Text style={styles.value}>
                {venta?.cliente?.dpi || "No disponible"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>
                {venta?.cliente?.telefono || "No disponible"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>
                {venta?.cliente?.direccion || "No disponible"}
              </Text>
            </View>
          </View>

          {/* Términos de Garantía */}
          <View style={styles.warrantyBox}>
            <Text style={styles.sectionTitle}>
              TÉRMINOS Y CONDICIONES DE LA GARANTÍA
            </Text>
            {[
              "Esta garantía cubre defectos de fabricación y materiales bajo condiciones normales de uso.",
              "La garantía NO cubre daños causados por mal uso, abuso, accidentes, desgaste normal o modificaciones no autorizadas.",
              "Para hacer válida la garantía, debe presentar este certificado junto con la factura de compra original.",
              "Las herramientas eléctricas requieren revisión técnica para determinar si aplica la garantía.",
              "Los productos de consumo (clavos, tornillos, etc.) tienen garantía limitada solo por defectos evidentes de fabricación.",
            ].map((term, idx) => (
              <Text key={idx} style={styles.terms}>
                {`${idx + 1}. ${term}`}
              </Text>
            ))}
          </View>

          {/* Firma */}
          <View style={styles.signatureSection}>
            <Text>
              Confirmo haber recibido el producto en buen estado y acepto los
              términos de garantía descritos en este documento.
            </Text>
            <View style={styles.signatureLine} />
            <Text>Firma del Cliente</Text>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Por favor, conserve este certificado junto con su factura para hacer
            válida la garantía.
          </Text>
        </Page>
      ))}
    </Document>
  );
};

export default Garantia;
