import Ajv, { ErrorObject } from "ajv"
import { Options } from "ajv"
import { getServiceDir, loadProject, readYamlFile } from "../common/utils"
import { getRequest, getService, readAndResolveApi } from "../common/api"
import { glob } from "glob"
import path from "path"
import { kRequestDirName } from "../common/constants"
import { writeFile } from "fs-extra"
import yaml from "js-yaml"
import { exit } from "process"

const ajvOptions: Options = { allErrors: true, strictSchema: false, validateFormats: false }
interface TestReport {
    [fileName: string]: {
        errors: ErrorObject[]
    }
}

export const testCommand = async (projectDir: string, failOnError: boolean, reportOutput: string) => {
    const ajv = new Ajv(ajvOptions)
    const errorsReport: TestReport = {}
    let hasErrors = false

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
                            const exampleContent = await readYamlFile(exampleFileName)
                            const valid = validator(exampleContent)
                            if (!valid) {
                                errorsReport[exampleFileName] = {
                                    errors: validator.errors,
                                }
                                hasErrors = true
                            }
                        }
                    }
                }
            }
        }
    }

    if (reportOutput) {
        writeFile(reportOutput, yaml.dump(errorsReport))
    }
    if (failOnError && hasErrors) {
        exit(1)
    }
}