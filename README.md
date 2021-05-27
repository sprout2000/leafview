# <img src="https://user-images.githubusercontent.com/52094761/83928161-b67afd00-a7c9-11ea-99c4-190121bfaf6f.png"> LeafView

**An image viewer for minimalists.**

<img width="912" alt="2020-04-13 15 07 43" src="https://user-images.githubusercontent.com/52094761/79097565-037abe00-7d9b-11ea-9f38-5a9e995792d8.png">

[![GitHub CI](https://github.com/sprout2000/leafview/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/leafview/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/leafview)](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/leafview)](https://github.com/sprout2000/leafview/stargazers)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/leafview)

## 👍 Features

- Pan & WheelZoom
- Fast
- Secure
- Memory-Friendly
- Auto Update (_macOS_)

## 📗 Usage

### ⌨️ Keyboard Shortcuts

|                                     Key                                     | Function               | Platform |
| :-------------------------------------------------------------------------: | :--------------------- | :------- |
|                                <kbd>J</kbd>                                 | Next Image             | -        |
|                                <kbd>K</kbd>                                 | Previous Image         | -        |
|                                <kbd>+</kbd>                                 | Zoom In                | -        |
|                                <kbd>-</kbd>                                 | Zoom Out               | -        |
|                                <kbd>0</kbd>                                 | Reset Zoom             | -        |
| <kbd>&#8592;</kbd> <kbd>&#8593;</kbd> <kbd>&#8595;</kbd> <kbd>&#8594;</kbd> | pan                    | -        |
|                       <kbd>Command</kbd>+<kbd>D</kbd>                       | Toggle Dark Mode       | macOS    |
|             <kbd>Command</kbd>+<kbd>Control</kbd>+<kbd>F</kbd>              | Toggle Fullscreen      | macOS    |
|              <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>I</kbd>              | Toggle Developer Tools | macOS    |
|                        <kbd>Ctrl</kbd>+<kbd>T</kbd>                         | Show/Hide Menu Bar     | Windows  |
|                        <kbd>Ctrl</kbd>+<kbd>D</kbd>                         | Toggle Dark Mode       | Windows  |
|                               <kbd>F11</kbd>                                | Toggle Fullscreen      | Windows  |
|                <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd>                | Toggle Developer Tools | Windows  |

### 🖱️ Mouse Operations

|    Mouse     | Function    |
| :----------: | :---------- |
|     drag     | pan         |
| double click | reset zoom  |
|    wheel     | zoom in/out |

## 🔒 Security

| API                        | Value   |
| :------------------------- | :------ |
| default-src (CSP)          | `self`  |
| nodeIntegration            | `false` |
| enableRemoteModule         | `false` |
| worldSafeExecuteJavaScript | `true`  |
| contextIsolation           | `true`  |
| safeDialogs                | `true`  |
| sandbox                    | `true`  |

## 🌈 Supported Image Formats

- `bmp` (com.microsoft.bmp)
- `ico` (com.microsoft.ico)
- `gif` (com.compuserve.gif)
- `jpg` (public.jpeg)
- `png` (public.png)
- `svg` (public.svg-image)
- `webp` (com.google.webp)

## 📚 Supported Languages

| Language         | Code |
| :--------------- | :--: |
| English 🇺🇸 🇬🇧 🌐 | `en` |
| 日本語 🇯🇵        | `ja` |
| Čeština 🇨🇿       | `cs` |
| Deutsch 🇩🇪 🇨🇭 🇦🇹 | `de` |
| Español 🇪🇸 🇲🇽    | `es` |
| Polski 🇵🇱        | `pl` |
| Русский 🇷🇺       | `ru` |

## 🛠️ Build and Install

```
$ git clone git@github.com:sprout2000/leafview.git
$ cd leafview
$ yarn install && yarn package
```

You will find the installer in `release` directory.

**Note:** _You will need to have [Node.js](https://nodejs.org/en/), [Git](https://git-scm.com/) and [yarn](https://yarnpkg.com/) installed._

## ✨ Download

### 💻 macOS (x64, arm64)

You can download the latest version of LeafView from the releases page here:  
[https://github.com/sprout2000/leafview/releases](https://github.com/sprout2000/leafview/releases)

### 🖥️ Windows10

You can download the latest version of LeafView from [Microsoft Store](https://www.microsoft.com/store/apps/9P870THX6217).

## 🍻 Contribution

I need more locale files.  
When you translate the menu into your language, please send me the locale file as a pull request.

- Create `{your_LANG}.json` in `src/locales`.
- And then add your locale to `src/setLocales.ts` like:

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

## 🎉 Contributors

**Special Thanks to:**

- [@guaycuru](https://github.com/guaycuru) [#228](https://github.com/sprout2000/leafview/pull/228)
- [@kitt3911](https://github.com/kitt3911) [#215](https://github.com/sprout2000/leafview/pull/215)
- [@nukeop](https://github.com/nukeop) [#214](https://github.com/sprout2000/leafview/pull/214)
- [@singuerinc](https://github.com/singuerinc) [#178](https://github.com/sprout2000/leafview/pull/178)
- [@DrDeee](https://github.com/DrDeee) [#166](https://github.com/sprout2000/leafview/pull/166)
- [@PetrTodorov](https://github.com/PetrTodorov) [#68](https://github.com/sprout2000/leafview/pull/68)

## 🏛️ License

[MIT](https://github.com/sprout2000/leafview/blob/master/LICENSE.md)
