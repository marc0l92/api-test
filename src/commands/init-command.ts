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
    writeFileSync(projectFileName, yaml.dump(project))
}

const migrateProjectVersion = (project: ApiTestProject) => {
    switch (project.version) {
        default:
            project.version = 1
    }
}

const isValidApiDoc = (apiDoc: ApiDoc): boolean => {
    return typeof apiDoc === 'object' && ('swagger' in apiDoc || 'openapi' in apiDoc)
        && 'paths' in apiDoc
        && 'info' in apiDoc && 'version' in apiDoc.info
}

export const initCommand = async (source: string, destinationDir: string) => {
    const project = await loadProject(destinationDir)
    if (!('services' in project)) {
        project.services = {}
    }

    for (const fileName of await glob(source)) {
        try {
            const apiDoc: ApiDoc = yaml.load(readFileSync(fileName, { encoding: 'utf-8' })) || {}
            if (isValidApiDoc(apiDoc)) {
                const apiVersion = apiDoc.info.version
                for (const path in apiDoc.paths) {
                    if (!(path in project.services)) {
                        project.services[path] = {}
                    }
                    for (const method in apiDoc.paths[path]) {
                        if (method !== 'properties') {
                            if (!(method in project.services[path])) {
                                project.services[path][method] = {}
                            }
                            if (!(apiVersion in project.services[path][method])) {
                                project.services[path][method][apiVersion] = { apiFiles: [] }
                            }
                            project.services[path][method][apiVersion].apiFiles.push(fileName)
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