import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs-extra"
import { glob } from "glob"
import path from "path"
import { ApiTestProject, kProjectFileName } from "./project-interface"
import yaml from 'js-yaml'

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

const isSwaggerFile = (fileContent: string) => {
}

export const initCommand = async (source: string, destinationDir: string) => {
    const project = await loadProject(destinationDir)

    for (const file of await glob(source)) {
        console.log(file)
    }

    await saveProject(destinationDir, project)
}