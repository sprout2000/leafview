#!/bin/sh

npm install && npm r eslint prettier eslint-config-prettier \
  @typescript-eslint/{parser,eslint-plugin} \
  eslint-plugin-{react,react-hooks} \
  wait-on electron-reload npm-run-all rimraf