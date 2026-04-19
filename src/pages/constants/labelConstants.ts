/**
 * Label Generation Constants
 * Centralized configuration for label dimensions, page layout, and constraints
 */

// A4 page dimensions (mm)
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// Label spacing and margins (mm)
export const LABEL_GAP_MM = 8;
export const PAGE_MARGINS_MM = 20;

// Default label dimensions (mm)
export const DEFAULT_LABEL_WIDTH_MM = 90; // Allows ~2 labels per row on A4
export const DEFAULT_LABEL_HEIGHT_MM = 120; // Allows ~2 labels per column on A4

// Label dimension constraints (mm)
export const MIN_LABEL_WIDTH_MM = 50;
export const MAX_LABEL_WIDTH_MM = 200;
export const MIN_LABEL_HEIGHT_MM = 50;
export const MAX_LABEL_HEIGHT_MM = A4_HEIGHT_MM;
