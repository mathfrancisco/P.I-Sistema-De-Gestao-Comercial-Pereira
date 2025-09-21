"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportType, REPORT_TITLES } from "@/types/report";
import { useReportTemplates } from "@/lib/hooks/useReportTemplates";
import { ReportBuilder } from "@/components/report/ReportBuilder";

export default function ReportBuilderPage() {
  const router = useRouter();
  const { saveTemplate } = useReportTemplates();
  const [selectedType, setSelectedType] = useState<ReportType>("sales");

  const handleSave = async (config: any) => {
    await saveTemplate({
      name: config.name,
      description: `Template customizado para ${REPORT_TITLES[selectedType]}`,
      type: selectedType,
      filters: {
        type: selectedType,
        ...config.settings,
      },
      isPublic: false,
      createdBy: "current-user@example.com", // Get from auth context
    });

    router.push("/reports/templates");
  };

  const handlePreview = (config: any) => {
    console.log("Preview:", config);
    // Implement preview logic
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Construtor de Relatórios</h1>
            <p className="text-muted-foreground">
              Crie relatórios personalizados com drag-and-drop
            </p>
          </div>
        </div>

        <Select
          value={selectedType}
          onValueChange={(v: string) => setSelectedType(v as ReportType)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REPORT_TITLES).map(([key, title]) => (
              <SelectItem key={key} value={key}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Builder */}
      <ReportBuilder
        reportType={selectedType}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
}
