# React + TypeScript + Vite

This project provides a minimal setup to get **React working with Vite** using **TypeScript**, including **Hot Module Replacement (HMR)** and **ESLint configuration** for code quality.

Vite offers a fast development environment and optimized production builds for modern React applications.

---

## 🚀 Features

- ⚛️ React 18
- ⚡ Vite for fast development
- 🟦 TypeScript support
- 🔥 Hot Module Replacement (HMR)
- 🧹 ESLint for code linting
- 📦 Optimized production build

---

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or later recommended)
- **npm**, **yarn**, or **pnpm**

Check your versions:

```bash
node -v
npm -v
```

---

## 📦 Installation

Clone the repository and install dependencies.

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

Or using Yarn:

```bash
yarn install
```

---

## ▶️ Running the Development Server

Start the development server:

```bash
npm run dev
```

After running the command, open your browser and go to:

```
http://localhost:5173
```

The page will automatically reload when you make changes to the source files.

---

## 🏗 Build for Production

To create an optimized production build:

```bash
npm run build
```

The build output will be generated in the **dist** folder.

---

## 🔎 Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

---

## 🧹 Linting

Run ESLint to check for code quality and style issues:

```bash
npm run lint
```

---

## ⚡ React Plugins for Vite

Two official React plugins are available for Vite:

### 1. @vitejs/plugin-react

Uses **Oxc** for fast refresh and JSX transformation.

```bash
npm install @vitejs/plugin-react
```

Repository:  
https://github.com/vitejs/vite-plugin-react

---

### 2. @vitejs/plugin-react-swc

Uses **SWC** for faster compilation.

```bash
npm install @vitejs/plugin-react-swc
```

More info:  
https://swc.rs/

---

## 🧠 React Compiler

The **React Compiler** is not enabled by default in this template because it can impact development and build performance.

To enable it, follow the official documentation:

https://react.dev/learn/react-compiler/installation

---

## 🔧 Expanding the ESLint Configuration

For production applications, it is recommended to enable **type-aware lint rules**.

Example configuration:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## ⚛ React-Specific ESLint Rules

You can add additional React linting rules using the following plugins:

Install plugins:

```bash
npm install eslint-plugin-react-x eslint-plugin-react-dom --save-dev
```

Update `eslint.config.js`:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## 📁 Project Structure

```
project-name
│
├── public
├── src
│   ├── assets
│   ├── components
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── eslint.config.js
```

---

## 📚 Useful Commands

| Command | Description |
|--------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build project for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is open-source and available under the **MIT License**.