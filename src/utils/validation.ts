import { DemosData, StmtData } from '../types'

export class ValidationUtils {
  /**
   * Validate DEMOS data
   */
  static validateDemosData(data: DemosData): string[] {
    const errors: string[] = []

    if (!data.accountNumber) errors.push('Account number is required')
    if (!data.patientName) errors.push('Patient name is required')
    if (!data.dateOfBirth) errors.push('Date of birth is required')
    if (!data.phoneNumber) errors.push('Phone number is required')
    if (!data.address.street) errors.push('Address is required')

    return errors
  }

  /**
   * Validate STMT data
   */
  static validateStmtData(data: StmtData): string[] {
    const errors: string[] = []

    if (!data.amountDue) errors.push('Amount due is required')

    return errors
  }

  /**
   * Check if patient is a minor
   */
  static isMinor(dateOfBirth: string): boolean {
    const [month, day, year] = dateOfBirth.split('/').map(Number)
    const dobDate = new Date(year, month - 1, day)
    const age = (new Date().getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return age < 18
  }

  /**
   * Format date for Excel
   */
  static formatDateForExcel(date: string): string {
    const [month, day, year] = date.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
} 