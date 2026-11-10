# RED Character Console — Fantastic Dice GitHub Pages

This repository kit includes the existing Character Console and a GitHub Actions workflow that **downloads and packages the actual Fantastic Dice v1.1.4 module, workers, and assets** during deployment. It does not require a CDN at runtime.

## Deploy

1. Create a **new public repository** named `cyberpunk-red` under `L3lackstardust` (do not use Aetherforge).
2. Upload **all contents of this kit**, including the hidden `.github/workflows/pages.yml` file, to the root of the new repository.
3. In GitHub repository **Settings → Pages**, set **Build and deployment → Source: GitHub Actions**.
4. Open **Actions → Deploy RED Character Console** and check that the job succeeds.
5. Visit `https://l3lackstardust.github.io/cyberpunk-red/`. Check the 3D status and roll D10 and D6.

This is a deployment kit, not proof that the engine has rendered in a browser. It uses GitHub Actions network access to download the package. If the workflow fails, check its log before sharing the URL.

## Security

The character sheet saves in localStorage and exports JSON. Google Sheets cloud synchronization and secure player permissions are **not** implemented. Do not store GM secrets in this public repo. Portraits are still third-party hotlinks; image hosting remains deferred.

Fantastic Dice is MIT licensed; upstream: https://github.com/3d-dice/dice-box .
