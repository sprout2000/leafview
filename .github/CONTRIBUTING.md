# Thank you for contributing to LeafView!

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
