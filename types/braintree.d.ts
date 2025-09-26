declare module 'braintree' {
  export interface BraintreeGateway {
    clientToken: {
      generate(options?: { customerId?: string }): Promise<{ clientToken: string }>
    }
    transaction: {
      sale(options: {
        amount: string
        paymentMethodNonce: string
        options?: any
      }): Promise<{
        success: boolean
        transaction?: any
        message?: string
      }>
    }
    webhookNotification: {
      parse(signature: string, payload: string): any
    }
  }

  export class BraintreeGateway {
    constructor(config: {
      environment: any
      merchantId: string
      publicKey: string
      privateKey: string
    })
  }

  export const Environment: {
    Production: any
    Sandbox: any
  }
}

declare module 'braintree-web' {
  export interface Client {
    create(options: { authorization: string }): Promise<Client>
  }
  
  export const client: {
    create(options: { authorization: string }): Promise<Client>
  }
  
  export default {
    client: {
      create(options: { authorization: string }): Promise<Client>
    }
  }
}

declare module 'braintree-web-drop-in' {
  export interface Dropin {
    create(options: {
      authorization: string
      container: HTMLElement
      card?: any
      paypal?: any
      venmo?: boolean
      applePay?: any
      googlePay?: any
    }): Promise<Dropin>
    
    requestPaymentMethod(): Promise<{
      nonce: string
      type: string
    }>
    
    teardown(): void
  }
  
  export default {
    create(options: {
      authorization: string
      container: HTMLElement
      card?: any
      paypal?: any
      venmo?: boolean
      applePay?: any
      googlePay?: any
    }): Promise<Dropin>
  }
}