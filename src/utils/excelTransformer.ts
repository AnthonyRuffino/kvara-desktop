import { PatientData, ExcelRowData } from '../types'
import { ValidationUtils } from './validation'

export class ExcelTransformer {
  /**
   * Transform patient data to Excel row format
   */
  static transformToExcelRow(patientData: PatientData): ExcelRowData {
    const { demos, stmt } = patientData
    const isMinor = ValidationUtils.isMinor(demos.dateOfBirth)
    const today = new Date().toLocaleDateString('en-US')

    return {
      accountNumber: demos.accountNumber,
      creditor: 'Mathers Clinic, LLC',
      merchantProvider: 'Mathers Clinic, LLC',
      openDate: ValidationUtils.formatDateForExcel(today),
      lastPaymentDate: stmt.lastPaymentDate,
      lastStatementDate: '',
      chargeOffDate: '',
      itemizationDate: 'last statement',
      delinquencyDate: '',
      balanceAsOfItemization: stmt.amountDue,
      blankK: '',
      blankL: '',
      blankM: '',
      totalDue: stmt.amountDue,
      debtDescription: 'deductible / coinsurance / copay',
      responsiblePartyName: demos.patientName,
      responsiblePartyDOB: demos.dateOfBirth,
      addressStreet: demos.address.street,
      addressCity: demos.address.city,
      addressState: demos.address.state,
      addressZip: demos.address.zip,
      responsiblePartyPhone: demos.phoneNumber,
      email: demos.email,
      blankX: '',
      blankZ: '',
      staticAA: 'N',
      staticAB: 'N',
      patientName: demos.patientName,
      patientDOB: demos.dateOfBirth,
      isMinor
    }
  }

  /**
   * Convert Excel row data to array format for xlsx library
   */
  static toArray(rowData: ExcelRowData): (string | number)[] {
    return [
      rowData.accountNumber,
      rowData.creditor,
      rowData.merchantProvider,
      rowData.openDate,
      rowData.lastPaymentDate,
      rowData.lastStatementDate,
      rowData.chargeOffDate,
      rowData.itemizationDate,
      rowData.delinquencyDate,
      rowData.balanceAsOfItemization,
      rowData.blankK,
      rowData.blankL,
      rowData.blankM,
      rowData.totalDue,
      rowData.debtDescription,
      rowData.responsiblePartyName,
      rowData.responsiblePartyDOB,
      rowData.addressStreet,
      rowData.addressCity,
      rowData.addressState,
      rowData.addressZip,
      rowData.responsiblePartyPhone,
      rowData.email,
      rowData.blankX,
      rowData.blankZ,
      rowData.staticAA,
      rowData.staticAB,
      rowData.patientName,
      rowData.patientDOB
    ]
  }
} 