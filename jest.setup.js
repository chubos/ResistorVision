// Jest setup file

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Tabs: 'Tabs',
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Suppress console warnings in tests (but keep errors visible for debugging)
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Ignore specific warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillMount'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

console.error = (...args) => {
  // Ignore specific errors in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Not implemented: HTMLFormElement'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

