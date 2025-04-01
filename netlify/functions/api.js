const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const puppeteer = require("puppeteer");

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

router.get('/', (req, res) => res.send('API is working!'));
/*
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
        page.drawText(`Total Amount ( - In Words): ${data.amtInWords}`, { x: 50, y: yPosition, size: fontSize, font });

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
*/

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
                    .section { margin-bottom: 10px; display: flex; }
                    .section .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .section-content { flex: 1; }
                    .table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
                    

                .totals {
    display: flex;
    justify-content: space-between; /* Keeps space between the two divs */
    align-items: center; /* Ensures they align properly on the same line */
    padding: 10px;
    border-top: 2px solid black; /* Optional separator */
    width: 100%; /* Ensures full-width container */
}

.total-left, .total-right {
    width: 50%; /* Each div takes 50% of the width */
}

.total-left {
    text-align: left; /* Aligns text to the left */
}

.total-right {
    width: 50%;
    text-align: left; /* Aligns text to the left */
    padding-left: 20px; /* Optional padding for better spacing */
    margin-left: 5px; /* Optional margin for spacing */
}




                    .footer { text-align: right; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }

                     .footer p.pb {
                        margin-bottom: 30px;
                    }

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
                            <p class="bg"><strong>${owner.business}</strong></p>
                            <p><i class="fas fa-user"></i> <strong>${owner.name
            }</strong></p>
                            <p><i class="fas fa-map-marker-alt"></i> ${owner.add
            }</p> 
                            <p><i class="fas fa-phone-alt"></i>  ${owner.ph
            }</p> 
                            <p><i class="fas fa-envelope"></i> ${owner.email
            }</p> 
                            <p><i class="fas fa-credit-card"></i>  ${owner.pan
            }</p> 
                        </div>
                    </div>
            
                    <div class="section">
                        <div class="section-content">
                            <h3 class="section-title">Buyer</h3>
                            <p>${data.buyerName}</p>
                            <p>${data.address}</p>
                            <p><strong>GSTIN:</strong> ${data.gstno}</p>
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
                        <div class="total-left">
                            <p><strong>Total</strong></p>
                            <p><strong>Basic Amount:</strong> ${data.basicAmount
            }/-</p>
                            <p><strong>Total Amount:</strong> ${data.totalAmount
            }}/-</p>
                            <p><strong>Total Amount (In Words):</strong> ${data.amtInWords
            }</p>
                        </div>
                        <div class="total-right">
                        <p><strong>Bank Details</strong></p>
                        <p><strong>Name:</strong> ${data.bank}</p>
                        <p><strong>Account No:</strong> ${data.accountNo}</p>
                        <p><strong>Branch:</strong> ${data.branch}</p>
                        <p><strong>IFSC:</strong>${data.ifsc}</p>
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

        // // Launch Puppeteer to generate the PDF from HTML
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        // Send the PDF as a base64 string in the response
        // const pdfBase64 = pdfBuffer.toString('base64');
        const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
        res.status(200).json({
            success: true,
            pdfBase64: pdfBase64,
            fileName: `invoice-${Date.now()}.pdf`,
        });

        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.setContent(invoiceHTML);
        // const pdfBuffer = await page.pdf({ format: "A4" });
        // await browser.close();

        // Set the appropriate headers for PDF download
        // res.setHeader("Content-Type", "application/pdf");
        // res.setHeader(
        //     "Content-Disposition",
        //     `attachment; filename="invoice-${Date.now()}.pdf"`
        // );

        // Send the PDF buffer directly in the response
        // res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ success: false, error: "Failed to generate PDF" });
    }
});


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
