const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoicePDF = (invoiceData, outputFile) => {
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(outputFile);
    doc.pipe(stream);

    // Header with Logo Placeholder
    doc.image('logo-placeholder.png', 50, 45, { width: 100 })
        .fillColor('#444444')
        .fontSize(20)
        .text('INVOICE', 400, 50, { align: 'right' })
        .fontSize(10)
        .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${invoiceData.date}`, 400, 95, { align: 'right' })
        .text(`Due Date: ${invoiceData.dueDate}`, 400, 110, { align: 'right' })
        .moveDown();

    // Company and Customer Info
    /*doc.fillColor('#000000')
        .fontSize(12)
        .text('From:', 50, 150)
        .font('Helvetica-Bold')
        .text(invoiceData.company.name)
        .font('Helvetica')
        .text(invoiceData.company.address)
        .text(`Phone: ${invoiceData.company.phone}`)
        .text(`Email: ${invoiceData.company.email}`)
        .moveDown();

    doc.text('To:', 300, 150)
        .font('Helvetica-Bold')
        .text(invoiceData.customer.name)
        .font('Helvetica')
        .text(invoiceData.customer.address)
        .text(`Phone: ${invoiceData.customer.phone}`)
        .text(`Email: ${invoiceData.customer.email}`)
        .moveDown(2);*/

    // Company Info on the Left
    doc.fillColor('#000000')
        .fontSize(12)
        .text('From:', 50, 150)
        .font('Helvetica-Bold')
        .text(invoiceData.company.name, 50, 170)
        .font('Helvetica')
        .text(invoiceData.company.address, 50, 185)
        .text(`Phone: ${invoiceData.company.phone}`, 50, 200)
        .text(`Email: ${invoiceData.company.email}`, 50, 215);

    // Customer Info on the Right (same line)
    const rightX = 300;  // Adjust the X coordinate to align on the right side

    doc.fillColor('#000000')
        .fontSize(12)
        .text('To:', rightX, 150)
        .font('Helvetica-Bold')
        .text(invoiceData.customer.name, rightX, 170)
        .font('Helvetica')
        .text(invoiceData.customer.address, rightX, 185)
        .text(`Phone: ${invoiceData.customer.phone}`, rightX, 200)
        .text(`Email: ${invoiceData.customer.email}`, rightX, 215)
        .moveDown(2);


    // Table Header
    const tableTop = 250;
    const itemX = 50;
    const qtyX = 320;
    const priceX = 400;
    const totalX = 480;

    doc
        .fontSize(12)
        .fillColor('#444444')
        .text('Description', itemX, tableTop, { bold: true })
        .text('Quantity', qtyX, tableTop)
        .text('Price', priceX, tableTop)
        .text('Total', totalX, tableTop);

    doc.moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();

    // Table Items
    let y = tableTop + 30;
    invoiceData.items.forEach((item, index) => {
        const total = item.quantity * item.price;

        doc
            .fillColor('#000000')
            .font('Helvetica')
            .text(item.description, itemX, y)
            .text(item.quantity.toString(), qtyX, y)
            .text(`$${item.price.toFixed(2)}`, priceX, y)
            .text(`$${total.toFixed(2)}`, totalX, y);

        y += 25;
    });

    // Draw line below table
    doc.moveTo(50, y)
        .lineTo(550, y)
        .stroke();

    // Totals Section
    y += 10;

    doc
        .fontSize(12)
        .text(`Subtotal:`, 400, y)
        .text(`$${invoiceData.subtotal.toFixed(2)}`, totalX, y, { align: 'right' });

    y += 20;

    doc
        .text(`Tax (${(invoiceData.taxRate * 100).toFixed(0)}%):`, 400, y)
        .text(`$${(invoiceData.subtotal * invoiceData.taxRate).toFixed(2)}`, totalX, y, { align: 'right' });

    y += 20;

    doc
        .font('Helvetica-Bold')
        .text(`Total:`, 400, y)
        .text(`$${invoiceData.total.toFixed(2)}`, totalX, y, { align: 'right' });

    // Footer
    doc
        .fontSize(10)
        .fillColor('gray')
        .text('Thank you for your business!', 50, 750, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
        console.log(`PDF saved: ${outputFile}`);
    });
};

// Sample Invoice Data
const invoiceData = {
    invoiceNumber: "INV-1001",
    date: "2025-03-23",
    dueDate: "2025-04-01",
    company: {
        name: "Tech Solutions Inc.",
        address: "123 Tech Street, Silicon Valley, CA",
        phone: "555-123-4567",
        email: "contact@techsolutions.com"
    },
    customer: {
        name: "John Doe",
        address: "456 Customer Rd, New York, NY",
        phone: "555-987-6543",
        email: "john.doe@email.com"
    },
    items: [
        { description: "Web Development Service", quantity: 2, price: 1500 },
        { description: "Hosting Service", quantity: 1, price: 300 },
        { description: "Maintenance", quantity: 3, price: 200 }
    ],
    subtotal: 3900,
    taxRate: 0.1,
    total: 4290
};

// Ensure you have a logo image in the same directory named 'logo-placeholder.png'
generateInvoicePDF(invoiceData, 'enhanced-invoice.pdf');
