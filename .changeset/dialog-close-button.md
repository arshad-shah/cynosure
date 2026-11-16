---
"@arshad-shah/cynosure": minor
---

Dialog and Sheet: `closeButton={false}` hides the header's close button while Escape and the backdrop still close the dialog, for a dialog whose own actions close it (a label picker) or a progress overlay. With `titleHidden` as well, the header takes no room and the title still names the dialog.
