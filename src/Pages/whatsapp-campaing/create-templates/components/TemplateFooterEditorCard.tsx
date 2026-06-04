"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TemplateFooterEditorCardProps {
  footerEnabled: boolean;
  footerText: string;
  onToggle: (v: boolean) => void;
  onTextChange: (v: string) => void;
}

export function TemplateFooterEditorCard({
  footerEnabled,
  footerText,
  onToggle,
  onTextChange,
}: TemplateFooterEditorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4 text-muted-foreground" />
            Footer{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (opcional)
            </span>
          </CardTitle>
          <Switch
            checked={footerEnabled}
            onCheckedChange={onToggle}
            aria-label="Activar footer"
          />
        </div>
      </CardHeader>

      {footerEnabled && (
        <CardContent className="px-4 pb-4 space-y-1">
          <Label className="text-xs font-medium">Texto del footer</Label>
          <Input
            value={footerText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Máximo 59 caracteres"
            className="h-8 text-xs"
            maxLength={59}
          />
        </CardContent>
      )}
    </Card>
  );
}
