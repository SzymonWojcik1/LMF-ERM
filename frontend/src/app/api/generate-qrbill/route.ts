import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { mm2pt } from 'swissqrbill/utils';
import { SwissQRBill, Table } from 'swissqrbill/pdf';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = {
      amount: 2606.35,
      creditor: {
        account: "CH44 3199 9123 0008 8901 2",
        address: "Musterstrasse",
        buildingNumber: 7,
        city: "Musterstadt",
        country: "CH",
        name: "SwissQRBill",
        zip: 1234
      },
      currency: "CHF",
      debtor: {
        address: "Musterstrasse",
        buildingNumber: 1,
        city: "Musterstadt",
        country: "CH",
        name: "Peter Muster",
        zip: 1234
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

    pdf.fontSize(14).text("Rechnung Nr. 1071672", mm2pt(20), mm2pt(100), {
      align: "left", width: mm2pt(170)
    });

    const date = new Date();
    pdf.fontSize(11).text(`Musterstadt ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`, {
      align: "right", width: mm2pt(170)
    });

    const table = new Table({
      rows: [
        {
          backgroundColor: "#4A4D51",
          columns: [
            { text: "Position", width: mm2pt(20) },
            { text: "Anzahl", width: mm2pt(20) },
            { text: "Bezeichnung" },
            { text: "Total", width: mm2pt(30) }
          ],
          height: 20, padding: 5, textColor: "#fff", verticalAlign: "center"
        },
        { columns: [{ text: "1", width: mm2pt(20) }, { text: "14 Std.", width: mm2pt(20) }, { text: "Programmierung SwissQRBill" }, { text: "CHF 1'540.00", width: mm2pt(30) }], padding: 5 },
        { columns: [{ text: "2", width: mm2pt(20) }, { text: "8 Std.", width: mm2pt(20) }, { text: "Dokumentation" }, { text: "CHF 880.00", width: mm2pt(30) }], padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "Summe" }, { text: "CHF 2'420.00", width: mm2pt(30) }], height: 40, padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "MwSt." }, { text: "7.7%", width: mm2pt(30) }], padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "MwSt. Betrag" }, { text: "CHF 186.35", width: mm2pt(30) }], padding: 5 },
        { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "Rechnungstotal" }, { text: "CHF 2'606.35", width: mm2pt(30) }], height: 40, padding: 5 }
      ],
      width: mm2pt(170)
    });

    const qrBill = new SwissQRBill(data);
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