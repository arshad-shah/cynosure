---
"@arshad-shah/cynosure": patch
---

Calendar builds its date formatters and reads each locale's week once instead of on every render (about 40 Intl objects per render before), so DateField stays light while typing.
