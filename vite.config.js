/// <reference types="vitest/config" />

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/tests/unit/setup.ts',
        globals: true,
        css: true,
        include: ['src/tests/unit/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/main.tsx', 'src/types/**/*.d.ts', 'src/tests/**', 'src/theme.ts'],
        },
    },
});
