import FeltPage from '@/pages/FeltPage';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import React from 'react';
import {MemoryRouter} from 'react-router';
import {vi} from 'vitest';

// Mock backend — Daten werden INSIDE der Factory erstellt, damit hoisting kein Problem ist.
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
            supplierName: 'Supplier B',
            thickness: 2,
            density: 200,
            price: 10,
            isLowOnSupply: true,
            hasBeenReordered: true,
        },
    ];
    return {
        fetchFelts: vi.fn().mockResolvedValue(mockFelts),
        fetchRolls: vi.fn().mockResolvedValue([]),
        deleteFelt: vi.fn().mockResolvedValue(undefined),
    };
});

// Mock DeleteFeltDialog to render a confirm button that calls onConfirm when clicked
vi.mock('@/pages/components/DeleteFeltDialog', () => {
    return {
        default: ({open, felt, onConfirm, onClose}: any) =>
            open ? (
                <div data-testid="delete-dialog">
                    <div data-testid="delete-felt">{felt?.articleNumber}</div>
                    <button
                        data-testid="confirm-delete"
                        onClick={() => {
                            void onConfirm();
                        }}
                    >
                        Confirm
                    </button>
                    <button data-testid="close-delete" onClick={() => onClose()}>
                        Close
                    </button>
                </div>
            ) : null,
    };
});

describe('FeltPage', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders rows from backend', async () => {
        render(
            <MemoryRouter>
                <FeltPage />
            </MemoryRouter>,
        );

        // Use title query to select DataGrid cells (unique) to avoid conflict with dialog text
        expect(await screen.findByTitle('A-1')).toBeInTheDocument();
        expect(screen.getByTitle('B-2')).toBeInTheDocument();
    });

    it('delete flow: clicking delete opens delete dialog and calls backend delete', async () => {
        const backend = await import('@/services/backend');
        render(
            <MemoryRouter>
                <FeltPage />
            </MemoryRouter>,
        );

        // wait for rows
        await screen.findByTitle('A-1');

        // find all delete buttons by aria-label (the actions column uses aria-label="delete")
        const deleteButtons = await screen.findAllByLabelText('delete');
        expect(deleteButtons.length).toBeGreaterThan(0);

        // click the first delete button
        fireEvent.click(deleteButtons[0]);

        // delete dialog should appear
        const deleteDialog = await screen.findByTestId('delete-dialog');
        expect(deleteDialog).toBeInTheDocument();
        expect(within(deleteDialog).getByTestId('delete-felt')).toHaveTextContent('A-1');

        // click confirm (calls onConfirm which calls backend.deleteFelt)
        fireEvent.click(within(deleteDialog).getByTestId('confirm-delete'));

        await waitFor(() => {
            expect(backend.deleteFelt).toHaveBeenCalledWith(1);
        });
    });
});
