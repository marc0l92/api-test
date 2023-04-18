export const kProjectFileName = 'api-test-project.yaml'

/**
 * @id api-test-project
 * @additionalProperties false
 */
export interface ApiTestProject {
    $schema?: string
    /**
     * ApiTestProject version
     */
    version?: number
}