# L3VPN RESTCONF

This repo contains a script used to deploy L3VPNs via RESTCONF. The script was written in JavaScript/Node.js and uses the Node-Fetch library for all of the RESTCONF API calls.

## Script Structure

The repo contains 2 main files:

- `config.js`
- `provision-l3vpn.js`

`config.js` contains functions that generate the PATCH request body for each RESTCONF endpoint. The functions in this module are imported into `provision-l3vpn.js`.

`provision-l3vpn.js` conatins the main logic for the script as well as a place to define all of the necessary variables such as the target devce IP, device credentials, and the values needed to configure the L3VPN.

## Usage

To run this script you will need Node.js and NPM. For the configuration to be applied correctly you will need a Cisco device running RESTCONF (tested on CSR1000v running 16.9.1) and while a working MPLS topology is preferable, having at least a BGP instance running will allow the script to be applied without failing.

Steps:

- First install node-fetch by running `npm-init` along with `npm install`.
- Then to run the script either use `npm start` or `node provison-l3vpn.js`

If the configuration was applied correctly you should see `L3VPN configuration successfull.` in the terminal. If a single task fails the script will exit and present an error message from where the script stopped.
