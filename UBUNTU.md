# Notes for Ubuntu 20.04 users

The node installed on ubuntu 20.04 is v12.x, but this app does not support node@12.
So you will need to have node@14.17+ and npm@7.15+ installed.

## How?

```bash
# Install curl and download the PPA script.
$ sudo snap install curl
$ curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh

# Check the script, and if it's ok, execute the script
$ nano nodesource_setup.sh
$ sudo bash nodesource_setup.sh

# Install node@14
$ sudo apt-get install -y nodejs

$ node -v
v14.17.1
$ npm -v
6.14.13

# Update your npm
$ sudo npm i -g npm
$ npm -v
7.18.1

# Clone this repo.
$ git clone git@github.com:sprout2000/elephicon.git

# And then build this project
$ cd elephicon

$ npm install && npm run package
```

You will find the AppImage in `release/Elephicon-0.18.x-linux-x64/`.
