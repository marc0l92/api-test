import { existsSync, mkdir, mkdirSync, readFileSync, writeFile, writeFileSync, writeJSON, writeJSONSync } from "fs-extra"
import { glob } from "glob"
import path from "path"
import { ApiTestProject, kProjectFileName } from "../interfaces/project"
import yaml from 'js-yaml'
import { ApiDoc, ApiService } from "../interfaces/api"
import { JSONSchemaFaker } from "json-schema-faker"
import { ApiModel } from "../interfaces/api"
import $RefParser from "@apidevtools/json-schema-ref-parser"

JSONSchemaFaker.option("alwaysFakeOptionals", true);

const loadProject = async (projectDir: string): Promise<ApiTestProject> => {
    mkdirSync(projectDir, { recursive: true })
    const projectFileName = path.join(projectDir, kProjectFileName)
    let project: ApiTestProject = {}
    if (existsSync(projectFileName)) {
        project = yaml.load(readFileSync(projectFileName, { encoding: 'utf-8' })) || {}
    }
    migrateProjectVersion(project)
    return project
}

const saveProject = async (projectDir: string, project: ApiTestProject) => {
    const projectFileName = path.join(projectDir, kProjectFileName)
    const metadata = '# yaml-language-server: $schema=https://raw.githubusercontent.com/marc0l92/api-test/master/dist/api-test-project.schema.json'
    writeFileSync(projectFileName, metadata + '\n\n' + yaml.dump(project))
}

const migrateProjectVersion = (project: ApiTestProject) => {
    switch (project.version) {
        default:
            project.version = 1
        case 1:
            if (!('services' in project)) {
                project.services = {}
            }
            break
    }
}

const isValidApiDoc = (apiDoc: ApiDoc): boolean => {
    return typeof apiDoc === 'object' && ('swagger' in apiDoc || 'openapi' in apiDoc)
        && 'paths' in apiDoc
        && 'info' in apiDoc && 'version' in apiDoc.info
}

const arrayPushUnique = (array: string[], item: string) => {
    if (array.indexOf(item) === -1) {
        array.push(item)
    }
}

const getRequest = (apiService: ApiService): ApiModel => {
    // OpenApi3
    if ('requestBody' in apiService && 'content' in apiService.requestBody) {
        const requestTypes = Object.values(apiService.requestBody.content)
        for (const requestType of requestTypes) {
            if ('schema' in requestType) {
                return requestType.schema
            }
        }
    }
    // Swagger2
    if ('properties' in apiService) {
        for (const property of apiService.properties) {
            if (property.in === 'body' && 'schema' in property) {
                return property.schema
            }
        }
    }
    return null
}

const getResponses = (apiService: ApiService): { [statusCode: string]: ApiModel } => {
    const responses: { [statusCode: string]: ApiModel } = {}
    if ('responses' in apiService) {
        for (const [statusCode, response] of Object.entries(apiService.responses)) {
            // OpenApi3
            if ('content' in response) {
                const responseTypes = Object.values(response.content)
                for (const responseType of responseTypes) {
                    if ('schema' in responseType) {
                        responses[statusCode] = responseType.schema
                    }
                }
            }
            // Swagger2
            if ('schema' in response) {
                responses[statusCode] = response.schema
            }
        }
    }
    return responses
}

const readAndResolveApi = async (fileName: string): Promise<ApiDoc> => {
    const apiDoc: ApiDoc = yaml.load(readFileSync(fileName, { encoding: 'utf-8' })) || {}
    return (await $RefParser.dereference(apiDoc)) as unknown as ApiDoc
}

const generateGitIgnore = async (projectDir: string) => {
    await writeFile(path.join(projectDir, '.gitignore'), 'schema.json')
}

export const initCommand = async (source: string, destinationDir: string) => {
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
                            const serviceDir = path.join(destinationDir, 'services', apiPath.replace(/\//g, '-'), apiMethod, apiVersion)
                            const request = getRequest(apiService)
                            if (request) {
                                await mkdir(path.join(serviceDir, 'request'), { recursive: true })
                                writeJSON(path.join(serviceDir, 'request', 'schema.json'), request)
                                const fullExample: any = await JSONSchemaFaker.resolve(request)
                                fullExample['$schema'] = './schema.json'
                                writeFile(path.join(serviceDir, 'request', 'full.test.json'), JSON.stringify(fullExample, null, 2))
                            }
                            const responses = getResponses(apiService)
                            for (const [statusCode, response] of Object.entries(responses)) {
                                await mkdir(path.join(serviceDir, 'responses', statusCode), { recursive: true })
                                writeJSON(path.join(serviceDir, 'responses', statusCode, 'schema.json'), response)
                                const fullExample: any = await JSONSchemaFaker.resolve(response)
                                fullExample['$schema'] = './schema.json'
                                writeFile(path.join(serviceDir, 'responses', statusCode, 'full.test.json'), JSON.stringify(fullExample, null, 2))
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