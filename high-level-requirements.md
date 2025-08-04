# High-Level Requirements: PDF-to-Spreadsheet Extractor

## Project Overview
An Electron desktop application that automates the extraction of patient data from PDF files (DEMOS and STMT) and exports the structured data to Excel spreadsheets for medical billing collections.

## Core Functionality
1. **PDF Upload & Processing**: Accept pairs of DEMOS and STMT PDF files
2. **Data Extraction**: Parse specific fields from each PDF type using regex patterns
3. **Data Mapping**: Transform extracted data to match Excel column requirements
4. **Excel Export**: Generate or append to Excel files with proper formatting
5. **Error Handling**: Validate data integrity and flag issues (e.g., minor patients)

## Technical Requirements

### Frontend Architecture
- **Framework**: Vue.js 3 with Composition API (modern, easy 2-way data binding)
- **Language**: TypeScript (type safety, better IDE support)
- **UI Library**: Vuetify 3 (Material Design components)
- **State Management**: Pinia (Vue 3's recommended state management)

### Backend/Electron
- **Runtime**: Electron with Node.js
- **PDF Processing**: pdf-parse library
- **Excel Handling**: xlsx library
- **File System**: fs-extra for enhanced file operations

### Data Flow
1. User uploads PDF pairs via drag-and-drop or file picker
2. Application groups files by patient ID (extracted from filename)
3. Each PDF pair is processed:
   - DEMOS PDF: Extract patient demographics
   - STMT PDF: Extract financial/visit data
4. Data is mapped to Excel column format
5. Results are exported to Excel file
6. Progress and errors are displayed to user

## Excel Column Mapping

| Column | Field | Source | Notes |
|--------|-------|--------|-------|
| A | Account Number | DEMOS PDF | Top left "Account Number" |
| B | Creditor | Static | Always "Mathers Clinic, LLC" |
| C | Merchant/Provider/Facility Name | Static | Always "Mathers Clinic, LLC" |
| D | Open Date/Date of Service | Dynamic | Current date (YYYY-MM-DD) |
| E | Last Payment Date | STMT PDF | Most recent "Received" date |
| F | Last Statement Date | Leave blank | - |
| G | Charge Off/Write-off Date | Leave blank | - |
| H | Itemization Date | Static | Always "last statement" |
| I | Delinquency Date | Leave blank | - |
| J | Balance as of Itemization Date | STMT PDF | "Amount Due" field |
| K-M | [Blank Columns] | Leave blank | - |
| N | Total Due | Same as column J | Copy value |
| O | Debt Description | Static | Always "deductible / coinsurance / copay" |
| P | Responsible Party Name | DEMOS PDF | Same as patient name |
| Q | Responsible Party DOB | DEMOS PDF | If < 18 → flag as minor |
| R | Address (Street) | DEMOS PDF | Street line only |
| S | Address (City) | DEMOS PDF | Parse from full address |
| T | Address (State) | DEMOS PDF | Parse from full address |
| U | Address (Zip) | DEMOS PDF | Parse from full address |
| V | Responsible Party Phone | DEMOS PDF | Cell or Home Phone Number |
| W | Email Address | DEMOS PDF | - |
| X, Z | [Blank Columns] | Leave blank | - |
| AA, AB | Static | Always "N" | - |
| AC | Patient Name | DEMOS PDF | Same as column P |
| AD | Patient DOB | DEMOS PDF | Same as column Q |
| AE-END | [Blank Columns] | Leave blank | - |

## Key Features

### Phase 1: Core PDF Processing
- PDF file upload and validation
- Text extraction from PDFs
- Regex-based data parsing
- Basic Excel export

### Phase 2: Enhanced UI & Validation
- Drag-and-drop interface
- Progress indicators
- Data validation and error reporting
- Minor patient detection and flagging

### Phase 3: Advanced Features
- Batch processing
- Template management
- Export customization
- Data preview before export

### Future Phases (Multi-Tab Application)
- Additional medical billing tools
- Report generation
- Data analytics dashboard
- Integration with other systems

## Success Criteria
1. Successfully extract data from all provided PDF samples
2. Generate Excel files matching the specified column format
3. Handle edge cases (missing data, minor patients, etc.)
4. Provide clear error messages and validation feedback
5. Maintain data integrity throughout the process

## Constraints
- Must work offline (no cloud dependencies)
- Should handle PDFs of varying quality/formats
- Must preserve data accuracy for medical billing compliance
- Should be user-friendly for non-technical users 