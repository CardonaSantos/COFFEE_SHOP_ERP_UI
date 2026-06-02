"use client";

import { TemplateBasicInfoCard } from "./components/TemplateBasicInfoCard";
import { TemplateBodyEditorCard } from "./components/TemplateBodyEditorCard";
import { TemplateButtonsEditorCard } from "./components/TemplateButtonsEditorCard";
import { TemplateCategoryInfoCard } from "./components/TemplateCategoryInfoCard";
import { TemplateCreateActionsBar } from "./components/TemplateCreateActionsBar";
import { TemplateFooterEditorCard } from "./components/TemplateFooterEditorCard";
import { TemplateHeaderEditorCard } from "./components/TemplateHeaderEditorCard";
import { TemplatePayloadPreviewCard } from "./components/TemplatePayloadPreviewCard";
import { TemplateSubmitConfirmDialog } from "./components/TemplateSubmitConfirmDialog";
import { TemplateWhatsappPreviewCard } from "./components/TemplateWhatsappPreviewCard";
import { useCreateWhatsappTemplateForm } from "./hook/use-create-template";

interface WhatsappTemplateCreatePageProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export function WhatsappTemplateCreatePage({
  onBack,
  onSuccess,
}: WhatsappTemplateCreatePageProps) {
  const {
    form,
    errors,
    confirmOpen,
    submitting,
    submitResult,
    submitError,
    previewPayload,
    variableCount,
    componentCount,
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
    resetForm,
    requestSubmit,
    confirmSubmit,
    setConfirmOpen,
  } = useCreateWhatsappTemplateForm(onSuccess);

  return (
    <div className="space-y-3 p-4 max-w-screen-xl mx-auto">
      {/* Actions bar */}
      <TemplateCreateActionsBar
        onBack={onBack}
        onReset={resetForm}
        onSubmit={requestSubmit}
        submitting={submitting}
      />

      {/* Main grid: form left | preview right */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left column — form cards */}
        <div className="space-y-3">
          <TemplateBasicInfoCard
            name={form.name}
            language={form.language}
            errors={errors}
            onNameChange={setName}
            onLanguageChange={setLanguage}
          />

          <TemplateCategoryInfoCard
            category={form.category}
            errors={errors}
            onCategoryChange={setCategory}
          />

          <TemplateHeaderEditorCard
            headerEnabled={form.headerEnabled}
            headerFormat={form.headerFormat}
            headerText={form.headerText}
            headerHandle={form.headerHandle}
            headerFileName={form.headerFileName}
            headerMimeType={form.headerMimeType}
            headerFileSize={form.headerFileSize}
            headerPreviewUrl={form.headerPreviewUrl}
            errors={errors}
            onToggle={setHeaderEnabled}
            onFormatChange={setHeaderFormat}
            onTextChange={setHeaderText}
            onHandleChange={setHeaderHandle}
            onImageUploaded={setHeaderImageMeta}
            onImageRemoved={clearHeaderImage}
          />

          <TemplateBodyEditorCard
            bodyText={form.bodyText}
            bodyVariables={form.bodyVariables}
            errors={errors}
            onBodyChange={setBodyText}
            onVariableChange={setBodyVariableValue}
          />

          <TemplateFooterEditorCard
            footerEnabled={form.footerEnabled}
            footerText={form.footerText}
            onToggle={setFooterEnabled}
            onTextChange={setFooterText}
          />

          <TemplateButtonsEditorCard
            buttonsEnabled={form.buttonsEnabled}
            buttons={form.buttons}
            errors={errors}
            onToggle={setButtonsEnabled}
            onAdd={addButton}
            onRemove={removeButton}
            onTypeChange={setButtonType}
            onUpdate={updateButton}
          />
        </div>

        {/* Right column — WhatsApp preview + payload */}
        <div className="space-y-3">
          <TemplateWhatsappPreviewCard form={form} />

          <TemplatePayloadPreviewCard
            payload={previewPayload}
            submitResult={submitResult}
            submitError={submitError}
          />
        </div>
      </div>

      {/* Confirm dialog — always present in DOM */}
      <TemplateSubmitConfirmDialog
        open={confirmOpen}
        form={form}
        componentCount={componentCount}
        variableCount={variableCount}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}
