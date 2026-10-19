import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('deve renderizar a aplicação com sucesso', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
