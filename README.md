# <img width="48" alt="leaves" src="https://user-images.githubusercontent.com/52094761/156916014-b9472d73-3270-455a-be95-25e527efeaff.svg" /> LeafView

[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/main/LICENSE.md)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/leafview)

Minimalist image viewer based on [Leaflet.js](https://leafletjs.com/) and [Electron](https://www.electronjs.org/).

<p align="center">
<img width="640" alt="2023-07-13-171541" src="https://github.com/sprout2000/leafview/assets/52094761/070ac55c-a6df-4ac7-b1da-f77aa25545de">
</p>

_Image by <a href="https://pixabay.com/users/jplenio-7645255/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Joe</a> from <a href="https://pixabay.com//?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4485609">Pixabay</a>._

## :thumbsup: Features

- Pan and zoom with the mouse wheel
- Browse images in a folder
- Grid view
- Remembers the last opened folder
- Automatically picks up files added to or removed from the folder
- Available in [20 languages](#globe_with_meridians-supported-languages)
- Automatic updates _(macOS and Linux only)_

<img width="480" alt="2023-07-13-171712" src="https://github.com/sprout2000/leafview/assets/52094761/138f527e-14f8-45f3-b310-2c0c82b5dada">

## :inbox_tray: Download

<!-- ### :computer: macOS & GNU/Linux -->

Download the latest version of _LeafView_ from the [Releases page](https://github.com/sprout2000/leafview/releases).

<!-- ### :desktop_computer: Windows -->

<!-- You can get _(or upgrade to)_ the latest version of _LeafView_ via [winget](https://github.com/microsoft/winget-cli): -->

<!-- ```sh -->
<!-- winget install sprout2000.LeafView -->
<!-- ``` -->

## :green_book: Usage

### :keyboard: Keyboard Shortcuts

|                                           Key                                           | Function         |
| :-------------------------------------------------------------------------------------: | :--------------- |
| <kbd>J</kbd>, <kbd>Ctrl</kbd>+<kbd>N</kbd>, <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>→</kbd> | Next Image       |
| <kbd>K</kbd>, <kbd>Ctrl</kbd>+<kbd>P</kbd>, <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>←</kbd> | Previous Image   |
|                                      <kbd>+</kbd>                                       | Zoom In          |
|                                      <kbd>-</kbd>                                       | Zoom Out         |
|                                      <kbd>0</kbd>                                       | Reset Zoom       |
|                   <kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd>                   | Pan              |
|                    <kbd>Fn</kbd>+<kbd>Delete</kbd> or <kbd>Del</kbd>                    | Move to Trash    |
|                       <kbd>H</kbd>, <kbd>Ctrl</kbd>+<kbd>G</kbd>                        | Toggle Grid View |

### :computer_mouse: Mouse Controls

|    Mouse     | Function          |
| :----------: | :---------------- |
|     Drag     | Pan               |
|    Wheel     | Zoom In/Out       |
| Double-click | Reset Zoom        |
| Right-click  | Show Context Menu |

## :globe_with_meridians: Supported Languages

| Language         |  Code   |
| :--------------- | :-----: |
| اللغة العربية    |  `ar`   |
| Čeština          |  `cs`   |
| Deutsch          |  `de`   |
| English          |  `en`   |
| Español          |  `es`   |
| Français         |  `fr`   |
| हिंदी             |  `hi`   |
| Magyar           |  `hu`   |
| Bahasa Indonesia |  `id`   |
| Italiano         |  `it`   |
| 日本語           |  `ja`   |
| 한국어           |  `ko`   |
| Bahasa Melayu    |  `ms`   |
| Polski           |  `pl`   |
| Português        |  `pt`   |
| Русский          |  `ru`   |
| Türkçe           |  `tr`   |
| Українська       |  `uk`   |
| 简体中文         | `zh-CN` |
| 繁體中文         | `zh-TW` |

## :beers: Contributing

You can easily contribute to this repository by providing a translation.

1. Create `{language_code}.json` _(e.g. `nl.json`)_ in `src/locales`, based on `en.json`. It must have the same keys as `en.json`.
2. Import the file and add the language to `languages` in `src/languages.ts`.

```diff
+ import nl from "./locales/nl.json";

  export const languages: Language[] = [
    ...
+   { code: "nl", label: "Nederlands", translation: nl },
    ...
  ];
```

3. Make sure `npm run lint` and `npm test` pass _(see [Development](#wrench-development))_.
4. Send a [pull request](https://github.com/sprout2000/leafview/pulls) to this repository.

## :tada: Contributors

Thanks go to these wonderful people! :slightly_smiling_face:

<a href="https://github.com/sprout2000/leafview/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/leafview" />
</a>

## :hammer_and_wrench: Building from Source

You will need to have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed.

```sh
# 1. Clone this repo
git clone https://github.com/sprout2000/leafview.git

# 2. Install dependencies
cd leafview
npm install

# 3. Build the app and create an installer
npm run build && npm run package
```

The installer will be created in the `release` directory.

## :wrench: Development

```sh
# Start the app in development mode
npm run dev

# Lint and format the code with Biome
npm run lint

# Run the tests with Vitest and show the coverage
npm test
```

The tests are in `src/__tests__` _(main process)_ and `src/__tests__/web` _(renderer process)_.

## :copyright: Copyright

Copyright (c) 2020-present sprout2000
