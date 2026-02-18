import Order from "../../models/order.model.js";
import PDFDocument from "pdfkit";

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* ================= HEADER ================= */

    doc
      .fontSize(20)
      .text("AI SaaS Store", { align: "center" });

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Invoice ID: ${order._id}`);
    doc.text(`Date: ${order.createdAt.toDateString()}`);
    doc.moveDown();

    /* ================= CUSTOMER ================= */

    doc.text("Customer Details:");
    doc.text(`Name: ${order.shippingAddress.name}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.text(`Address: ${order.shippingAddress.address}`);
    doc.text(
      `City: ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`
    );

    doc.moveDown(2);

    /* ================= TABLE HEADER ================= */

    const tableTop = doc.y;
    const itemX = 40;
    const qtyX = 280;
    const priceX = 340;
    const totalX = 420;

    doc.font("Helvetica-Bold");
    doc.text("Item", itemX, tableTop);
    doc.text("Qty", qtyX, tableTop);
    doc.text("Price", priceX, tableTop);
    doc.text("Total", totalX, tableTop);

    doc.moveTo(itemX, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    doc.font("Helvetica");

    let position = tableTop + 25;

    /* ================= TABLE ROWS ================= */

    order.items.forEach((item) => {
      const total = item.price * item.quantity;

      doc.text(item.name, itemX, position);
      doc.text(item.quantity.toString(), qtyX, position);
      doc.text(`₹${item.price}`, priceX, position);
      doc.text(`₹${total}`, totalX, position);

      position += 25;
    });

    doc.moveTo(itemX, position)
       .lineTo(550, position)
       .stroke();

    position += 20;

    /* ================= TOTALS ================= */

    doc.font("Helvetica-Bold");
    doc.text(`Subtotal: ₹${order.subtotal}`, totalX, position);
    position += 20;

    doc.text(`Delivery: ₹${order.deliveryCharge}`, totalX, position);
    position += 20;

    doc.text(`Grand Total: ₹${order.totalAmount}`, totalX, position);

    position += 30;

    doc.font("Helvetica");
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Status: ${order.status}`);

    doc.end();

  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};
