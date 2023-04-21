import Ajv from "ajv"
import { Options } from "ajv"
import { loadProject } from "../common/utils"

const ajvOptions: Options = { allErrors: true }

export const testCommand = async (projectDir: string) => {
    const ajv = new Ajv(ajvOptions)
    const project = await loadProject(projectDir)
    for()
}