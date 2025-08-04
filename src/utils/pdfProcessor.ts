import * as pdfParse from 'pdf-parse'
import * as fs from 'fs-extra'

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