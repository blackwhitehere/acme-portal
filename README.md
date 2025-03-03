# acme-portal

`VSCode` extension for managing deployments in `acme-prefect` [Link.](https://github.com/blackwhitehere/acme-prefect)

## Features

* Show and navigate to all `prefect` flows in the project
* View all flow deployments across `branches` and `environments`
* Promote a deployment in a given environment to another environment
* View source code differences between environments

## Requirements

* Microsoft Python Extension
* `git` CLI needs to be installed and the opened project needs to have remote source pointing to a `GitHub` repository
* GitHub CLI `gh` client needs to be installed.
* Python environment needs to be selected with `Python: Select Interpreter` command that contains `prefect` package

## Extension Settings

* Path to directory where `prefect` flows can be discovered

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of `acme-portal`

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)