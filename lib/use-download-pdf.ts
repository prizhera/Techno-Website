import { useCallback, useRef, useState } from "react";

const EXPORT_ID = "__pdf_export_root";

export function useDownloadPdf(filename = "document") {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (!ref.current) return;
    setLoading(true);

    const root = ref.current;
    const styleId = "__pdf_export_override";
    let injectedStyle: HTMLStyleElement | null = null;

    try {
      const existing = document.getElementById(styleId);
      if (!existing) {
        const s = document.createElement("style");
        s.id = styleId;
        s.textContent = `
          #${EXPORT_ID} * {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            text-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          #${EXPORT_ID} svg {
            overflow: visible !important;
          }
          #${EXPORT_ID} table, #${EXPORT_ID} th, #${EXPORT_ID} td {
            border: none !important;
          }
          #${EXPORT_ID} .recharts-wrapper {
            overflow: visible !important;
          }
          #${EXPORT_ID} * {
            mix-blend-mode: normal !important;
          }
        `;
        document.head.appendChild(s);
        injectedStyle = s;
      }

      root.id = EXPORT_ID;
      (document.activeElement as HTMLElement)?.blur();

      const domtoimage = (await import("dom-to-image-more")).default;
      const { default: jsPDF } = await import("jspdf");

      const dataUrl = await domtoimage.toPng(root, {
        quality: 1,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const pagePixels = (pageHeight * img.naturalWidth) / pdfWidth;
        let offset = 0;
        while (offset < img.naturalHeight) {
          if (offset > 0) pdf.addPage();
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = img.naturalWidth;
          const sliceH = Math.min(pagePixels, img.naturalHeight - offset);
          sliceCanvas.height = sliceH;
          const sliceCtx = sliceCanvas.getContext("2d")!;
          sliceCtx.drawImage(canvas, 0, offset, img.naturalWidth, sliceH, 0, 0, img.naturalWidth, sliceH);
          const sliceData = sliceCanvas.toDataURL("image/png");
          const sliceHeight = (sliceH * pdfWidth) / img.naturalWidth;
          pdf.addImage(sliceData, "PNG", 0, 0, pdfWidth, sliceHeight);
          offset += pagePixels;
        }
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      root.id = "";
      injectedStyle?.remove();
      setLoading(false);
    }
  }, [filename]);

  return { ref, downloadPdf, loading };
}
