// Migration mapping for button variants
export const BUTTON_VARIANT_MAPPING = {
  'outline': 'secondary',    // outline -> secondary (gray background)
  'destructive': 'primary',  // destructive -> primary (keep emphasis but use standard variant)
  'link': 'ghost',          // link -> ghost
  'success': 'primary',     // success -> primary
  'warning': 'primary'      // warning -> primary
} as const;

// Helper function to migrate button variant
export function migrateButtonVariant(variant: string): 'primary' | 'default' | 'secondary' | 'ghost' {
  return BUTTON_VARIANT_MAPPING[variant as keyof typeof BUTTON_VARIANT_MAPPING] || 'default';
}