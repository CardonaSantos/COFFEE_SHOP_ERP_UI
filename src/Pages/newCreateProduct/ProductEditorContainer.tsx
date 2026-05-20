"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useApiQuery,
  useApiMutation,
} from "@/hooks/genericoCall/genericoCallHook";
import { toast } from "sonner";
import { PaginatedResponse } from "../tipos-presentaciones/Interfaces/tiposPresentaciones.interfaces";
import {
  ProductCreateDTO,
  ProductDetailDTO,
  ExistingImage,
  Categoria,
  TipoPresentacion,
  PresentationDetailDTO,
} from "./interfaces/DomainProdPressTypes";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/Context/ContextSucursal";
import { buildFormData, debugFormData } from "./builder";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { validateBeforeSubmit } from "./helpers/validators";
import { PageTransition } from "@/components/Transition/layout-transition";
import { GeneradorQR } from "./Qr/generate-qr";
import { Switch } from "@/components/ui/switch";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { DescriptionForm } from "./components/DescriptionForm";
import { ImageUploader } from "./components/ImageUploader";
import { PricesForm } from "./components/PricesForm";

const initialProduct: ProductCreateDTO = {
  basicInfo: {
    nombre: "",
    codigoProducto: "",
    codigoProveedor: "",
    stockMinimo: 0,
    precioCostoActual: 0,
    categorias: [],
    tipoPresentacionId: null,
    tipoPresentacion: null,
  },
  description: "",
  images: [],
  prices: [],
  presentations: [],
};

export const QK = {
  CATEGORIES: ["categorias"] as const,
  PACKAGING_TYPES: ["empaques"] as const,
  PRODUCTS_LIST: ["products"] as const,
  PRESENTATIONS_LIST: ["presentations"] as const,
  PRODUCT_DETAIL: (id: number) => ["product", id] as const,
  PRESENTATION_DETAIL: (id: number) => ["presentation", id] as const,
};

const QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnWindowFocus: true as const,
  refetchOnReconnect: true as const,
};

export default function ProductEditorContainer({
  mode = "product",
}: {
  mode?: "product" | "presentation";
}) {
  const userId = useStore((s) => s.userId) ?? 0;
  const queryClient = useQueryClient();
  const [includeLogo, setIncludeLogo] = useState<boolean>(false);
  // Params / estado edición
  const params = useParams<{ productId?: string; presentationId?: string }>();
  const idParam = mode === "product" ? params.productId : params.presentationId;
  const id = idParam ? Number(idParam) : undefined;
  const isEditing = Boolean(id);

  // Data
  const { data: catsData } = useApiQuery<Categoria[]>(
    QK.CATEGORIES,
    "categoria",
    undefined,
    { ...QUERY_OPTIONS },
  );

  const { data: packData } = useApiQuery<PaginatedResponse<TipoPresentacion>>(
    QK.PACKAGING_TYPES,
    "tipo-presentacion",
    undefined,
    {
      ...QUERY_OPTIONS,
    },
  );

  const categories = catsData ?? [];
  const packagingTypes = packData?.data ?? [];

  // Detalle condicional
  const detailKey: QueryKey | undefined = isEditing
    ? mode === "product"
      ? QK.PRODUCT_DETAIL(id!)
      : QK.PRESENTATION_DETAIL(id!)
    : undefined;

  const detailUrl =
    mode === "product" ? `products/${id ?? ""}` : `presentations/${id ?? ""}`;

  const { data: detailData } = useApiQuery<
    ProductDetailDTO | PresentationDetailDTO
  >(detailKey ?? ["_detail_disabled"], detailUrl, undefined, {
    ...QUERY_OPTIONS,
    enabled: isEditing && !!id,
  });

  // Estado de formulario
  const [formState, setFormState] = useState<ProductCreateDTO>(initialProduct);
  const [originalDetail, setOriginalDetail] = useState<ProductDetailDTO | null>(
    null,
  );

  // Un solo efecto para mapear y guardar original
  useEffect(() => {
    if (!detailData) return;
    if (mode === "product") {
      const mapped = mapProductDto(detailData as ProductDetailDTO);
      setFormState(mapped);
      setOriginalDetail(detailData as ProductDetailDTO);
    } else {
      const mapped = mapPresentationDto(detailData as PresentationDetailDTO);
      setFormState(mapped);
    }
  }, [detailData, mode]);

  // Update genérico
  const updateField = <K extends keyof ProductCreateDTO>(
    key: K,
    value: ProductCreateDTO[K],
  ) => setFormState((prev) => ({ ...prev, [key]: value }));

  // Mutación create/update
  const submitBase = mode === "product" ? "/products" : "/presentations";
  const mutation = useApiMutation<unknown, FormData>(
    isEditing ? "patch" : "post",
    isEditing ? `${submitBase}/${id}` : submitBase,
  );

  // Helper de invalidación centralizada
  const invalidate = async (keys: QueryKey[]) => {
    for (const k of keys) {
      await queryClient.invalidateQueries({ queryKey: k });
    }
  };

  const handleSubmit = async () => {
    const v = validateBeforeSubmit(formState, mode);
    if (!v.ok) {
      v.errors.forEach((msg) => toast.error(msg));
      return;
    }

    const formData = buildFormData(formState, userId, {
      isEditing,
      original: originalDetail ?? undefined,
    });

    try {
      debugFormData(
        formData,
        isEditing
          ? `${mode === "product" ? "PATCH /products" : "PATCH /presentations"}`
          : `${mode === "product" ? "POST /products" : "POST /presentations"}`,
      );

      await toast.promise(mutation.mutateAsync(formData), {
        loading: isEditing
          ? `Actualizando ${
              mode === "product" ? "producto" : "presentación"
            }...`
          : `Creando ${mode === "product" ? "producto" : "presentación"}...`,
        success: isEditing
          ? `${mode === "product" ? "Producto" : "Presentación"} actualizado`
          : `${mode === "product" ? "Producto" : "Presentación"} creado`,
        error: (err) => getErrorMessage(err),
      });

      // Invalidaciones post-mutate
      const keysToInvalidate: QueryKey[] = [QK.CATEGORIES, QK.PACKAGING_TYPES];

      if (mode === "product") {
        keysToInvalidate.push(QK.PRODUCTS_LIST);
        if (isEditing && id) keysToInvalidate.push(QK.PRODUCT_DETAIL(id));
      } else {
        keysToInvalidate.push(QK.PRESENTATIONS_LIST);
        if (isEditing && id) keysToInvalidate.push(QK.PRESENTATION_DETAIL(id));
      }

      await invalidate(keysToInvalidate);
    } catch {
      // manejado por toast.promise
    }
  };

  return (
    <PageTransition
      fallbackBackTo="/"
      titleHeader="Creación y Edición de Producto"
    >
      {mode === "product" && (
        <div className="space-y-8">
          {" "}
          {/* Espaciado consistente entre secciones */}
          {/* SECCIÓN 1: Información Básica y QR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BasicInfoForm
                value={formState.basicInfo}
                categories={categories}
                packagingTypes={packagingTypes}
                onChange={(val) => updateField("basicInfo", val)}
              />
            </div>

            {/* TARJETA DE CÓDIGO QR */}
            <div className="flex flex-col p-6 border rounded-xl bg-card shadow-sm items-center justify-center space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Código QR del Producto
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {formState.basicInfo.codigoProducto || "Sin código asignado"}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-inner">
                <GeneradorQR
                  valor={formState.basicInfo.codigoProducto || "placeholder"}
                  includeLogo={includeLogo}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="logo-qr"
                  onCheckedChange={setIncludeLogo}
                  checked={includeLogo}
                />
                <label htmlFor="logo-qr" className="text-sm cursor-pointer">
                  Incluir mi logo
                </label>
              </div>
            </div>
          </div>
          {/* SECCIÓN 2: Descripción y Multimedia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DescriptionForm
              value={formState.description}
              onChange={(val) => updateField("description", val)}
            />
            <ImageUploader
              files={formState.images}
              onDone={(files) => updateField("images", files)}
            />
          </div>
          {/* SECCIÓN 3: Precios */}
          <PricesForm
            precios={formState.prices}
            setPrecios={(prices) => updateField("prices", prices)}
          />
        </div>
      )}

      {/* Footer de Acción */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          size={"sm"}
          className=" disabled:bg-gray-400 "
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Procesando..."
            : isEditing
              ? `Guardar Cambios`
              : `Crear ${mode === "product" ? "Producto" : "Presentación"}`}
        </Button>
      </div>
    </PageTransition>
  );
}

export function mapProductDto(dto: ProductDetailDTO): ProductCreateDTO {
  return {
    basicInfo: {
      nombre: dto.nombre,
      codigoProducto: dto.codigoProducto,
      codigoProveedor: dto.codigoProveedor ?? "",
      // 🔹 ahora usamos el del server
      stockMinimo: dto.stockMinimo ?? 0,
      // 🔹 asegurar número
      precioCostoActual: Number(dto.precioCostoActual ?? 0),

      categorias: dto.categorias ?? [],
      tipoPresentacionId: dto.tipoPresentacionId ?? null,
      tipoPresentacion: dto.tipoPresentacion ?? null,
    },
    description: dto.descripcion ?? "",
    images: (dto.imagenesProducto ?? []) as ExistingImage[],
    prices: (dto.precios ?? []).map((p) => ({
      rol: p.rol,
      orden: p.orden,
      precio: String(p.precio), // el server ya lo manda string
    })),
    presentations: (dto.presentaciones ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      codigoBarras: p.codigoBarras ?? "",
      tipoPresentacionId:
        p.tipoPresentacionId ?? p.tipoPresentacion?.id ?? null,
      tipoPresentacion: p.tipoPresentacion ?? null,
      costoReferencialPresentacion: String(
        p.costoReferencialPresentacion ?? "0",
      ),
      descripcion: p.descripcion ?? "",
      // 🔹 ya viene listo y null-safe desde el server
      stockMinimo: p.stockMinimo ?? 0,
      precios: (p.precios ?? []).map((x) => ({
        rol: x.rol,
        orden: x.orden,
        precio: String(x.precio),
      })),
      esDefault: !!p.esDefault,
      imagenes: (p.imagenesPresentacion ?? []) as ExistingImage[],
      activo: !!p.activo,
      categorias: p.categorias ?? [],
    })),
  };
}

export function mapPresentationDto(
  dto: PresentationDetailDTO,
): ProductCreateDTO {
  return {
    basicInfo: {
      nombre: "",
      codigoProducto: "",
      codigoProveedor: "",
      stockMinimo: 0,
      precioCostoActual: 0,
      categorias: [],
      tipoPresentacionId: null,
      tipoPresentacion: null,
    },
    description: "",
    images: [],
    prices: [],
    presentations: [
      {
        id: dto.id,
        nombre: dto.nombre,
        codigoBarras: dto.codigoBarras ?? "",
        tipoPresentacionId: dto.tipoPresentacionId,
        tipoPresentacion: dto.tipoPresentacion,
        costoReferencialPresentacion: dto.costoReferencialPresentacion,
        descripcion: dto.descripcion ?? "",
        stockMinimo: dto.stockMinimo ?? 0,
        precios: dto.precios.map((x) => ({
          rol: x.rol,
          orden: x.orden,
          precio: x.precio,
        })),
        esDefault: !!dto.esDefault,
        imagenes: dto.imagenesPresentacion, // ExistingImage[]
        activo: dto.activo,
        categorias: dto.categorias,
      },
    ],
  };
}

function getErrorMessage(err: any): string {
  return err?.message || "Error desconocido";
}
