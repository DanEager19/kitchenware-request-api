export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalTeardown: './tests/teardown.global.ts',
};