import { DemosData } from '../types'

export class DemosParser {
  /**
   * Parse DEMOS PDF text and extract patient demographics
   */
  static parse(text: string): DemosData {
    const accountNumber = this.extractAccountNumber(text)
    const patientName = this.extractPatientName(text)
    const dateOfBirth = this.extractDateOfBirth(text)
    const phoneNumber = this.extractPhoneNumber(text)
    const email = this.extractEmail(text)
    const address = this.extractAddress(text)

    return {
      accountNumber,
      patientName,
      dateOfBirth,
      phoneNumber,
      email,
      address
    }
  }

  private static extractAccountNumber(text: string): string {
    const match = text.match(/Account Number\s*:\s*(\d+)/i)
    if (!match) {
      throw new Error('Account number not found in DEMOS PDF')
    }
    return match[1]
  }

  private static extractPatientName(text: string): string {
    const match = text.match(/^([A-Z\s\.,]+)\s+-\s+Patient Demographics/i)
    if (!match) {
      throw new Error('Patient name not found in DEMOS PDF')
    }
    return match[1].trim()
  }

  private static extractDateOfBirth(text: string): string {
    const match = text.match(/Date of Birth\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)
    if (!match) {
      throw new Error('Date of birth not found in DEMOS PDF')
    }
    return match[1]
  }

  private static extractPhoneNumber(text: string): string {
    // Try cell phone first, then home phone
    let match = text.match(/(?:Cell|Mobile) Phone Number\s*:\s*([\d\-\(\) ]+)/i)
    if (!match) {
      match = text.match(/Home Phone Number\s*:\s*([\d\-\(\) ]+)/i)
    }
    if (!match) {
      throw new Error('Phone number not found in DEMOS PDF')
    }
    return match[1].trim()
  }

  private static extractEmail(text: string): string {
    const match = text.match(/Email\s*:\s*([^\s\n]+@[^\s\n]+)/i)
    return match ? match[1].trim() : ''
  }

  private static extractAddress(text: string): { street: string, city: string, state: string, zip: string } {
    const addressMatch = text.match(/Address\s*:\s*([^\n]+)\n\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i)
    if (!addressMatch) {
      throw new Error('Address not found in DEMOS PDF')
    }

    return {
      street: addressMatch[1].trim(),
      city: addressMatch[2].trim(),
      state: addressMatch[3],
      zip: addressMatch[4]
    }
  }
} 