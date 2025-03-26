const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const PORT = 3000;

const app = express();
// const router = express.Router();
// app.use(express.json());
app.use(bodyParser.json());

// Test Routes
app.get('/', (req, res) => res.send('API is working!'));
app.get('/ok', (req, res) => res.send('API1 is working!'));
app.post('/invoice', (req, res) => res.send({ message: 'API2 is working!' }));

// ✅ PDF Generation Route
app.post('/generate-invoice', async (req, res) => {
    const data = req.body;

    if (!data) {
        return res.status(400).send('Invalid invoice data');
    }

    try {
        // 🛠️ Create PDF Document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;

        // 🛠️ Add Invoice Header
        page.drawText('TAX INVOICE', { x: 50, y: height - 50, size: 18, font, color: rgb(0, 0, 0) });

        // 🛠️ Bill To Section
        page.drawText(`Bill To:`, { x: 50, y: height - 80, size: fontSize + 2, font, color: rgb(0, 0, 0.7) });
        page.drawText(`Buyer: ${data.buyerName}`, { x: 50, y: height - 100, size: fontSize, font });
        page.drawText(`Address: ${data.address}`, { x: 50, y: height - 120, size: fontSize, font });
        page.drawText(`GSTIN: ${data.gstno}`, { x: 50, y: height - 140, size: fontSize, font });

        // 🛠️ Items Section
        let yPosition = height - 180;
        page.drawText(`Items:`, { x: 50, y: yPosition, size: fontSize + 2, font, color: rgb(0, 0, 0.7) });

        yPosition -= 20;
        data.items.forEach((item, index) => {
            page.drawText(`• ${item.descOfGoods}`, { x: 50, y: yPosition, size: fontSize, font });
            page.drawText(`HSN: ${item.hsn}, Qty: ${item.qty}, Rate: ${item.rate}, Amount: ${item.amt}`,
                { x: 50, y: yPosition - 20, size: fontSize, font });
            yPosition -= 40;
        });

        // 🛠️ Total Section
        page.drawText(`Grand Total: ${data.totalAmount}`,
            { x: 50, y: yPosition - 20, size: fontSize + 2, font, color: rgb(0, 0, 0) });

        // 🛠️ Generate PDF
        const pdfBytes = await pdfDoc.save();

        // ✅ Send PDF as downloadable file
        const fileName = `invoice-${Date.now()}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

// app.use('/.netlify/functions/api', router);
// module.exports.handler = serverless(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

