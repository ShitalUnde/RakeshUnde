const express = require('express');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// POST API to generate and download PDF in browser
app.post('/generate-invoice', (req, res) => {
    const invoiceData = req.body;

    if (!invoiceData) {
        return res.status(400).send('Invalid invoice data');
    }

    const pdfFilePath = path.join(__dirname, `invoice-${invoiceData.invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    // Pipe PDF to file and send it for download
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);

    // Header with Logo Placeholder (Skip if no logo)
    try {
        doc.image('logo-placeholder.png', 50, 45, { width: 100 })
            .fillColor('#444444')
            .fontSize(20)
            .text('INVOICE', 400, 50, { align: 'right' })
            .fontSize(10)
            .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 80, { align: 'right' })
            .text(`Date: ${invoiceData.date}`, 400, 95, { align: 'right' })
            .moveDown();
    } catch (error) {
        console.log('Logo not found, skipping...');
    }

    // Company and Customer Info (Side-by-side layout)
    doc.fillColor('#000000')
        .fontSize(12)
        .text('Buyer:', 50, 150)
        .font('Helvetica-Bold')
        .text(invoiceData.buyerName, 50, 170)
        .font('Helvetica')
        .text(invoiceData.address, 50, 185)
        .text(`Phone: 8790908888`, 50, 200)
        .text(`Email: jk@email.com`, 50, 215);

    const rightX = 300;  // Customer info on the right
    // doc.fillColor('#000000')
    //     .fontSize(12)
    //     .text('To:', rightX, 150)
    //     .font('Helvetica-Bold')
    //     .text(invoiceData.customer.name, rightX, 170)
    //     .font('Helvetica')
    //     .text(invoiceData.customer.address, rightX, 185)
    //     .text(`Phone: ${invoiceData.customer.phone}`, rightX, 200)
    //     .text(`Email: ${invoiceData.customer.email}`, rightX, 215)
    //     .moveDown(2);

    // Table Header
    const tableTop = 250;
    const itemX = 50;
    const HSNpos = 200
    const qtyX = 320;
    const priceX = 400;
    const totalX = 480;
    const ratex = 500;

    doc.fontSize(12)
        .fillColor('#444444')
        .text('Description', itemX, tableTop, { bold: true })
        .text('HSN/SAC', HSNpos, tableTop)
        .text('Qty', qtyX, tableTop)
        .text('Unit', priceX, tableTop)
        .text('Rate', totalX, tableTop)
        .text('Amount', ratex, tableTop);

    doc.moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();

    // Table Items
    let y = tableTop + 30;
    invoiceData.items.forEach((item) => {
        const total = item.quantity * item.price;

        doc.fillColor('#000000')
            .font('Helvetica')
            .text(item.descOfGoods, itemX, y)
            .text(item.hsn, itemX, y)
            .text(item.qty.toString(), qtyX, y)
            .text(item.unit, itemX, y)
            .text(`$${item.rate}`, priceX, y)
            .text(`$${item.amt}`, totalX, y);

        y += 25;
    });

    // Draw line below table
    doc.moveTo(50, y)
        .lineTo(550, y)
        .stroke();

    // Totals Section
    y += 10;

    doc.fontSize(12)
        .text(`Basic Amount:`, 400, y)
        .text(`$${invoiceData.basicAmount}`, totalX, y, { align: 'right' });
    doc.fontSize(12)
        .text(`Total Amount:`, 400, y)
        .text(`$${invoiceData.totalAmount}`, totalX, y, { align: 'right' });

    y += 20;

    // doc.text(`Tax (${(invoiceData.taxRate * 100).toFixed(0)}%):`, 400, y)
    //     .text(`$${(invoiceData.subtotal * invoiceData.taxRate)}`, totalX, y, { align: 'right' });

    // y += 20;

    // doc.font('Helvetica-Bold')
    //     .text(`Total:`, 400, y)
    //     .text(`$${invoiceData.total}`, totalX, y, { align: 'right' });

    // Footer
    doc.fontSize(10)
        .fillColor('gray')
        .text('Thank you for your business!', 50, 750, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
        console.log(`PDF saved: ${pdfFilePath}`);

        // Send PDF for download
        res.download(pdfFilePath, `invoice-${invoiceData.invoiceNumber}.pdf`, (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                res.status(500).send('Failed to download PDF');
            } else {
                // Remove the PDF after download
                fs.unlinkSync(pdfFilePath);
            }
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
