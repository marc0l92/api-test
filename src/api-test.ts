import { parseCliOptions } from "./cli"
import { generateCommand } from "./commands/generate"
import { initCommand } from "./commands/init"
import { testCommand } from "./commands/test"

const main = async () => {
    const argv = parseCliOptions(process.argv)

    switch (argv._[0]) {
        case 'init':
            initCommand(argv.source as string, argv.destination as string)
            break
        case 'test':
            testCommand(argv.project as string)
            break
        case 'generate':
            generateCommand(argv.project as string)
            break
        default:
            throw new Error('Command not implemented')
    }
}

main()