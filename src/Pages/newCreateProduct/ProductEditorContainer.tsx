"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useApiMutation,
  useApiQuery,
} from "@/hooks/genericoCall/genericoCallHook";
import {
  ExistingImage,
  ProductCreateDTO,
  ProductDetailDTO,
} from "./interfaces/DomainProdPressTypes";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/Context/ContextSucursal";
import { PageTransition } from "@/components/Transition/layout-transition";
import { buildFormData, debugFormData } from "./builder";
import { validateBeforeSubmit } from "./helpers/validators";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { DescriptionForm } from "./components/DescriptionForm";
import { ImageUploader } from "./components/ImageUploader";
import { PricesForm } from "./components/PricesForm";
import { ProductCodesPanel } from "./code/ProductCodesPanel";
import { useGetCategorias } from "@/hooks/use-categorias/use-categorias";
import { useTiposPresentaciones } from "@/hooks/use-tipos-presentaciones/use-tipos-presentaciones";

import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { useDeleteProductImage } from "@/hooks/use-delete-images/use-delete-images";

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
};

export const QK = {
  CATEGORIES: ["categorias"] as const,
  PACKAGING_TYPES: ["empaques"] as const,
  PRODUCTS_LIST: ["products"] as const,
  PRODUCT_DETAIL: (id: number) => ["product", id] as const,
};

const QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnWindowFocus: true as const,
  refetchOnReconnect: true as const,
};

export default function ProductEditorContainer() {
  const userId = useStore((state) => state.userId) ?? 0;
  const queryClient = useQueryClient();
  const [includeLogo, setIncludeLogo] = useState(false);
  const [formState, setFormState] = useState<ProductCreateDTO>(initialProduct);
  const [originalDetail, setOriginalDetail] = useState<ProductDetailDTO | null>(
    null,
  );
  const params = useParams<{ productId?: string }>();
  const productId = params.productId ? Number(params.productId) : undefined;
  const isEditing = Number.isFinite(productId) && Boolean(productId);
  const { data: catsData = [] } = useGetCategorias();
  const { data: packData } = useTiposPresentaciones();

  const deleteImage = useDeleteProductImage();

  const removeImageFromState = (image: ExistingImage) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((item) => {
        const current = item as ExistingImage;

        if (image.id && current.id) {
          return current.id !== image.id;
        }

        return current.url !== image.url;
      }),
    }));
  };

  const handleDeleteExistingImage = async (image: ExistingImage) => {
    if (!image.id) {
      removeImageFromState(image);
      return;
    }

    await toast.promise(deleteImage.mutateAsync(image.id), {
      loading: "Eliminando imagen...",
      success: "Imagen eliminada",
      error: (error) => getApiErrorMessageAxios(error),
    });

    removeImageFromState(image);

    if (productId) {
      await queryClient.invalidateQueries({
        queryKey: QK.PRODUCT_DETAIL(productId),
      });
    }
  };

  const { data: detailData } = useApiQuery<ProductDetailDTO>(
    isEditing ? QK.PRODUCT_DETAIL(productId!) : ["_product_detail_disabled"],
    `products/${productId ?? ""}`,
    undefined,
    {
      ...QUERY_OPTIONS,
      enabled: isEditing,
    },
  );

  const mutation = useApiMutation<unknown, FormData>(
    isEditing ? "patch" : "post",
    isEditing ? `/products/${productId}` : "/products",
  );

  const categories = catsData ?? [];
  const packagingTypes = packData?.data ?? [];

  useEffect(() => {
    if (!detailData) return;

    const mapped = mapProductDto(detailData);

    setFormState(mapped);
    setOriginalDetail(detailData);
  }, [detailData]);

  const updateField = <K extends keyof ProductCreateDTO>(
    key: K,
    value: ProductCreateDTO[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const invalidate = async (keys: QueryKey[]) => {
    for (const key of keys) {
      await queryClient.invalidateQueries({ queryKey: key });
    }
  };

  const handleSubmit = async () => {
    /**
     * Si ya limpiaste el validator, usa:
     * const validation = validateBeforeSubmit(formState);
     *
     * Si todavía espera segundo argumento, deja "product".
     */
    const validation = validateBeforeSubmit(formState, "product");

    if (!validation.ok) {
      validation.errors.forEach((message) => toast.error(message));
      return;
    }

    const formData = buildFormData(formState, userId, {
      isEditing,
      original: originalDetail ?? undefined,
    });

    try {
      debugFormData(formData, `${isEditing ? "PATCH" : "POST"} /products`);

      await toast.promise(mutation.mutateAsync(formData), {
        loading: isEditing ? "Actualizando producto..." : "Creando producto...",
        success: isEditing ? "Producto actualizado" : "Producto creado",
        error: (error) => getErrorMessage(error),
      });

      const keysToInvalidate: QueryKey[] = [
        QK.CATEGORIES,
        QK.PACKAGING_TYPES,
        QK.PRODUCTS_LIST,
      ];

      if (isEditing && productId) {
        keysToInvalidate.push(QK.PRODUCT_DETAIL(productId));
      }

      await invalidate(keysToInvalidate);
    } catch {
      // toast.promise ya muestra el error.
    }
  };
  console.log("El form: ", formState);

  return (
    <PageTransition
      fallbackBackTo="/"
      titleHeader="Creación y Edición de Producto"
    >
      <div className="space-y-8">
        {/* SECCIÓN 1: Información básica y códigos */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BasicInfoForm
              value={formState.basicInfo}
              categories={categories}
              packagingTypes={packagingTypes}
              onChange={(value) => updateField("basicInfo", value)}
            />
          </div>

          <ProductCodesPanel
            codigoProducto={formState.basicInfo.codigoProducto}
            includeLogo={includeLogo}
            onIncludeLogoChange={setIncludeLogo}
          />
        </div>

        {/* SECCIÓN 2: Descripción y multimedia */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DescriptionForm
            value={formState.description}
            onChange={(value) => updateField("description", value)}
          />

          <ImageUploader
            files={formState.images}
            onDone={(files) => updateField("images", files)}
            onDeleteExisting={handleDeleteExistingImage}
            isDeletingExisting={deleteImage.isPending}
          />
        </div>

        {/* SECCIÓN 3: Precios */}
        <PricesForm
          precios={formState.prices}
          setPrecios={(prices) => updateField("prices", prices)}
        />
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button
          size="sm"
          className="disabled:bg-gray-400"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Procesando..."
            : isEditing
              ? "Guardar Cambios"
              : "Crear Producto"}
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
      stockMinimo: dto.stockMinimo ?? 0,
      precioCostoActual: Number(dto.precioCostoActual ?? 0),
      categorias: dto.categorias ?? [],
      tipoPresentacionId: dto.tipoPresentacionId ?? null,
      tipoPresentacion: dto.tipoPresentacion ?? null,
    },
    description: dto.descripcion ?? "",
    images: (dto.imagenesProducto ?? []) as ExistingImage[],
    prices: (dto.precios ?? []).map((precio) => ({
      rol: precio.rol,
      orden: precio.orden,
      precio: String(precio.precio),
    })),
  };
}

function getErrorMessage(error: any): string {
  return error?.message || "Error desconocido";
}
