// PDF Processing Types
export interface PdfFile {
  path: string
  name: string
  type: 'DEMOS' | 'STMT'
  patientId: string
}

export interface PatientData {
  patientId: string
  demos: DemosData
  stmt: StmtData
  processed: boolean
  errors: string[]
}

// DEMOS PDF Data Structure
export interface DemosData {
  accountNumber: string
  patientName: string
  dateOfBirth: string
  phoneNumber: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
}

// STMT PDF Data Structure
export interface StmtData {
  lastPaymentDate: string
  amountDue: string
  visitDates: string[]
  serviceCodes: string[]
}

// Excel Export Data Structure
export interface ExcelRowData {
  accountNumber: string
  creditor: string
  merchantProvider: string
  openDate: string
  lastPaymentDate: string
  lastStatementDate: string
  chargeOffDate: string
  itemizationDate: string
  delinquencyDate: string
  balanceAsOfItemization: string
  blankK: string
  blankL: string
  blankM: string
  totalDue: string
  debtDescription: string
  responsiblePartyName: string
  responsiblePartyDOB: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  responsiblePartyPhone: string
  email: string
  blankX: string
  blankZ: string
  staticAA: string
  staticAB: string
  patientName: string
  patientDOB: string
  isMinor: boolean
} 