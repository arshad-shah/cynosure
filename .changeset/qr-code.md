---
"@arshad-shah/cynosure": minor
---

New `QRCode`: a QR code drawn as one crisp SVG path from Cynosure's own encoder (versions 1 to 40, levels L, M, Q and H, numeric, alphanumeric or UTF-8 text). `size` takes `sm`, `md`, `lg` or a number of pixels, `quietZone` keeps the light margin scanners need, and `icon` puts a logo in the middle and raises the level to H. It stays dark on light in dark mode, because many phones cannot scan an inverted code. `qrMatrix`, `qrPath` and `qrToSvg` export the encoder for pages without React.
