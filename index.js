#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { CONFIRMATIONS, PACKAGE_META_FILE } = require('./src/consts')
const {
    getPackageJson, getArg, hasArg, extractDependencies, createInstallCommand,
} = require('./src/utils')
const {
    warning, error, success, info, placeholder
} = require('./src/log-theme')

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
    console.log('  -s, --source               Source package (from where you want to transfer dependencies)')
    console.log('  -t, --target               Target package (defaults to current directory)')
    console.log('  --yarn                     Use yarn instead of npm')
    console.log('  --dev                      Transfer devDependencies')
    console.log('  --dry-run                  Just prints install command, does NOT really install anything')
    console.log('  --strict                   Use exact versions from source package.json when installing dependencies')

    process.exit(0)
}

const verbose = hasArg('--verbose', args)
const dryRun = hasArg('--dry-run', args)
const source = getArg('--source', args) || getArg('-s', args)
const isStrict = hasArg('--strict', args)
if (!source) {
    console.warn(warning('Specify source package path with --source'))

    process.exit(0)
}

const transferDependencies = (sourcePackage, targetPackage) => {
    const [newDeps, sourceDeps] = extractDependencies(sourcePackage, targetPackage, args)
    const packageCount = newDeps.length

    console.log(info('Found', packageCount, packageCount ? 'packages:' : 'packages'))

    if (!packageCount) {
        console.warn(warning('Nothing to install!'))

        process.exit(0)
    }

    newDeps.forEach((dep) => console.log(isStrict ? `    ${dep}@${sourceDeps[dep]}` : `    ${dep}`))

    if (dryRun) {
        console.log()
        console.log(createInstallCommand(newDeps, sourceDeps, args))
        return
    }

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    })

    readline.question(`${info('Install above packages into target package?')} (${placeholder('yes')}) `, (answer = 'yes') => {
        if (CONFIRMATIONS.indexOf(answer || 'yes') > -1) {
            readline.close()

            try {
                execSync(createInstallCommand(newDeps, sourceDeps, args), { stdio: 'inherit' })

                console.log(success('Transfer completed!'))
                process.exit(0)
            } catch (e) {
                if (e.signal !== 'SIGINT') {
                    console.error(e)
                }

                process.exit(1)
            }
        } else {
            console.log('Install canceled!')

            process.exit(0)
        }
    })
}

try {
    const sourcePackage = getPackageJson(source)
    const target = getArg('--target', args) || getArg('-t', args)

    if (!target) {
        console.warn(warning('Target package is not set!'))

        const pwd = path.join(process.cwd(), PACKAGE_META_FILE)
        if (fs.existsSync(pwd)) {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout,
            })

            readline.question(`${info('Use current project?')} (${placeholder('yes')}) `, (answer) => {
                readline.close()

                if (CONFIRMATIONS.indexOf(answer || 'yes') > -1) {
                    transferDependencies(sourcePackage, getPackageJson(pwd))
                }
            })
        }
    } else {
        try {
            const targetPackage = getPackageJson(target)
            transferDependencies(sourcePackage, targetPackage)
        } catch (e) {
            if (verbose) {
                console.error(e)
            }
            console.error(error(`There is no valid ${PACKAGE_META_FILE} inside specified target.`))
            console.error(error('Path:', target))

            process.exit(1)
        }
    }
} catch (e) {
    if (verbose) {
        console.error(e)
    }
    console.error(error(`There is no valid ${PACKAGE_META_FILE} inside specified source.`))
    console.error(error('Path:', source))

    process.exit(1)
}
