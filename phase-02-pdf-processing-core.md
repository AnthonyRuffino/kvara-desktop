# Phase 02: PDF Processing Core

## Overview
Implement the core PDF processing functionality including text extraction, data parsing, and the foundation for Excel export. This phase focuses on the backend logic and data structures.

## Objectives
- Create TypeScript interfaces for data structures
- Implement PDF text extraction functionality
- Build regex-based data parsers for DEMOS and STMT PDFs
- Create utility functions for data validation and transformation
- Set up Pinia store for state management

## Detailed Steps

### Step 1: Define TypeScript Interfaces
Create `src/types/index.ts`:
```typescript
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
```

### Step 2: Create PDF Processing Utilities
Create `src/utils/pdfProcessor.ts`:
```typescript
import * as pdfParse from 'pdf-parse'
import * as fs from 'fs-extra'
import { PdfFile, DemosData, StmtData } from '@/types'

export class PdfProcessor {
  /**
   * Extract text content from PDF file
   */
  static async extractText(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath)
      const data = await pdfParse(dataBuffer)
      return data.text
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error}`)
    }
  }

  /**
   * Extract patient ID from filename
   */
  static extractPatientId(filename: string): string {
    const match = filename.match(/^(\d+)_/)
    if (!match) {
      throw new Error(`Invalid filename format: ${filename}`)
    }
    return match[1]
  }

  /**
   * Determine PDF type from filename
   */
  static getPdfType(filename: string): 'DEMOS' | 'STMT' {
    if (filename.includes('demos')) return 'DEMOS'
    if (filename.includes('stmt')) return 'STMT'
    throw new Error(`Cannot determine PDF type from filename: ${filename}`)
  }

  /**
   * Group PDF files by patient ID
   */
  static groupFilesByPatient(files: string[]): Map<string, { demos?: string, stmt?: string }> {
    const grouped = new Map<string, { demos?: string, stmt?: string }>()
    
    for (const file of files) {
      const patientId = this.extractPatientId(file)
      const type = this.getPdfType(file)
      
      if (!grouped.has(patientId)) {
        grouped.set(patientId, {})
      }
      
      const patientFiles = grouped.get(patientId)!
      if (type === 'DEMOS') {
        patientFiles.demos = file
      } else {
        patientFiles.stmt = file
      }
    }
    
    return grouped
  }
}
```

### Step 3: Implement DEMOS Data Parser
Create `src/utils/demosParser.ts`:
```typescript
import { DemosData } from '@/types'

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
```

### Step 4: Implement STMT Data Parser
Create `src/utils/stmtParser.ts`:
```typescript
import { StmtData } from '@/types'

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
```

### Step 5: Create Data Validation Utilities
Create `src/utils/validation.ts`:
```typescript
import { DemosData, StmtData, PatientData } from '@/types'

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
```

### Step 6: Create Pinia Store for State Management
Create `src/stores/pdfStore.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PatientData, PdfFile } from '@/types'
import { PdfProcessor } from '@/utils/pdfProcessor'
import { DemosParser } from '@/utils/demosParser'
import { StmtParser } from '@/utils/stmtParser'
import { ValidationUtils } from '@/utils/validation'

export const usePdfStore = defineStore('pdf', () => {
  const patients = ref<Map<string, PatientData>>(new Map())
  const isProcessing = ref(false)
  const currentProgress = ref(0)
  const totalFiles = ref(0)

  const processedPatients = computed(() => {
    return Array.from(patients.value.values()).filter(p => p.processed)
  })

  const patientsWithErrors = computed(() => {
    return Array.from(patients.value.values()).filter(p => p.errors.length > 0)
  })

  /**
   * Process uploaded PDF files
   */
  async function processFiles(filePaths: string[]) {
    isProcessing.value = true
    currentProgress.value = 0
    totalFiles.value = filePaths.length

    try {
      const groupedFiles = PdfProcessor.groupFilesByPatient(filePaths)
      
      for (const [patientId, files] of groupedFiles) {
        if (!files.demos || !files.stmt) {
          const errors = []
          if (!files.demos) errors.push('Missing DEMOS PDF')
          if (!files.stmt) errors.push('Missing STMT PDF')
          
          patients.value.set(patientId, {
            patientId,
            demos: {} as any,
            stmt: {} as any,
            processed: false,
            errors
          })
          continue
        }

        await processPatientFiles(patientId, files.demos, files.stmt)
        currentProgress.value += 2
      }
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Process individual patient's PDF pair
   */
  async function processPatientFiles(patientId: string, demosPath: string, stmtPath: string) {
    try {
      // Extract text from both PDFs
      const demosText = await PdfProcessor.extractText(demosPath)
      const stmtText = await PdfProcessor.extractText(stmtPath)

      // Parse data
      const demosData = DemosParser.parse(demosText)
      const stmtData = StmtParser.parse(stmtText)

      // Validate data
      const demosErrors = ValidationUtils.validateDemosData(demosData)
      const stmtErrors = ValidationUtils.validateStmtData(stmtData)
      const errors = [...demosErrors, ...stmtErrors]

      // Store patient data
      patients.value.set(patientId, {
        patientId,
        demos: demosData,
        stmt: stmtData,
        processed: true,
        errors
      })
    } catch (error) {
      patients.value.set(patientId, {
        patientId,
        demos: {} as any,
        stmt: {} as any,
        processed: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    }
  }

  /**
   * Clear all processed data
   */
  function clearData() {
    patients.value.clear()
    currentProgress.value = 0
    totalFiles.value = 0
  }

  return {
    patients,
    isProcessing,
    currentProgress,
    totalFiles,
    processedPatients,
    patientsWithErrors,
    processFiles,
    clearData
  }
})
```

### Step 7: Create Excel Data Transformer
Create `src/utils/excelTransformer.ts`:
```typescript
import { PatientData, ExcelRowData } from '@/types'
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
```

## Deliverables
- [ ] TypeScript interfaces for all data structures
- [ ] PDF text extraction utility
- [ ] DEMOS PDF parser with regex patterns
- [ ] STMT PDF parser with regex patterns
- [ ] Data validation utilities
- [ ] Pinia store for state management
- [ ] Excel data transformation utilities
- [ ] Minor patient detection logic

## Success Criteria
1. Successfully extract text from all provided PDF samples
2. Parse DEMOS data with 95%+ accuracy
3. Parse STMT data with 95%+ accuracy
4. Handle edge cases (missing data, malformed PDFs)
5. Properly detect minor patients
6. Transform data to correct Excel format

## Testing Notes
- Test with all provided PDF samples (18420, 055527, 059226, 059309)
- Validate regex patterns against actual PDF content
- Test error handling for missing or malformed data
- Verify minor patient detection logic

## Next Phase
Phase 03 will focus on implementing the user interface components and file upload functionality. 