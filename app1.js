const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(bodyParser.json());

// Helper function to strip HTML tags and clean up text
const cleanText = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

app.get('/', (req, res) => res.send('API is working!'));

app.post('/generate-invoice', async (req, res) => {
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
        const fontSize = 10;
        let yPosition = height - 50;

        // ✅ Header Section - Business Info
        page.drawText('TAX INVOICE', {
            x: 230,
            y: yPosition,
            size: 18,
            font: fontBold,
            color: rgb(0, 0, 0)
        });
        yPosition -= 30;

        page.drawText(`INVOICE NO: ${data.invoiceNumber}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        page.drawText(`DATE: ${new Date(data.date).toLocaleDateString()}`, {
            x: 400,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 30;

        // ✅ Business Info (static for this example)
        page.drawText('BUSINESS NAME', {
            x: 50,
            y: yPosition,
            size: fontSize + 2,
            font: fontBold
        });
        yPosition -= 15;
        page.drawText('132 Street, City, State, PIN', {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        page.drawText('GSTIN: AAA213465', {
            x: 50,
            y: yPosition - 15,
            size: fontSize,
            font
        });
        page.drawText('Email: 122@gmail.com', {
            x: 50,
            y: yPosition - 30,
            size: fontSize,
            font
        });
        page.drawText('PAN NO: AAA132456', {
            x: 50,
            y: yPosition - 45,
            size: fontSize,
            font
        });
        yPosition -= 80;

        // ✅ Bill To Section
        page.drawText('Bill To:', {
            x: 50,
            y: yPosition,
            size: fontSize + 2,
            font: fontBold
        });
        yPosition -= 20;
        page.drawText(`PARTY'S NAME: ${data.buyerName}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });

        // Handle address with HTML tags
        const cleanAddress = cleanText(data.address);
        const addressLines = cleanAddress.split('\n');
        addressLines.forEach(line => {
            yPosition -= 15;
            page.drawText(`ADDRESS: ${line}`, {
                x: 50,
                y: yPosition,
                size: fontSize,
                font
            });
        });

        page.drawText(`GSTIN: ${data.gstno}`, {
            x: 50,
            y: yPosition - 30,
            size: fontSize,
            font
        });
        yPosition -= 60;

        // ✅ Payment Info
        page.drawText('Bank Details:', {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: fontBold
        });
        yPosition -= 15;
        page.drawText(`Bank Name: ${data.bank}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 15;
        page.drawText(`Account No: ${data.accountNo}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 15;
        page.drawText(`Branch: ${data.branch}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 15;
        page.drawText(`IFSC Code: ${data.ifsc}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 30;

        // ✅ Table Header
        const descX = 50;
        const hsnX = 200;
        const qtyX = 300;
        const rateX = 370;
        const amtX = 470;

        page.drawText('Description', { x: descX, y: yPosition, size: fontSize, font: fontBold });
        page.drawText('HSN Code', { x: hsnX, y: yPosition, size: fontSize, font: fontBold });
        page.drawText('Qty', { x: qtyX, y: yPosition, size: fontSize, font: fontBold });
        page.drawText('Rate', { x: rateX, y: yPosition, size: fontSize, font: fontBold });
        page.drawText('Amount', { x: amtX, y: yPosition, size: fontSize, font: fontBold });

        // Table divider
        yPosition -= 10;
        page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 550, y: yPosition },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
        yPosition -= 20;

        // ✅ Table Data
        data.items.forEach(item => {
            // Handle description with HTML tags
            const cleanDesc = cleanText(item.descOfGoods);
            const descLines = cleanDesc.split('\n');

            // Draw first line of description
            page.drawText(descLines[0], { x: descX, y: yPosition, size: fontSize, font });
            page.drawText(item.hsn, { x: hsnX, y: yPosition, size: fontSize, font });
            page.drawText(item.qty.toString(), { x: qtyX, y: yPosition, size: fontSize, font });
            page.drawText(item.rate.toString(), { x: rateX, y: yPosition, size: fontSize, font });
            page.drawText(item.amt.toString(), { x: amtX, y: yPosition, size: fontSize, font });

            // Draw remaining description lines
            for (let i = 1; i < descLines.length; i++) {
                yPosition -= 15;
                page.drawText(descLines[i], { x: descX, y: yPosition, size: fontSize, font });
            }

            yPosition -= 20;
        });

        // ✅ Totals Section
        yPosition -= 30;
        page.drawText('Basic Amount:', { x: 300, y: yPosition, size: fontSize, font: fontBold });
        page.drawText(data.basicAmount, { x: amtX, y: yPosition, size: fontSize, font });
        yPosition -= 20;

        page.drawText('Grand Total:', { x: 300, y: yPosition, size: fontSize + 2, font: fontBold });
        page.drawText(data.totalAmount, { x: amtX, y: yPosition, size: fontSize + 2, font: fontBold });
        yPosition -= 30;

        // ✅ Amount in Words
        page.drawText(`Total Amount ( - In Words): ${data.amtInWords}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font
        });
        yPosition -= 40;

        // ✅ Footer
        page.drawText('For: BUSINESS NAME', {
            x: 50,
            y: yPosition,
            size: fontSize + 2,
            font: fontBold
        });
        page.drawText('Authorised Signatory', {
            x: 400,
            y: yPosition,
            size: fontSize,
            font
        });

        // ✅ Generate PDF
        const pdfBytes = await pdfDoc.save();

        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        res.status(200).json({
            success: true,
            pdfBase64: pdfBase64,
            fileName: `invoice-${Date.now()}.pdf`,
        });

        // ✅ Send PDF Response
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `attachment; filename=invoice-${data.invoiceNumber || '1234WE'}.pdf`);
        // res.send(pdfBytes);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, error: 'Failed to generate PDF' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});