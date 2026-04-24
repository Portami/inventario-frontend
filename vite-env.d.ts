interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_DATABASE_URL: string;
    readonly VITE_DATABASE_USERNAME: string;
    readonly VITE_DATABASE_PASSWORD: string;
    readonly VITE_DATABASE_NAME: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.svg' {
    const content: string;
    export default content;
}
