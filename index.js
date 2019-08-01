#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { CONFIRMATIONS, PACKAGE_META_FILE } = require('./consts')
const { getPackageJson, getArg, hasArg, transferDependencies } = require('./utils')
const args = process.argv.slice(2)

// exit listener
process.on('SIGINT', () => {
  process.exit(1)
})

if (hasArg('--version', args) || hasArg('-v', args)) {
  const { version } = require('./package.json')
  console.log('pkg-transfer:', version)

  process.exit(0)
}

if (hasArg('--help', args) || hasArg('-h', args)) {
  console.log('Usage: pkg-transfer [options]')
  console.log('')
  console.log('Options:')
  console.log('  -v, --version              Print version')
  console.log('  --verbose                  Increase logging verbosity')
  console.log('  -h, --help                 Output help and usage information')
  console.log('  -h, --help                 Output help and usage information')
  console.log('  -s, --source               Source package (from where you want to transfer dependencies)')
  console.log('  -t, --target               Target package (defaults to current directory)')
  console.log('  --yarn                     Use yarn instead of npm')
  console.log('  --dev                      Transfer devDependencies')

  process.exit(0)
}

const verbose = hasArg('--verbose', args)
const source = getArg('--source', args) || getArg('-s', args)
if (!source) {
  console.warn('Specify source package path with --source')

  process.exit(0)
}

try {
  const sourcePackage = getPackageJson(source)
  const target = getArg('--target', args) || getArg('-t', args)

  if (!target) {
    console.warn('Target package is not set!')

    const pwd = path.join(__dirname, PACKAGE_META_FILE)
    if(fs.existsSync(pwd)) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })

      readline.question('Use current project? ', answer => {
        readline.close()

        if (CONFIRMATIONS.indexOf(answer) > -1) {
          transferDependencies(sourcePackage, getPackageJson(pwd), args)
        }
      })
    }
  } else {
    try {
      const targetPackage = getPackageJson(target)
      transferDependencies(sourcePackage, targetPackage, args)
    } catch (e) {
      if (verbose) {
        console.error(e)
      }
      console.error('There is no valid ' + PACKAGE_META_FILE + ' inside specified target.')
      console.error('Path:', target)

      process.exit(1)
    }
  }
} catch (e) {
  if (verbose) {
    console.error(e)
  }
  console.error('There is no valid ' + PACKAGE_META_FILE + ' inside specified source.')
  console.error('Path:', source)

  process.exit(1)
}
