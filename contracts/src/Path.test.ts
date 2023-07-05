// Ephemerant is a primitive that allows you to interact with people you cross paths with.

import { Paths, Link, friendsHash, MerkleWitness16, treeHeight } from './Path.js';
import { Mina, PrivateKey, PublicKey, AccountUpdate, Poseidon, MerkleTree } from 'snarkyjs';

let proofsEnabled = false;

const Local = Mina.LocalBlockchain({ proofsEnabled });
let incrementIndex = 0n;

const link: Link[] = []

// This test runs based on a scenario of 5 users entering a website at different points
// They can meet others on the same path (defined as visiting the same page and the same previous pages)
// This is opt-in and zero knowledge, so the user can choose to join or not at any point
// If they join, no personal information is needed, they simply share a common key with\
// others on their path, an emphemerant cohort key

// This key can be used in many ways, for example to create a group chat, specify a common meeting link
// This primitive opens new opportunities for social interaction, education, group coordination and 
// access control - all without the need to share personal information

// With little modification, the definition of a matching path can be modified to:
//  - include a time window (e.g. 5 minutes, 1 month, e)
//  - a dynamic number of previous pages, optimising for cohorts with more in common or of specifici sizes

// This might also be used to create a channel for multi-party key generation

// Here is the scenario:
// A first user visits 3 pages, and is joined by 2 others on the way. Two others visit a separate page.
// Notice user 2 joins on the same path as user 1, and user 3 joins them on the last page only.
// User 4 and 5 join on a the same page, but not the same path, since a path is reuires the previous page as well

// The generation of common ephemeral keys is tested at the bottom of this file

const rawLinks = [
  {user: 1, url: 'url1', prevLink: null},
  {user: 1, url: 'url2', prevLink: 0},
  {user: 1, url: 'url3', prevLink: 1},
  {user: 2, url: 'url2', prevLink: null},
  {user: 2, url: 'url3', prevLink: 3},
  {user: 3, url: 'url3', prevLink: null},
  {user: 4, url: 'url4', prevLink: null},
  {user: 5, url: 'url4', prevLink: null}
]

// linkStore emulates application storage
let linkStore: Map<BigInt, Object> = new Map();

rawLinks.forEach((rawLink,i) => {
  const prevLink = rawLink.prevLink?link[rawLink.prevLink].toMiniHash().toString():'0';

  link[i] = new Link({
    user: rawLink.user.toString(),
    url: rawLink.url,
    prevLink
  })

  linkStore.set(link[i].toURLHash(), rawLink);  
})

function createLinksTree(): any {
  const linksTree = new MerkleTree(treeHeight);
  return linksTree;
}

describe('Path', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount1: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Paths,
    linksTree: MerkleTree[] = [];

  // These tests run as a single sequence, describing different user paths
  // that validate against the same Merkle root on-chain

  beforeAll(async () => {
    if (proofsEnabled) await Paths.compile();

    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount1 } = Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Paths(zkAppAddress);
    await localDeploy();

    linksTree[0] = createLinksTree();
    linksTree[1] = createLinksTree();
    linksTree[2] = createLinksTree();
    linksTree[3] = createLinksTree();
    linksTree[4] = createLinksTree();
    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.initState(linksTree[0].getRoot());
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

  });

  beforeEach(async () => {
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Paths` smart contract', async () => {
    const root = zkApp.userLinksRoot.getAndAssertEquals()
    expect(root).toEqual(linksTree[1].getRoot());
  });

  //This is a test link, outside of our use cases
  it('adds a link', async () => {
    // update the leaf 
    linksTree[0].setLeaf(incrementIndex, Poseidon.hash(link[0].toFields()));

    const witness = new MerkleWitness16(linksTree[0].getWitness(incrementIndex));

    const txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[0]);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    expect(zkApp.userLinksRoot.getAndAssertEquals()).toEqual(linksTree[0].getRoot());
  });

//Here we run each user path as on a separate "local" merkle tree, but the same on-chain tree
it('records a single users path', async () => {
  let witness: MerkleWitness16;
  let txn:Mina.Transaction;
  incrementIndex++;

  linksTree[1].setLeaf(incrementIndex, Poseidon.hash(link[1].toFields()));
  witness = new MerkleWitness16(linksTree[1].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[1]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();

  incrementIndex++;

  linksTree[1].setLeaf(incrementIndex, Poseidon.hash(link[2].toFields()));
  witness = new MerkleWitness16(linksTree[1].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[2]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();


});


it('records a second users path', async () => {
  let witness: MerkleWitness16;
  let txn:Mina.Transaction;

  incrementIndex++;

  linksTree[2].setLeaf(incrementIndex, Poseidon.hash(link[3].toFields()));
  witness = new MerkleWitness16(linksTree[2].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[3]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();

  incrementIndex++;

  linksTree[2].setLeaf(incrementIndex, Poseidon.hash(link[4].toFields()));
  witness = new MerkleWitness16(linksTree[2].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[4]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();

});

it('records a third users path', async () => {
  let witness: MerkleWitness16;
  let txn:Mina.Transaction;
  incrementIndex++;

  linksTree[3].setLeaf(incrementIndex, Poseidon.hash(link[5].toFields()));
  witness = new MerkleWitness16(linksTree[3].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[5]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();

});

it('records a fourth users path', async () => {
  let witness: MerkleWitness16;
  let txn:Mina.Transaction;
  incrementIndex++;

  linksTree[4].setLeaf(incrementIndex, Poseidon.hash(link[6].toFields()));
  witness = new MerkleWitness16(linksTree[4].getWitness(incrementIndex));
  txn = await Mina.transaction(senderAccount1, () => {
      zkApp.addLink(witness, link[6]);
  });
  await txn.prove();
  await txn.sign([senderKey]).send();

});


// And here we test if a common ephemerant cohort key is generated for users who share two links in the same path
it('connects users who share two Links', async () => {
  expect(link[2].toURLHash()).toBe(link[4].toURLHash());
  expect(friendsHash(link[2], link[1])).toEqual(friendsHash(link[4], link[3]));
});

it("doesn't connect users who share one Link", async () => {
  expect(friendsHash(link[6])).not.toBe(friendsHash(link[7]));
});

it("doesn't connect users who share no Links", async () => {
  expect(link[2].toURLHash()).not.toBe(link[7].toURLHash());
  expect(friendsHash(link[2])).not.toBe(friendsHash(link[7]));
});


});