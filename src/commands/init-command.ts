import { exists, mkdir, writeFile, writeJSON } from "fs-extra"
import { glob } from "glob"
import path from "path"
import { ApiDoc } from "../interfaces/api"
import { JSONSchemaFaker } from "json-schema-faker"
import { arrayPushUnique, getServiceDir, loadProject, saveProject } from "../common/utils"
import { getRequest, getResponses, isValidApiDoc, readAndResolveApi } from "../common/api"
import { kFullExampleFileName, kRequestDirName, kResponseDirName, kSchemaFileName } from "../common/constants"

JSONSchemaFaker.option("alwaysFakeOptionals", true);

const generateGitIgnore = async (projectDir: string) => {
    await writeFile(path.join(projectDir, '.gitignore'), kSchemaFileName)
}

export const initCommand = async (source: string, destinationDir: string, force: boolean) => {
    if (!force && await exists(destinationDir)) {
        throw new Error('The selected destination directory for a new project already exists')
    }
    const project = await loadProject(destinationDir)

    for (const fileName of await glob(source)) {
        try {
            const apiDoc: ApiDoc = await readAndResolveApi(fileName)
            if (isValidApiDoc(apiDoc)) {
                const apiVersion = apiDoc.info.version
                for (const apiPath in apiDoc.paths) {
                    if (!(apiPath in project.services)) {
                        project.services[apiPath] = {}
                    }
                    for (const apiMethod in apiDoc.paths[apiPath]) {
                        if (apiMethod !== 'properties') {
                            const apiService = apiDoc.paths[apiPath][apiMethod]
                            if (!(apiMethod in project.services[apiPath])) {
                                project.services[apiPath][apiMethod] = {}
                            }
                            if (!(apiVersion in project.services[apiPath][apiMethod])) {
                                project.services[apiPath][apiMethod][apiVersion] = { apiFiles: [] }
                            }
                            arrayPushUnique(project.services[apiPath][apiMethod][apiVersion].apiFiles, fileName)
                            const apiFileIndex = project.services[apiPath][apiMethod][apiVersion].apiFiles.length
                            const serviceDir = getServiceDir(destinationDir, apiPath, apiMethod, apiVersion)
                            const request = getRequest(apiService)
                            if (request) {
                                await mkdir(path.join(serviceDir, kRequestDirName), { recursive: true })
                                writeJSON(path.join(serviceDir, kRequestDirName, kSchemaFileName), request)
                                const fullExample: any = await JSONSchemaFaker.resolve(request)
                                fullExample['$schema'] = kSchemaFileName
                                writeFile(path.join(serviceDir, kRequestDirName, kFullExampleFileName(apiFileIndex)), JSON.stringify(fullExample, null, 2))
                            }
                            const responses = getResponses(apiService)
                            for (const [statusCode, response] of Object.entries(responses)) {
                                await mkdir(path.join(serviceDir, kResponseDirName, statusCode), { recursive: true })
                                writeJSON(path.join(serviceDir, kResponseDirName, statusCode, kSchemaFileName), response)
                                const fullExample: any = await JSONSchemaFaker.resolve(response)
                                if (typeof fullExample === 'object' && !Array.isArray(fullExample)) {
                                    fullExample['$schema'] = kSchemaFileName
                                }
                                writeFile(path.join(serviceDir, kResponseDirName, statusCode, kFullExampleFileName(apiFileIndex)), JSON.stringify(fullExample, null, 2))
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn(`Error while processing "${fileName}":`, e)
        }
    }

    generateGitIgnore(destinationDir)
    await saveProject(destinationDir, project)
}