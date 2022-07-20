module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalTeardown: './tests/teardown.global.ts',
};