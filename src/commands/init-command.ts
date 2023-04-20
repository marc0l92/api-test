import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs-extra"
import { glob } from "glob"
import path from "path"
import { ApiTestProject, kProjectFileName } from "../interfaces/project"
import yaml from 'js-yaml'
import { ApiDoc } from "../interfaces/api"

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

export const initCommand = async (source: string, destinationDir: string) => {
    const project = await loadProject(destinationDir)

    for (const fileName of await glob(source)) {
        try {
            const apiDoc: ApiDoc = yaml.load(readFileSync(fileName, { encoding: 'utf-8' })) || {}
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
                            mkdirSync(serviceDir, { recursive: true })

                        }
                    }
                }
            }
        }
        catch (e) {
            console.warn(`Error while processing "${fileName}":`, e)
        }
    }

    await saveProject(destinationDir, project)
}