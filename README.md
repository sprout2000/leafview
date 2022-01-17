# LeafView

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="780" alt="2021-10-29-095018" src="https://user-images.githubusercontent.com/52094761/139355323-1be87ae2-f23b-4c69-b64f-909e81a06d58.png">
<!-- <img width="800" alt="2021-10-18-080803" src="https://user-images.githubusercontent.com/52094761/137648261-1f5dcea8-c455-44aa-8f13-71400d37f82e.png"> -->

[![GitHub CI](https://github.com/sprout2000/leafview/actions/workflows/release.yml/badge.svg)](https://github.com/sprout2000/leafview/actions/workflows/release.yml)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
[![Twitter](https://img.shields.io/twitter/url?style=flat-square&url=https%3A%2F%2Fgithub.com%2Fsprout2000%2Fleafview)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fsprout2000%2Fleafview)

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

<a href='https://www.microsoft.com/store/apps/9P870THX6217'><img width="160px" src='https://developer.microsoft.com/en-us/store/badges/images/English_get-it-from-MS.png' alt='Badge'/></a>

### :penguin: Linux

see [LINUX.md](https://github.com/sprout2000/leafview/blob/main/LINUX.md#notes-for-linux-users).

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                     Key                                     | Function       |
| :-------------------------------------------------------------------------: | :------------- |
|           <kbd>J</kbd> or <kbd>CmdOrCtrl</kbd>+<kbd>&#8594;</kbd>           | Next Image     |
|           <kbd>K</kbd> or <kbd>CmdOrCtrl</kbd>+<kbd>&#8592;</kbd>           | Previous Image |
|                                <kbd>+</kbd>                                 | Zoom In        |
|                                <kbd>-</kbd>                                 | Zoom Out       |
|                                <kbd>0</kbd>                                 | Reset Zoom     |
| <kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | Pan            |

### :computer_mouse: Mouse Operations

|    Mouse     | Function                             |
| :----------: | :----------------------------------- |
|     Drag     | Pan                                  |
|    Wheel     | Zoom in/out                          |
| Double click | Reset zoom                           |
| Right click  | Show the context menu when available |

## :closed_lock_with_key: Security

| API                | Value   |
| :----------------- | :------ |
| default-src (CSP)  | `self`  |
| nodeIntegration    | `false` |
| enableRemoteModule | `false` |
| contextIsolation   | `true`  |
| safeDialogs        | `true`  |
| sandbox            | `true`  |

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

## :vertical_traffic_light: Privacy Policy

- LeafView and the developers do _NOT_ collect any personal information or privacy-related information about the user.
- LeafView and the developers do _NOT_ collect the information of files opened by LeafView.

## :copyright: License

Copyright (c) 2020 sprout2000 and other contributors
