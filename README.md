# Tab Vault

Tab Vault is a Chrome Extension designed to help you organize your research sessions into "Spaces". It allows you to save tab groups, highlight text on pages, and manage your browsing context efficiently.

Built with **Next.js**, **React**, **Tailwind CSS**, and **TypeScript**.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Building the Extension**

    To create a production-ready build for the extension:

    ```bash
    npm run build
    ```

    This command compiles the Next.js application, exports it to static HTML, and runs a post-build script (`scripts/build-extension.js`) to:
    - Rename Next.js internal folders (e.g., `_next` -> `next`) to be compatible with Chrome's restrictions.
    - Extract inline scripts into external files to comply with Manifest V3 Content Security Policy (CSP).
    - Clean up forbidden files.

    The final extension will be located in the `out/` directory.

3.  **Development Mode (Watch)**

    For a smoother development workflow, you can watch for file changes:

    ```bash
    npm run watch
    ```

    This will use `chokidar` to watch for changes in the `src/` directory and automatically rebuild the extension. _Note: You often still need to click the "Reload" icon on the extension in Chrome's `chrome://extensions` page for changes to take effect._

## Loading into Chrome

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** by toggling the switch in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the `out` directory inside your project folder (`.../TabVault/out`).
5.  The extension should now appear in your list and be usable!

## Project Structure

- `src/`: React source code (Next.js App Router).
- `public/`: Extension-specific files (Manifest, background scripts, content scripts).
- `scripts/`: Custom build scripts to adapt Next.js export for Chrome Extensions.
- `out/`: The final build output directory (load this into Chrome).

## Troubleshooting

- **"File not found" or `_next` errors**: Ensure you are running `npm run build` which includes the fix script, not just `next build`.
- **CSP / Inline Script Errors**: The build script extracts inline scripts. If you see these, try rebuilding. Ensure you are not adding new inline `<script>` tags manually in your components without going through the build process.
