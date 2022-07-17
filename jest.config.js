module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalTeardown: './src/tests/teardown.global.ts',
};