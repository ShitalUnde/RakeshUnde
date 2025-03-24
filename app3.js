const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const htmlPdf = require('html-pdf-node');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/generate-invoice', async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).send('Invalid invoice data');
  }

  // 🛠️ Prepare HTML content with rendered HTML tags
  const htmlContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { width: 700px; margin: auto; }
            h1, h2, h3 { text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .footer { margin-top: 20px; font-size: 12px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Invoice #${data.invoiceNumber}</h1>
            <p>Date: ${new Date(data.date).toLocaleDateString()}</p>

            <h3>Buyer Info</h3>
            <p><strong>Name:</strong> ${data.buyerName}</p>
            <p><strong>GST No:</strong> ${data.gstno}</p>
            <p><strong>Address:</strong> ${data.address}</p>

            <h3>Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>HSN</th>
                        <th>Quantity</th>
                        <th>Unit</th>
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
                            <td>${item.unit}</td>
                            <td>${item.rate}</td>
                            <td>${item.amt}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3>Summary</h3>
            <p><strong>Basic Amount:</strong> ₹${data.basicAmount}</p>
            <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
            <p><strong>Amount in Words:</strong> ${data.amtInWords}</p>

            <h3>Bank Details</h3>
            <p><strong>Bank:</strong> ${data.bank}</p>
            <p><strong>Account No:</strong> ${data.accountNo}</p>
            <p><strong>Branch:</strong> ${data.branch}</p>
            <p><strong>IFSC:</strong> ${data.ifsc}</p>

            <div class="footer">
                <p>Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;

  // Convert HTML to PDF
  const pdfOptions = { format: 'A4' };
  const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, pdfOptions);

  // Send PDF for download
  const fileName = `invoice-${data.invoiceNumber}.pdf`;
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
