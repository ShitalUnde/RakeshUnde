const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const htmlPdf = require('html-pdf-node');

const app = express();
app.use(bodyParser.json());

app.post('/generate-invoice', async (req, res) => {
    const data = req.body;

    if (!data) {
        return res.status(400).send('Invalid invoice data');
    }

    // 🛠️ Prepare HTML content
    const htmlContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { width: 850px; margin: auto; padding: 20px; border: 1px solid #ccc; }
            .header { text-align: center; background: #004080; color: white; padding: 10px; }
            .footer { text-align: right; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header"><h1>TAX INVOICE</h1></div>
            
            <h3>Bill To:</h3>
            <p>${data.buyerName}</p>
            <p>${data.address}</p>
            <p>GSTIN: ${data.gstno}</p>

            <h3>Items:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>HSN Code</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.descOfGoods}</td>
                            <td>${item.hsn}</td>
                            <td>${item.qty}</td>
                            <td>₹${item.rate}</td>
                            <td>₹${item.amt}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>Grand Total: ₹${data.totalAmount}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Generate PDF
    const pdfOptions = { format: 'A4' };
    const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, pdfOptions);

    // Send PDF for download
    const fileName = `invoice-${Date.now()}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
});

// Export server as a serverless function
module.exports.handler = serverless(app);
