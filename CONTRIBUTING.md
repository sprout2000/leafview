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
