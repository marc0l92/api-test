/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['public'],
    verbose: true,
    collectCoverage: true,
    silent: false,
    moduleDirectories: [
        'node_modules',
        'src',
        'test',
    ]
}