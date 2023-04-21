import { testCommand } from "./test-command"

const kProjectDir = 'test/project'

describe('test-command', () => {
    test("testCommand", async () => {
        await testCommand(kProjectDir)
    })
})
