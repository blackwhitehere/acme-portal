# acme-portal

`VSCode` extension for managing deployments using [`acme-portal-sdk`](https://github.com/blackwhitehere/acme-portal-sdk). Sample project using it at [`acme-prefect`](https://github.com/blackwhitehere/acme-prefect).

For explanation of main concepts used by the extension view `acme-portal-sdk` [docs](https://blackwhitehere.github.io/acme-portal-sdk/)

![acme-portal](.media/acme_portal_screen.png)

## Features

* Show and navigate all `Flows` in a project
* View existing `Flow` deployments across different `Environments` (and `branches`)
* `Deploy` a flow to a given starting environment, e.g. `dev`
* `Promote` a deployment from a given environment to another environment
* View source code differences between environments


## Requirements

* Microsoft Python VSCode Extension needs to be installed
* Python environment used by your project needs to be selected with `Python: Select Interpreter` command
* Project needs to setup [`acme-portal-sdk`](https://blackwhitehere.github.io/acme-portal-sdk)
* `git` CLI needs to be installed
* Opened project needs to have remote source pointing to a `GitHub` repository (Other repos to be supported)

## Dev setup

* Go `VSCode` `Run and Debug` tab and run `Run Extension` configuration.
* Open `acme-prefect` [repo]((https://github.com/blackwhitehere/acme-prefect)
* Create python virtual env according to instructions in the repo and set it using `Python: Select Interpreter`

## Extension Settings

## Release Notes

### 1.0.0

Initial release of `acme-portal`

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)