# Phase 04: Testing, Error Handling & Deployment

## Overview
Implement comprehensive testing, improve error handling and validation, and prepare the application for deployment. This phase focuses on ensuring reliability, user experience, and production readiness.

## Objectives
- Implement comprehensive error handling and validation
- Create automated tests for core functionality
- Add logging and debugging capabilities
- Prepare application for production deployment
- Create user documentation and help system

## Detailed Steps

### Step 1: Enhanced Error Handling
Create `src/utils/errorHandler.ts`:
```typescript
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
}

export class ErrorHandler {
  private static errors: AppError[] = []
  private static maxErrors = 100

  /**
   * Log and handle application errors
   */
  static handleError(error: Error | string, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date(),
      userId: this.getCurrentUserId()
    }

    this.errors.push(appError)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', appError)
    }

    return appError
  }

  /**
   * Get all logged errors
   */
  static getErrors(): AppError[] {
    return [...this.errors]
  }

  /**
   * Clear error log
   */
  static clearErrors(): void {
    this.errors = []
  }

  /**
   * Export errors for debugging
   */
  static exportErrors(): string {
    return JSON.stringify(this.errors, null, 2)
  }

  private static getErrorCode(error: Error | string): string {
    if (typeof error === 'string') {
      return 'GENERIC_ERROR'
    }

    // Map common error types to codes
    if (error.message.includes('PDF')) return 'PDF_PROCESSING_ERROR'
    if (error.message.includes('Excel')) return 'EXCEL_EXPORT_ERROR'
    if (error.message.includes('file')) return 'FILE_IO_ERROR'
    
    return 'UNKNOWN_ERROR'
  }

  private static getCurrentUserId(): string | undefined {
    // In a real app, this would get the current user ID
    return 'default-user'
  }
}
```

### Step 2: Create Validation Service
Create `src/services/validationService.ts`:
```typescript
import { PatientData, DemosData, StmtData } from '@/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ValidationService {
  /**
   * Validate complete patient data
   */
  static validatePatientData(patient: PatientData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate DEMOS data
    const demosValidation = this.validateDemosData(patient.demos)
    errors.push(...demosValidation.errors)
    warnings.push(...demosValidation.warnings)

    // Validate STMT data
    const stmtValidation = this.validateStmtData(patient.stmt)
    errors.push(...stmtValidation.errors)
    warnings.push(...stmtValidation.warnings)

    // Cross-field validations
    const crossValidation = this.validateCrossFields(patient)
    errors.push(...crossValidation.errors)
    warnings.push(...crossValidation.warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate DEMOS data
   */
  static validateDemosData(demos: DemosData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!demos.accountNumber) {
      errors.push('Account number is required')
    } else if (!/^\d+$/.test(demos.accountNumber)) {
      errors.push('Account number must contain only digits')
    }

    if (!demos.patientName) {
      errors.push('Patient name is required')
    } else if (demos.patientName.length < 2) {
      errors.push('Patient name is too short')
    }

    if (!demos.dateOfBirth) {
      errors.push('Date of birth is required')
    } else if (!this.isValidDate(demos.dateOfBirth)) {
      errors.push('Invalid date of birth format')
    }

    if (!demos.phoneNumber) {
      errors.push('Phone number is required')
    } else if (!this.isValidPhone(demos.phoneNumber)) {
      warnings.push('Phone number format may be invalid')
    }

    // Address validation
    if (!demos.address.street) {
      errors.push('Street address is required')
    }

    if (!demos.address.city) {
      errors.push('City is required')
    }

    if (!demos.address.state) {
      errors.push('State is required')
    } else if (!/^[A-Z]{2}$/.test(demos.address.state)) {
      errors.push('State must be 2-letter code')
    }

    if (!demos.address.zip) {
      errors.push('ZIP code is required')
    } else if (!/^\d{5}(-\d{4})?$/.test(demos.address.zip)) {
      warnings.push('ZIP code format may be invalid')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * Validate STMT data
   */
  static validateStmtData(stmt: StmtData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!stmt.amountDue) {
      errors.push('Amount due is required')
    } else if (!this.isValidAmount(stmt.amountDue)) {
      errors.push('Invalid amount due format')
    }

    if (stmt.lastPaymentDate && !this.isValidDate(stmt.lastPaymentDate)) {
      warnings.push('Last payment date format may be invalid')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * Cross-field validations
   */
  static validateCrossFields(patient: PatientData): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for minor patients
    if (this.isMinor(patient.demos.dateOfBirth)) {
      warnings.push('Patient is a minor - verify responsible party information')
    }

    // Check for future dates
    if (this.isFutureDate(patient.demos.dateOfBirth)) {
      errors.push('Date of birth cannot be in the future')
    }

    if (patient.stmt.lastPaymentDate && this.isFutureDate(patient.stmt.lastPaymentDate)) {
      errors.push('Last payment date cannot be in the future')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  // Helper methods
  private static isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  }

  private static isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return /^\d{10,11}$/.test(cleanPhone)
  }

  private static isValidAmount(amount: string): boolean {
    return /^\d+(\.\d{2})?$/.test(amount)
  }

  private static isMinor(dateOfBirth: string): boolean {
    const [month, day, year] = dateOfBirth.split('/').map(Number)
    const dobDate = new Date(year, month - 1, day)
    const age = (new Date().getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return age < 18
  }

  private static isFutureDate(dateStr: string): boolean {
    const date = new Date(dateStr)
    return date > new Date()
  }
}
```

### Step 3: Create Logging Service
Create `src/services/loggingService.ts`:
```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: string
  data?: any
}

export class LoggingService {
  private static logs: LogEntry[] = []
  private static maxLogs = 1000
  private static currentLevel = LogLevel.INFO

  /**
   * Set logging level
   */
  static setLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  /**
   * Log debug message
   */
  static debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  /**
   * Log info message
   */
  static info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data)
  }

  /**
   * Log warning message
   */
  static warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data)
  }

  /**
   * Log error message
   */
  static error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data)
  }

  /**
   * Get logs by level
   */
  static getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level)
    }
    return [...this.logs]
  }

  /**
   * Export logs
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Clear logs
   */
  static clearLogs(): void {
    this.logs = []
  }

  private static log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level < this.currentLevel) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${entry.timestamp.toISOString()}] ${LogLevel[level]}:`
      if (context) {
        console.log(`${prefix} [${context}] ${message}`, data || '')
      } else {
        console.log(`${prefix} ${message}`, data || '')
      }
    }
  }
}
```

### Step 4: Create Test Suite
Create `src/tests/pdfProcessor.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { PdfProcessor } from '@/utils/pdfProcessor'
import { DemosParser } from '@/utils/demosParser'
import { StmtParser } from '@/utils/stmtParser'

describe('PDF Processing', () => {
  describe('PdfProcessor', () => {
    it('should extract patient ID from filename', () => {
      expect(PdfProcessor.extractPatientId('18420_demos.pdf')).toBe('18420')
      expect(PdfProcessor.extractPatientId('055527_stmt.pdf')).toBe('055527')
    })

    it('should determine PDF type from filename', () => {
      expect(PdfProcessor.getPdfType('18420_demos.pdf')).toBe('DEMOS')
      expect(PdfProcessor.getPdfType('055527_stmt.pdf')).toBe('STMT')
    })

    it('should group files by patient ID', () => {
      const files = [
        '18420_demos.pdf',
        '18420_stmt.pdf',
        '055527_demos.pdf',
        '055527_stmt.pdf'
      ]

      const grouped = PdfProcessor.groupFilesByPatient(files)
      
      expect(grouped.get('18420')).toEqual({
        demos: '18420_demos.pdf',
        stmt: '18420_stmt.pdf'
      })
      
      expect(grouped.get('055527')).toEqual({
        demos: '055527_demos.pdf',
        stmt: '055527_stmt.pdf'
      })
    })
  })

  describe('DemosParser', () => {
    const sampleDemosText = `
      CHRISTOPHER RIVERA - Patient Demographics
      Account Number: 18420
      Date of Birth: 01/01/2000
      Cell Phone Number: (555) 123-4567
      Email: chris@example.com
      Address: 123 Main St.
      Springfield, IL 62704
    `

    it('should parse DEMOS data correctly', () => {
      const result = DemosParser.parse(sampleDemosText)

      expect(result.accountNumber).toBe('18420')
      expect(result.patientName).toBe('CHRISTOPHER RIVERA')
      expect(result.dateOfBirth).toBe('01/01/2000')
      expect(result.phoneNumber).toBe('(555) 123-4567')
      expect(result.email).toBe('chris@example.com')
      expect(result.address.street).toBe('123 Main St.')
      expect(result.address.city).toBe('Springfield')
      expect(result.address.state).toBe('IL')
      expect(result.address.zip).toBe('62704')
    })
  })

  describe('StmtParser', () => {
    const sampleStmtText = `
      Statement Summary
      Amount Due: $824.00
      Received Date 12/02/2024
      Received Date 10/28/2024
      CPT: 99213
      CPT: 99214
    `

    it('should parse STMT data correctly', () => {
      const result = StmtParser.parse(sampleStmtText)

      expect(result.amountDue).toBe('824.00')
      expect(result.lastPaymentDate).toBe('12/02/2024')
      expect(result.serviceCodes).toContain('99213')
      expect(result.serviceCodes).toContain('99214')
    })
  })
})
```

### Step 5: Create Error Display Component
Create `src/components/ErrorDisplay.vue`:
```vue
<template>
  <div class="error-display">
    <v-expansion-panels v-if="errors.length > 0">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon left color="error">mdi-alert-circle</v-icon>
          {{ errors.length }} Error{{ errors.length > 1 ? 's' : '' }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list dense>
            <v-list-item
              v-for="(error, index) in errors"
              :key="index"
              class="error-item"
            >
              <v-list-item-icon>
                <v-icon color="error" small>mdi-close-circle</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="error-message">
                  {{ error.message }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="error.context">
                  {{ error.context }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-2"></v-divider>
          
          <div class="text-center">
            <v-btn
              color="primary"
              small
              @click="exportErrors"
            >
              Export Error Log
            </v-btn>
            <v-btn
              color="secondary"
              small
              @click="clearErrors"
              class="ml-2"
            >
              Clear Errors
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'
import { ErrorHandler } from '@/utils/errorHandler'

const pdfStore = usePdfStore()

const errors = computed(() => {
  const appErrors = ErrorHandler.getErrors()
  const patientErrors = Array.from(pdfStore.patients.values())
    .flatMap(patient => patient.errors.map(error => ({
      message: error,
      context: `Patient ${patient.patientId}`
    })))
  
  return [...appErrors, ...patientErrors]
})

const exportErrors = () => {
  const errorData = ErrorHandler.exportErrors()
  const blob = new Blob([errorData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

const clearErrors = () => {
  ErrorHandler.clearErrors()
  pdfStore.clearData()
}
</script>

<style scoped>
.error-item {
  border-left: 3px solid #f44336;
  margin-bottom: 8px;
}

.error-message {
  color: #f44336;
  font-weight: 500;
}
</style>
```

### Step 6: Create Settings Dialog
Create `src/components/SettingsDialog.vue`:
```vue
<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>
        <v-icon left>mdi-cog</v-icon>
        Application Settings
      </v-card-title>
      
      <v-card-text>
        <v-tabs v-model="activeTab">
          <v-tab value="general">General</v-tab>
          <v-tab value="processing">Processing</v-tab>
          <v-tab value="export">Export</v-tab>
          <v-tab value="debug">Debug</v-tab>
        </v-tabs>
        
        <v-window v-model="activeTab" class="mt-4">
          <v-window-item value="general">
            <v-form ref="generalForm">
              <v-text-field
                v-model="settings.defaultFilename"
                label="Default Export Filename"
                hint="Default filename for Excel exports"
                persistent-hint
              ></v-text-field>
              
              <v-checkbox
                v-model="settings.autoSave"
                label="Auto-save processed data"
              ></v-checkbox>
              
              <v-checkbox
                v-model="settings.showConfirmations"
                label="Show confirmation dialogs"
              ></v-checkbox>
            </v-form>
          </v-window-item>
          
          <v-window-item value="processing">
            <v-form ref="processingForm">
              <v-select
                v-model="settings.maxConcurrentFiles"
                :items="[1, 2, 4, 8, 16]"
                label="Max Concurrent File Processing"
                hint="Number of files to process simultaneously"
                persistent-hint
              ></v-select>
              
              <v-checkbox
                v-model="settings.validateOnProcess"
                label="Validate data during processing"
              ></v-checkbox>
              
              <v-checkbox
                v-model="settings.autoFlagMinors"
                label="Automatically flag minor patients"
              ></v-checkbox>
            </v-form>
          </v-window-item>
          
          <v-window-item value="export">
            <v-form ref="exportForm">
              <v-select
                v-model="settings.defaultExportType"
                :items="exportTypeOptions"
                label="Default Export Type"
              ></v-select>
              
              <v-checkbox
                v-model="settings.includeHeaders"
                label="Include headers by default"
              ></v-checkbox>
              
              <v-checkbox
                v-model="settings.onlySuccessful"
                label="Export only successful records by default"
              ></v-checkbox>
            </v-form>
          </v-window-item>
          
          <v-window-item value="debug">
            <v-form ref="debugForm">
              <v-select
                v-model="settings.logLevel"
                :items="logLevelOptions"
                label="Log Level"
              ></v-select>
              
              <v-checkbox
                v-model="settings.enableDebugMode"
                label="Enable debug mode"
              ></v-checkbox>
              
              <v-btn
                color="primary"
                @click="exportLogs"
                class="mt-4"
              >
                Export Logs
              </v-btn>
              
              <v-btn
                color="secondary"
                @click="clearLogs"
                class="mt-4 ml-2"
              >
                Clear Logs
              </v-btn>
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="resetSettings">
          Reset to Defaults
        </v-btn>
        <v-btn color="primary" @click="saveSettings">
          Save Settings
        </v-btn>
        <v-btn @click="dialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LoggingService, LogLevel } from '@/services/loggingService'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('general')

const settings = ref({
  defaultFilename: 'collections_export',
  autoSave: true,
  showConfirmations: true,
  maxConcurrentFiles: 4,
  validateOnProcess: true,
  autoFlagMinors: true,
  defaultExportType: 'new',
  includeHeaders: true,
  onlySuccessful: true,
  logLevel: LogLevel.INFO,
  enableDebugMode: false
})

const exportTypeOptions = [
  { text: 'Create new file', value: 'new' },
  { text: 'Append to existing', value: 'append' },
  { text: 'Overwrite existing', value: 'overwrite' }
]

const logLevelOptions = [
  { text: 'Debug', value: LogLevel.DEBUG },
  { text: 'Info', value: LogLevel.INFO },
  { text: 'Warning', value: LogLevel.WARN },
  { text: 'Error', value: LogLevel.ERROR }
]

const saveSettings = () => {
  // Save settings to localStorage or config file
  localStorage.setItem('kvara-settings', JSON.stringify(settings.value))
  LoggingService.setLevel(settings.value.logLevel)
  dialog.value = false
}

const resetSettings = () => {
  settings.value = {
    defaultFilename: 'collections_export',
    autoSave: true,
    showConfirmations: true,
    maxConcurrentFiles: 4,
    validateOnProcess: true,
    autoFlagMinors: true,
    defaultExportType: 'new',
    includeHeaders: true,
    onlySuccessful: true,
    logLevel: LogLevel.INFO,
    enableDebugMode: false
  }
}

const exportLogs = () => {
  const logData = LoggingService.exportLogs()
  const blob = new Blob([logData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `kvara-logs-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

const clearLogs = () => {
  LoggingService.clearLogs()
}
</script>
```

### Step 7: Create Build Configuration
Update `electron-builder.json`:
```json
{
  "appId": "com.kvara.desktop",
  "productName": "Kvara Desktop",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": "dmg",
    "icon": "build/icon.icns"
  },
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  },
  "linux": {
    "target": "AppImage",
    "icon": "build/icon.png"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  },
  "publish": {
    "provider": "github",
    "releaseType": "release"
  }
}
```

### Step 8: Create Package Scripts
Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "dist": "npm run build && electron-builder",
    "dist:win": "npm run build && electron-builder --win",
    "dist:mac": "npm run build && electron-builder --mac",
    "dist:linux": "npm run build && electron-builder --linux",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts,.vue",
    "lint:fix": "eslint src --ext .ts,.vue --fix",
    "type-check": "vue-tsc --noEmit"
  }
}
```

## Deliverables
- [ ] Comprehensive error handling system
- [ ] Data validation service with detailed rules
- [ ] Logging service with configurable levels
- [ ] Automated test suite for core functionality
- [ ] Error display component with export capabilities
- [ ] Settings dialog with configuration options
- [ ] Production build configuration
- [ ] User documentation and help system

## Success Criteria
1. All core functionality has comprehensive error handling
2. Data validation catches common issues and provides clear feedback
3. Logging system provides useful debugging information
4. Test suite covers critical functionality with >80% coverage
5. Application builds successfully for all target platforms
6. Settings are persistent and configurable
7. Error messages are user-friendly and actionable

## Testing Checklist
- [ ] Test with all provided PDF samples
- [ ] Test error handling with malformed PDFs
- [ ] Test validation with invalid data
- [ ] Test Excel export with various configurations
- [ ] Test application on target platforms
- [ ] Test settings persistence
- [ ] Test logging and error export functionality

## Deployment Notes
- Build and test on target platforms (Windows, macOS, Linux)
- Create installer packages for each platform
- Test installation and uninstallation process
- Verify all functionality works in packaged application
- Create user documentation and help files

## Next Steps
After completing Phase 04, the application will be ready for production use. Future phases can include:
- Additional medical billing tools and features
- Integration with external systems
- Advanced reporting and analytics
- Multi-user support and data sharing 