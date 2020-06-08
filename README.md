<div align="center">
  <img src="https://user-images.githubusercontent.com/52094761/83928161-b67afd00-a7c9-11ea-99c4-190121bfaf6f.png">
  <h1>LeafView</h1>
  <strong>An image viewer for minimalists.</strong>
  <img width="912" alt="2020-04-13 15 07 43" src="https://user-images.githubusercontent.com/52094761/79097565-037abe00-7d9b-11ea-9f38-5a9e995792d8.png">
</div>

[![GitHub CI](https://github.com/sprout2000/leafview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/leafview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/leafview)

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
$ git clone git@github.com:sprout2000/leafview.git
$ cd leafview
$ yarn install && yarn package
```

*Note that you will need to have [Node.js](https://nodejs.org), [Git](https://git-scm.com/) and [Yarn](https://yarnpkg.com/) installed.*

*And you might also need to have some build tools (ex. [Microsoft Build Tools](https://www.microsoft.com/en-us/download/details.aspx?id=48159), [Xcode](https://apps.apple.com/app/xcode/id497799835)) installed.*

## Download

### macOS

You can download the latest version of LeafView from the releases page here:  
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### Windows10

You can download the latest version of LeafView from [Microsoft Store](https://www.microsoft.com/store/apps/9P870THX6217).

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

## License

[MIT](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
