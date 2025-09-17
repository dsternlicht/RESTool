interface BuildInfo {
    version: string;
    buildDate: string;
}

// This file is processed by Maven during the build process.
// The values will be replaced with the actual version and build date.
// Src File: /maven/version.tsx
// Dest File: /src/version.tsx
export const buildInfo: BuildInfo = {
    version: '0.0.1',
    buildDate: '1990-01-01T12:00:00Z'
};