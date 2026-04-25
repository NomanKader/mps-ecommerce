import { screen } from '@testing-library/react';

import { HomePage } from '@pages/HomePage/HomePage';
import { renderWithProviders } from '../test/utils';

describe('HomePage', () => {
  it('renders the hero banner and featured products heading', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/launch modern multi-tenant commerce experiences/i)).toBeInTheDocument();
    expect(screen.getByText(/featured products/i)).toBeInTheDocument();
  });
});
