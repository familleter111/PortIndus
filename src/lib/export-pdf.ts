/**
 * Fabrique un vrai fichier PDF téléchargeable, sans backend.
 *
 * Chaque page du rapport est capturée en image depuis le support d'export hors
 * écran (`#pdf-export-root`, voir globals.css), puis les images sont assemblées
 * dans un PDF avec jsPDF et poussées au navigateur pour téléchargement. C'est
 * un vrai fichier .pdf sur le disque — pas la boîte d'impression du navigateur,
 * qui n'aboutit à un fichier que si l'utilisateur choisit lui-même
 * « Enregistrer au format PDF » comme imprimante.
 */

/** Taille des pages du rapport — voir `Sheet` dans report-document.tsx. */
const SHEET_PX = { w: 720, h: 480 };
/** Largeur cible : proche d'un A4 paysage (297 mm), sans forcer le ratio A4. */
const PAGE_W_MM = 297;
const PAGE_H_MM = (PAGE_W_MM * SHEET_PX.h) / SHEET_PX.w;

export interface PdfExportOptions {
  fileName: string;
}

/**
 * Capture les pages présentes dans `#pdf-export-root` (une par
 * `[data-report-page]`, dans l'ordre) et déclenche le téléchargement.
 */
export async function exportReportToPdf({ fileName }: PdfExportOptions): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const root = document.getElementById("pdf-export-root");
  if (!root) throw new Error("Support d'export introuvable.");
  const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-report-page]"));
  if (pages.length === 0) throw new Error("Aucune page à exporter.");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [PAGE_W_MM, PAGE_H_MM],
  });

  for (let i = 0; i < pages.length; i++) {
    // `scale: 2` : le texte des tableaux reste net une fois zoomé dans le PDF.
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const image = canvas.toDataURL("image/png", 1);
    if (i > 0) pdf.addPage([PAGE_W_MM, PAGE_H_MM], "landscape");
    pdf.addImage(image, "PNG", 0, 0, PAGE_W_MM, PAGE_H_MM);
  }

  pdf.save(`${fileName}.pdf`);
}
