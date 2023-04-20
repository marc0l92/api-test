export interface ApiDoc {
    openapi?: string
    swagger?: string
    info?: {
        version?: string
    }
    paths?: {
        [path: string]: {
            [method: string]: ApiService
        }
    }
}

export interface ApiService {
    properties?: {
        schema?: ApiModel
    }[]
    requestBody?: {
        content?: {
            [contentType: string]: {
                schema?: ApiModel
            }
        }
    }
    responses?: {
        [statusCode: string]: {
            content?: {
                [contentType: string]: {
                    schema?: ApiModel
                }
            }
            schema?: ApiModel
        }
    }
}

export interface ApiModel {
}