const chalk = require('chalk')

const error = chalk.bold.red;
const warning = chalk.yellow
const success = chalk.bold.green
const info = chalk.bold
const placeholder = chalk.gray

module.exports = {
    error,
    warning,
    success,
    info,
    placeholder
}
