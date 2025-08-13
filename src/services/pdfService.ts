import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { Ticket } from "../models/Ticket";
import { Events } from "../models/Events";
import { User } from "../models/User";

export interface TicketPDFData {
  ticket: any;
  event: any;
  user: any;
}

export class PDFService {
  static async generateTicketPDF(ticketData: TicketPDFData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const { ticket, event, user } = ticketData;
        
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Ticket - ${event.title}`,
            Author: 'Evently',
            Subject: `Event Ticket for ${user.firstName} ${user.lastName}`,
            Creator: 'Evently Ticket System'
          }
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });

        // Generate QR code for ticket verification
        const qrData = JSON.stringify({
          ticketId: ticket._id,
          ticketCode: ticket.ticketCode,
          eventId: event._id,
          userId: user._id,
          verification: `${ticket.ticketCode}-${event._id}-${user._id}`
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 200
        });

        // Convert QR code data URL to buffer
        const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

        // Header with logo area and title
        this.addHeader(doc, event.title);

        // Ticket information section
        this.addTicketInfo(doc, ticket, event, user);

        // QR Code section
        this.addQRCode(doc, qrCodeBuffer, ticket.ticketCode);

        // Event details section
        this.addEventDetails(doc, event);

        // Terms and conditions
        this.addTermsAndConditions(doc);

        // Footer
        this.addFooter(doc);

        // Finalize the PDF
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  private static addHeader(doc: PDFKit.PDFDocument, eventTitle: string) {
    // Header background
    doc.rect(0, 0, doc.page.width, 80)
       .fill('#2563eb');

    // Logo/Brand area (you can add logo image here)
    doc.fontSize(24)
       .fillColor('white')
       .text('EVENTLY', 50, 25, { align: 'left' });

    // Ticket title
    doc.fontSize(18)
       .fillColor('white')
       .text('EVENT TICKET', 50, 50, { align: 'left' });

    // Reset position
    doc.y = 100;
  }

  private static addTicketInfo(doc: PDFKit.PDFDocument, ticket: any, event: any, user: any) {
    const startY = doc.y + 20;

    // Ticket section background
    doc.rect(40, startY - 10, doc.page.width - 80, 120)
       .stroke('#e5e7eb')
       .lineWidth(1);

    // Ticket Code (prominent)
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('TICKET CODE', 60, startY + 10);
    
    doc.fontSize(24)
       .fillColor('#dc2626')
       .text(ticket.ticketCode, 60, startY + 35);

    // Attendee information
    doc.fontSize(12)
       .fillColor('#374151')
       .text('ATTENDEE', 60, startY + 70);
    
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text(`${user.firstName} ${user.lastName}`, 60, startY + 85);

    // Purchase date
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Purchased: ${new Date(ticket.purchaseDate).toLocaleDateString()}`, 350, startY + 10);

    // Payment status
    const statusColor = ticket.paymentStatus === 'succeeded' ? '#059669' : '#dc2626';
    doc.fontSize(10)
       .fillColor(statusColor)
       .text(`Status: ${ticket.paymentStatus.toUpperCase()}`, 350, startY + 25);

    // Price
    doc.fontSize(12)
       .fillColor('#374151')
       .text('PRICE', 350, startY + 50);
    
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text(`$${ticket.totalAmount.toFixed(2)}`, 350, startY + 65);

    doc.y = startY + 140;
  }

  private static addQRCode(doc: PDFKit.PDFDocument, qrCodeBuffer: Buffer, ticketCode: string) {
    const startY = doc.y + 20;

    // QR Code section
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text('SCAN FOR VERIFICATION', 60, startY);

    // Add QR code image
    doc.image(qrCodeBuffer, 60, startY + 25, { width: 120, height: 120 });

    // QR code instructions
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Present this QR code at the event entrance', 200, startY + 40, { width: 200 });

    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Ticket Code: ${ticketCode}`, 200, startY + 60, { width: 200 });

    doc.y = startY + 160;
  }

  private static addEventDetails(doc: PDFKit.PDFDocument, event: any) {
    const startY = doc.y + 20;

    // Event details header
    doc.fontSize(16)
       .fillColor('#1f2937')
       .text('EVENT DETAILS', 60, startY);

    // Event information
    const eventDate = new Date(event.date);
    const details = [
      { label: 'Event', value: event.title },
      { label: 'Date', value: eventDate.toLocaleDateString() },
      { label: 'Time', value: eventDate.toLocaleTimeString() },
      { label: 'Location', value: event.location },
      { label: 'Description', value: event.description }
    ];

    let yPosition = startY + 30;
    details.forEach((detail) => {
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(detail.label.toUpperCase(), 60, yPosition);
      
      doc.fontSize(12)
         .fillColor('#1f2937')
         .text(detail.value, 150, yPosition, { width: 350 });
      
      yPosition += 25;
    });

    doc.y = yPosition + 20;
  }

  private static addTermsAndConditions(doc: PDFKit.PDFDocument) {
    const startY = doc.y + 20;

    // Terms section
    doc.fontSize(12)
       .fillColor('#1f2937')
       .text('TERMS & CONDITIONS', 60, startY);

    const terms = [
      '• This ticket is non-refundable and non-transferable',
      '• Present this ticket (digital or printed) at the event entrance',
      '• Valid only for the specified date and time',
      '• Event organizer reserves the right to refuse entry',
      '• No re-entry allowed once you leave the venue'
    ];

    let yPosition = startY + 20;
    terms.forEach((term) => {
      doc.fontSize(9)
         .fillColor('#6b7280')
         .text(term, 60, yPosition, { width: 450 });
      yPosition += 15;
    });

    doc.y = yPosition + 20;
  }

  private static addFooter(doc: PDFKit.PDFDocument) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;

    // Footer line
    doc.moveTo(50, footerY - 10)
       .lineTo(doc.page.width - 50, footerY - 10)
       .stroke('#e5e7eb');

    // Footer text
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('Generated by Evently Ticket System', 50, footerY, { align: 'left' });

    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text(`Generated on ${new Date().toLocaleString()}`, 50, footerY, { align: 'right' });
  }

  static async getTicketWithDetails(ticketId: string, userId: string): Promise<TicketPDFData | null> {
    try {
      const ticket = await Ticket.findOne({ 
        _id: ticketId, 
        user: userId 
      }).populate('event').populate('user');

      if (!ticket) {
        return null;
      }

      return {
        ticket: ticket.toObject(),
        event: ticket.event,
        user: ticket.user
      };
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      return null;
    }
  }
}
