/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const {Wallets, Gateway} = require('fabric-network');
const path = require('path');
const fs = require('fs');
async function main() {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'Org1');
    const wallet =  await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    // Import Identity
    const key = fs.readFileSync('./Org1/org1Admin/ddcdf9a1065533bad7d10f8cc8145f66a22542253fdb249e2e2f1657f112d9fa-priv').toString();
    const identityPath = path.resolve(__dirname, './Org1/org1Admin','org1Admin.txt');
    const identityFile = fs.readFileSync(identityPath, 'utf8');
    const identityJSON = JSON.parse(identityFile);
    //console.log(identityJSON)
    //console.log(key);
    // prep wallet and test it at the same time
    const identity = {
      credentials: {
          certificate: identityJSON.enrollment.identity.certificate,
          privateKey: key,
      },
      mspId: identityJSON.mspid,
      type: 'X.509',
  };
  await wallet.put(identityJSON.name, identity);
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    const connectionProfilePath = path.resolve(__dirname, '..','connection.json');
    const connectionProfileJSON = fs.readFileSync(connectionProfilePath, 'utf8');
    const connectionProfile = JSON.parse(connectionProfileJSON);
    let connectionOptions = { wallet, identity: 'org1Admin',discovery: { enabled: true, asLocalhost: true }};
    await gateway.connect(connectionProfile, connectionOptions);
    console.log('gateway connected');
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');
    // Get the contract from the network.
    const contract = network.getContract('boilerplate');
    // Submit the specified transaction.
    await contract.submitTransaction('createMyAsset', '002', 'bsmlah');
    console.log(`Transaction has been submitted`);
    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
}
}

main();