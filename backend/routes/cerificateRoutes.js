import express from "express";
import Certificate from "../models/Certificate.js";
import generateCertificateText from "../templates/certificateTemplate.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// ✅ NEW: Certificate Generation Route (saves to DB and returns download link)
router.post("/generate-certificate", async (req, res) => {
  try {
    const { name, email, score, paymentId, date } = req.body;

    const cert = new Certificate({
      name,
      email,
      score,
      paymentId,
      issuedAt: date,
    });

    await cert.save();

    res.status(201).json({
      message: "Certificate created",
      url: `/api/certificates/download/${cert._id}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Existing PDF download route
router.get("/download/:id", async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const { name, score, issuedAt } = certificate;

    const certText = generateCertificateText({
      name,
      score,
      date: issuedAt,
    });

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificate.pdf"`);

    doc.pipe(res);

    // 🟣 Draw purple top-half background (simulate wavy effect)
    doc.save();
    doc.rect(0, 0, doc.page.width, doc.page.height / 2).fill("#6B46C1");
    doc.restore();

    // 🔲 White certificate panel in center
    const panelWidth = doc.page.width - 100;
    const panelHeight = doc.page.height - 100;
    const panelX = 50;
    const panelY = 50;

    doc.roundedRect(panelX, panelY, panelWidth, panelHeight, 20).fill("#ffffff");

    // 🎨 Text over white panel
    doc
      .fillColor("#6B46C1")
      .fontSize(38)
      .font("Helvetica-Bold")
      .text("CODEORBITERA", panelX, panelY + 40, {
        align: "center",
        width: panelWidth,
      });

    doc
      .fillColor("#444")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("Certificate of Completion", panelX, panelY + 90, {
        align: "center",
        width: panelWidth,
      });

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(18)
      .text("This is to certify that", panelX, panelY + 140, {
        align: "center",
        width: panelWidth,
      });

    doc
      .fillColor("#111")
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(name.toUpperCase(), panelX, panelY + 175, {
        align: "center",
        width: panelWidth,
      });

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(18)
      .text(
        `has successfully completed the coding course with a score of ${score}.`,
        panelX,
        panelY + 215,
        {
          align: "center",
          width: panelWidth,
        }
      );

    doc
      .fillColor("#666")
      .font("Helvetica-Oblique")
      .fontSize(16)
      .text(`Awarded on: ${new Date(issuedAt).toDateString()}`, panelX, panelY + 270, {
        align: "center",
        width: panelWidth,
      });

    // Optional: signature line
    doc
      .moveTo(panelX + panelWidth - 200, panelY + panelHeight - 80)
      .lineTo(panelX + panelWidth - 50, panelY + panelHeight - 80)
      .stroke("#888");

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#555")
      .text("Instructor Signature", panelX + panelWidth - 200, panelY + panelHeight - 65, {
        align: "left",
      });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;