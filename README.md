# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<p align="center">
<img width="640" alt="2023-07-13-171541" src="https://github.com/sprout2000/leafview/assets/52094761/070ac55c-a6df-4ac7-b1da-f77aa25545de">
</p>

_Image by <a href="https://pixabay.com/users/jplenio-7645255/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Joe</a> from <a href="https://pixabay.com//?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Pixabay</a>._

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Grid view mode available
- Available in [14 languages](#globe_with_meridians-supported-languages)
- Auto update _(only on macOS)_

<img width="480" alt="2023-07-13-171712" src="https://github.com/sprout2000/leafview/assets/52094761/138f527e-14f8-45f3-b310-2c0c82b5dada">

## :inbox_tray: Download

You can download the latest version of _LeafView_ from the releases page here:<br />
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

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
|                 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>                 | Toggle Menubar _(Windows / Linux)_ |

### :computer_mouse: Mouse Operations

|    Mouse     | Function                             |
| :----------: | :----------------------------------- |
|     Drag     | Pan                                  |
|    Wheel     | Zoom in/out                          |
| Double click | Reset zoom                           |
| Right click  | Show the context menu when available |

## :globe_with_meridians: Supported Languages

| Language      |  Code   |
| :------------ | :-----: |
| اللغة العربية |  `ar`   |
| Čeština       |  `cs`   |
| Deutsch       |  `de`   |
| English       |  `en`   |
| Español       |  `es`   |
| Français      |  `fr`   |
| Magyar        |  `hu`   |
| 日本語        |  `ja`   |
| Polski        |  `pl`   |
| Português     |  `pt`   |
| Русский       |  `ru`   |
| Türkçe        |  `tr`   |
| 简体中文      | `zh_CN` |
| 繁体中文      | `zh_TW` |

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

Copyright (c) 2023 sprout2000 and other contributors
