import FeltReorderPage from '@/pages/FeltReorderPage';
import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {vi} from 'vitest';

vi.mock('@/services/backend', () => {
    const mockFelts = [
        {
            id: 1,
            color: 'Red',
            feltTypeName: 'Wool',
            articleNumber: 'A-1',
            supplierName: 'Supplier A',
            thickness: 1,
            density: 100,
            price: 5,
            isLowOnSupply: true,
            hasBeenReordered: false,
        },
        {
            id: 2,
            color: 'Blue',
            feltTypeName: 'Synthetic',
            articleNumber: 'B-2',
            supplierName: 'Supplier A',
            thickness: 2,
            density: 200,
            price: 10,
            isLowOnSupply: true,
            hasBeenReordered: true,
        },
        {
            id: 3,
            color: 'Green',
            feltTypeName: 'Blended',
            articleNumber: 'C-3',
            supplierName: 'Supplier B',
            thickness: 3,
            density: 300,
            price: 12,
            isLowOnSupply: false,
            hasBeenReordered: false,
        },
    ];
    return {
        fetchFelts: vi.fn().mockResolvedValue(mockFelts),
        deleteFelt: vi.fn().mockResolvedValue(undefined),
    };
});

vi.mock('@/pages/components/FeltDialog', () => {
    return {
        default: ({open, felt}: any) => (open ? <div data-testid="felt-dialog">{felt?.articleNumber}</div> : null),
    };
});

vi.mock('@/pages/components/DeleteFeltDialog', () => {
    return {
        default: ({open, felt, onConfirm}: any) =>
            open ? (
                <div data-testid="delete-dialog">
                    <div data-testid="delete-felt">{felt?.articleNumber}</div>
                    <button data-testid="confirm-delete" onClick={() => void onConfirm()}>
                        Confirm
                    </button>
                </div>
            ) : null,
    };
});

describe('FeltReorderPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows not-reordered list and grouped supplier lists', async () => {
        render(<FeltReorderPage />);

        // The page filters felts by isLowOnSupply
        expect(await screen.findByText('Noch nicht nachbestellt (1)')).toBeInTheDocument();

        // A-1 should appear as a DataGrid cell (use title)
        expect(screen.getByTitle('A-1')).toBeInTheDocument();

        // Supplier group title should appear for Supplier A
        expect(screen.getByText(/Supplier A \(1\)/)).toBeInTheDocument();

        // B-2 should appear under Supplier A
        expect(screen.getByTitle('B-2')).toBeInTheDocument();
    });

    it('opens edit dialog when clicking a row in any DataGrid', async () => {
        render(<FeltReorderPage />);

        // wait for data
        const aCell = await screen.findByTitle('A-1');

        // click A-1 row
        fireEvent.click(aCell);
        const dialogA = await screen.findByTestId('felt-dialog');
        expect(within(dialogA).getByText('A-1')).toBeInTheDocument();

        // click B-2 row
        const bCell = screen.getByTitle('B-2');
        fireEvent.click(bCell);
        const dialogB = await screen.findByTestId('felt-dialog');
        expect(within(dialogB).getByText('B-2')).toBeInTheDocument();
    });
});
