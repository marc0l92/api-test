import { rm, writeFile } from "fs-extra"
import { initCommand } from "./init-command"

const kSource = 'test/api/*.json'
const kDestination = 'test/project'

describe('init-command', () => {
    beforeEach(async () => {
        await rm(kDestination, { recursive: true, force: true })
    })
    test("base", async () => {
        // await initCommand(kSource, kDestination)
    })
    test("destination already exists", async () => {
        await writeFile(kDestination, '')
        await expect(() => initCommand(kSource, kDestination, false)).rejects
            .toThrowError(new Error('The selected destination directory for a new project already exists'))
    })
})
