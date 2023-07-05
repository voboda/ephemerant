// Ephemerant is a primitive that allows you to interact with people you cross paths with.

import { Paths } from './Path.js';
import { Mina, PrivateKey, PublicKey, AccountUpdate } from 'snarkyjs';

let proofsEnabled = false;

const Local = Mina.LocalBlockchain({ proofsEnabled });

let deployerAccount: PublicKey,
deployerKey: PrivateKey,
zkAppAddress: PublicKey,
zkAppPrivateKey: PrivateKey,
zkApp: Paths

if (proofsEnabled) await Paths.compile();

Mina.setActiveInstance(Local);
({ privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]);
zkAppPrivateKey = PrivateKey.random();
zkAppAddress = zkAppPrivateKey.toPublicKey();
zkApp = new Paths(zkAppAddress);
await localDeploy();


async function localDeploy() {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkApp.deploy();
  });
  await txn.prove();
  await txn.sign([deployerKey, zkAppPrivateKey]).send();
}
