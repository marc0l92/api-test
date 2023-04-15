import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const sourceOption: yargs.PositionalOptions = {
    description: 'Folder containing all the OpenApi and Swagger files',
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

export const parseCliOptions = (argv: string[]) => {
    return yargs(hideBin(argv))
        .usage('Unit tests manager for OpenApi and Swagger')
        .command('init <source> <destination>', 'Initialize a new project', {
            source: sourceOption,
            destination: destinationOption,
        })
        .command('test <project>', 'Validate all the examples of a project', {
            project: projectOption,
        })
        .command('generate <project>', 'Generate and update the minimal and maximal examples of the project', {
            project: projectOption,
        })
        .example([
            ['$0 init ./api ./test', 'Initialize project with the api of the folder "./api" and store it in "./test"'],
            ['$0 test .', 'Validate project in the current folder'],
            ['$0 generate .', 'Refresh all the examples of the project in the current folder'],
        ])
        .epilogue('Project source at: https://github.com/marc0l92/api-test')
        .strict()
        .parseSync()
}