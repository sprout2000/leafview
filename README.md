# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="640" alt="Image by Frank Winkler from Pixabay" src="https://user-images.githubusercontent.com/52094761/211186660-c4313cf5-5a86-4bf5-b5c7-1997eb12b1ec.png">

_Image by <a href="https://pixabay.com/ja/users/frankwinkler-64960/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=540123">Frank Winkler</a> from <a href="https://pixabay.com/ja//?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=540123">Pixabay</a>_

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Grid view mode available
- Available in [13 languages](#globe_with_meridians-supported-languages)
- Auto update _(macOS / Linux)_
- Compatible with Windows Package Manager (aka [winget](https://github.com/microsoft/winget-pkgs))

<img width="480" alt="Grid View mode" src="https://user-images.githubusercontent.com/52094761/212441562-dc318929-028f-4eab-9527-23c2ae38969a.png">

## :inbox_tray: Download

### :computer: macOS & GNU/Linux

You can download the latest version of _LeafView_ from the releases page here:<br />
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

- _NOTE: macOS 10.13 or earlier is NOT supported._

### :desktop_computer: Windows 11

You can get _(or upgrade to)_ the latest version of _LeafView_ via [winget](https://github.com/microsoft/winget-pkgs):

```sh
winget install sprout2000.LeafView
```

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                      Key                                      | Function                           |
| :---------------------------------------------------------------------------: | :--------------------------------- |
| <kbd>J</kbd>, <kbd>Ctrl</kbd>+<kbd>N</kbd>, <kbd>CmdOrCtrl</kbd>+<kbd>→</kbd> | Next Image                         |
| <kbd>K</kbd>, <kbd>Ctrl</kbd>+<kbd>P</kbd>, <kbd>CmdOrCtrl</kbd>+<kbd>←</kbd> | Previous Image                     |
|                                 <kbd>+</kbd>                                  | Zoom In                            |
|                                 <kbd>-</kbd>                                  | Zoom Out                           |
|                                 <kbd>0</kbd>                                  | Reset Zoom                         |
|              <kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd>              | Pan                                |
|               <kbd>Fn</kbd>+<kbd>Delete</kbd> or <kbd>Del</kbd>               | Move to Trash                      |
|                  <kbd>H</kbd>, <kbd>Ctrl</kbd>+<kbd>L</kbd>                   | Toggle Grid View                   |
|              <kbd>CmdOrCtrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>               | Toggle Dark Mode                   |
|                 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>                 | Toggle Menubar _(Windows / Linux)_ |

### :computer_mouse: Mouse Operations

|    Mouse     | Function                             |
| :----------: | :----------------------------------- |
|     Drag     | Pan                                  |
|    Wheel     | Zoom in/out                          |
| Double click | Reset zoom                           |
| Right click  | Show the context menu when available |

## :globe_with_meridians: Supported Languages

| Language      | Code |     | Language  | Code |     | Language |  Code   |
| :------------ | :--: | :-: | :-------- | :--: | :-: | :------- | :-----: |
| اللغة العربية | `ar` |     | Français  | `fr` |     | Русский  |  `ru`   |
| Čeština       | `cs` |     | Magyar    | `hu` |     | 简体中文 | `zh_CN` |
| Deutsch       | `de` |     | 日本語    | `ja` |     | 繁体中文 | `zh_TW` |
| English       | `en` |     | Polski    | `pl` |     |
| Español       | `es` |     | Português | `pt` |     |

## :beers: Contributing

You can easily contribute to this repository by providing translation files.

1. Create `{your_LANG}.json` in `src/locales`.

```diff
  src
  ├── @types
  ├── createMenu.ts
  ├── locales
+ │   ├── cs.json
  │   ├── en.json
  │   └── ja.json
  ├── main.ts
  ├── preload.ts
  ├── setLocales.ts
  └── web
```

2. Import the locale into [src/setLocales.ts](https://github.com/sprout2000/leafview/blob/main/src/setLocales.ts) as follows:

```diff
  import en from './locales/en.json';
  import ja from './locales/ja.json';
+ import cs from './locales/cs.json';

  export const setLocales = (locale: string): void => {
    i18next.init({
      lng: locale,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        ja: { translation: ja },
+       cs: { translation: cs },
      },
    });
  };
```

3. And then please send a [pull request](https://github.com/sprout2000/leafview/pulls) to this repository.

## :tada: Contributors

Thanks go to these wonderful people :slightly_smiling_face::

<a href="https://github.com/sprout2000/leafview/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/leafview" />
</a>

## :copyright: Copyright

Copyright (c) 2020 sprout2000 and other contributors
