# Little by Little

Little by Little is a small, installable habit tracker made with HTML, CSS, and JavaScript. It runs in a mobile browser, saves habits on the device, and works offline after its first successful load.

## Run it on Windows

Open a terminal in this folder and start a local web server:

```powershell
npx --yes http-server . -p 8080
```

Open `http://localhost:8080` in a browser on your PC. To try it on an Android phone over your home Wi-Fi, find the PC's local IP address with `ipconfig`, start the server with `npx --yes http-server . -p 8080 -a 0.0.0.0`, then open `http://PC-IP-ADDRESS:8080` on the phone. Allow the connection through Windows Firewall if prompted. The phone and PC must be on the same network.

Browsers generally require a secure HTTPS connection to install a web app or enable offline support. `localhost` is treated as secure for development on the PC; for an Android phone, publish the folder to an HTTPS host (for example, GitHub Pages) before installing it from Chrome's menu or the app's Install button.

## Publish with GitHub Pages

Create a GitHub repository for this folder and push the project to its `main` branch. In the repository, open **Settings > Pages** and set the build and deployment source to **GitHub Actions**. The workflow in `.github/workflows/deploy-pages.yml` will publish the app on pushes to `main`; you can also run it manually from the Actions tab. GitHub Pages will show the HTTPS site URL when deployment finishes.

Open that URL on Android in Chrome, then choose **Install app** (or Chrome's **Install app** menu item). Open the installed app once while online so its files are cached; then test launching it offline and confirming habits survive closing and reopening it.

## Test

```powershell
node --test .\tests\habit-data.test.mjs
```

## Google Play

This project is a Progressive Web App (PWA), not a native Android package. You can install it from a supported Android browser after hosting it over HTTPS. Publishing in Google Play requires additional packaging as an Android app (for example, a Trusted Web Activity), store assets, a signed release, a Play Console account, and compliance with current Play policies. A native Android app can be a later learning step.

Habits are stored only in this browser on this device. Clearing browser data will remove them.
