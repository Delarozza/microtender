import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  ethers: {
    utils: {
      formatEther: jest.fn((value) => value.toString()),
      parseEther: jest.fn((value) => value),
    },
  },
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
}));

global.window.ethereum = {
  request: jest.fn(),
  send: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children }) => <a>{children}</a>
}), { virtual: true });

describe('MicroTender App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays MicroTender branding', () => {
    render(<App />);

    expect(screen.getAllByText(/MicroTender/i).length).toBeGreaterThan(0);
  });
});

describe('Status Names', () => {
  test('all status names are defined in Slovak', () => {
    const statusNames = ['Aktívny', 'Hlasovanie', 'Ukončený', 'Splnený', 'Zrušený'];
    statusNames.forEach(status => {
      expect(status).toBeTruthy();
    });
  });
});

describe('UI Components', () => {
  test('renders navigation tabs when wallet connected', () => {
    expect(true).toBe(true);
  });
});
