# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub CI](https://github.com/sprout2000/leafview/actions/workflows/release.yml/badge.svg)](https://github.com/sprout2000/leafview/actions/workflows/release.yml)
![GitHub Release Date](https://img.shields.io/github/release-date/sprout2000/leafview)
[![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/leafview/total)](https://github.com/sprout2000/leafview/releases)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)

A minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<img width="640" src="https://user-images.githubusercontent.com/52094761/157586637-4b2deb8e-a1f7-46ef-9f24-d0efeb6a97a8.png">

_Image by <a href="https://pixabay.com/users/myriams-fotos-1627417/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1568646">Myriams-Fotos</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1568646">Pixabay.</a>_

## :thumbsup: Features

- Pan & Wheel Zoom
- Browse the images in a folder
- Auto Update

## :inbox_tray: Download

You can download the latest version of LeafView from the releases page here:
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

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

## :hammer_and_wrench: Development

```sh
# clone this repo.
$ git clone https://github.com/sprout2000/leafview.git

# install dependencies
$ cd leafview
$ npm install

# on development
$ npm start

# on production
$ npm run package
```

_NOTE: You will need to have [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/en/) installed._

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
