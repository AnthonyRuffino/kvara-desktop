# Phase 03: User Interface & File Upload

## Overview
Implement the user interface components for file upload, progress tracking, data preview, and Excel export functionality. This phase focuses on creating an intuitive and responsive UI using Vue.js 3 and Vuetify.

## Objectives
- Create file upload interface with drag-and-drop support
- Implement progress tracking and status indicators
- Build data preview and validation display
- Add Excel export functionality
- Create responsive and user-friendly UI components

## Detailed Steps

### Step 1: Create Main Application Layout
Update `src/App.vue`:
```vue
<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>
        <v-icon left>mdi-file-pdf-box</v-icon>
        Kvara Desktop - PDF Extractor
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="showSettings = true">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-tabs v-model="activeTab" grow>
                <v-tab value="upload">
                  <v-icon left>mdi-upload</v-icon>
                  Upload PDFs
                </v-tab>
                <v-tab value="preview">
                  <v-icon left>mdi-eye</v-icon>
                  Preview Data
                </v-tab>
                <v-tab value="export">
                  <v-icon left>mdi-download</v-icon>
                  Export Excel
                </v-tab>
              </v-tabs>

              <v-card-text>
                <v-window v-model="activeTab">
                  <v-window-item value="upload">
                    <FileUploadTab />
                  </v-window-item>
                  
                  <v-window-item value="preview">
                    <DataPreviewTab />
                  </v-window-item>
                  
                  <v-window-item value="export">
                    <ExcelExportTab />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Settings Dialog -->
    <SettingsDialog v-model="showSettings" />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUploadTab from '@/components/FileUploadTab.vue'
import DataPreviewTab from '@/components/DataPreviewTab.vue'
import ExcelExportTab from '@/components/ExcelExportTab.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'

const activeTab = ref('upload')
const showSettings = ref(false)
</script>
```

### Step 2: Create File Upload Component
Create `src/components/FileUploadTab.vue`:
```vue
<template>
  <div class="file-upload-container">
    <v-row>
      <v-col cols="12" md="8">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="primary">mdi-file-pdf-box</v-icon>
            Upload PDF Files
          </v-card-title>
          
          <v-card-text>
            <p class="text-body-2 mb-4">
              Upload pairs of DEMOS and STMT PDF files. Files should be named in the format:
              <code>PATIENTID_demos.pdf</code> and <code>PATIENTID_stmt.pdf</code>
            </p>

            <!-- Drag and Drop Zone -->
            <v-card
              outlined
              :class="['upload-zone', { 'upload-zone--active': isDragOver }]"
              @drop="handleDrop"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @click="triggerFileInput"
            >
              <v-card-text class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4">
                  mdi-cloud-upload
                </v-icon>
                <h3 class="text-h6 mb-2">
                  {{ isDragOver ? 'Drop files here' : 'Drag and drop PDF files here' }}
                </h3>
                <p class="text-body-2 text-grey">
                  or click to browse files
                </p>
                <v-btn
                  color="primary"
                  class="mt-4"
                  @click.stop="triggerFileInput"
                >
                  Browse Files
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".pdf"
              class="d-none"
              @change="handleFileSelect"
            >
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>
            <v-icon left>mdi-information</v-icon>
            Instructions
          </v-card-title>
          
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small color="primary">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Upload PDF pairs</v-list-item-title>
                  <v-list-item-subtitle>DEMOS and STMT files for each patient</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small color="primary">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Correct naming</v-list-item-title>
                  <v-list-item-subtitle>Files must follow the naming convention</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-icon>
                  <v-icon small color="primary">mdi-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Review data</v-list-item-title>
                  <v-list-item-subtitle>Check extracted data before export</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Processing Progress -->
    <ProcessingProgress v-if="pdfStore.isProcessing" />

    <!-- File List -->
    <FileList v-if="uploadedFiles.length > 0" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'
import ProcessingProgress from './ProcessingProgress.vue'
import FileList from './FileList.vue'

const pdfStore = usePdfStore()
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

const uploadedFiles = computed(() => {
  return Array.from(pdfStore.patients.values())
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  event.preventDefault()
  
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    processFiles(pdfFiles)
  }
}

const processFiles = async (files: File[]) => {
  const filePaths = files.map(file => file.path)
  await pdfStore.processFiles(filePaths)
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
}

.upload-zone--active {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.1);
}
</style>
```

### Step 3: Create Processing Progress Component
Create `src/components/ProcessingProgress.vue`:
```vue
<template>
  <v-card class="mt-4" color="info" dark>
    <v-card-text>
      <v-row align="center">
        <v-col cols="12" md="8">
          <h3 class="text-h6 mb-2">Processing PDF Files</h3>
          <v-progress-linear
            :value="progressPercentage"
            height="20"
            color="white"
            class="mb-2"
          >
            <template v-slot:default="{ value }">
              <strong>{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
          <p class="text-body-2">
            Processed {{ pdfStore.currentProgress }} of {{ pdfStore.totalFiles }} files
          </p>
        </v-col>
        
        <v-col cols="12" md="4" class="text-center">
          <v-btn
            color="error"
            @click="cancelProcessing"
            :disabled="!canCancel"
          >
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'

const pdfStore = usePdfStore()

const progressPercentage = computed(() => {
  if (pdfStore.totalFiles === 0) return 0
  return (pdfStore.currentProgress / pdfStore.totalFiles) * 100
})

const canCancel = computed(() => {
  return pdfStore.isProcessing && pdfStore.currentProgress > 0
})

const cancelProcessing = () => {
  // Implementation for canceling processing
  pdfStore.clearData()
}
</script>
```

### Step 4: Create File List Component
Create `src/components/FileList.vue`:
```vue
<template>
  <v-card class="mt-4">
    <v-card-title>
      <v-icon left>mdi-file-document</v-icon>
      Uploaded Files
      <v-spacer></v-spacer>
      <v-btn
        color="error"
        small
        @click="clearAll"
        :disabled="pdfStore.isProcessing"
      >
        Clear All
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="fileItems"
        :loading="pdfStore.isProcessing"
        class="elevation-1"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            small
            text-color="white"
          >
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.errors="{ item }">
          <div v-if="item.errors.length > 0">
            <v-chip
              color="error"
              small
              @click="showErrors(item)"
            >
              {{ item.errors.length }} errors
            </v-chip>
          </div>
          <span v-else class="text-success">✓</span>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            small
            @click="viewDetails(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            color="error"
            @click="removeFile(item.patientId)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'

const pdfStore = usePdfStore()

const headers = [
  { text: 'Patient ID', value: 'patientId' },
  { text: 'Patient Name', value: 'patientName' },
  { text: 'Status', value: 'status' },
  { text: 'Errors', value: 'errors' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const fileItems = computed(() => {
  return Array.from(pdfStore.patients.values()).map(patient => ({
    patientId: patient.patientId,
    patientName: patient.processed ? patient.demos.patientName : 'Processing...',
    status: patient.processed ? 'Processed' : 'Processing',
    errors: patient.errors,
    ...patient
  }))
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processed': return 'success'
    case 'Processing': return 'warning'
    default: return 'error'
  }
}

const showErrors = (item: any) => {
  // Show error dialog
  console.log('Errors:', item.errors)
}

const viewDetails = (item: any) => {
  // Navigate to preview tab
  console.log('View details:', item)
}

const removeFile = (patientId: string) => {
  pdfStore.patients.delete(patientId)
}

const clearAll = () => {
  pdfStore.clearData()
}
</script>
```

### Step 5: Create Data Preview Component
Create `src/components/DataPreviewTab.vue`:
```vue
<template>
  <div class="data-preview-container">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-eye</v-icon>
            Data Preview
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="refreshData"
              :disabled="pdfStore.isProcessing"
            >
              <v-icon left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="pdfStore.processedPatients.length === 0"
              type="info"
              class="mb-4"
            >
              No processed data available. Please upload and process PDF files first.
            </v-alert>

            <div v-else>
              <!-- Summary Statistics -->
              <v-row class="mb-4">
                <v-col cols="12" md="3">
                  <v-card outlined>
                    <v-card-text class="text-center">
                      <div class="text-h4 text-primary">{{ totalPatients }}</div>
                      <div class="text-body-2">Total Patients</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card outlined>
                    <v-card-text class="text-center">
                      <div class="text-h4 text-success">{{ successfulPatients }}</div>
                      <div class="text-body-2">Successful</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card outlined>
                    <v-card-text class="text-center">
                      <div class="text-h4 text-warning">{{ patientsWithErrors.length }}</div>
                      <div class="text-body-2">With Errors</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card outlined>
                    <v-card-text class="text-center">
                      <div class="text-h4 text-info">{{ minorPatients }}</div>
                      <div class="text-body-2">Minors</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Patient Data Table -->
              <v-data-table
                :headers="previewHeaders"
                :items="previewItems"
                :search="search"
                :loading="pdfStore.isProcessing"
                class="elevation-1"
                multi-sort
              >
                <template v-slot:top>
                  <v-text-field
                    v-model="search"
                    label="Search patients"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    class="mx-4"
                  ></v-text-field>
                </template>
                
                <template v-slot:item.isMinor="{ item }">
                  <v-chip
                    :color="item.isMinor ? 'warning' : 'success'"
                    small
                    text-color="white"
                  >
                    {{ item.isMinor ? 'Minor' : 'Adult' }}
                  </v-chip>
                </template>
                
                <template v-slot:item.errors="{ item }">
                  <v-chip
                    v-if="item.errors.length > 0"
                    color="error"
                    small
                    @click="showPatientErrors(item)"
                  >
                    {{ item.errors.length }} errors
                  </v-chip>
                  <span v-else class="text-success">✓</span>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon
                    small
                    @click="editPatient(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Patient Edit Dialog -->
    <PatientEditDialog
      v-model="showEditDialog"
      :patient="selectedPatient"
      @save="savePatientChanges"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'
import { ExcelTransformer } from '@/utils/excelTransformer'
import PatientEditDialog from './PatientEditDialog.vue'

const pdfStore = usePdfStore()
const search = ref('')
const showEditDialog = ref(false)
const selectedPatient = ref(null)

const previewHeaders = [
  { text: 'Patient ID', value: 'patientId' },
  { text: 'Name', value: 'patientName' },
  { text: 'Account #', value: 'accountNumber' },
  { text: 'DOB', value: 'dateOfBirth' },
  { text: 'Phone', value: 'phoneNumber' },
  { text: 'Amount Due', value: 'amountDue' },
  { text: 'Minor', value: 'isMinor' },
  { text: 'Errors', value: 'errors' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const previewItems = computed(() => {
  return pdfStore.processedPatients.map(patient => {
    const excelData = ExcelTransformer.transformToExcelRow(patient)
    return {
      patientId: patient.patientId,
      patientName: patient.demos.patientName,
      accountNumber: patient.demos.accountNumber,
      dateOfBirth: patient.demos.dateOfBirth,
      phoneNumber: patient.demos.phoneNumber,
      amountDue: patient.stmt.amountDue,
      isMinor: excelData.isMinor,
      errors: patient.errors,
      ...patient
    }
  })
})

const totalPatients = computed(() => pdfStore.processedPatients.length)
const successfulPatients = computed(() => 
  pdfStore.processedPatients.filter(p => p.errors.length === 0).length
)
const minorPatients = computed(() => 
  previewItems.value.filter(p => p.isMinor).length
)

const refreshData = () => {
  // Refresh data if needed
}

const showPatientErrors = (patient: any) => {
  // Show error details
  console.log('Patient errors:', patient.errors)
}

const editPatient = (patient: any) => {
  selectedPatient.value = patient
  showEditDialog.value = true
}

const savePatientChanges = (updatedPatient: any) => {
  // Save changes to store
  pdfStore.patients.set(updatedPatient.patientId, updatedPatient)
  showEditDialog.value = false
}
</script>
```

### Step 6: Create Excel Export Component
Create `src/components/ExcelExportTab.vue`:
```vue
<template>
  <div class="excel-export-container">
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-microsoft-excel</v-icon>
            Export to Excel
          </v-card-title>
          
          <v-card-text>
            <v-form ref="exportForm" v-model="formValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="exportSettings.filename"
                    label="Excel Filename"
                    :rules="[v => !!v || 'Filename is required']"
                    hint="Enter filename without extension"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="exportSettings.exportType"
                    :items="exportTypeOptions"
                    label="Export Type"
                    :rules="[v => !!v || 'Export type is required']"
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12">
                  <v-checkbox
                    v-model="exportSettings.includeHeaders"
                    label="Include column headers"
                  ></v-checkbox>
                  
                  <v-checkbox
                    v-model="exportSettings.onlySuccessful"
                    label="Export only successful records (no errors)"
                  ></v-checkbox>
                  
                  <v-checkbox
                    v-model="exportSettings.flagMinors"
                    label="Flag minor patients in separate column"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-form>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="text-center">
              <v-btn
                color="primary"
                size="large"
                :disabled="!canExport"
                :loading="isExporting"
                @click="exportToExcel"
              >
                <v-icon left>mdi-download</v-icon>
                Export to Excel
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-information</v-icon>
            Export Summary
          </v-card-title>
          
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Total Records</v-list-item-title>
                  <v-list-item-subtitle>{{ totalRecords }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Will Export</v-list-item-title>
                  <v-list-item-subtitle>{{ recordsToExport }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Minor Patients</v-list-item-title>
                  <v-list-item-subtitle>{{ minorPatients }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePdfStore } from '@/stores/pdfStore'
import { ExcelExporter } from '@/utils/excelExporter'

const pdfStore = usePdfStore()
const exportForm = ref()
const formValid = ref(false)
const isExporting = ref(false)

const exportSettings = ref({
  filename: 'collections_export',
  exportType: 'append',
  includeHeaders: true,
  onlySuccessful: true,
  flagMinors: true
})

const exportTypeOptions = [
  { text: 'Create new file', value: 'new' },
  { text: 'Append to existing file', value: 'append' },
  { text: 'Overwrite existing file', value: 'overwrite' }
]

const totalRecords = computed(() => pdfStore.processedPatients.length)

const recordsToExport = computed(() => {
  if (exportSettings.value.onlySuccessful) {
    return pdfStore.processedPatients.filter(p => p.errors.length === 0).length
  }
  return totalRecords.value
})

const minorPatients = computed(() => {
  return pdfStore.processedPatients.filter(p => {
    // Check if patient is minor
    return false // TODO: Implement minor check
  }).length
})

const canExport = computed(() => {
  return formValid.value && recordsToExport.value > 0 && !isExporting.value
})

const exportToExcel = async () => {
  if (!exportForm.value.validate()) return
  
  isExporting.value = true
  
  try {
    const patientsToExport = exportSettings.value.onlySuccessful
      ? pdfStore.processedPatients.filter(p => p.errors.length === 0)
      : pdfStore.processedPatients
    
    await ExcelExporter.exportToFile(
      patientsToExport,
      exportSettings.value
    )
    
    // Show success message
    console.log('Export completed successfully')
  } catch (error) {
    console.error('Export failed:', error)
    // Show error message
  } finally {
    isExporting.value = false
  }
}
</script>
```

### Step 7: Create Excel Exporter Utility
Create `src/utils/excelExporter.ts`:
```typescript
import * as XLSX from 'xlsx'
import * as fs from 'fs-extra'
import { PatientData, ExcelRowData } from '@/types'
import { ExcelTransformer } from './excelTransformer'

export interface ExportSettings {
  filename: string
  exportType: 'new' | 'append' | 'overwrite'
  includeHeaders: boolean
  onlySuccessful: boolean
  flagMinors: boolean
}

export class ExcelExporter {
  /**
   * Export patient data to Excel file
   */
  static async exportToFile(
    patients: PatientData[],
    settings: ExportSettings
  ): Promise<void> {
    const filePath = `${settings.filename}.xlsx`
    
    // Transform data to Excel format
    const excelRows = patients.map(patient => 
      ExcelTransformer.transformToExcelRow(patient)
    )
    
    // Convert to array format
    const data = excelRows.map(row => ExcelTransformer.toArray(row))
    
    // Add headers if requested
    if (settings.includeHeaders) {
      const headers = this.getColumnHeaders()
      data.unshift(headers)
    }
    
    // Handle different export types
    let workbook: XLSX.WorkBook
    
    if (settings.exportType === 'append' && await fs.pathExists(filePath)) {
      // Load existing workbook
      const existingData = await fs.readFile(filePath)
      workbook = XLSX.read(existingData, { type: 'buffer' })
      
      // Get first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // Append new data
      XLSX.utils.sheet_add_aoa(worksheet, data, { origin: -1 })
    } else {
      // Create new workbook
      workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Collections')
    }
    
    // Write file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    await fs.writeFile(filePath, buffer)
  }
  
  /**
   * Get column headers for Excel
   */
  private static getColumnHeaders(): string[] {
    return [
      'Account Number',
      'Creditor',
      'Merchant/Provider/Facility Name',
      'Open Date/Date of Service',
      'Last Payment Date',
      'Last Statement Date',
      'Charge Off/Write-off Date',
      'Itemization Date',
      'Delinquency Date',
      'Balance as of Itemization Date',
      'K',
      'L',
      'M',
      'Total Due',
      'Debt Description',
      'Responsible Party Name',
      'Responsible Party DOB',
      'Address (Street)',
      'Address (City)',
      'Address (State)',
      'Address (Zip)',
      'Responsible Party Phone',
      'Email',
      'X',
      'Z',
      'AA',
      'AB',
      'Patient Name',
      'Patient DOB'
    ]
  }
}
```

## Deliverables
- [ ] Main application layout with tabbed interface
- [ ] File upload component with drag-and-drop
- [ ] Processing progress indicator
- [ ] File list with status and error display
- [ ] Data preview table with search and filtering
- [ ] Excel export component with configuration options
- [ ] Excel export utility
- [ ] Responsive and user-friendly UI

## Success Criteria
1. Users can easily upload PDF files via drag-and-drop or file picker
2. Progress is clearly displayed during processing
3. Data preview shows all extracted information clearly
4. Excel export works with all configuration options
5. UI is responsive and intuitive for non-technical users
6. Error handling and validation feedback is clear

## Testing Notes
- Test file upload with various file types and sizes
- Verify drag-and-drop functionality works correctly
- Test progress tracking with large numbers of files
- Validate Excel export with different settings
- Test responsive design on different screen sizes

## Next Phase
Phase 04 will focus on error handling, validation improvements, and final testing and deployment preparation. 