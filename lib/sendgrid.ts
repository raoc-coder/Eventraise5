import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface DonationReceiptData {
  donorName: string
  donorEmail: string
  amount: number
  campaignTitle: string
  campaignDescription?: string
  donationId: string
  transactionId: string
  donationDate: string
  taxDeductible?: boolean
  organizationName?: string
  organizationAddress?: string
  organizationEIN?: string
}

export interface DonationConfirmationData {
  donorName: string
  donorEmail: string
  amount: number
  campaignTitle: string
  campaignDescription?: string
  donationId: string
  transactionId: string
  donationDate: string
  progressPercentage?: number
  goalAmount?: number
  currentAmount?: number
}

export class SendGridService {
  private static isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY
  }

  static async sendDonationReceipt(data: DonationReceiptData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('SendGrid not configured, skipping receipt email')
      return false
    }

    try {
      const msg = {
        to: data.donorEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@eventraisehub.com',
          name: 'EventraiseHUB'
        },
        templateId: process.env.SENDGRID_RECEIPT_TEMPLATE_ID,
        dynamicTemplateData: {
          donor_name: data.donorName,
          amount: data.amount,
          campaign_title: data.campaignTitle,
          campaign_description: data.campaignDescription,
          donation_id: data.donationId,
          transaction_id: data.transactionId,
          donation_date: data.donationDate,
          tax_deductible: data.taxDeductible,
          organization_name: data.organizationName,
          organization_address: data.organizationAddress,
          organization_ein: data.organizationEIN,
        },
        // Fallback to HTML email if template not configured
        html: this.generateReceiptHTML(data),
        subject: `Receipt for your donation to ${data.campaignTitle}`,
      }

      await sgMail.send(msg)
      console.log(`Receipt email sent to ${data.donorEmail}`)
      return true
    } catch (error) {
      console.error('Error sending receipt email:', error)
      return false
    }
  }

  static async sendDonationConfirmation(data: DonationConfirmationData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('SendGrid not configured, skipping confirmation email')
      return false
    }

    try {
      const msg = {
        to: data.donorEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@eventraisehub.com',
          name: 'EventraiseHUB'
        },
        templateId: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID,
        dynamicTemplateData: {
          donor_name: data.donorName,
          amount: data.amount,
          campaign_title: data.campaignTitle,
          campaign_description: data.campaignDescription,
          donation_id: data.donationId,
          transaction_id: data.transactionId,
          donation_date: data.donationDate,
          progress_percentage: data.progressPercentage,
          goal_amount: data.goalAmount,
          current_amount: data.currentAmount,
        },
        // Fallback to HTML email if template not configured
        html: this.generateConfirmationHTML(data),
        subject: `Thank you for your donation to ${data.campaignTitle}!`,
      }

      await sgMail.send(msg)
      console.log(`Confirmation email sent to ${data.donorEmail}`)
      return true
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      return false
    }
  }

  private static generateReceiptHTML(data: DonationReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt - EventraiseHUB</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .receipt-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You for Your Donation!</h1>
            <p>Your generous contribution makes a difference</p>
          </div>
          <div class="content">
            <div class="receipt-details">
              <h2>Donation Receipt</h2>
              <p><strong>Donor:</strong> ${data.donorName}</p>
              <p><strong>Campaign:</strong> ${data.campaignTitle}</p>
              <p><strong>Amount:</strong> <span class="amount">$${data.amount.toFixed(2)}</span></p>
              <p><strong>Date:</strong> ${data.donationDate}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Donation ID:</strong> ${data.donationId}</p>
              ${data.taxDeductible ? '<p><strong>Tax Deductible:</strong> Yes</p>' : ''}
            </div>
            ${data.organizationName ? `
              <div class="receipt-details">
                <h3>Organization Information</h3>
                <p><strong>${data.organizationName}</strong></p>
                ${data.organizationAddress ? `<p>${data.organizationAddress}</p>` : ''}
                ${data.organizationEIN ? `<p><strong>EIN:</strong> ${data.organizationEIN}</p>` : ''}
              </div>
            ` : ''}
            <p>This receipt serves as confirmation of your donation. Please keep this for your records.</p>
          </div>
          <div class="footer">
            <p>Powered by EventraiseHUB - Making fundraising simple and effective</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateConfirmationHTML(data: DonationConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Confirmation - EventraiseHUB</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
          .progress-fill { background: linear-gradient(135deg, #059669 0%, #047857 100%); height: 100%; transition: width 0.3s ease; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You for Your Donation!</h1>
            <p>Your generosity is making a real difference</p>
          </div>
          <div class="content">
            <h2>Donation Confirmation</h2>
            <p>Dear ${data.donorName},</p>
            <p>Thank you for your generous donation of <span class="amount">$${data.amount.toFixed(2)}</span> to <strong>${data.campaignTitle}</strong>!</p>
            
            ${data.campaignDescription ? `<p><em>"${data.campaignDescription}"</em></p>` : ''}
            
            <h3>Campaign Progress</h3>
            ${data.progressPercentage !== undefined ? `
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(data.progressPercentage, 100)}%"></div>
              </div>
              <p><strong>${data.progressPercentage.toFixed(1)}%</strong> of goal reached</p>
              ${data.currentAmount && data.goalAmount ? `
                <p>$${data.currentAmount.toLocaleString()} raised of $${data.goalAmount.toLocaleString()} goal</p>
              ` : ''}
            ` : ''}
            
            <h3>Donation Details</h3>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Donation ID:</strong> ${data.donationId}</p>
            <p><strong>Date:</strong> ${data.donationDate}</p>
            
            <p>Your donation is helping to make a positive impact in our community. We'll keep you updated on the campaign's progress!</p>
          </div>
          <div class="footer">
            <p>Powered by EventraiseHUB - Making fundraising simple and effective</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
