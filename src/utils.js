const path = require('path')
const { execSync } = require('child_process')
const { CONFIRMATIONS, PACKAGE_META_FILE } = require('./consts')
const {
    warning, success, info
} = require('./log-theme')

/**
* Load package meta file from path
*
* @param  {string} packagePath
* @return {object}
*/
const getPackageJson = (packagePath) => {
    if (packagePath === '.') {
        return require(path.join(process.cwd(), PACKAGE_META_FILE))
    }

    return require(path.join(
        path.isAbsolute(packagePath) ? '' : process.cwd(),
        packagePath,
        packagePath.indexOf(PACKAGE_META_FILE) === -1 ? PACKAGE_META_FILE : ''
    ))
}

/**
* Check if cli arg has value
*
* @param  {string}  name
* @param  {Array}  args
* @return {Boolean}
*/
const getArg = (name, args) => {
    const index = args.indexOf(name)
    return index > -1 ? args[index + 1] : undefined
}

/**
* Check if cli arg is set
*
* @param  {string}  name
* @param  {Array}  args
* @return {Boolean}
*/
const hasArg = (name, args) => {
    const index = args.indexOf(name)
    return index > -1
}

/**
* Transfer dependencies from source to target
* This method runs npm or yarn install
*
* @param source
* @param target
* @param  {Array}  [args=[]]
*/
const transferDependencies = (source, target, args = []) => {
    const dev = hasArg('--dev', args)
    const useYarn = hasArg('--yarn', args)
    const depKey = dev ? 'devDependencies' : 'dependencies'
    const { [depKey]: sourceDependencies = {} } = source
    const { [depKey]: destDependencies = {} } = target

    const newDeps = Object.keys(sourceDependencies).filter((dep) => !destDependencies[dep])
    let installCommand = (useYarn ? 'yarn add ' : 'npm install ')
    + newDeps.join(' ')

    if (dev) {
        installCommand += useYarn ? ' --dev' : ' --save-dev'
    } else if (!useYarn) {
        installCommand += ' --save'
    }

    const packageCount = newDeps.length
    console.log(info('Found', packageCount, packageCount ? 'packages:' : 'packages'))

    if (!packageCount) {
        console.warn(warning('Nothing to install!'))

        process.exit(0)
    }

    newDeps.forEach((dep) => console.log(`    ${dep}@${sourceDependencies[dep]}`))

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    })

    readline.question(info('Install above packages into target package? '), (answer) => {
        if (CONFIRMATIONS.indexOf(answer) > -1) {
            readline.close()

            try {
                execSync(installCommand, { stdio: 'inherit' })

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

module.exports = {
    getPackageJson,
    getArg,
    hasArg,
    transferDependencies
}
