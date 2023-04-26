import { exists, readFile, mkdir, writeFile } from "fs-extra"
import { ApiTestProject } from "../interfaces/project"
import yaml from 'js-yaml'
import path from "path"
import { kProjectFileName } from "./constants"

export const readYamlFile = async (fileName: string) => {
    return yaml.load(await readFile(fileName, { encoding: 'utf-8' })) || {}
}

export const loadProject = async (projectDir: string): Promise<ApiTestProject> => {
    await mkdir(projectDir, { recursive: true })
    const projectFileName = path.join(projectDir, kProjectFileName)
    let project: ApiTestProject = {}
    if (await exists(projectFileName)) {
        project = await readYamlFile(projectFileName)
    }
    migrateProjectVersion(project)
    return project
}

export const saveProject = async (projectDir: string, project: ApiTestProject) => {
    const projectFileName = path.join(projectDir, kProjectFileName)
    const metadata = '# yaml-language-server: $schema=https://raw.githubusercontent.com/marc0l92/api-test/master/dist/api-test-project.schema.json'
    await writeFile(projectFileName, metadata + '\n\n' + yaml.dump(project))
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

export const arrayPushUnique = (array: string[], item: string) => {
    if (array.indexOf(item) === -1) {
        array.push(item)
    }
}

export const getServiceDir = (destinationDir: string, apiPath: string, apiMethod: string, apiVersion: string): string => {
    return path.join(destinationDir, 'services', apiPath.replace(/^\//, '').replace(/\//g, '-'), apiMethod, apiVersion)
}