<p align="center">
  <img src="public/logo-placenoter.svg" width="200"/>
  
  <h1 align="center">PlaceNoter</h1>
</p>

- This extension replaces your new tab with a note taking app so you never have to leave chrome. (that's it for now.)
- Download it from [chrome webstore.](https://chrome.google.com/webstore/detail/pagenoter/jefjneinemilpncgcfdglggeheiaakfc?hl=en-GB&authuser=0)

If you **👍 / ❤️ what I'm doing**, consider **🌟ing the repo**, **I** and the **Open-Source-Community** appreciate it very much ❤️.

## Demo

- You can try it out without installing the extension at https://sereneinserenade.github.io/placenoter/

https://user-images.githubusercontent.com/45892659/156848685-6a8043e6-de07-4c37-9c3d-be6e65060647.mp4

## Development

```
npm i
npm run dev # Runs on http://localhost:3000/
```


It you try and open the page http://localhost:3000/ you will get an error: `This localhost page can’t be found` - a kind of 404 error.

In order to see it running, you need to install it as a local extension. To do that, navigate to chrome://extensions/ and click the `Load unpacked` button, it will ask you to "Select the extension directory", so navigate to the repo root, select the `dist` folder, and click open.

Now when you open a new tab, it will open Placenoter from your local. Chrome doesn't like it initially, and will offer to revert to the original. Once you tell it no, it will leave it in place.

It works well like this, as you make changes to the code, the page will be updated.

## Stargazers

[![Stargazers repo roster for @sereneinserenade/placenoter](https://reporoster.com/stars/dark/sereneinserenade/placenoter)](https://github.com/sereneinserenade/placenoter/stargazers)

## Made with ❤️ using these things.

![React Badge](https://img.shields.io/badge/React-1ca0f1?style=for-the-badge&labelColor=61dafb&logo=react&logoColor=white) ![Webpack](https://img.shields.io/badge/Webpack-1ca0f1?style=for-the-badge&labelColor=1c73b9&logo=Webpack&logoColor=white) ![Sass](https://img.shields.io/badge/Sass-1ca0f1?style=for-the-badge&labelColor=c56394&logo=sass&logoColor=white) [NextUI](https://nextui.org/)
