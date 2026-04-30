import FeltPage from '@/pages/FeltPage';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// mock Backend-Service
vi.mock('@/services/backend', async () => {
    return {
        fetchFelts: vi.fn(),
        deleteFelt: vi.fn(),
    };
});

// mock Toast-Hook
const mockToast = vi.fn();
vi.mock('@/components/ToastProvider', async () => {
    const actual = await vi.importActual<typeof import('@/components/ToastProvider')>('@/components/ToastProvider');
    return {
        ...actual,
        useToast: () => mockToast,
    };
});

import {deleteFelt, fetchFelts} from '@/services/backend';

const mockFelts = [
    {
        id: 1,
        feltTypeName: 'Wolle',
        color: 'Rot',
        articleNumber: 'ART-001',
        supplierName: 'Lieferant A',
        thickness: 3.5,
        density: 850,
        price: 12.5,
        isLowOnSupply: false,
        hasBeenReordered: false,
    },
];

describe('FeltPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lädt und zeigt Filze an', async () => {
        vi.mocked(fetchFelts).mockResolvedValue(mockFelts as any);

        render(<FeltPage />);

        await waitFor(() => {
            expect(fetchFelts).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText(/Wolle/i)).toBeInTheDocument();
        expect(screen.getByText(/Rot/i)).toBeInTheDocument();
    });

    it('löscht einen Filz und zeigt Success-Toast', async () => {
        vi.mocked(fetchFelts).mockResolvedValue(mockFelts as any);
        vi.mocked(deleteFelt).mockResolvedValue(undefined);

        render(<FeltPage />);

        // Warten bis Tabelle geladen ist
        await screen.findByText(/Wolle/i);

        // Delete-Icon klicken
        const deleteButton = screen.getByLabelText('delete');
        await userEvent.click(deleteButton);

        // Dialog bestätigen
        await userEvent.click(screen.getByRole('button', {name: 'Löschen'}));

        await waitFor(() => {
            expect(deleteFelt).toHaveBeenCalledWith(1);
        });

        expect(mockToast).toHaveBeenCalledWith('Filz erfolgreich gelöscht.', 'success');
    });
});
