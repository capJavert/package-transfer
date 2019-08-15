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
