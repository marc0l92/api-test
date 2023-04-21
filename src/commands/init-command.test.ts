import { rm } from "fs-extra"
import { initCommand } from "./init-command"

const kSource = 'test/api/*.json'
const kDestination = 'test/project'

describe('init-command', () => {
    test("initCommand", async () => {
        await rm(kDestination, { recursive: true })
        await initCommand(kSource, kDestination)
    })
})
