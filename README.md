# acme-portal

> **Important:** This extension is currently in alpha and primarily for demonstration purposes. APIs may still change frequently.

This project is a `VSCode` extension that allows users to manage deployments of their python projects. Data for the extension is provided via the open project using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it is available at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect).

For explanation of main concepts used by the extension view `acme-portal-sdk` [docs](https://blackwhitehere.github.io/acme-portal-sdk/)

📚 **[Extension Documentation](https://blackwhitehere.github.io/acme-portal/)** - Complete user guide, API reference, and contributing guidelines

![acme-portal](https://raw.githubusercontent.com/blackwhitehere/acme-portal/main/media/acme_portal_screen2.png)

## Features

* Show and navigate all `Flows` in a project
* View existing `Flow` deployments across different `Environments` (and `branches`)
* Navigate to deployment URL from deployment tree view
* `Deploy` a flow to a given starting environment, e.g. `dev`
* `Promote` a deployment from a given environment to another environment
* View source code differences between environments
* **Progress Notifications**: Real-time progress updates in the notification bar for all operations

## Video Demonstration

Watch how to:

* [Navigate Flows and View Deployments](https://vimeo.com/1078687975/38ca31d450?share=copy "Navigate Flows and View Deployments")
* [Deploy Flow Demonstration](https://vimeo.com/1078676313/8c957e07db?share=copy "Deploy Flow Demonstration")
* [View Deployment](https://vimeo.com/1078680347/53b0f567f0?share=copy "View Deployment")
* [Promote Deployment](https://vimeo.com/1078686510/fcf1ce0d2c?share=copy "Promote Deployment")
* [Compare Flow Deployment Versions](https://vimeo.com/1078701794/21ed88bdf9?share=copy "Compare Flow Deployment Versions")

## Requirements

* VSCode version 1.99.3 or higher
* Microsoft Python VSCode Extension needs to be installed
* Python environment used by your project needs to be selected with `Python: Select Interpreter` command
* Project needs to add as dependency & setup [`acme-portal-sdk`](https://blackwhitehere.github.io/acme-portal-sdk)
* `git` CLI needs to be installed
* Opened project needs to have remote source pointing to a `GitHub` repository (Other repos to be supported)

## Development

For detailed development setup, contribution guidelines, and release process, see [CONTRIBUTING.md](CONTRIBUTING.md).


## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)