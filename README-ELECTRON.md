# Elyon Examination - Desktop Application

This guide explains how to run, develop, and build the Elyon Examination System as a desktop application using Electron.

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later (comes with Node.js)
- Git (for cloning the repository)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/elyon-examination.git
cd elyon-examination
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Edit the `.env` file and set `VITE_ELECTRON=true` to enable Electron mode.

## Development

### Running in Development Mode

To run the application in development mode with hot-reload:

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Launch the Electron app connected to the dev server
3. Open developer tools automatically

### Project Structure

- `electron/` - Contains Electron main process code
  - `main.js` - Main Electron process
  - `preload.js` - Preload script for secure IPC
- `src/` - React application code
- `public/` - Static assets
- `dist/` - Built application (created after build)

## Building for Production

### Building the Application

To build the application for production:

```bash
npm run electron:build
```

This will:
1. Build the React application
2. Package it with Electron
3. Create installers for the current platform

### Platform-Specific Builds

For Windows:
```bash
npm run electron:build:win
```

For macOS:
```bash
npm run electron:build:mac
```

For Linux:
```bash
npm run electron:build:linux
```

## Distribution

### Creating Installers

After building, you can find the installers in the `release` directory:

- Windows: `.exe` installer and portable version
- macOS: `.dmg` and `.zip` files
- Linux: `.AppImage`, `.deb`, and `.rpm` packages

### Publishing

To publish a new release:

1. Update the version in `package.json`
2. Create a new GitHub release
3. The GitHub Action will automatically build and upload the artifacts

## Security Considerations

### Secure Electron Configuration

The application is configured with security best practices:
- Context Isolation is enabled
- Node Integration is disabled in the renderer
- A preload script is used for secure IPC
- Content Security Policy is enforced
- Only necessary permissions are granted

### Code Signing

For production releases, you should sign your application:

- **Windows**: Use a valid code signing certificate
- **macOS**: Sign with an Apple Developer ID
- **Linux**: Sign with a GPG key

## Troubleshooting

### Common Issues

1. **Blank Screen**
   - Make sure the Vite dev server is running
   - Check the developer tools for errors (Ctrl+Shift+I)
   - Verify the `base` URL in `vite.config.ts`

2. **Native Module Errors**
   - Rebuild native modules: `npm rebuild`
   - Make sure Node.js versions match between build and runtime

3. **Build Failures**
   - Clear the `node_modules` and `dist` directories
   - Run `npm install` again
   - Check for platform-specific build requirements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
