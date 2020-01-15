module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
  ],
  "setupFiles": [
     "./jest-setup.js"
   ],
  "testMatch": [
    "**/src/__tests__/*.spec.ts"
  ]
};
