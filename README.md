# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<p align="center">
<img width="580" alt="Image by Joe from Pixabay" src="https://user-images.githubusercontent.com/52094761/229950855-18cabd19-7df3-4fa2-a58d-64cbee91333f.png" />
</p>

<p align="center">
Image by <a href="https://pixabay.com/users/jplenio-7645255/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Joe</a> from <a href="https://pixabay.com//?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Pixabay</a>.
</p>

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Grid view mode available
- Available in [14 languages](#globe_with_meridians-supported-languages)
- Auto update _(only on macOS)_

<img width="480" alt="Grid View mode" src="https://user-images.githubusercontent.com/52094761/224457447-05a1fa38-aa1b-490d-a1ad-5289c670563b.png" />

## :inbox_tray: Download

### :computer: macOS & GNU/Linux

You can download the latest version of _LeafView_ from the releases page here:<br />
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

<!-- _Note that the Windows version does not have code signing._ -->

### :desktop_computer: Windows 10 & 11

You can download the latest version of LeafView from [Microsoft Store](https://www.microsoft.com/store/apps/9P870THX6217).

<a href='https://www.microsoft.com/store/apps/9P870THX6217'><img width="160px" src='https://developer.microsoft.com/en-us/store/badges/images/English_get-it-from-MS.png' alt='Badge'/></a>

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

## :vertical_traffic_light: Privacy Policy

- LeafView and the developers do _NOT_ collect any personal information or privacy-related information about the user.
- LeafView and the developers do _NOT_ collect the information of files opened by LeafView.

## :copyright: Copyright

Copyright (c) 2023 sprout2000 and other contributors
