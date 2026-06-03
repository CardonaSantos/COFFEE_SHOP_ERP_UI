"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WhatsappTemplateCreateFormState,
  WhatsappTemplateCategory,
  WhatsappTemplateHeaderFormat,
  WhatsappTemplateButton,
  WhatsappTemplateButtonType,
  WhatsappTemplateComponent,
  CreateWhatsappTemplateDto,
  MetaCreateTemplateResponse,
  FormErrors,
  TemplateVariable,
  WhatsappTemplateMediaHandleResponse,
} from "@/Types/whatsapp-campaing/types";
import {
  createUtilityImageTemplate,
  createWhatsappTemplate,
} from "../services/services";
import { toast } from "sonner";

// ─── Variable detection ───────────────────────────────────────────────────────

const VAR_REGEX = /\{\{(\d+)\}\}/g;

function extractVariableIndices(text: string): number[] {
  const matches = [...text.matchAll(VAR_REGEX)];
  const indices = matches.map((m) => Number(m[1]));
  return [...new Set(indices)].sort((a, b) => a - b);
}

function syncBodyVariables(
  text: string,
  current: TemplateVariable[],
): TemplateVariable[] {
  const indices = extractVariableIndices(text);
  return indices.map((idx) => ({
    index: idx,
    value: current.find((v) => v.index === idx)?.value ?? "",
  }));
}

// ─── Payload builder ──────────────────────────────────────────────────────────

export function buildCreateWhatsappTemplatePayload(
  form: WhatsappTemplateCreateFormState,
): CreateWhatsappTemplateDto {
  const components: WhatsappTemplateComponent[] = [];

  // 1. HEADER
  if (form.headerEnabled) {
    if (form.headerFormat === "TEXT") {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: form.headerText,
      });
    } else {
      components.push({
        type: "HEADER",
        format: form.headerFormat,
        example: { header_handle: [form.headerHandle] },
      });
    }
  }

  // 2. BODY (always)
  const bodyComponent: WhatsappTemplateComponent = {
    type: "BODY",
    text: form.bodyText,
  };
  if (form.bodyVariables.length > 0) {
    bodyComponent.example = {
      body_text: [form.bodyVariables.map((v) => v.value)],
    };
  }
  components.push(bodyComponent);

  // 3. FOOTER
  if (form.footerEnabled && form.footerText.trim()) {
    components.push({ type: "FOOTER", text: form.footerText });
  }

  // 4. BUTTONS
  if (form.buttonsEnabled && form.buttons.length > 0) {
    components.push({ type: "BUTTONS", buttons: form.buttons });
  }

  return {
    name: form.name,
    language: form.language,
    category: form.category,
    components,
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateForm(
  form: WhatsappTemplateCreateFormState,
): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  } else if (!/^[a-z0-9_]+$/.test(form.name)) {
    errors.name =
      "Solo minúsculas, números y guion bajo. Ej: recordatorio_pago";
  }

  if (!form.language) errors.language = "Selecciona un idioma.";
  if (!form.category) errors.category = "Selecciona una categoría.";

  if (!form.bodyText.trim()) {
    errors.bodyText = "El cuerpo del mensaje es obligatorio.";
  } else if (
    form.bodyVariables.length > 0 &&
    form.bodyVariables.some((v) => !v.value.trim())
  ) {
    errors.bodyVariables =
      "Todos los ejemplos de variables deben estar completos.";
  }

  if (form.headerEnabled) {
    if (form.headerFormat === "TEXT" && !form.headerText.trim()) {
      errors.headerText = "El texto del header es obligatorio.";
    }
    if (form.headerFormat === "IMAGE" && !form.headerHandle.trim()) {
      errors.headerHandle =
        "Debes subir la imagen a Meta antes de enviar la plantilla a revisión.";
    }
    if (
      (form.headerFormat === "VIDEO" || form.headerFormat === "DOCUMENT") &&
      !form.headerHandle.trim()
    ) {
      errors.headerHandle = "El media handle es obligatorio.";
    }
  }

  if (form.buttonsEnabled) {
    form.buttons.forEach((btn, i) => {
      if (!btn.text.trim())
        errors[`button_${i}_text`] = "El texto del botón es obligatorio.";
      if (btn.type === "URL" && !btn.url?.trim())
        errors[`button_${i}_url`] = "La URL es obligatoria.";
      if (btn.type === "PHONE_NUMBER" && !btn.phone_number?.trim())
        errors[`button_${i}_phone`] = "El número de teléfono es obligatorio.";
    });
  }

  return errors;
}

// ─── Default state ────────────────────────────────────────────────────────────

const DEFAULT_FORM: WhatsappTemplateCreateFormState = {
  name: "",
  language: "es",
  category: "UTILITY",
  headerEnabled: false,
  headerFormat: "TEXT",
  headerText: "",
  headerHandle: "",
  bodyText: "",
  bodyVariables: [],
  footerEnabled: false,
  footerText: "",
  buttonsEnabled: false,
  buttons: [],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCreateWhatsappTemplateForm(onSuccess?: () => void) {
  const [form, setForm] =
    useState<WhatsappTemplateCreateFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] =
    useState<MetaCreateTemplateResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Field setters ────────────────────────────────────────────────────────────

  // const setResetForm = () => {
  //   setForm(DEFAULT_FORM);
  // };

  const setName = useCallback((value: string) => {
    setForm((f) => ({ ...f, name: value }));
    setErrors((e) => ({ ...e, name: undefined }));
  }, []);

  const setLanguage = useCallback((value: string) => {
    setForm((f) => ({ ...f, language: value }));
    setErrors((e) => ({ ...e, language: undefined }));
  }, []);

  const setCategory = useCallback((value: WhatsappTemplateCategory) => {
    setForm((f) => ({ ...f, category: value }));
    setErrors((e) => ({ ...e, category: undefined }));
  }, []);

  const setHeaderEnabled = useCallback((value: boolean) => {
    setForm((f) => ({ ...f, headerEnabled: value }));
  }, []);

  const setHeaderFormat = useCallback((value: WhatsappTemplateHeaderFormat) => {
    setForm((f) => ({
      ...f,
      headerFormat: value,
      headerText: "",
      headerHandle: "",
      headerFileName: undefined,
      headerMimeType: undefined,
      headerFileSize: undefined,
      headerPreviewUrl: undefined,
    }));
    setErrors((e) => ({
      ...e,
      headerText: undefined,
      headerHandle: undefined,
    }));
  }, []);

  const setHeaderText = useCallback((value: string) => {
    setForm((f) => ({ ...f, headerText: value }));
    setErrors((e) => ({ ...e, headerText: undefined }));
  }, []);

  const setHeaderHandle = useCallback((value: string) => {
    setForm((f) => ({ ...f, headerHandle: value }));
    setErrors((e) => ({ ...e, headerHandle: undefined }));
  }, []);

  const setHeaderImageMeta = useCallback(
    (response: WhatsappTemplateMediaHandleResponse, previewUrl: string) => {
      setForm((f) => ({
        ...f,
        headerHandle: response.handle,
        headerFileName: response.fileName,
        headerMimeType: response.mimeType,
        headerFileSize: response.size,
        headerPreviewUrl: previewUrl,
      }));
      setErrors((e) => ({ ...e, headerHandle: undefined }));
    },
    [],
  );

  const clearHeaderImage = useCallback(() => {
    setForm((f) => ({
      ...f,
      headerHandle: "",
      headerFileName: undefined,
      headerMimeType: undefined,
      headerFileSize: undefined,
      headerPreviewUrl: undefined,
    }));
  }, []);

  const setBodyText = useCallback((value: string) => {
    setForm((f) => ({
      ...f,
      bodyText: value,
      bodyVariables: syncBodyVariables(value, f.bodyVariables),
    }));
    setErrors((e) => ({ ...e, bodyText: undefined, bodyVariables: undefined }));
  }, []);

  const setBodyVariableValue = useCallback((index: number, value: string) => {
    setForm((f) => ({
      ...f,
      bodyVariables: f.bodyVariables.map((v) =>
        v.index === index ? { ...v, value } : v,
      ),
    }));
    setErrors((e) => ({ ...e, bodyVariables: undefined }));
  }, []);

  const setFooterEnabled = useCallback((value: boolean) => {
    setForm((f) => ({ ...f, footerEnabled: value }));
  }, []);

  const setFooterText = useCallback((value: string) => {
    setForm((f) => ({ ...f, footerText: value }));
  }, []);

  const setButtonsEnabled = useCallback((value: boolean) => {
    setForm((f) => ({ ...f, buttonsEnabled: value }));
  }, []);

  const addButton = useCallback(() => {
    setForm((f) => {
      if (f.buttons.length >= 3) return f;
      const newBtn: WhatsappTemplateButton = { type: "QUICK_REPLY", text: "" };
      return { ...f, buttons: [...f.buttons, newBtn] };
    });
  }, []);

  const removeButton = useCallback((index: number) => {
    setForm((f) => ({
      ...f,
      buttons: f.buttons.filter((_, i) => i !== index),
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next[`button_${index}_text`];
      delete next[`button_${index}_url`];
      delete next[`button_${index}_phone`];
      return next;
    });
  }, []);

  const updateButton = useCallback(
    (index: number, patch: Partial<WhatsappTemplateButton>) => {
      setForm((f) => ({
        ...f,
        buttons: f.buttons.map((b, i) =>
          i === index ? { ...b, ...patch } : b,
        ),
      }));
    },
    [],
  );

  const setButtonType = useCallback(
    (index: number, type: WhatsappTemplateButtonType) => {
      setForm((f) => ({
        ...f,
        buttons: f.buttons.map((b, i) =>
          i === index
            ? { type, text: b.text, url: undefined, phone_number: undefined }
            : b,
        ),
      }));
      setErrors((e) => {
        const next = { ...e };
        delete next[`button_${index}_url`];
        delete next[`button_${index}_phone`];
        return next;
      });
    },
    [],
  );

  // ── Form actions ─────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
    setErrors({});
    setSubmitResult(null);
    setSubmitError(null);
    setConfirmOpen(false);
  }, []);

  const requestSubmit = useCallback(() => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitError(null);
    setSubmitResult(null);
    setConfirmOpen(true);
  }, [form]);

  const confirmSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const isUtilityImage =
        form.category === "UTILITY" &&
        form.headerEnabled &&
        form.headerFormat === "IMAGE" &&
        form.headerHandle.trim();

      let result: MetaCreateTemplateResponse;

      if (isUtilityImage) {
        result = await createUtilityImageTemplate({
          name: form.name,
          language: form.language,
          headerHandle: form.headerHandle,
          bodyText: form.bodyText,
          bodyExample: [form.bodyVariables.map((v) => v.value)],
          footerText: form.footerEnabled ? form.footerText : undefined,
        });
      } else {
        const payload = buildCreateWhatsappTemplatePayload(form);
        result = await createWhatsappTemplate(payload);
      }

      setSubmitResult(result);
      setConfirmOpen(false);

      toast.success("Plantilla enviada a Meta correctamente");

      resetForm();

      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al enviar.";

      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, onSuccess, resetForm]);

  // ── Derived payload for preview ───────────────────────────────────────────────

  const previewPayload = useMemo(() => {
    try {
      return buildCreateWhatsappTemplatePayload(form);
    } catch {
      return null;
    }
  }, [form]);

  const variableCount = form.bodyVariables.length;

  const componentCount = useMemo(() => {
    let n = 1; // body always
    if (form.headerEnabled) n++;
    if (form.footerEnabled && form.footerText.trim()) n++;
    if (form.buttonsEnabled && form.buttons.length > 0) n++;
    return n;
  }, [form]);

  return {
    // state
    form,
    errors,
    confirmOpen,
    submitting,
    submitResult,
    submitError,
    previewPayload,
    variableCount,
    componentCount,
    // field setters
    setName,
    setLanguage,
    setCategory,
    setHeaderEnabled,
    setHeaderFormat,
    setHeaderText,
    setHeaderHandle,
    setHeaderImageMeta,
    clearHeaderImage,
    setBodyText,
    setBodyVariableValue,
    setFooterEnabled,
    setFooterText,
    setButtonsEnabled,
    addButton,
    removeButton,
    updateButton,
    setButtonType,
    // actions
    resetForm,
    requestSubmit,
    confirmSubmit,
    setConfirmOpen,
    //
  };
}
