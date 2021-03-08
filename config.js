module.exports = {
  vrf: (name, rd, rt) => {
    return {
      "Cisco-IOS-XE-native:definition": {
        name: `${name}`,
        rd: `${rd}`,
        "address-family": {
          ipv4: {
            "route-target": {
              export: [
                {
                  "asn-ip": `${rt}`,
                },
              ],
              import: [
                {
                  "asn-ip": `${rt}`,
                },
              ],
            },
          },
        },
      },
    };
  },
  interface: (interfaceNumber, vrfName, ipAddress, networkMask) => {
    return {
      "Cisco-IOS-XE-native:Loopback": {
        name: interfaceNumber,
        vrf: {
          forwarding: `${vrfName}`,
        },
        ip: {
          address: {
            primary: {
              address: `${ipAddress}`,
              mask: `${networkMask}`,
            },
          },
        },
      },
    };
  },
  bgp: (vrfName) => {
    return {
      "Cisco-IOS-XE-bgp:vrf": [
        {
          name: `${vrfName}`,
          "ipv4-unicast": {
            redistribute: {
              connected: {},
            },
          },
        },
      ],
    };
  },
  bgpIfNoVrfExists: (vrfName) => {
    return {
      "Cisco-IOS-XE-bgp:address-family": {
        "with-vrf": {
          ipv4: [
            {
              "af-name": "unicast",
              vrf: [
                {
                  name: `${vrfName}`,
                  "ipv4-unicast": {
                    redistribute: {
                      connected: {},
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };
  },
};
