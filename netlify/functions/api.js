const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const puppeteer = require("puppeteer");
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

router.get('/', (req, res) => res.send('API is working!'));

router.post("/generate-invoice", async (req, res) => {
    const data = req.body;

    const owner = {
        name: "Rakesh R. Unde",
        add: `Shop No.2, Alandi Phata, Medankar Wadi, Chakan PUNE (410501)`,
        email: `rakeshu88@gmail.com`,
        ph: `8888406631`,
        pan: `ACOPU7463M`,
        business: `Sai Indo Properties`,
    };

    if (!data) {
        return res.status(400).send("Invalid invoice data");
    }

    try {
        const invoiceHTML = `
            <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1; /* Set line-height to 1 to remove extra line spacing */
                        margin: 0; /* Remove extra margin */
                        padding: 0; /* Remove extra padding */
                    }

                    .container { 
                        width: 850px; 
                        margin: auto; 
                        padding: 10px; 
                        border: 1px solid #ccc; 
                    }

                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        background: #004080; 
                        color: white;  
                        padding: 5px 0; 
                        margin: 0; 
                    }

                    .header .business-info { 
                        text-align: center; 
                        flex: 1; 
                        margin-top: 0px; 
                        padding-top : 0px;
                    }

                    .business-info p {
                        color: black;
                    }

                    .business-info p.bg {
                        color: red;
                        font-size: 40px;
                    }

                    .header .invoice-details { 
                        text-align: right; 
                        flex: 1; 
                    }

                    .section { 
                        margin-bottom: 10px; 
                        display: flex; 
                    }

                    .section .section-title { 
                        font-weight: bold; 
                        padding-bottom: 5px; 
                    }

                    .section-content { 
                        flex: 1; 
                        padding-left: 15px !important;
                        border: 1px solid #ccc; 

                    }

                    .table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 5px; 
                    }

                    th, td { 
                        border: 1px solid #ccc; 
                        padding: 10px; 
                        text-align: center; 
                        line-height: 1; 
                    }

                    .totals {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        border-top: 2px solid black;
                        width: 100%;
                    }

                    .total-left, .total-right {
                        width: 50%;
                    }

                    .total-left {
                        text-align: left;
                    }

                    .total-right {
                        width: 50%;
                        text-align: left;
                        padding-left: 20px;
                        margin-left: 5px;
                    }

                    .invoice-info {
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                    }

                    .footer { 
                        text-align: right; 
                        margin-top: 30px; 
                        border-top: 1px solid #ccc; 
                        padding-top: 10px; 
                    }

                    .footer p.pb {
                        margin-bottom: 35px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="invoice-info">
                            <p style="text-align: left; display: inline-block;"><strong>DATE:</strong> ${data.date}</p>
                            <p style="text-align: right; display: inline-block; margin-left: 30px;"><strong>INVOICE NO:</strong> ${data.invoiceNumber}</p>
                        </div>
                    </div>

                    <div class="header">
                        <div class="business-info">
                            <p class="bg"><strong>${owner.business}</strong></p>
                            <p><i class="fas fa-user"></i> <strong>${owner.name}</strong></p>
                            <p><i class="fas fa-map-marker-alt"></i> ${owner.add}</p> 
                            <div>
                                <p style="display: inline-block; margin-right: 20px;">
                                    <i class="fas fa-phone-alt"></i> ${owner.ph}
                                </p>
                                <p style="display: inline-block; margin-right: 20px;">
                                    <i class="fas fa-envelope"></i> ${owner.email}
                                </p>
                                <p style="display: inline-block;">
                                    <i class="fas fa-id-card"></i> ${owner.pan}
                                </p>
                            </div>  
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-content">
                            <h3 class="section-title">Buyer Details</h3>
                            <p><strong>Name: </strong>${data.buyerName}</p>
                            <p><strong>Address: </strong>${data.address}</p>
                            <p><strong>GSTIN:</strong> ${data.gstno}</p>
                        </div>
                    </div>

                    <br/>

                    <div class="section">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>HSN/SAC</th>
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
                                                <td>${item.hsn || ""}</td>
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
                        <div class="total-left">
                            <p><strong>Total</strong></p>
                            <p><strong>Basic Amount:</strong> ${data.basicAmount}/-</p>
                            <p><strong>Total Amount:</strong> ${data.totalAmount}/-</p>
                            <p><strong>Total Amount (In Words):</strong> ${data.amtInWords}</p>
                        </div>
                        <div class="total-right">
                            <p><strong>Bank Details</strong></p>
                            <p><strong>Name:</strong> ${data.bank}</p>
                            <p><strong>Account No:</strong> ${data.accountNo}</p>
                            <p><strong>Branch:</strong> ${data.branch}</p>
                            <p><strong>IFSC:</strong> ${data.ifsc}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>${owner.name}</strong></p>
                        <p class="pb">Authorised Signatory</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        res.status(200).json({
            success: true,
            pdfBase64: pdfBase64,
            fileName: `invoice-${Date.now()}.pdf`,
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ success: false, error: "Failed to generate PDF" });
    }
});


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
