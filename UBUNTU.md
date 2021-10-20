# Notes for Ubuntu 20.04 users

## Introduction

On Ubuntu 20.04, you will need to install [Node.js](https://nodejs.org/) v14.x and [yarn](https://yarnpkg.com/) v1.22.x.

## How?

### 1. Install Node.js 14.x

```bash
# Download the setup script.
$ curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh

# Inspect the contents of the downloaded script.
$ less nodesource_setup.sh

# And if it's ok, install the ppa.
$ sudo bash nodesource_setup.sh

# And then install Node.js v14.x.
$ sudo apt install nodejs
```

### 2. Install yarn v1.22.x:

```bash
# Activate the Yarn repository.
$ curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

# Next, add Yarn's APT package repository to your system.
$ echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# And then install yarn.
$ sudo apt update
$ sudo apt install yarn
```

### 3. Clone and build

```bash
# Clone this repo.
$ git clone https://github.com/sprout2000/leafview.git

# And then build this project
$ cd leafview

$ yarn install && yarn package
```

You will find the AppImage in `release/LeafView-1.x-linux-x64/`.

### 4. Integrate LeafView into your system

You will need to have [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher/wiki/Install-on-Ubuntu-or-Debian) installed to integrate AppImage into your system.
