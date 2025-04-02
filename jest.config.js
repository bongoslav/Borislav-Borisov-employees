module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	clearMocks: true,
	collectCoverage: false,
	testMatch: ['**/src/tests/**/*.test.ts'],
}; 