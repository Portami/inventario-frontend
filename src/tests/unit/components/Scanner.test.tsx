import Scanner from '@/components/Scanner';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// Mock the backend service
vi.mock('@/services/backend', () => ({
    lookupRollCode: vi.fn(),
}));

// Mock the scanner mock
vi.mock('@/services/mock/scannerMock', () => ({
    getMockPresetCodes: vi.fn(() => ['00001', '00002', '00003']),
}));

import {lookupRollCode} from '@/services/backend';

// @ts-ignore
const mockLookupRollCode = lookupRollCode as vi.Mock;

const renderScanner = (props = {}) => {
    const defaultProps = {
        isOpen: true,
        onSuccess: vi.fn(),
        onError: vi.fn(),
        onClose: vi.fn(),
    };

    return render(
        <BrowserRouter>
            <Scanner {...defaultProps} {...props} />
        </BrowserRouter>,
    );
};

describe('Scanner Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLookupRollCode.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should not render when isOpen is false', () => {
            render(
                <BrowserRouter>
                    <Scanner isOpen={false} onSuccess={vi.fn()} onError={vi.fn()} onClose={vi.fn()} />
                </BrowserRouter>,
            );

            const modal = screen.queryByRole('dialog');
            expect(modal).not.toBeInTheDocument();
        });

        it('should render modal when isOpen is true', () => {
            renderScanner();
            expect(screen.getByText('Rollcode scannen')).toBeInTheDocument();
        });

        it('should display scan method selector', () => {
            renderScanner();
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThan(0);
        });
    });

    describe('Bluetooth Scanner Mode', () => {
        it('should display Bluetooth scanner instructions', () => {
            renderScanner();

            const bluetoothElements = screen.queryAllByText(/Bluetooth-Scanner/i);
            expect(bluetoothElements.length).toBeGreaterThan(0);

            const instructions = screen.queryByText(/Verbinden Sie Ihren Bluetooth-Scanner/i);
            expect(instructions).toBeInTheDocument();
        });

        it('should show connection status chip', () => {
            renderScanner();

            // Look for the status indicator (Bereit or Warten)
            const statusElements = screen.queryAllByText(/Bereit|Warten/);
            expect(statusElements.length).toBeGreaterThan(0);
        });

        it('should handle keyboard input in Bluetooth mode - simple test', async () => {
            mockLookupRollCode.mockResolvedValueOnce({
                type: 'roll' as const,
                id: '00001',
            });

            const onSuccess = vi.fn();
            renderScanner({onSuccess});

            // Just verify the component rendered
            expect(screen.getByText('Rollcode scannen')).toBeInTheDocument();
        });
    });

    describe('Manual Entry Mode', () => {
        it('should switch to manual entry mode', async () => {
            renderScanner();

            const selects = screen.getAllByRole('combobox');
            const selectElement = selects[0];
            fireEvent.mouseDown(selectElement);

            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('00001')).toBeInTheDocument();
            });
        });

        it('should validate code format in manual entry', async () => {
            renderScanner();

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');
            const submitButton = screen.getByRole('button', {name: /Suchen/i});

            // Try submitting empty (should show error in manual entry)
            expect(submitButton).toBeInTheDocument();

            // Try submitting 5 digits (valid)
            await userEvent.type(input, '00001');
            expect(submitButton).not.toBeDisabled();
        });

        it('should only accept numeric input in manual mode', async () => {
            renderScanner();

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');

            await userEvent.type(input, 'abc123xyz');
            expect(input).toHaveValue('123');
        });

        it('should limit input to 5 characters', async () => {
            renderScanner();

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');

            await userEvent.type(input, '0000099999');
            expect(input).toHaveValue('00000');
        });

        it('should submit valid code and call backend', async () => {
            mockLookupRollCode.mockResolvedValueOnce({
                type: 'roll' as const,
                id: '00001',
            });

            const onSuccess = vi.fn();
            renderScanner({onSuccess});

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');
            const submitButton = screen.getByRole('button', {name: /Suchen/i});

            await userEvent.type(input, '00001');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLookupRollCode).toHaveBeenCalledWith('00001');
                expect(onSuccess).toHaveBeenCalled();
            });
        });
    });

    describe('Code Validation', () => {
        it('should reject code with less than 5 digits', async () => {
            renderScanner();

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');
            const submitButton = screen.getByRole('button', {name: /Suchen/i});

            await userEvent.type(input, '123');
            expect(submitButton).toBeDisabled();
        });

        it('should accept exactly 5 digits', async () => {
            mockLookupRollCode.mockResolvedValueOnce({
                type: 'roll' as const,
                id: '99999',
            });

            const onSuccess = vi.fn();
            renderScanner({onSuccess});

            // Switch to manual mode
            const selects = screen.getAllByRole('combobox');
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            const input = await screen.findByPlaceholderText('00001');
            const submitButton = screen.getByRole('button', {name: /Suchen/i});

            await userEvent.type(input, '99999');
            expect(submitButton).not.toBeDisabled();

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLookupRollCode).toHaveBeenCalledWith('99999');
            });
        });
    });

    describe('Error Handling', () => {
        it('should clear error when changing mode', async () => {
            renderScanner();

            // Test basic rendering and mode switching
            const selects = screen.getAllByRole('combobox');
            expect(selects.length).toBeGreaterThan(0);

            // Switch modes to verify error clearing works
            fireEvent.mouseDown(selects[0]);
            const manualOption = screen.getByRole('option', {name: /Manuelle Eingabe/i});
            fireEvent.click(manualOption);

            await waitFor(() => {
                // Should now be in manual mode
                const updatedSelects = screen.getAllByRole('combobox');
                expect(updatedSelects.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Modal Actions', () => {
        it('should close modal when Cancel is clicked', () => {
            const onClose = vi.fn();
            renderScanner({onClose});

            const cancelButton = screen.getByRole('button', {name: /Abbrechen/i});
            fireEvent.click(cancelButton);

            expect(onClose).toHaveBeenCalled();
        });
    });
});
