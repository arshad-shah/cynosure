---
"@arshad-shah/cynosure": minor
---

QRCode: `color` and `background` props set the two colours. `qrContrast(color, background)` checks a pair before it is used (`scans` needs 4:1 and dark modules on light). `qrToSvg` takes `logo: { href, size? }` (level raised to H, the modules under it cleared, the picture drawn in the middle), and `qrToPng` makes the same code as a PNG Blob (`scale` pixels per module), for downloading what is shown.
