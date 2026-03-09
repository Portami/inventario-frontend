import Demo from '../../../pages/Demo';
import {render, screen} from '@testing-library/react';

describe('Demo', () => {
    it('renders the heading', () => {
        render(<Demo />);

        expect(screen.getByRole('heading', {name: /hello react/i})).toBeInTheDocument();
    });

    it('renders the button', () => {
        render(<Demo />);

        expect(screen.getByRole('button', {name: /test button/i})).toBeInTheDocument();
    });
});
