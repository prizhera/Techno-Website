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

      const scale = 2;
      const width = ref.current.scrollWidth;
      const height = ref.current.scrollHeight;

      const dataUrl = await domtoimage.toPng(ref.current, {
        width: width * scale,
        height: height * scale,
        style: {
          transform: "none",
          opacity: "1",
          filter: "none",
          "mix-blend-mode": "normal",
          "backdrop-filter": "none",
          "box-shadow": "none",
          "text-shadow": "none",
        },
        filter: (node) => {
          if (node instanceof Element) {
            const tag = node.tagName.toLowerCase();
            if (tag === "script" || tag === "style") return false;
          }
          return true;
        },
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
