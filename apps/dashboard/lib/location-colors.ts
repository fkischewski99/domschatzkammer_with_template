/**
 * Default color palette for locations without a custom color assigned.
 * These colors are designed to be visually distinct and accessible.
 */
export const DEFAULT_LOCATION_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

/**
 * Gets the color for a location.
 * If the location has a custom color, returns that.
 * Otherwise, returns a color from the default palette based on the index.
 */
export function getLocationColor(color: string | null | undefined, index: number): string {
  if (color) {
    return color;
  }
  return DEFAULT_LOCATION_COLORS[index % DEFAULT_LOCATION_COLORS.length];
}

/**
 * Determines whether to use white or black text for optimal contrast
 * against a given background color.
 *
 * Uses the relative luminance formula from WCAG 2.0.
 */
export function getContrastColor(hexColor: string): 'white' | 'black' {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
