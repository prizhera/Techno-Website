import { useCallback, useRef, useState } from "react";

export function useDownloadPdf(filename = "document") {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const downloadPdf = useCallback(async () => {
    if (!ref.current) return;
    setLoading(true);
    try {
      const domtoimage = (await import("dom-to-image-more")).default;
      const { default: jsPDF } = await import("jspdf");
      const dataUrl = await domtoimage.toPng(ref.current, {
        style: { transform: "none" },
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filename]);

  return { ref, downloadPdf, loading };
}
