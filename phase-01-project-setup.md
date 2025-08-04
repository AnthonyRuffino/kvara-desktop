# Phase 01: Project Setup & Foundation

## Overview
Establish the foundational Electron application with Vue.js 3, TypeScript, and Vuetify. Set up the development environment and create the basic project structure.

## Objectives
- Initialize Electron application with Vue.js 3 and TypeScript
- Configure build tools and development environment
- Set up basic project structure and dependencies
- Create minimal working application

## Detailed Steps

### Step 1: Initialize Project Structure
```bash
# Create project directory
mkdir kvara-desktop
cd kvara-desktop

# Initialize package.json
npm init -y

# Install Electron and core dependencies
npm install --save-dev electron electron-builder
npm install --save-dev @types/node typescript
npm install --save-dev vue@next @vitejs/plugin-vue
npm install --save-dev vite electron-vite
```

### Step 2: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 3: Configure Vite
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### Step 4: Configure Electron
Create `electron/main.ts`:
```typescript
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

### Step 5: Set up Vue.js with Vuetify
Install Vuetify:
```bash
npm install vuetify@next @mdi/font
npm install pinia
```

Create `src/main.ts`:
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import vuetify from './plugins/vuetify'

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')
```

Create `src/plugins/vuetify.ts`:
```typescript
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})
```

### Step 6: Create Basic App Structure
Create `src/App.vue`:
```vue
<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>Kvara Desktop</v-app-bar-title>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <h1>PDF to Spreadsheet Extractor</h1>
        <p>Welcome to the medical billing data extraction tool.</p>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Component logic will be added in later phases
</script>
```

### Step 7: Configure Package Scripts
Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "dist": "npm run build && electron-builder"
  }
}
```

### Step 8: Create Project Structure
```
kvara-desktop/
├── electron/
│   └── main.ts
├── src/
│   ├── components/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.json
```

### Step 9: Install Additional Dependencies
```bash
# PDF processing
npm install pdf-parse

# Excel handling
npm install xlsx

# File system utilities
npm install fs-extra
npm install --save-dev @types/fs-extra

# Development utilities
npm install --save-dev concurrently wait-on
```

### Step 10: Configure Electron Builder
Create `electron-builder.json`:
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
    "node_modules/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity"
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## Deliverables
- [x] Working Electron application with Vue.js 3
- [x] TypeScript configuration
- [x] Vuetify integration
- [x] Basic project structure
- [x] Development and build scripts
- [x] Hot reload development environment

## Success Criteria
1. ✅ Application launches successfully in development mode
2. ✅ Vue.js components render properly
3. ✅ Vuetify components are available
4. ✅ TypeScript compilation works without errors
5. ✅ Hot reload functions correctly

## Next Phase
Phase 02 will focus on implementing the PDF processing core functionality and data extraction logic. 