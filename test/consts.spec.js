const {
    CONFIRMATIONS,
    PACKAGE_META_FILE
} = require('../src/consts')

test('module is defined', () => {
    expect(CONFIRMATIONS).toBeDefined()
    expect(PACKAGE_META_FILE).toBeDefined()
})
