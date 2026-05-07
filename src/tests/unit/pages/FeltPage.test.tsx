import FeltPage from '@/pages/FeltPage';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import React from 'react';
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
        deleteFelt: vi.fn().mockResolvedValue(undefined),
    };
});

// Mock FeltDialog to be a simple component that renders when open
vi.mock('@/pages/components/FeltDialog', () => {
    return {
        default: ({open, felt}: any) => (open ? <div data-testid="felt-dialog">{felt?.articleNumber}</div> : null),
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

    it('renders rows from backend and opens edit dialog on row click', async () => {
        render(<FeltPage />);

        // wait for rows to render (article numbers should appear)
        // Use title query to select the DataGrid cell (unique) to avoid conflict with dialog text
        const cell = await screen.findByTitle('A-1');
        expect(cell).toBeInTheDocument();

        // also ensure the other row exists
        expect(screen.getByTitle('B-2')).toBeInTheDocument();

        // click the DataGrid cell to open the FeltDialog
        fireEvent.click(cell);

        // dialog should open and show articleNumber — assert inside the dialog container to avoid ambiguity
        const dialog = await screen.findByTestId('felt-dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('A-1')).toBeInTheDocument();
    });

    it('delete flow: clicking delete opens delete dialog and calls backend delete', async () => {
        const backend = await import('@/services/backend');
        render(<FeltPage />);

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
