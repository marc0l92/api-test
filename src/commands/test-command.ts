import Ajv from "ajv"
import { Options } from "ajv"
import { getServiceDir, loadProject, readYamlFile } from "../common/utils"
import { getRequest, getService, readAndResolveApi } from "../common/api"
import { glob } from "glob"
import path from "path"
import { kRequestDirName } from "../common/constants"

const ajvOptions: Options = { allErrors: true, strictSchema: false, validateFormats: false }

export const testCommand = async (projectDir: string) => {
    const ajv = new Ajv(ajvOptions)
    const errorsReport = {}

    const project = await loadProject(projectDir)
    for (const apiPath in project.services) {
        for (const apiMethod in project.services[apiPath]) {
            for (const apiVersion in project.services[apiPath][apiMethod]) {
                for (const apiFile of project.services[apiPath][apiMethod][apiVersion].apiFiles) {
                    const apiDoc = await readAndResolveApi(apiFile)
                    const apiService = getService(apiDoc, apiPath, apiMethod)
                    const serviceDir = getServiceDir(projectDir, apiPath, apiMethod, apiVersion)
                    const request = getRequest(apiService)
                    if (request) {
                        const validator = ajv.compile(request)
                        for (const exampleFileName of await glob(path.join(serviceDir, kRequestDirName, '*.test.json').replace(/\\/g, '/'))) {
                            const valid = validator(readYamlFile(exampleFileName))
                            if (!valid) console.log(validator.errors)
                        }
                    }
                }
            }
        }
    }
}