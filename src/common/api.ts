import { readFile } from "fs-extra"
import { ApiDoc, ApiModel, ApiService } from "../interfaces/api"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import yaml from 'js-yaml'

export const isValidApiDoc = (apiDoc: ApiDoc): boolean => {
    return typeof apiDoc === 'object' && ('swagger' in apiDoc || 'openapi' in apiDoc)
        && 'paths' in apiDoc
        && 'info' in apiDoc && 'version' in apiDoc.info
}

export const getRequest = (apiService: ApiService): ApiModel => {
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

export const getResponses = (apiService: ApiService): { [statusCode: string]: ApiModel } => {
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

export const readAndResolveApi = async (fileName: string): Promise<ApiDoc> => {
    const apiDoc: ApiDoc = yaml.load(await readFile(fileName, { encoding: 'utf-8' })) || {}
    return (await $RefParser.dereference(apiDoc)) as unknown as ApiDoc
}