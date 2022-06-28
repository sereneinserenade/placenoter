<p align="center">
  <img src="public/logo-placenoter.svg" width="200"/>
  
  <h1 align="center">PlaceNoter - Take Notes in Browser</h1>
</p>

This extension replaces your new tab with a **note taking app** so you never have to **leave chrome**.

If you **👍 / ❤️ what I'm doing**, consider **🌟ing the repo**, **I** and the **Open-Source-Community** appreciate it very much ❤️.

## Installation:

From [chrome webstore.](https://chrome.google.com/webstore/detail/pagenoter/jefjneinemilpncgcfdglggeheiaakfc?hl=en-GB&authuser=0)

## Demo

- You can try it out without installing the extension at https://sereneinserenade.github.io/placenoter/

<details>
  <summary> <b> List of Features </b> </summary> <br />

- **Code**: Write code with **~35 different languages** to choose from 🧑‍💻: Great for us **programmers/developers/coders**
- **Shortcuts 🔗**: Sortable shortcuts to your websites
- **Easy-to-use 🍰**: Open new tab and start writing
- **Auto-save 🔄**: Never worry about saving your data, it does that automatically
- **Theme ⚫️⚪️**: Great support for light/dark theme, so you can work late in the night or midday without stressing your eyes
- **Secure 🔐**: No data is sent to any server whatsoever, it always lies on your computer, and you can export it to a JSON file at will
- **Recycle Bin ♻️**: Notes that you deleted live in recycle bin unless deleted permanently
- It's **open-source** and **free to use** ❤️!
</details>

https://user-images.githubusercontent.com/45892659/156848685-6a8043e6-de07-4c37-9c3d-be6e65060647.mp4

## Development (local setup)

```
npm i

# Creates 'dist' folder and runs the vite server on http://localhost:3000/
npm run dev
```

It you try and open the page http://localhost:3000/ you will get an error: `This localhost page can’t be found` - a kind of 404 error.

In order to see it running, you need to install it as a local extension. To do that, navigate to chrome://extensions/ and click the `Load unpacked` button, it will ask you to "Select the extension directory", so navigate to the repo root, select the `dist` folder, and click open.

Now when you open a new tab, it will open Placenoter from your local. Chrome doesn't like it initially, and will offer to revert to the original. Once you tell it no, it will leave it in place.

It works well like this, as you make changes to the code, the page will be updated.

## Stargazers

[![Stargazers repo roster for @sereneinserenade/placenoter](https://reporoster.com/stars/dark/sereneinserenade/placenoter)](https://github.com/sereneinserenade/placenoter/stargazers)

## Made with ❤️ using these things.

![NextUi](https://img.shields.io/badge/NextUI-1ca0f1?style=for-the-badge&labelColor=c56394&logo=nextui&logoColor=white) 
![React Badge](https://img.shields.io/badge/React-1ca0f1?style=for-the-badge&labelColor=61dafb&logo=react&logoColor=white) 
![Webpack](https://img.shields.io/badge/Webpack-1ca0f1?style=for-the-badge&labelColor=1c73b9&logo=Webpack&logoColor=white) 
![Sass](https://img.shields.io/badge/Sass-1ca0f1?style=for-the-badge&labelColor=c56394&logo=sass&logoColor=white) 
