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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
