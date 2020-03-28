# <img width="64" alt="icon_128x128@2x" src="https://user-images.githubusercontent.com/52094761/75083039-f3dcb700-5559-11ea-94c4-5550a885a972.png"> LessView

[![GitHub CI](https://github.com/sprout2000/lessview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/lessview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/lessview)](https://github.com/sprout2000/lessview/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/lessview)

An image viewer for minimalists.

<img width="912" alt="2020-03-27 8 18 18" src="https://user-images.githubusercontent.com/52094761/77708128-89141500-700a-11ea-90fe-31f30f1dd9ee.png">

## Security

Function | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`

## Features

- Pan & WheelZoom
- Fast
- Secure
- Memory-Friendly
- Auto Update (*macOS*)

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

*And you might also need to have some build tools (ex. [Microsoft Build Tools](https://www.microsoft.com/en-us/download/details.aspx?id=48159), [Xcode](https://apps.apple.com/app/xcode/id497799835) and so on...) installed.*

## Download

You can download binary packages for macOS (signed & notarized) at [releases](https://github.com/sprout2000/lessview/releases).

## Usage

### Keyboard Shortcuts

Key | Function | Platform
:---: | :--- | :---
<kbd>J</kbd> | Next Image | All
<kbd>K</kdb> | Previous Image | All
<kbd>+</kdb> | Zoom In | All
<kbd>-</kdb> | Zoom Out | All
<kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | pan | All
<kbd>Command</kbd>+<kbd>Control</kbd>+<kbd>F</kbd> | Toggle Fullscreen | macOS
<kbd>F11</kbd> | Toggle Fullscreen | Windows
<kbd>Alt</kbd> | Show/Hide Menu Bar | Windows

### Mouse Operations

Mouse | Function
:---: | :---
drag | pan
double click | reset zoom
wheel | zoom in/out

## License

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md)
