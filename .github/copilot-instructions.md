# Project Overview

This project is a `VSCode` extension that allows users to manage deployments of their python projects. Data for the extension is provided via the open project using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it is available at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect).

For explanation of main concepts used by the extension view `acme-portal-sdk` [docs](https://blackwhitehere.github.io/acme-portal-sdk/)

## Folder Structure

- `src/`: Contains the main source code for the VSCode extension.
  - `actions/`: Handles deployment-related actions such as finding deployments and promoting them.
  - `commands/`: Manages the commands available in the extension, grouped by functionality.
  - `treeView/`: Implements the tree view UI components for the extension.
  - `utils/`: Utility functions and helpers used across the extension.
  - `scripts/`: Python scripts for interacting with python objects
  - `sdk/`: Objects to interact with the `acme-portal-sdk` and provide a bridge between the extension and the SDK. 
- `docs/`: Documentation files for the project, including user guides and API references.
- `media/`: Media assets such as icons and screenshots used in the extension.
- `scripts/`: Scripts for development and build processes.

## Libraries and Frameworks

- `vscode`: The core library for building VSCode extensions.
- `acme-portal-sdk`: Provides the backend functionality for managing deployments and flows. Not used directly in the extension, but provides the data for it.
- `typescript`: Used for type-safe development of the extension.
- `@typescript-eslint`: Provides TypeScript-specific linting rules.
- `@vscode/test-cli` and `@vscode/test-electron`: Tools for testing VSCode extensions.
- `knip`: Helps identify unused files, dependencies, and exports.
- `mkdocs`: Used for building and deploying project documentation.

## Coding Standards

When possible make code easy to change in the future. Isolate distinct concerns into distinct components because that makes code easy to change. Create components with single reponsibilities because that makes them easy to change. Name things well becasue that makes code easy to read and make changes to. Allow for design decisions to be reversed because that makes code easy to change when new requirements arrive.

Adhere to DRY (don't repeat yourself) principle if possible. Centralize definition of the same knowledge and use it in all places it's used. When possible attempt to refactor code to obey this principle.

Design systems to have orthogonal functionality.

Check for python typing information in method signatures is correct and if documentation needs to be updated to reflect existing funcionality. Keep documentation concise but informative and avoid excess comments that just describe what code is doing.

## UI guidelines

- Follow VSCode's design principles to ensure a consistent user experience.
- Use clear and concise labels for commands and UI elements.
- Provide meaningful error messages and feedback to users.
- Ensure the UI is responsive and accessible to all users.