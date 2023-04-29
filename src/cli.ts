import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const sourceOption: yargs.PositionalOptions = {
    description: 'Glob patter to find all the OpenApi and Swagger files',
    type: 'string',
}
const destinationOption: yargs.PositionalOptions = {
    description: 'Directory where to store the project',
    type: 'string',
}
const projectOption: yargs.PositionalOptions = {
    description: 'Project folder',
    type: 'string',
}
const forceOption: yargs.PositionalOptions = {
    description: 'Initialize the project even if the destination folder already exist by merging the existing project with the new one',
    alias: 'f',
    type: 'boolean',
    default: false,
}
const failOnErrorOption: yargs.PositionalOptions = {
    description: 'Return not zero status code when an error is detected',
    alias: 'e',
    type: 'boolean',
    default: false,
}
const reportOutputOption: yargs.PositionalOptions = {
    description: 'Save report in a file',
    alias: 'o',
    type: 'string',
    default: 'api-test-report.yaml',
}

export const parseCliOptions = (argv: string[]) => {
    return yargs(hideBin(argv))
        .usage('Unit tests manager for OpenApi and Swagger')
        .command('init <source> <destination>', 'Initialize a new project', {
            source: sourceOption,
            destination: destinationOption,
            force: forceOption,
        })
        .command('test <project>', 'Validate all the examples of a project', {
            project: projectOption,
            failOnError: failOnErrorOption,
            reportOutput: reportOutputOption,
        })
        .command('generate <project>', 'Generate and update the minimal and maximal examples of the project', {
            project: projectOption,
        })
        .example([
            ['$0 init ./api/*.json ./test', 'Initialize project with the api of the folder "./api" and store it in "./test"'],
            ['$0 test .', 'Validate project in the current folder'],
            ['$0 generate .', 'Refresh all the examples of the project in the current folder'],
        ])
        .epilogue('Project source at: https://github.com/marc0l92/api-test')
        .strict()
        // .exitProcess(false)
        .parseSync()
}