export const kProjectFileName = 'api-test-project.yaml'

/**
 * @id api-test-project
 * @additionalProperties false
 */
export interface ApiTestProject {
    /**
     * ApiTestProject version
     */
    version?: number
    /**
     * Services collection
     */
    services?: {
        [apiPath: string]: {
            [apiMethod: string]: {
                [apiVersion: string]: {
                    apiFiles: string[]
                }
            }
        }
    }
}