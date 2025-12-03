// Vue Test Utils setup

import { config } from '@vue/test-utils';

// Mock Vue Router
config.mocks = {
  $router: {
    push: jest.fn(),
    replace: jest.fn()
  },
  $route: {
    params: {},
    query: {}
  }
};

// Mock window.fetch
global.fetch = jest.fn();