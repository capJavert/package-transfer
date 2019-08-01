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

const verbose = hasArg('--verbose', args)
const source = getArg('--source', args)
if (!source) {
  console.warn('Specify source package path with --source')

  process.exit(0)
}

try {
  const sourcePackage = getPackageJson(source)
  const target = getArg('--target', args)

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
