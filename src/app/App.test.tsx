import { screen } from '@testing-library/react';

import { HomePage } from '@pages/HomePage/HomePage';
import { renderWithProviders } from '../test/utils';

describe('HomePage', () => {
  it('renders the hero banner and top offers section', () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText(/10% cashback inspiration for a cleaner, greener grocery routine/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/top offers/i)).toBeInTheDocument();
  });
});
