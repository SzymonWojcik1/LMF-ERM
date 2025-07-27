import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { mm2pt } from 'swissqrbill/utils';
import { SwissQRBill, Table } from 'swissqrbill/pdf';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = {
      amount: 756.70,
      creditor: {
        account: "CH44 3199 9123 0008 8901 2",
        address: "Rue de la Servette",
        buildingNumber: 45,
        city: "Genève",
        country: "CH",
        name: "LMF Services Sàrl",
        zip: 1202
      },
      currency: "CHF" as const,
      debtor: {
        address: "Avenue du Mont-Blanc",
        buildingNumber: 12,
        city: "Genève",
        country: "CH",
        name: "Hôtel Le Grand Lac SA",
        zip: 1201
      },
      reference: "21 00000 00003 13947 14300 09017"
    };

    const fontPath = join(process.cwd(), 'src/fonts', 'Helvetica.ttf');
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font not found at: ${fontPath}`);
    }

    const pdf = new PDFDocument({ size: "A4", bufferPages: true });
    pdf.registerFont("customHelvetica", fontPath);
    pdf.font("customHelvetica");

    const chunks: Buffer[] = [];
    pdf.on('data', (chunk) => chunks.push(chunk));



    pdf.fontSize(12);
    pdf.fillColor("black");
    pdf.text(
      `${data.creditor.name}\n${data.creditor.address} ${data.creditor.buildingNumber}\n${data.creditor.zip} ${data.creditor.city}`,
      mm2pt(20), mm2pt(35),
      { align: "left", height: mm2pt(50), width: mm2pt(100) }
    );

    pdf.text(
      `${data.debtor.name}\n${data.debtor.address} ${data.debtor.buildingNumber}\n${data.debtor.zip} ${data.debtor.city}`,
      mm2pt(130), mm2pt(60),
      { align: "left", height: mm2pt(50), width: mm2pt(70) }
    );

    pdf.fontSize(14).text("Facture N.010111", mm2pt(20), mm2pt(100), {
      align: "left", width: mm2pt(170)
    });

    pdf.fontSize(11).text(`Genève le, 08 Juillet 2025`, {
      align: "right", width: mm2pt(170)
    });

    const table = new Table({
      rows: [
        {
          backgroundColor: "#4A4D51",
          columns: [
            { text: "Position", width: mm2pt(20) },
            { text: "Heures", width: mm2pt(20) },
            { text: "Désignation" },
            { text: "Prix/h", width: mm2pt(25) },
            { text: "Total", width: mm2pt(25) }
          ],
          height: 20, padding: 5, textColor: "#fff", verticalAlign: "center"
        },
        { columns: [{ text: "•", width: mm2pt(20) }, { text: "8 h.", width: mm2pt(20) }, { text: "Montage et démontage de meubles" }, { text: "CHF 35.00", width: mm2pt(25) }, { text: "CHF 280.00", width: mm2pt(25) }], padding: 5 },
        { columns: [{ text: "•", width: mm2pt(20) }, { text: "6 h.", width: mm2pt(20) }, { text: "Protection et mise à la cave" }, { text: "CHF 35.00", width: mm2pt(25) }, { text: "CHF 210.00", width: mm2pt(25) }], padding: 5 },
        { columns: [{ text: "•", width: mm2pt(20) }, { text: "6 h.", width: mm2pt(20) }, { text: "Frais de transport et mains d'œuvres" }, { text: "CHF 35.00", width: mm2pt(25) }, { text: "CHF 210.00", width: mm2pt(25) }], padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: "Montant total HT :", width: mm2pt(25) }, { text: "CHF 700.00", width: mm2pt(25) }], height: 40, padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: "TVA 8.1%", width: mm2pt(25) }, { text: "CHF 56.70", width: mm2pt(25) }], padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: "Pour un montant total TTC :", width: mm2pt(25) }, { text: "CHF 756.70 TTC", width: mm2pt(25) }], height: 40, padding: 5 }
      ],
      width: mm2pt(170)
    });

    const qrBill = new SwissQRBill(data, { language: "FR" });
    table.attachTo(pdf);
    qrBill.attachTo(pdf);

    pdf.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="qr-bill.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}