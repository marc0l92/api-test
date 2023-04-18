import { exit } from "process"
import { parseCliOptions } from "./cli"
import { generateCommand } from "./commands/generate-command"
import { initCommand } from "./commands/init-command"
import { testCommand } from "./commands/test-command"

const apiTest = async () => {
    const argv = parseCliOptions(process.argv)

    if (argv._[0]) {
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
                throw new Error(`Command not implemented: "${argv._[0]}"`)
        }
    } else {
        throw new Error(`No command provided. Use --help to view the available commands`)
    }
}

apiTest().catch((e: Error) => {
    console.error(e.message)
    console.error(e)
    exit(1)
})