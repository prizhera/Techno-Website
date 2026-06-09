import { useCallback, useRef, useState } from "react";

const COLOR_PROPS = [
  "color", "backgroundColor", "borderColor", "borderTopColor",
  "borderRightColor", "borderBottomColor", "borderLeftColor",
  "outlineColor", "textDecorationColor",
];

let _colorParser: CanvasRenderingContext2D | null = null;
function getColorParser() {
  if (!_colorParser && typeof document !== "undefined") {
    _colorParser = document.createElement("canvas").getContext("2d");
  }
  return _colorParser;
}

function normalizeColor(value: string): string {
  const ctx = getColorParser();
  if (!ctx) return value;
  try {
    ctx.fillStyle = value;
    return ctx.fillStyle;
  } catch {
    return value;
  }
}

function hasUnsupportedColor(value: string): boolean {
  return /oklab|oklch|color\(/i.test(value);
}

function flattenColors(root: HTMLElement) {
  const saved: { el: HTMLElement; prop: string; value: string }[] = [];
  const process = (el: HTMLElement) => {
    for (const prop of COLOR_PROPS) {
      const cs = getComputedStyle(el)[prop as any];
      if (cs && hasUnsupportedColor(cs)) {
        saved.push({ el, prop, value: el.style.getPropertyValue(prop) });
        el.style.setProperty(prop, normalizeColor(cs));
      }
    }
  };
  process(root);
  root.querySelectorAll<HTMLElement>("*").forEach(process);
  return saved;
}

function restoreColors(saved: { el: HTMLElement; prop: string; value: string }[]) {
  for (const { el, prop, value } of saved) {
    if (value) el.style.setProperty(prop, value);
    else el.style.removeProperty(prop);
  }
}

export function useDownloadPdf(filename = "document") {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (!ref.current) return;
    setLoading(true);
    const saved = flattenColors(ref.current);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");

      (document.activeElement as HTMLElement)?.blur();

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      let remaining = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      remaining -= pageHeight;

      while (remaining > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        remaining -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      restoreColors(saved);
      setLoading(false);
    }
  }, [filename]);

  return { ref, downloadPdf, loading };
}
