const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

router.get('/', (req, res) => res.send('API is working!'));
router.post('/generate-invoice', async (req, res) => {
    const data = req.body;

    if (!data) {
        return res.status(400).send('Invalid invoice data');
    }

    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 850]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontSize = 12;
        let yPosition = height - 50;

        // ✅ Header Section
        page.drawText('TAX INVOICE', { x: 220, y: yPosition, size: 18, font: fontBold, color: rgb(0, 0, 0) });
        yPosition -= 30;

        page.drawText(`INVOICE NO: ${data.invoiceNumber}`, { x: 50, y: yPosition, size: fontSize, font });
        page.drawText(`DATE: ${data.date}`, { x: 400, y: yPosition, size: fontSize, font });

        // ✅ Business Info
        yPosition -= 30;
        page.drawText('BUSINESS NAME', { x: 50, y: yPosition, size: fontSize + 2, font: fontBold });
        yPosition -= 15;
        page.drawText('132 Street, City, State, PIN', { x: 50, y: yPosition, size: fontSize, font });
        page.drawText('GSTIN: AAA213465', { x: 50, y: yPosition - 15, size: fontSize, font });
        page.drawText('Email: 122@gmail.com', { x: 50, y: yPosition - 30, size: fontSize, font });
        page.drawText('PAN NO: AAA132456', { x: 50, y: yPosition - 45, size: fontSize, font });

        // ✅ Bill To Section
        yPosition -= 80;
        page.drawText(`Bill To:`, { x: 50, y: yPosition, size: fontSize + 2, font: fontBold });
        yPosition -= 20;
        page.drawText(`PARTY'S NAME: ${data.buyerName}`, { x: 50, y: yPosition, size: fontSize, font });
        page.drawText(`ADDRESS: ${data.address}`, { x: 50, y: yPosition - 15, size: fontSize, font });
        page.drawText(`GSTIN: ${data.gstno}`, { x: 50, y: yPosition - 30, size: fontSize, font });

        // ✅ Payment Info
        yPosition -= 60;
        page.drawText('Payment Due Date:', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText('Payment Mode:', { x: 300, y: yPosition, size: fontSize, fontBold });

        // ✅ Items Table Header
        yPosition -= 40;
        page.drawText('Description', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText('HSN Code', { x: 220, y: yPosition, size: fontSize, fontBold });
        page.drawText('Qty', { x: 320, y: yPosition, size: fontSize, fontBold });
        page.drawText('Rate', { x: 390, y: yPosition, size: fontSize, fontBold });
        page.drawText('Amount', { x: 470, y: yPosition, size: fontSize, fontBold });

        // ✅ Items Data
        yPosition -= 20;
        data.items.forEach(item => {
            page.drawText(`${item.descOfGoods}`, { x: 50, y: yPosition, size: fontSize, font });
            page.drawText(`${item.hsn}`, { x: 220, y: yPosition, size: fontSize, font });
            page.drawText(`${item.qty}`, { x: 320, y: yPosition, size: fontSize, font });
            page.drawText(`${item.rate}`, { x: 390, y: yPosition, size: fontSize, font });
            page.drawText(`${item.amt}`, { x: 470, y: yPosition, size: fontSize, font });
            yPosition -= 20;
        });

        // ✅ Totals and Taxes
        yPosition -= 30;
        page.drawText('Add: CGST @ 14%', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText(`${data.cgst}`, { x: 470, y: yPosition, size: fontSize, font });

        yPosition -= 20;
        page.drawText('Add: SGST @ 14%', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText(`${data.sgst}`, { x: 470, y: yPosition, size: fontSize, font });

        yPosition -= 20;
        page.drawText('Balance Received:', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText(`${data.balanceReceived}`, { x: 470, y: yPosition, size: fontSize, font });

        yPosition -= 20;
        page.drawText('Balance Due:', { x: 50, y: yPosition, size: fontSize, fontBold });
        page.drawText(`${data.balanceDue}`, { x: 470, y: yPosition, size: fontSize, font });

        yPosition -= 30;
        page.drawText('Grand Total:', { x: 50, y: yPosition, size: fontSize + 2, fontBold });
        page.drawText(`${data.totalAmount}`, { x: 470, y: yPosition, size: fontSize + 2, fontBold });

        yPosition -= 40;
        page.drawText(`Total Amount (₹ - In Words): ${data.amtInWords}`, { x: 50, y: yPosition, size: fontSize, font });

        // ✅ Footer
        yPosition -= 60;
        page.drawText('For: BUSINESS NAME', { x: 50, y: yPosition, size: fontSize + 2, fontBold });
        page.drawText('Authorised Signatory', { x: 400, y: yPosition, size: fontSize, font });

        // ✅ Generate PDF
        const pdfBytes = await pdfDoc.save();

        // ✅ Send PDF Response
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        res.status(200).json({
            success: true,
            pdfBase64: pdfBase64,
            fileName: `invoice-${Date.now()}.pdf`,
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, error: 'Failed to generate PDF' });
    }
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
