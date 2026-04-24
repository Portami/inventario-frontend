import {useHidScanner} from '@/hooks/useHidScanner';
import {renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('useHidScanner', () => {
    // eslint-disable-next-line no-unused-vars -- Parameter is part of the callback signature
    let mockOnScan: (_code: string) => void;

    beforeEach(() => {
        mockOnScan = vi.fn();
        vi.clearAllMocks();
    });

    it('should initialize with isConnected false when inactive', () => {
        const {result} = renderHook(() => useHidScanner(false, mockOnScan));
        expect(result.current.isConnected).toBe(false);
    });

    it('should initialize with isConnected true when active', () => {
        const {result} = renderHook(() => useHidScanner(true, mockOnScan));
        expect(result.current.isConnected).toBe(true);
    });

    it('should toggle isConnected when active prop changes', () => {
        const {result, rerender} = renderHook(({isActive}: {isActive: boolean}) => useHidScanner(isActive, mockOnScan), {
            initialProps: {isActive: true},
        });

        expect(result.current.isConnected).toBe(true);
        rerender({isActive: false});
        expect(result.current.isConnected).toBe(false);
    });

    it('should attach keydown event listener when active', () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        renderHook(() => useHidScanner(true, mockOnScan));

        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        addEventListenerSpy.mockRestore();
    });

    it('should remove keydown event listener when inactive', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        const {rerender} = renderHook(({isActive}: {isActive: boolean}) => useHidScanner(isActive, mockOnScan), {
            initialProps: {isActive: true},
        });

        rerender({isActive: false});

        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });

    it('should not call onScan if only Enter is pressed without input', () => {
        renderHook(() => useHidScanner(true, mockOnScan));

        window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

        expect(mockOnScan).not.toHaveBeenCalled();
    });

    it('should be ready to listen for input when active', () => {
        const {result} = renderHook(() => useHidScanner(true, mockOnScan));

        // Main purpose of the hook is to be ready to listen
        expect(result.current.isConnected).toBe(true);
    });

    it('should initialize with empty scanned code', () => {
        const {result} = renderHook(() => useHidScanner(true, mockOnScan));
        expect(result.current.scannedCode).toBe('');
    });
});
