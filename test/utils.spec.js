const path = require('path')
const {
    getPackageJson,
    getArg,
    hasArg,
    extractDependencies,
    createInstallCommand
} = require('../src/utils')

test('module is defined', () => {
    expect(getPackageJson).toBeDefined()
    expect(getArg).toBeDefined()
    expect(hasArg).toBeDefined()
    expect(extractDependencies).toBeDefined()
    expect(createInstallCommand).toBeDefined()
})

test('detect when argument exists', () => {
    const args = ['node', 'index.js', '-s', '../old-project', '--dev']

    expect(hasArg('--dev', args)).toBe(true)
    expect(hasArg('-s', args)).toBe(true)
})

test('detect when argument does not exist', () => {
    const args = ['node', 'index.js', '-s', '../old-project', '--dev']

    expect(hasArg('--verbose', args)).toBe(false)
})

test('get argument value', () => {
    const args = ['node', 'index.js', '-s', '../old-project', '--dev']

    expect(getArg('-s', args)).toBe('../old-project')
})

test('get file with relative path', () => {
    expect(getPackageJson('./package.json')).toBeDefined()
})

test('get file with absolute path', () => {
    expect(getPackageJson(path.join(__dirname, '../package.json'))).toBeDefined()
})

test('extracts dependencies', () => {
    const sourcePackage = {
        dependencies: {
            'body-parser': '^1.18.3',
            'cookie-parser': '^1.4.3',
            cors: '^2.8.5',
            debug: '^4.1.1',
            express: '^4.16.4'
        }
    }

    const targetPackage = {
        dependencies: {}
    }

    const [newDeps] = extractDependencies(sourcePackage, targetPackage)

    expect(newDeps).toEqual([
        'body-parser',
        'cookie-parser',
        'cors',
        'debug',
        'express'
    ])
})

test('ignores dependencies already included in target', () => {
    const sourcePackage = {
        dependencies: {
            'body-parser': '^1.18.3',
            'cookie-parser': '^1.4.3',
            cors: '^2.8.5',
            debug: '^4.1.1',
            express: '^4.16.4'
        }
    }

    const targetPackage = {
        dependencies: {
            'cookie-parser': '^1.4.3',
            cors: '^2.8.5',
            debug: '^4.1.1',
        }
    }

    const [newDeps] = extractDependencies(sourcePackage, targetPackage)

    expect(newDeps).toEqual([
        'body-parser',
        'express'
    ])
})

test('extract respects --dev flag', () => {
    const sourcePackage = {
        dependencies: {
            'body-parser': '^1.18.3',
            'cookie-parser': '^1.4.3',
            cors: '^2.8.5',
            debug: '^4.1.1',
            express: '^4.16.4'
        },
        devDependencies: {
            nodemon: '^1.18.9',
            'express-redis-cache': '^1.1.3'
        }
    }

    const targetPackage = {
        dependencies: {},
        devDependencies: {}
    }

    const [newDeps] = extractDependencies(sourcePackage, targetPackage, ['--dev'])

    expect(newDeps).toEqual([
        'nodemon',
        'express-redis-cache'
    ])
})

test('creates install command', () => {
    const newDeps = [
        'body-parser',
        'cookie-parser',
        'cors',
        'debug',
        'express'
    ]

    const installCommand = createInstallCommand(newDeps)

    expect(installCommand).toEqual('npm install body-parser cookie-parser cors debug express --save')
})

test('create respects --dev flag', () => {
    const newDeps = [
        'body-parser',
        'cookie-parser',
        'cors',
        'debug',
        'express'
    ]

    const installCommand = createInstallCommand(newDeps, ['--dev'])

    expect(installCommand).toEqual('npm install body-parser cookie-parser cors debug express --save-dev')
})

test('create respects --yarn flag', () => {
    const newDeps = [
        'body-parser',
        'cookie-parser',
        'cors',
        'debug',
        'express'
    ]

    const installCommand = createInstallCommand(newDeps, ['--yarn'])

    expect(installCommand).toEqual('yarn add body-parser cookie-parser cors debug express')
})

test('create respects --yarn and --dev flags', () => {
    const newDeps = [
        'body-parser',
        'cookie-parser',
        'cors',
        'debug',
        'express'
    ]

    const installCommand = createInstallCommand(newDeps, ['--yarn', '--dev'])

    expect(installCommand).toEqual('yarn add body-parser cookie-parser cors debug express --dev')
})
