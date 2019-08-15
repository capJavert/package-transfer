const {
    error,
    warning,
    success,
    info,
    placeholder
} = require('../src/log-theme')

test('module is defined', () => {
    expect(error).toBeDefined()
    expect(warning).toBeDefined()
    expect(success).toBeDefined()
    expect(info).toBeDefined()
    expect(placeholder).toBeDefined()
})
