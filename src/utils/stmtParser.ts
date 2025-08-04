import { StmtData } from '../types'

export class StmtParser {
  /**
   * Parse STMT PDF text and extract financial data
   */
  static parse(text: string): StmtData {
    const lastPaymentDate = this.extractLastPaymentDate(text)
    const amountDue = this.extractAmountDue(text)
    const visitDates = this.extractVisitDates(text)
    const serviceCodes = this.extractServiceCodes(text)

    return {
      lastPaymentDate,
      amountDue,
      visitDates,
      serviceCodes
    }
  }

  private static extractLastPaymentDate(text: string): string {
    // Find all received dates and get the most recent
    const receivedMatches = [...text.matchAll(/Received Date\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi)]
    
    if (receivedMatches.length === 0) {
      return ''
    }

    // Convert to Date objects and find the most recent
    const dates = receivedMatches
      .map(match => new Date(match[1]))
      .sort((a, b) => b.getTime() - a.getTime())

    return dates[0].toLocaleDateString('en-US')
  }

  private static extractAmountDue(text: string): string {
    const match = text.match(/Amount Due\s+\$([\d,]+\.\d{2})/i)
    if (!match) {
      throw new Error('Amount due not found in STMT PDF')
    }
    return match[1].replace(',', '')
  }

  private static extractVisitDates(text: string): string[] {
    // Extract dates that appear to be service dates
    const dateMatches = [...text.matchAll(/(\d{1,2}\/\d{1,2}\/\d{4})/g)]
    return dateMatches.map(match => match[1])
  }

  private static extractServiceCodes(text: string): string[] {
    // Extract CPT codes
    const codeMatches = [...text.matchAll(/CPT\s*:\s*(\d{5})/gi)]
    return codeMatches.map(match => match[1])
  }
} 