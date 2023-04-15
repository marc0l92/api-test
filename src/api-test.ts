import { parseCliOptions } from "./cli"
import { generateCommand } from "./commands/generate-command"
import { initCommand } from "./commands/init-command"
import { testCommand } from "./commands/test-command"

const apiTest = async () => {
    const argv = parseCliOptions(process.argv)

    switch (argv._[0]) {
        case 'init':
            await initCommand(argv.source as string, argv.destination as string)
            break
        case 'test':
            await testCommand(argv.project as string)
            break
        case 'generate':
            await generateCommand(argv.project as string)
            break
        default:
            throw new Error('Command not implemented')
    }
}

apiTest()