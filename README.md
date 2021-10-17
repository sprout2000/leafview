# LeafView

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="800" alt="2021-10-18-080603" src="https://user-images.githubusercontent.com/52094761/137648197-ea8a4a03-d29f-4501-ab7a-7f02bf92c72a.png">

[![GitHub CI](https://github.com/sprout2000/leafview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/leafview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Auto Update

## :inbox_tray: Download

### :desktop_computer: macOS (x64, arm64)

You can download the latest version of LeafView from the releases page here:
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### :computer: Windows 10, 11

You can download the latest version of LeafView from [Microsoft Store](https://www.microsoft.com/store/apps/9P870THX6217).

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                     Key                                     | Function          | Platform |
| :-------------------------------------------------------------------------: | :---------------- | :------- |
|                                <kbd>J</kbd>                                 | Next Image        | -        |
|                                <kbd>K</kbd>                                 | Previous Image    | -        |
|                                <kbd>+</kbd>                                 | Zoom In           | -        |
|                                <kbd>-</kbd>                                 | Zoom Out          | -        |
|                                <kbd>0</kbd>                                 | Reset Zoom        | -        |
| <kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | pan               | -        |
|                       <kbd>Command</kbd>+<kbd>D</kbd>                       | Toggle Dark Mode  | macOS    |
|                        <kbd>Ctrl</kbd>+<kbd>D</kbd>                         | Toggle Dark Mode  | Windows  |
|                               <kbd>F11</kbd>                                | Toggle Fullscreen | Windows  |
|                        <kbd>Ctrl</kbd>+<kbd>T</kbd>                         | Toggle Menu bar   | Windows  |

### :computer_mouse: Mouse Operations

|    Mouse     | Function                             |
| :----------: | :----------------------------------- |
|     Drag     | Pan                                  |
|    Wheel     | Zoom in/out                          |
| Double click | Reset zoom                           |
| Right click  | Show the context menu when available |

## :closed_lock_with_key: Security

| API               | Value   |
| :---------------- | :------ |
| default-src (CSP) | `self`  |
| nodeIntegration   | `false` |
| contextIsolation  | `true`  |
| safeDialogs       | `true`  |
| sandbox           | `true`  |

## :globe_with_meridians: Supported Languages

| Language                           |  Code   |
| :--------------------------------- | :-----: |
| English :us: :uk: :earth_americas: |  `en`   |
| 日本語 :jp:                        |  `ja`   |
| Čeština :czech_republic:           |  `cs`   |
| Deutsch :de:                       |  `de`   |
| Español :es: :mexico: :argentina:  |  `es`   |
| Polski :poland:                    |  `pl`   |
| Русский :ru:                       |  `ru`   |
| Português :portugal: :brazil:      |  `pt`   |
| 简体中文 :cn:                      | `zh_CN` |
| 繁体中文 :taiwan:                  | `zh_TW` |
| Arabic (Standard)                  |  `ar`   |

## :beers: Contribution

We need more locale files.
When you have translated the menu into your language, could you please send us the locale file as a [pull request](https://github.com/sprout2000/leafview/pulls)?

1. Create `{your_LANG}.json` in `src/locales`.
2. Then import the locale file into `src/setLocales.ts` as follows:

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
+      cs: { translation: cs },
     },
   });
 };
```

## :tada: Contributors

**Special Thanks to:**

- [@SuhaibAtef](https://github.com/SuhaibAtef) [#274](https://github.com/sprout2000/leafview/pull/274)
- [@mwoz123](https://github.com/mwoz123) [#260](https://github.com/sprout2000/leafview/pull/260), [#261](https://github.com/sprout2000/leafview/pull/261)
- [@ArcherGu](https://github.com/ArcherGu) [#235](https://github.com/sprout2000/leafview/pull/235)
- [@guaycuru](https://github.com/guaycuru) [#228](https://github.com/sprout2000/leafview/pull/228), [#232](https://github.com/sprout2000/leafview/pull/232)
- [@kitt3911](https://github.com/kitt3911) [#215](https://github.com/sprout2000/leafview/pull/215)
- [@nukeop](https://github.com/nukeop) [#214](https://github.com/sprout2000/leafview/pull/214)
- [@singuerinc](https://github.com/singuerinc) [#178](https://github.com/sprout2000/leafview/pull/178)
- [@DrDeee](https://github.com/DrDeee) [#166](https://github.com/sprout2000/leafview/pull/166)
- [@PetrTodorov](https://github.com/PetrTodorov) [#68](https://github.com/sprout2000/leafview/pull/68)

## :copyright: License

Copyright (c) 2020 sprout2000 and other contributors
