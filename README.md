<div align="center">
  <img src="https://user-images.githubusercontent.com/52094761/79167678-fa353400-7e22-11ea-896b-4e7f600ad63a.png">
  <h1>LessView</h1>
  <strong>An image viewer for minimalists.</strong>
  <img width="912" alt="2020-04-13 15 07 43" src="https://user-images.githubusercontent.com/52094761/79097565-037abe00-7d9b-11ea-9f38-5a9e995792d8.png">
</div>

[![GitHub CI](https://github.com/sprout2000/lessview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/lessview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/lessview)](https://github.com/sprout2000/lessview/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/lessview)

## Features

- Pan & WheelZoom
- Fast
- Secure
- Memory-Friendly
- Auto Update (*macOS*)

## Security

API | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`

## Supported Image Formats

- `bmp` (com.microsoft.bmp)
- `ico` (com.microsoft.ico)
- `gif` (com.compuserve.gif)
- `jpg` (public.jpeg)
- `png` (public.png)
- `svg` (public.svg-image)
- `webp` (image/webp)

## Build and Install

```
$ git clone git@github.com:sprout2000/lessview.git
$ cd lessview
$ yarn install && yarn package
```

*Note that you will need to have [Node.js](https://nodejs.org), [Git](https://git-scm.com/) and [Yarn](https://yarnpkg.com/) installed.*

*And you might also need to have some build tools (ex. [Microsoft Build Tools](https://www.microsoft.com/en-us/download/details.aspx?id=48159), [Xcode](https://apps.apple.com/app/xcode/id497799835)) installed.*

## Download

You can download binary packages for macOS (signed & notarized) at [releases](https://github.com/sprout2000/lessview/releases).

## Usage

### Keyboard Shortcuts

Key | Function | Platform
:---: | :--- | :---
<kbd>J</kbd> | Next Image | Both
<kbd>K</kbd> | Previous Image | Both
<kbd>+</kbd> | Zoom In | Both
<kbd>-</kbd> | Zoom Out | Both
<kbd>0</kbd> | Reset Zoom | Both
<kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | pan | Both
<kbd>Command</kbd>+<kbd>Control</kbd>+<kbd>F</kbd> | Toggle Fullscreen | macOS
<kbd>F11</kbd> | Toggle Fullscreen | Windows
<kbd>Alt</kbd> | Show/Hide Menu Bar | Windows

### Mouse Operations

Mouse | Function
:---: | :---
drag | pan
double click | reset zoom
wheel | zoom in/out

## Contributing

### Adding missing translations

The list of all English strings can be found in [en.json](https://github.com/sprout2000/lessview/blob/master/src/locales/en.json). If there are translations missing for your language and you'd like to help with the translation, you can add the translated strings to your language's file in [src/locales](https://github.com/sprout2000/lessview/tree/master/src/locales) and submit a PR.

### Adding a new language

If the app isn't translated into your language yet and you'd like to help out, you can easily add translations with the following steps:

1. The translation files can be found in [`src/locales`](https://github.com/sprout2000/lessview/tree/master/src/locales). Duplicate the [`en.json`](https://github.com/sprout2000/lessview/blob/master/src/locales/en.json) file as `[LANG].json`, where `[LANG]` is the [shortcode of your language](https://electronjs.org/docs/api/locales).
2. In the file you just created, replace the English translations with your own.
3. Run the app in your language (just type `npm start`) and make sure that the translations fit into the app (e.g. that they aren't too long for input fields).
4. Submit a PR. Thanks for your help!

## License

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md)
