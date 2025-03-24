const htmlPdf = require('html-pdf-node');

exports.handler = async (event, context) => {
    const data = JSON.parse(event.body);

    if (!data) {
        return {
            statusCode: 400,
            body: 'Invalid invoice data'
        };
    }

    // 🛠️ Prepare HTML content matching the provided image format
    const htmlContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.5; margin: 0; padding: 0; }
            .container { width: 850px; margin: auto; padding: 20px; border: 1px solid #ccc; }
            .header { text-align: center; background: #004080; color: white; padding: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .company-info { text-align: center; font-size: 14px; line-height: 1.6; }
            .section { display: flex; justify-content: space-between; padding: 10px; }
            .section .box { width: 48%; padding: 10px; background: #d3eafc; }
            .bold { font-weight: bold; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ccc; padding: 10px; text-align: center; }
            .totals { display: flex; justify-content: space-between; margin-top: 20px; }
            .terms { background: #d3eafc; padding: 15px; }
            .footer { text-align: right; margin-top: 40px; }
            .footer p { margin: 0; font-size: 14px; }
            .signature { text-align: right; margin-top: 60px; }
        </style>
    </head>
    <body>
        <div class="container">

            <!-- Header Section -->
            <div class="header">
                <h1>TAX INVOICE</h1>
            </div>

            <!-- Company Info -->
            <div class="company-info">
                <h2>BUSINESS NAME</h2>
                <p>132 Street, City, State, PIN</p>
                <p>GSTIN: AAA213465 | Email ID: 122@gmail.com | PAN NO: AAA132456</p>
            </div>

            <!-- Invoice & Bill To Section -->
            <div class="section">
                <div class="box">
                    <h3>Bill To:</h3>
                    <p class="bold">PARTY'S NAME:</p>
                    <p>${data.buyerName}</p>
                    <p class="bold">ADDRESS:</p>
                    <p>${data.address}</p>
                    <p class="bold">GSTIN:</p>
                    <p>${data.gstno}</p>
                </div>
                <div class="box">
                    <p class="bold">Invoice No:</p>
                    <p>${`INVOICE1BN`}</p>
                    <p class="bold">Date:</p>
                    <p>${new Date(data.date).toLocaleDateString()}</p>
                    <p class="bold">Payment Due Date:</p>
                    <p>-</p>
                    <p class="bold">Payment Mode:</p>
                    <p>-</p>
                </div>
            </div>

            <!-- Items Table -->
            <h3>Items</h3>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>HSN Code</th>
                        <th>Qty</th>
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
                            <td>₹${item.rate}</td>
                            <td>₹${item.amt}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals Section -->
            <div class="totals">
                <div class="terms">
                    <h3>Terms & Conditions:</h3>
                    <ul>
                        <li>All payments must be made within the due date.</li>
                        <li>Late payment will attract interest as per company policy.</li>
                        <li>Product once sold cannot be returned.</li>
                    </ul>
                </div>
                <div>
                    <table class="invoice-table">
                        <tr>
                            <td>Add: CGST @ 14%</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Add: SGST @ 14%</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Balance Received:</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Balance Due:</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td class="bold">Grand Total:</td>
                            <td class="bold">₹${data.totalAmount}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer Section -->
            <div class="footer">
                <p>Total Amount (₹ - In Words): <strong>${data.amtInWords}</strong></p>
                <p>Grand Total: ₹${data.totalAmount}</p>
            </div>

            <!-- Signature Section -->
            <div class="signature">
                <p>For: Business Name</p>
                <p>Authorized Signatory</p>
            </div>

        </div>
    </body>
    </html>
    `;

    // Generate PDF
    const pdfOptions = { format: 'A4' };
    const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, pdfOptions);

    // Return PDF as response
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="invoice-INVOICE1BN.pdf"'
        },
        body: pdfBuffer.toString('base64'),
        isBase64Encoded: true
    };
};
