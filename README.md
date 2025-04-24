# acme-portal

`VSCode` extension for managing deployments using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect). 

## Features

* Show and navigate all `Flows` in a project
* View existing `Flow` deployments across different `Environments` (and `branches`)
* `Promote` a deployment in a given environment to another environment
* View source code differences between environments

## Requirements

* Microsoft Python VSCode Extension needs to be installed
* Python environment used by your project needs to be selected with `Python: Select Interpreter` command
* Project needs to setup [`acme-portal-sdk`](https://blackwhitehere.github.io/acme-portal-sdk)
* `git` CLI needs to be installed
* Opened project needs to have remote source pointing to a `GitHub` repository (Other repos to be supported)

## Extension Settings

## Release Notes

### 1.0.0

Initial release of `acme-portal`

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)