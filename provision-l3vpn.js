const fetch = require("node-fetch");
const config = require("./config");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// **************************************
//          Target host IP
// **************************************
const host = "172.16.30.68";

// **************************************
//   Device credentials for Basic Auth
// **************************************
const user = {
  name: "cisco",
  password: "cisco",
};

// **************************************
//  Device specific parameters for L3VPN
// **************************************
const params = {
  vrfName: "blue",
  rd: "65000:301",
  rt: "65000:2",
  interfaceNumber: "9",
  ipAddress: "172.21.93.1",
  networkMask: "255.255.255.0",
  bgpAs: 65000,
};

// **************************************
//          Restconf Endpoints
// **************************************
const resources = {
  vrf: "restconf/data/native/vrf/definition",
  interface: "restconf/data/native/interface/Loopback",
  bgp: `restconf/data/native/router/bgp=${params.bgpAs}/address-family/with-vrf/ipv4=unicast/vrf`,
  bgpIfNoVrfExists: `restconf/data/native/router/bgp=${params.bgpAs}/address-family`,
};

// **************************************
//          Restconf headers
// **************************************
const headers = {
  "Content-Type": "application/yang-data+json",
  Accept: "application/yang-data+json",
  Authorization:
    "Basic " + Buffer.from(user.name + ":" + user.password).toString("base64"),
};

// **************************************
//  Patch request function to provide
//  consistant API calls.
// **************************************
async function patchRequest(ip, resource, body) {
  const url = `https://${ip}:443/${resource}`;
  const options = {
    method: "patch",
    headers: headers,
    body: JSON.stringify(body),
  };
  const res = await fetch(url, options);
  const data = await res;
  return data;
}

// **************************************
//      Provision L3VPN services
// **************************************
async function provisionL3VPN(config) {
  // Configure VRF
  const vrfStatus = await patchRequest(
    host,
    resources.vrf,
    config.vrf(params.vrfName, params.rd, params.rt)
  );

  // If the status code does not equal 204, exit the script.
  if (vrfStatus.status !== 204) {
    throw Error(
      `Exiting. Device returned status code of ${vrfStatus.status} ${vrfStatus.statusText}`
    );
  }

  // Configure Interface
  const interfaceStatus = await patchRequest(
    host,
    resources.interface,
    config.interface(
      params.interfaceNumber,
      params.vrfName,
      params.ipAddress,
      params.networkMask
    )
  );

  // If the status code does not equal 204, exit the script.
  if (interfaceStatus.status !== 204) {
    throw Error(
      `Exiting. Device returned status code of ${interfaceStatus.status} ${interfaceStatus.statusText}`
    );
  }

  // Configure BGP
  const bgpStatus = await patchRequest(
    host,
    resources.bgp,
    config.bgp(params.vrfName)
  );

  // If the status code equals 400, try a patch to a different resource.
  if (bgpStatus.status === 400) {
    const tryBgpAgain = await patchRequest(
      host,
      resources.bgpIfNoVrfExists,
      config.bgpIfNoVrfExists(params.vrfName)
    );

    // If the status code does not equal 204, exit the script.
    if (tryBgpAgain.status !== 204) {
      throw Error(
        `Exiting. Device returned status code of ${tryBgpAgain.status} ${tryBgpAgain.statusText}`
      );
    }
  }

  // If the status code does not equal 204, exit the script.
  if (bgpStatus.status !== 204 && bgpStatus.status !== 400) {
    throw Error(
      `Exiting. Device returned status code of ${bgpStatus.status} ${bgpStatus.statusText}`
    );
  }

  console.log("L3VPN configuration successfull.");
}

provisionL3VPN(config);
