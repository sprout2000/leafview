# :scroll: Adding Locales

You can contribute to this repository very easily!

1. Fork this repository.

<img width="480" alt="スクリーンショット 2022-02-02 17 01 54" src="https://user-images.githubusercontent.com/52094761/152115921-ec22558b-df83-43fa-b0cd-754fbb687988.png">

2. Create `{your_LANG}.json` in `src/locales`.

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

`src/locales/cs.json`:

```json
{
  "File": "Soubor",
  "Open...": "Otevřít...",
  "Select an image": "Vybrat obrázek",
  "Image files": "Soubory obrázku",
  "Move to Trash": "Přesunout do koše",
  "View": "Zobrazit",
  "Next Image": "Následující obrázek",
  "Prev Image": "Předchozí obrázek",
  "Toggle Fullscreen": "Celá obrazovka",
  "Toggle Developer Tools": "Zobrazit nástroje pro vývojáře",
  "Toggle Menubar": "Přepnout lištu nabídek",
  "Toggle Dark Mode": "Přepínání tmavého režimu",
  "Window": "Okno",
  "Minimize": "Minimalizovat",
  "Maximize": "Maximalizovat",
  "Zoom": "Přiblížit",
  "Bring All to Front": "Přenést vše do popředí",
  "Close": "Storno",
  "Help": "Nápověda",
  "About": "O aplikaci LeafView",
  "About LeafView": "O aplikaci LeafView",
  "Support URL...": "URL podpory...",
  "Hide LeafView": "Skrýt LeafView",
  "Hide Others": "Skrýt ostatní",
  "Show All": "Zobrazit vše",
  "Quit": "Ukončit LeafView",
  "Quit LeafView": "Ukončit LeafView"
}
```

3. Import the locale into `src/setLocales.ts` as follows:

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

4. Send the [pull request](https://github.com/sprout2000/leafview/pulls) to this repo.
