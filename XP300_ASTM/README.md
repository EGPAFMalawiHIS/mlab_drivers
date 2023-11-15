# Sysmex XP 300 Hematology Analyzer
Files for Sysmex XP 300 **Machine-Integration (Driver)**. This machine driver uses ASTM (Low Level Protocol) in data transfer to a Host computer (**Read Documentation on Host Transmission for Sysmex XP 300**).
# Installation
Make sure you have the latest version of Node.js^8 `nvm install 8`
Install packages using NPM `npm install`
#  Run on Local
Use node to run it on local: `npm run start`
# Run on Server
Use Node pm2 to run an instance to start a nodemon process. Configure the pm2 to start on server reboot.
