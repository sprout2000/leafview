# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="640" src="https://user-images.githubusercontent.com/52094761/157586637-4b2deb8e-a1f7-46ef-9f24-d0efeb6a97a8.png">

_Image by <a href="https://pixabay.com/users/myriams-fotos-1627417/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1568646">Myriams-Fotos</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1568646">Pixabay.</a>_

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Auto update _(macOS / Linux)_

## :inbox_tray: Download

### :computer: macOS & GNU/Linux

You can download the latest version of _LeafView_ from the releases page here:
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### :desktop_computer: Windows 10 & 11

You can get _(or upgrade to)_ the latest version of _LeafView_ via [winget](https://github.com/microsoft/winget-cli):

```sh
winget install sprout2000.LeafView
```

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                     Key                                     | Function                           |
| :-------------------------------------------------------------------------: | :--------------------------------- |
|           <kbd>J</kbd> or <kbd>CmdOrCtrl</kbd>+<kbd>&#8594;</kbd>           | Next Image                         |
|           <kbd>K</kbd> or <kbd>CmdOrCtrl</kbd>+<kbd>&#8592;</kbd>           | Previous Image                     |
|                                <kbd>+</kbd>                                 | Zoom In                            |
|                                <kbd>-</kbd>                                 | Zoom Out                           |
|                                <kbd>0</kbd>                                 | Reset Zoom                         |
| <kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | Pan                                |
|              <kbd>Fn</kbd>+<kbd>Delete</kbd> or <kbd>Del</kbd>              | Move to Trash                      |
|             <kbd>CmdOrCtrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>              | Toggle Dark Mode                   |
|                <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>                | Toggle Menubar _(Windows / Linux)_ |

### :computer_mouse: Mouse Operations

|    Mouse     | Function    |
| :----------: | :---------- |
|     Drag     | Pan         |
|    Wheel     | Zoom in/out |
| Double click | Reset zoom  |

## :globe_with_meridians: Supported Languages

| Language      | Code |     | Language  | Code |     | Language |  Code   |
| :------------ | :--: | :-: | :-------- | :--: | :-: | :------- | :-----: |
| اللغة العربية | `ar` |     | Français  | `fr` |     | Русский  |  `ru`   |
| Čeština       | `cs` |     | Magyar    | `hu` |     | 简体中文 | `zh_CN` |
| Deutsch       | `de` |     | 日本語    | `ja` |     | 繁体中文 | `zh_TW` |
| English       | `en` |     | Polski    | `pl` |     |
| Español       | `es` |     | Português | `pt` |     |

## :scroll: Contributing

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

**Special Thanks to:**

- [@BackSpace54](https://github.com/BackSpace54) [#312](https://github.com/sprout2000/leafview/pull/312)
- [@vedantmgoyal2009](https://github.com/vedantmgoyal2009) [#308](https://github.com/sprout2000/leafview/pull/308), [#311](https://github.com/sprout2000/leafview/pull/311), [#317](https://github.com/sprout2000/leafview/pull/317), [#321](https://github.com/sprout2000/leafview/pull/321)
- [@Levminer](https://github.com/Levminer) [#305](https://github.com/sprout2000/leafview/pull/305)
- [@SuhaibAtef](https://github.com/SuhaibAtef) [#274](https://github.com/sprout2000/leafview/pull/274)
- [@mwoz123](https://github.com/mwoz123) [#260](https://github.com/sprout2000/leafview/pull/260), [#261](https://github.com/sprout2000/leafview/pull/261)
- [@ArcherGu](https://github.com/ArcherGu) [#235](https://github.com/sprout2000/leafview/pull/235)
- [@guaycuru](https://github.com/guaycuru) [#228](https://github.com/sprout2000/leafview/pull/228), [#232](https://github.com/sprout2000/leafview/pull/232)
- [@kitt3911](https://github.com/kitt3911) [#215](https://github.com/sprout2000/leafview/pull/215)
- [@nukeop](https://github.com/nukeop) [#214](https://github.com/sprout2000/leafview/pull/214)
- [@singuerinc](https://github.com/singuerinc) [#178](https://github.com/sprout2000/leafview/pull/178)
- [@DrDeee](https://github.com/DrDeee) [#166](https://github.com/sprout2000/leafview/pull/166)
- [@PetrTodorov](https://github.com/PetrTodorov) [#68](https://github.com/sprout2000/leafview/pull/68)

## :copyright: Copyright

Copyright (c) 2020 sprout2000 and other contributors
