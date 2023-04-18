import { initCommand } from "./init-command"

const kSource = 'test/api/*.json'
const kDestination = 'test/project'

describe('init-command', () => {
    test("initCommand", async () => {
        await initCommand(kSource, kDestination)
    })
})
