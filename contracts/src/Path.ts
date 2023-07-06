import {  CircuitString, Field, SmartContract, state, State,  Struct, method,  MerkleWitness, Poseidon, } from 'snarkyjs'

export const treeHeight = 16
export class MerkleWitness16 extends MerkleWitness(treeHeight) { }

export class Link extends Struct({
  user: String,
  url: String,
  prevLink: String,
}) {
  toFields(): Field[] {
    return [
      Poseidon.hash(CircuitString.fromString(this.user).toFields()),
      Poseidon.hash(CircuitString.fromString(this.url).toFields()),
      Poseidon.hash(CircuitString.fromString(this.prevLink).toFields())
    ]
  }
  
  toHash(): Field {
    return Poseidon.hash(this.toFields());
  }

  //a 256-bit unique hash of the link
  toMiniHash(): BigInt {
    return BigInt(this.toHash().toString()) % BigInt(2 ** 256);
  }

  //a 32 digit unique hash of the link, for use in URLs like chatroom names
  toURLHash(): BigInt {
    return BigInt(
      Poseidon.hash(
          CircuitString.fromString(this.url).toFields()
      ).toString().slice(0, 32)
    )
  }

}

export class Paths extends SmartContract {
  @state(Field) userLinksRoot = State<Field>();

  @method initState(initialRoot: Field) {
    super.init();

    this.userLinksRoot.set(initialRoot);
    const root = this.userLinksRoot.getAndAssertEquals();
  }

  @method addLink(path: MerkleWitness16, link: Link) {
    // we fetch the on-chain commitment
    const userLinksRoot = this.userLinksRoot.get();
    this.userLinksRoot.assertEquals(userLinksRoot);

    const newRoot = path.calculateRoot(Poseidon.hash(link.toFields()))
    this.userLinksRoot.set(newRoot);
  }

}

export function friendsHash(link: Link, prevLink?:Link ): BigInt| {}{
  if (!prevLink) {
    return {};
  }
  return link.toURLHash().valueOf() + prevLink.toURLHash().valueOf();
}

