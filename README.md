# Kvara Desktop

A modern Electron desktop application for automating medical billing data extraction from PDF files and exporting to Excel spreadsheets.

## 🚀 Features

- **PDF Processing**: Extract data from DEMOS and STMT PDF files
- **Data Validation**: Comprehensive validation with error reporting
- **Excel Export**: Generate properly formatted Excel files
- **Modern UI**: Built with Vue.js 3 and Vuetify
- **Type Safety**: Full TypeScript support
- **Error Handling**: Robust error handling and logging

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/AnthonyRuffino/kvara-desktop.git
cd kvara-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run electron-dev
```

## 📦 Build

Build for production:
```bash
npm run dist
```

Build for specific platforms:
```bash
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📁 Project Structure

```
kvara-desktop/
├── electron/           # Electron main process
├── src/
│   ├── components/     # Vue components
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   ├── services/       # Business logic services
│   └── tests/          # Test files
├── pdfs/              # Sample PDF files
└── docs/              # Documentation
```

## 🔧 Development

### Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run electron` - Run Electron app
- `npm run electron-dev` - Run in development mode
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **UI Framework**: Vuetify 3
- **Language**: TypeScript
- **State Management**: Pinia
- **Desktop**: Electron
- **Build Tool**: Vite
- **Testing**: Vitest
- **PDF Processing**: pdf-parse
- **Excel**: xlsx

## 📄 PDF Format Requirements

The application expects PDF files to be named in the following format:
- `PATIENTID_demos.pdf` - Patient demographics
- `PATIENTID_stmt.pdf` - Patient statement

Example:
- `18420_demos.pdf`
- `18420_stmt.pdf`

## 📊 Excel Export Format

The application exports data to Excel with the following columns:

| Column | Field | Source |
|--------|-------|--------|
| A | Account Number | DEMOS PDF |
| B | Creditor | Static: "Mathers Clinic, LLC" |
| C | Merchant/Provider/Facility Name | Static: "Mathers Clinic, LLC" |
| D | Open Date/Date of Service | Current date |
| E | Last Payment Date | STMT PDF |
| J | Balance as of Itemization Date | STMT PDF |
| N | Total Due | Same as column J |
| O | Debt Description | Static: "deductible / coinsurance / copay" |
| P | Responsible Party Name | DEMOS PDF |
| Q | Responsible Party DOB | DEMOS PDF |
| R-U | Address | DEMOS PDF |
| V | Responsible Party Phone | DEMOS PDF |
| W | Email | DEMOS PDF |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔄 Roadmap

- [ ] Phase 1: Project Setup & Foundation
- [ ] Phase 2: PDF Processing Core
- [ ] Phase 3: User Interface & File Upload
- [ ] Phase 4: Testing, Error Handling & Deployment
- [ ] Future: Additional medical billing tools
- [ ] Future: Integration with external systems
- [ ] Future: Advanced reporting and analytics 