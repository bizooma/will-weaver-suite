

# Fix: QR Code Not Scannable Due to Invisible Finder Patterns

## Problem
The QR code generator defaults the "Eye Inner Color" to white (`#ffffff`), which matches the white background. This makes the inner dots of the three corner finder patterns invisible, preventing phones from detecting and reading the QR code.

## Root Cause
In `src/components/dashboard/QRCodeManager.tsx`, the form default state sets:
- `eyeInnerColor: "#ffffff"` (white -- invisible on white background)

The `cornersDotOptions.color` in the QR code rendering uses this value, so the critical inner corner markers disappear.

## Solution
Change the default `eyeInnerColor` from `#ffffff` to `#000000` (black) in two places:

### File: `src/components/dashboard/QRCodeManager.tsx`

1. **Initial form state (line 60)**: Change `eyeInnerColor` default from `"#ffffff"` to `"#000000"`
2. **Form reset after creation (line 264)**: Change `eyeInnerColor` reset value from `"#ffffff"` to `"#000000"`

This ensures the finder pattern inner dots are visible by default, making generated QR codes scannable.

## Technical Details
- The `cornersDotOptions.color` property in `qr-code-styling` controls the inner dots of the three corner squares
- These dots are essential for QR scanners to locate and orient the code
- Users can still customize this color, but the default will now produce a working QR code

