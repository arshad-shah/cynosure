---
"@arshad-shah/cynosure": minor
---

ZoomControls works for a canvas as well as a document: `fits` chooses the menu's fit modes (`[]` for none), `buttons` adds Fit to view (`fit-page`, the whole content) and Actual size (100%), `steps` sets the percents zoom in and out go through, and `zoom` is optional (the preset equal to `percent` is marked). PanZoomCanvas's handle gains `zoom(setting)`, which applies any ZoomControls choice: a percent, `fit-page` (fit `bounds`) or `fit-width`. `zoomStep` takes the steps to use.
