# @risecorejs/app-cli

`rcjs` is a command-line tool designed to simplify the process of managing and scaffolding projects. It offers a set of commands to initialize projects, create modules, services, controllers, models, perform database migrations, and more.

## Installation

You can install `rcjs` globally using npm or yarn:

```bash
npm install -g @risecorejs/app-cli
# or
yarn global add @risecorejs/app-cli
```

## Usage

```bash js
rcjs <command> [options]
```

## Commands
- rcjs init [dist]: Initialize a project.
- rcjs make:module [name]: Create a new module.
- rcjs make:service: Create a service in a module.
- rcjs make:controller: Create a controller in a module.
- rcjs make:model [name]: Create a model in a module.
- rcjs make:migrations: Generate database migration files.
- rcjs db:migrate [file]: Execute database migrations for modules in your project.
- rcjs db:rollback [file]: Rollback the last database migration.

For a quick list of all commands, run:

```bash
rcjs --help
```

## Explore Commands and Options

To discover available commands and their options, use `--help` with any command:

```bash
rcjs <command> --help
```
