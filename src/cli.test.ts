import { parseCliOptions } from "./cli"

const kExecutable = 'api-test'

describe('cli', () => {
  afterEach(() => {
    jest.resetAllMocks();
  })

  // test("help", () => {
  //   const consoleLogSpy = jest.spyOn(console, "log")
  //   const consoleErrorSpy = jest.spyOn(console, "error")

  //   expect(parseCliOptions([kExecutable, '--help'])).toEqual({ "$0": "node_modules\\jest\\bin\\jest.js", "_": [], })

  //   expect(consoleErrorSpy).toBeCalledTimes(0)
  //     expect(consoleLogSpy).toBeCalledWith(`Unit tests manager for OpenApi and Swagger

  // Commands:
  //   bin.js init <source> <destination>  Initialize a new project
  //   bin.js test <project>               Validate all the examples of a project
  //   bin.js generate <project>           Generate and update the minimal and
  //                                       maximal examples of the project

  // Options:
  //   --help     Show help                                                 [boolean]
  //   --version  Show version number                                       [boolean]

  // Examples:
  //   bin.js init ./api/*.json ./test  Initialize project with the api of the folder
  //                                    \"./api\" and store it in \"./test\"
  //   bin.js test .                    Validate project in the current folder
  //   bin.js generate .                Refresh all the examples of the project in
  //                                    the current folder

  // Project source at: https://github.com/marc0l92/api-test
  // `)
  // })
  test("command init", () => {
  })
})
