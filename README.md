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
- `rcjs init [dist]`: Initializing the Project.
- `rcjs make:module [name]`: Generating a new module.
- `rcjs make:service`: Generating a service in a module.
- `rcjs make:controller`: Generating a controller in a module.
- `rcjs make:middleware`: Generating a middleware in a module.
- `rcjs make:model [name]`: Generating a model in a module.
- `rcjs make:migration [name]`: Generating a database migration file in a module.
- `rcjs make:migrations`: Generating database migration files based on module models.
- `rcjs db:migrate [file]`: Executing database migration files of modules.
- `rcjs db:rollback [file]`: Rollback the last database migration.

For a quick list of all commands, run:

```bash
rcjs --help
```

## Explore Commands and Options

To discover available commands and their options, use `--help` with any command:

```bash
rcjs <command> --help
```
