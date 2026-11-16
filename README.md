# MyPortfolio

This project uses Angular 22.

## Requirements and installation

Use Node.js 24.15+ LTS (see `.nvmrc`) and npm 10 or newer. Node.js 22.22.3+ is also supported. See the [Angular compatibility table](https://angular.dev/reference/versions).

```sh
nvm install
nvm use
npm ci
```

Run `npm audit` to check all dependencies, including development tools. Commit both `package.json` and `package-lock.json` when updating dependencies so `npm ci` installs the audited versions.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Grima contact form

The contact form now uses the independent Grima API and Cloudflare Turnstile.
See [local setup and verification](docs/grima-local-development.md) for the two-terminal
workflow, public environment configuration and production setup.
