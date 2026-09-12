# Matatu Sun Side Advisor

This is a Vite project using pnpm. Do not open `index.html` directly with `file://`.

From PowerShell in this folder, run:

```powershell
pnpm install
pnpm dev
```

Then open the localhost URL printed by Vite.

The browser error `GET file:///.../js/app.js net::ERR_FAILED` happens because browsers block module imports from `file://` pages.
