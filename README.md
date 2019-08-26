# package-transfer

[![npm](https://img.shields.io/npm/v/package-transfer)](https://www.npmjs.com/package/package-transfer)
[![Build Status](https://travis-ci.org/capJavert/package-transfer.svg?branch=master)](https://travis-ci.org/capJavert/package-transfer)
[![Coverage Status](https://coveralls.io/repos/github/capJavert/package-transfer/badge.svg)](https://coveralls.io/github/capJavert/package-transfer)

Simple utility to transfer packages from your dependencies or devDependencies lists into new project.

## Install
```
npm install -g package-transfer
```

## Usage
```
pkg-transfer [options]
```

Transfer dependencies from `old-project` to current project (`my-new-project`):
```
cd my-new-project
pkg-transfer -s ../old-project
```

The command detects which packages need to be transferred and offers to auto install them into target package.

This command does exactly the same thing only for devDependencies:
```
pkg-transfer -s ../old-project --dev
```

If you prefer `yarn` over `npm`:
```
pkg-transfer -s ../old-project --yarn
```

## Help
Usage: pkg-transfer [options]

Options:<br>
  -v, --version              **Print version**<br>
  --verbose                  **Increase logging verbosity**<br>
  -h, --help                 **Output help and usage information**<br>
  -s, --source               **Source package (from where you want to transfer dependencies)**<br>
  -t, --target               **Target package (defaults to current directory)**<br>
  --yarn                     **Use yarn instead of npm**<br>
  --dev                      **Transfer devDependencies**<br>
