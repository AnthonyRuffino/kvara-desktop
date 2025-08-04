import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PatientData } from '../types'
import { PdfProcessor } from '../utils/pdfProcessor'
import { DemosParser } from '../utils/demosParser'
import { StmtParser } from '../utils/stmtParser'
import { ValidationUtils } from '../utils/validation'

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