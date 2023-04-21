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