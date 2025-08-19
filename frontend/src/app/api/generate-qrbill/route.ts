import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { mm2pt } from 'swissqrbill/utils';
import { SwissQRBill, Table } from 'swissqrbill/pdf';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const requestData = await request.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    // Use the provided data or fall back to default values
    const data = {
      amount: requestData.amount || 756.70,
      creditor: {
        account: requestData.creditor?.account || "CH44 3199 9123 0008 8901 2",
        address: requestData.creditor?.address || "Rue de la Servette",
        buildingNumber: requestData.creditor?.buildingNumber || 45,
        city: requestData.creditor?.city || "Genève",
        country: requestData.creditor?.country || "CH",
        name: requestData.creditor?.name || "LMF Services Sàrl",
        zip: requestData.creditor?.zip || 1202
      },
      currency: requestData.currency || "CHF" as const,
      debtor: {
        address: requestData.debtor?.address || "Avenue du Mont-Blanc",
        buildingNumber: requestData.debtor?.buildingNumber || 12,
        city: requestData.debtor?.city || "Genève",
        country: requestData.debtor?.country || "CH",
        name: requestData.debtor?.name || "Hôtel Le Grand Lac SA",
        zip: requestData.debtor?.zip || 1201
      },
      reference: requestData.reference || "21 00000 00003 13947 14300 09017"
    };

    // Extract additional invoice data
    const invoiceNumber = requestData.invoiceNumber || "N.010111";
    const invoiceDate = requestData.invoiceDate || "08 Juillet 2025";
    const items = requestData.items || [
      { position: "•", hours: "8 h.", description: "Montage et démontage de meubles", pricePerHour: 35.00, total: 280.00 },
      { position: "•", hours: "6 h.", description: "Protection et mise à la cave", pricePerHour: 35.00, total: 210.00 },
      { position: "•", hours: "6 h.", description: "Frais de transport et mains d'œuvres", pricePerHour: 35.00, total: 210.00 }
    ];
    const subtotal = requestData.subtotal || 700.00;
    const vatRate = requestData.vatRate || 8.1;
    const vatAmount = requestData.vatAmount || 56.70;
    const totalAmount = requestData.totalAmount || 756.70;

    // Optional adjustments
    const proRata = requestData.proRata || 0;
    const rabais = requestData.rabais || 0;
    const showProRataRabais = requestData.showProRataRabais || false;

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
      mm2pt(20), mm2pt(15),
      { align: "left", height: mm2pt(50), width: mm2pt(100) }
    );

    pdf.text(
      `${data.debtor.name}\n${data.debtor.address} ${data.debtor.buildingNumber}\n${data.debtor.zip} ${data.debtor.city}`,
      mm2pt(130), mm2pt(40),
      { align: "left", height: mm2pt(50), width: mm2pt(70) }
    );

    // Format the invoice date
    const formattedDate = new Date(invoiceDate).toLocaleDateString('fr-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    pdf.fontSize(11).text(`Genève le, ${formattedDate}`, mm2pt(20), mm2pt(65), {
      align: "right", width: mm2pt(170)
    });

    pdf.fontSize(14).text(`Facture ${invoiceNumber}`, mm2pt(20), mm2pt(80), {
      align: "left", width: mm2pt(170)
    });

    // Create table rows dynamically from items
    const rawSubtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

    // Header row
    const headerRow = {
      backgroundColor: "#4A4D51",
      columns: [
        { text: "Position", width: mm2pt(20) },
        { text: "Heures", width: mm2pt(20) },
        { text: "Désignation" },
        { text: "Prix/h", width: mm2pt(25) },
        { text: "Total", width: mm2pt(25) }
      ],
      height: 20, padding: 5, textColor: "#fff", verticalAlign: "center"
    };

    // Item rows
    const itemRows = items.map((item: any) => ({
      columns: [
        { text: item.position, width: mm2pt(20) },
        { text: item.hours, width: mm2pt(20) },
        { text: item.description },
        { text: `CHF ${item.pricePerHour.toFixed(2)}`, width: mm2pt(25) },
        { text: `CHF ${item.total.toFixed(2)}`, width: mm2pt(25) }
      ],
      padding: 5
    }));

    // Summary rows (totals, VAT, etc.)
    const summaryRows = [
      // Add subtotal row if adjustments are present
      ...(showProRataRabais && (proRata > 0 || rabais > 0) ? [{
        columns: [
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(25) },
          { text: "Sous-total éléments :", width: mm2pt(25) },
          { text: `CHF ${rawSubtotal.toFixed(2)}`, width: mm2pt(25) }
        ],
        padding: 5
      }] : []),
      // Add Pro Rata row if specified
      ...(showProRataRabais && proRata > 0 ? [{
        columns: [
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(25) },
          { text: `Pro Rata ${proRata}% :`, width: mm2pt(25) },
          { text: `-CHF ${(rawSubtotal * (proRata / 100)).toFixed(2)}`, width: mm2pt(25) }
        ],
        padding: 5
      }] : []),
      // Add Rabais row if specified
      ...(showProRataRabais && rabais > 0 ? [{
        columns: [
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(20) },
          { text: "", width: mm2pt(25) },
          { text: `Rabais ${rabais}% :`, width: mm2pt(25) },
          { text: `-CHF ${(rawSubtotal * (rabais / 100)).toFixed(2)}`, width: mm2pt(25) }
        ],
        padding: 5
      }] : []),
      // Add total rows
      { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: "Montant total HT :", width: mm2pt(25) }, { text: `CHF ${subtotal.toFixed(2)}`, width: mm2pt(25) }], height: 40, padding: 5 },
      { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: `TVA ${vatRate}%`, width: mm2pt(25) }, { text: `CHF ${vatAmount.toFixed(2)}`, width: mm2pt(25) }], padding: 5 },
      { columns: [{ text: "", width: mm2pt(20) }, { text: "", width: mm2pt(20) }, { text: "", width: mm2pt(25) }, { text: "Pour un montant total TTC :", width: mm2pt(25) }, { text: `CHF ${totalAmount.toFixed(2)} TTC`, width: mm2pt(25) }], height: 40, padding: 5 }
    ];

    // Calculate space usage
    const currentY = mm2pt(95);
    const pageHeight = mm2pt(297);
    const qrBillHeight = mm2pt(105);
    const bottomMargin = mm2pt(10);
    const availableHeight = pageHeight - currentY - qrBillHeight - bottomMargin;

    const estimatedRowHeight = 20;
    const headerHeight = 25;
    const summaryHeight = summaryRows.length * estimatedRowHeight;
    const maxItemsPerPage = Math.floor((availableHeight - headerHeight - summaryHeight) / estimatedRowHeight);

    if (itemRows.length <= maxItemsPerPage) {
      // All items fit on one page
      const tableRows = [headerRow, ...itemRows];
      const table = new Table({
        rows: tableRows,
        width: mm2pt(170)
      });

      pdf.y = currentY;
      table.attachTo(pdf);

      // Add custom totals section with proper formatting
      addCustomTotalsSection(pdf, rawSubtotal, proRata, rabais, showProRataRabais, subtotal, vatRate, vatAmount, totalAmount);
    } else {
      // Multiple pages needed
      let remainingItems = [...itemRows];
      let pageNumber = 1;

      while (remainingItems.length > 0) {
        if (pageNumber > 1) {
          pdf.addPage();
          // Add header info on new page
          pdf.fontSize(11).text(`Facture ${invoiceNumber} - Page ${pageNumber}`, mm2pt(20), mm2pt(20), {
            align: "left", width: mm2pt(170)
          });
          pdf.y = mm2pt(35);
        } else {
          pdf.y = currentY;
        }

        const isLastPage = remainingItems.length <= maxItemsPerPage;
        const itemsForThisPage = remainingItems.splice(0, maxItemsPerPage);
        const pageRows = [
          headerRow,
          ...itemsForThisPage
        ];

        const table = new Table({
          rows: pageRows,
          width: mm2pt(170)
        });

        table.attachTo(pdf);

        // Add custom totals section only on last page
        if (isLastPage) {
          addCustomTotalsSection(pdf, rawSubtotal, proRata, rabais, showProRataRabais, subtotal, vatRate, vatAmount, totalAmount);
        }

        pageNumber++;
      }
    }

    // Helper function to add custom totals section
    function addCustomTotalsSection(pdf: any, rawSubtotal: number, proRata: number, rabais: number, showProRataRabais: boolean, subtotal: number, vatRate: number, vatAmount: number, totalAmount: number) {
      const leftX = mm2pt(35);
      const rightX = mm2pt(145);
      const lineSpacing = 18;
      let currentY = pdf.y + 20;

      pdf.fontSize(11);

      // Sous-total if discounts present
      if (showProRataRabais && (proRata > 0 || rabais > 0)) {
        pdf.text("Sous-total éléments :", leftX, currentY);
        pdf.text(`CHF ${rawSubtotal.toFixed(2)}`, rightX, currentY);
        currentY += lineSpacing;
      }

      // Pro Rata if present
      if (showProRataRabais && proRata > 0) {
        pdf.text(`Pro Rata ${proRata}% :`, leftX, currentY);
        pdf.text(`-CHF ${(rawSubtotal * (proRata / 100)).toFixed(2)}`, rightX, currentY);
        currentY += lineSpacing;
      }

      // Rabais if present
      if (showProRataRabais && rabais > 0) {
        pdf.text(`Rabais ${rabais}% :`, leftX, currentY);
        pdf.text(`-CHF ${(rawSubtotal * (rabais / 100)).toFixed(2)}`, rightX, currentY);
        currentY += lineSpacing;
      }

      // Montant total HT
      currentY += 5;
      pdf.text("Montant total HT :", leftX, currentY);
      pdf.text(`CHF ${subtotal.toFixed(2)}`, rightX, currentY);
      currentY += lineSpacing;

      // TVA
      pdf.text(`TVA ${vatRate}%`, leftX, currentY);
      const vatText = `CHF ${vatAmount.toFixed(2)}`;
      pdf.text(vatText, rightX, currentY);
      const vatWidth = pdf.widthOfString(vatText);
      pdf.moveTo(rightX, currentY + 12)
         .lineTo(rightX + vatWidth, currentY + 12)
         .stroke();
      currentY += lineSpacing + 5;

      // Final total
      pdf.font("customHelvetica").fontSize(12);
      pdf.text("Pour un montant total TTC :", leftX, currentY);
      const finalText = `CHF ${totalAmount.toFixed(2)} TTC`;
      pdf.text(finalText, rightX, currentY);

      const finalWidth = pdf.widthOfString(finalText);
      pdf.moveTo(rightX, currentY + 14)
         .lineTo(rightX + finalWidth, currentY + 14)
         .stroke();
      pdf.moveTo(rightX, currentY + 16)
         .lineTo(rightX + finalWidth, currentY + 16)
         .stroke();

      pdf.y = currentY + 30;
    }

    const qrBill = new SwissQRBill(data, { language: "FR" });
    qrBill.attachTo(pdf);

    pdf.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="qr-bill.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}