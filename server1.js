const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(bodyParser.json());


// Helper function to strip HTML tags and clean up text
const cleanText = (html) => {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

app.get("/", (req, res) => res.send("API is working!"));

app.post("/generate-invoice", async (req, res) => {
    const data = req.body;

    const owner = {
        name: 'Rakesh R. Unde',
        add: `Sai Indo Properties, Shop No.2, Alandi Phata, Medankar Wadi, Chakan PUNE (410501)`,
        email: `rakeshu88@gmail.com`,
        ph: `8888406631`,
        pan: `ACOPU7463M`
    }

    if (!data) {
        return res.status(400).send("Invalid invoice data");
    }

    try {
        const invoiceHTML = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { width: 850px; margin: auto; padding: 20px; border: 1px solid #ccc; }
                    .header { display: flex; justify-content: space-between; align-items: center; background: #004080; color: white; padding: 10px; }
                    .header .business-info { text-align: center; flex: 1;}

                    .business-info p{
                        color: black
                    }

                    .business-info p.bg {
                        color: red;
                        font-size: 40px;
                    }


                    .header .invoice-details { text-align: right; flex: 1; }
                    .section { margin-bottom: 20px; display: flex; }
                    .section .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .section-content { flex: 1; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
                    .totals { text-align: right; margin-top: 20px; }
                    .footer { text-align: right; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                    
                        <div class="invoice-details">
                            <p><strong>INVOICE NO:</strong> ${data.invoiceNumber
            }</p>
                            <p><strong>DATE:</strong> ${data.date}</p>
                        </div>
                    </div>
                    <div class="header">
                        <div class="business-info">
                            <p class="bg"><strong>${owner.name}</strong></p>
                            <p>${owner.add}</p>
                            <p><strong>Mobile NO:</strong> ${owner.ph}</p>
                            <p><strong>Email:</strong> ${owner.email}</p>
                            <p><strong>PAN NO:</strong> ${owner.pan}</p>
                        </div>
                    </div>
            
                    <div class="section">
                        <div class="section-content">
                            <h3 class="section-title">Buyer</h3>
                            <p><strong>PARTY'S NAME:</strong> ${data.buyerName}</p>
                            <p><strong>ADDRESS:</strong> ${data.address}</p>
                            <p><strong>GSTIN:</strong> ${data.gstno}</p>
                        </div>
                        <div class="section-content">
                            <h3 class="section-title">PAYMENT INFO</h3>
                            <p><strong>Payment Due Date:</strong> ${data.paymentDueDate
            }</p>
                            <p><strong>Payment Mode:</strong> ${data.paymentMode
            }</p>
                        </div>
                    </div>
                    <br/>
                
                    <div class="section">
                        
                        <table class="table">
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
                                ${data.items
                .map(
                    (item) => `
                                    <tr>
                                        <td>${item.descOfGoods}</td>
                                        <td>${item.hsn}</td>
                                        <td>${item.qty}</td>
                                        <td>₹${item.rate}</td>
                                        <td>₹${item.amt}</td>
                                    </tr>
                                `
                )
                .join("")}
                            </tbody>
                        </table>
                    </div>
            
                    <div class="totals">
                        <p><strong>Add: CGST @ 14%:</strong> ₹${data.cgst}</p>
                        <p><strong>Add: SGST @ 14%:</strong> ₹${data.sgst}</p>
                        <p><strong>Balance Received:</strong> ₹${data.balanceReceived
            }</p>
                        <p><strong>Balance Due:</strong> ₹${data.balanceDue}</p>
                        <p><strong>Grand Total:</strong> ₹${data.totalAmount
            }</p>
                    </div>
            
                    <div class="footer">
                        <p><strong>Total Amount (In Words):</strong> ${data.amtInWords
            }</p>
                        <p><strong>For:</strong> BUSINESS NAME</p>
                        <p>Authorised Signatory</p>
                    </div>
                </div>
            </body>
            </html>
            `;

        // // Launch Puppeteer to generate the PDF from HTML
        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.setContent(invoiceHTML);
        // const pdfBuffer = await page.pdf({ format: "A4" });
        // await browser.close();

        // // Send the PDF as a base64 string in the response
        // // const pdfBase64 = pdfBuffer.toString('base64');
        // const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        // res.status(200).json({
        //     success: true,
        //     pdfBase64: pdfBase64,
        //     fileName: `invoice-${Date.now()}.pdf`,
        // });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        // Set the appropriate headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="invoice-${Date.now()}.pdf"`
        );

        // Send the PDF buffer directly in the response
        res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ success: false, error: "Failed to generate PDF" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
