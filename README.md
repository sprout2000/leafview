# LeafView

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="640" src="https://user-images.githubusercontent.com/52094761/156723625-9eed907c-1d5f-4549-9e80-9b35c314e61f.png">

_(Image from [Pixabay](https://pixabay.com/ja/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1568646) by [Myriams-Fotos](https://pixabay.com/ja/users/myriams-fotos-1627417/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1568646))_

[![GitHub CI](https://github.com/sprout2000/leafview/actions/workflows/electron.yml/badge.svg)](https://github.com/sprout2000/leafview/actions/workflows/electron.yml)
![GitHub Release Date](https://img.shields.io/github/release-date/sprout2000/leafview)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Auto Update

## :inbox_tray: Download

### :desktop_computer: macOS

You can download the latest version of LeafView from the releases page here:
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### :penguin: Linux and Windows10+

see [BUILD.md](https://github.com/sprout2000/leafview/blob/main/BUILD.md#how-to-build).

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

| API                     | Value              |
| :---------------------- | :----------------- |
| Content-Security-Policy | `default-src self` |
| nodeIntegration         | `false`            |
| enableRemoteModule      | `false`            |
| contextIsolation        | `true`             |
| safeDialogs             | `true`             |
| sandbox                 | `true`             |

## :globe_with_meridians: Supported Languages

| Language                               |  Code   |
| :------------------------------------- | :-----: |
| English :us: :uk: :earth_americas:     |  `en`   |
| 日本語 :jp:                            |  `ja`   |
| 繁体中文 :taiwan:                      | `zh_TW` |
| Čeština :czech_republic:               |  `cs`   |
| Deutsch :de: :austria: :switzerland:   |  `de`   |
| Español :es: :mexico: :argentina: :us: |  `es`   |
| Polski :poland:                        |  `pl`   |
| Русский :ru:                           |  `ru`   |
| Português :portugal: :brazil:          |  `pt`   |
| 简体中文 :cn:                          | `zh_CN` |
| اللغة العربية                          |  `ar`   |

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
