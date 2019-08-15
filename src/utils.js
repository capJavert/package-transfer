const path = require('path')
const { PACKAGE_META_FILE } = require('./consts')

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
* @return {Array} dependencies array
*/
const extractDependencies = (source, target, args = []) => {
    const dev = hasArg('--dev', args)
    const depKey = dev ? 'devDependencies' : 'dependencies'
    const { [depKey]: sourceDependencies = {} } = source
    const { [depKey]: destDependencies = {} } = target

    return [
        Object.keys(sourceDependencies).filter((dep) => !destDependencies[dep]),
        sourceDependencies
    ]
}

const createInstallCommand = (deps, args) => {
    const dev = hasArg('--dev', args)
    const useYarn = hasArg('--yarn', args)

    let installCommand = (useYarn ? 'yarn add ' : 'npm install ')
    + deps.join(' ')

    if (dev) {
        installCommand += useYarn ? ' --dev' : ' --save-dev'
    } else if (!useYarn) {
        installCommand += ' --save'
    }

    return installCommand
}

module.exports = {
    getPackageJson,
    getArg,
    hasArg,
    extractDependencies,
    createInstallCommand
}
