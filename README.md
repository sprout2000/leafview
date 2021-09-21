# ![artwork](https://user-images.githubusercontent.com/52094761/132089381-b19789f3-4f41-47a1-8579-1d62d3f87027.png) LeafView

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="864" alt="2021-09-14-172602" src="https://user-images.githubusercontent.com/52094761/133223244-41292db5-6995-461e-8335-a6b1fb07e955.png">

[![GitHub CI](https://github.com/sprout2000/leafview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/leafview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/leafview)

## :thumbsup: Features

- Pan & WheelZoom
- Auto Update

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                     Key                                     | Function           | Platform |
| :-------------------------------------------------------------------------: | :----------------- | :------- |
|                                <kbd>J</kbd>                                 | Next Image         | -        |
|                                <kbd>K</kbd>                                 | Previous Image     | -        |
|                                <kbd>+</kbd>                                 | Zoom In            | -        |
|                                <kbd>-</kbd>                                 | Zoom Out           | -        |
|                                <kbd>0</kbd>                                 | Reset Zoom         | -        |
| <kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | pan                | -        |
|                       <kbd>Command</kbd>+<kbd>D</kbd>                       | Toggle Dark Mode   | macOS    |
|             <kbd>Command</kbd>+<kbd>Control</kbd>+<kbd>F</kbd>              | Toggle Fullscreen  | macOS    |
|                        <kbd>Ctrl</kbd>+<kbd>T</kbd>                         | Show/Hide Menu Bar | Windows  |
|                        <kbd>Ctrl</kbd>+<kbd>D</kbd>                         | Toggle Dark Mode   | Windows  |
|                               <kbd>F11</kbd>                                | Toggle Fullscreen  | Windows  |

### :computer_mouse: Mouse Operations

|    Mouse     | Function    |
| :----------: | :---------- |
|     drag     | pan         |
| double click | reset zoom  |
|    wheel     | zoom in/out |

## :closed_lock_with_key: Security

| API               | Value   |
| :---------------- | :------ |
| default-src (CSP) | `self`  |
| nodeIntegration   | `false` |
| contextIsolation  | `true`  |
| safeDialogs       | `true`  |
| sandbox           | `true`  |

## :rainbow: Supported Image Formats

- `bmp` (com.microsoft.bmp)
- `ico` (com.microsoft.ico)
- `gif` (com.compuserve.gif)
- `jpg` (public.jpeg)
- `png` (public.png)
- `svg` (public.svg-image)
- `webp` (com.google.webp)

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

## :inbox_tray: Download

### :desktop_computer: macOS (x64, arm64)

You can download the latest version of LeafView from the releases page here:
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### :computer: Windows10

You can download the latest version of LeafView from [Microsoft Store](https://www.microsoft.com/store/apps/9P870THX6217).

## :beers: Contribution

I need more locale files.
When you have translated the menu into your language, could you please send me the locale file as a [pull request](https://github.com/sprout2000/leafview/pulls)?

1. Create `{your_LANG}.json` in `src/locales`.
2. Then import the locale file into `src/lib/setLocales.ts` as follows:

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

- [@mwoz123](https://github.com/mwoz123) [#260](https://github.com/sprout2000/leafview/pull/260), [#261](https://github.com/sprout2000/leafview/pull/261)
- [@ArcherGu](https://github.com/ArcherGu) [#235](https://github.com/sprout2000/leafview/pull/235)
- [@guaycuru](https://github.com/guaycuru) [#228](https://github.com/sprout2000/leafview/pull/228), [#232](https://github.com/sprout2000/leafview/pull/232)
- [@kitt3911](https://github.com/kitt3911) [#215](https://github.com/sprout2000/leafview/pull/215)
- [@nukeop](https://github.com/nukeop) [#214](https://github.com/sprout2000/leafview/pull/214)
- [@singuerinc](https://github.com/singuerinc) [#178](https://github.com/sprout2000/leafview/pull/178)
- [@DrDeee](https://github.com/DrDeee) [#166](https://github.com/sprout2000/leafview/pull/166)
- [@PetrTodorov](https://github.com/PetrTodorov) [#68](https://github.com/sprout2000/leafview/pull/68)

## :notes: Notes for Ubuntu 20.04 users

_see [UBUNTU.md](https://github.com/sprout2000/leafview/blob/main/UBUNTU.md)._

## :copyright: License

Copyright (c) 2020 sprout2000 and other contributors
