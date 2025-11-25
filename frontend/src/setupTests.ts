import '@testing-library/jest-dom'

class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!window.ResizeObserver) {
  // @ts-expect-error - assign mock
  window.ResizeObserver = ResizeObserverMock
}

