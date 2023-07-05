#Ephemerant

Ephemerant is a primitive that allows you to interact with people you cross paths with.

Paths are created through recursively linking Links, which contain a URL. (The webpages themselves may contain less guessable nonce values, but for this proof of concept, the url itself is considered the private input.)

This is opt-in and zero knowledge, so the user can choose to join or not at any point. If they join, no personal information is needed, they simply share a common key with others on their path, **an emphemerant cohort key**. 

This key can be used in many ways, for example to create a group chat, specify a common meeting link, or expose an airdrop to visitors who find their way to the right pages on a site.

This primitive opens new opportunities for social interaction, education, group coordination and access control - all without the need to share personal information.

With little modification, the definition of a matching path can be modified to:
 - include a time window (e.g. 5 minutes, 1 month, e)
 - a dynamic number of previous pages, optimising for cohorts with more in common or of specifici sizes

This might also be used to create a channel for multi-party key generation

## Test scenario
The test runs based on a scenario of 5 users entering a website at different points. They can meet others on the same path (defined as visiting the same page and the same previous pages)

A first user visits 3 pages, and is joined by 2 others on the way. Two others visit a separate page.

Notice user 2 joins on the same path as user 1, and user 3 joins them on the last page only.

User 4 and 5 join on a the same page, but not the same path, since a path is reuires the previous page as well

Each user's path is recorded on a separate "local" merkle tree, but the same on-chain tree

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
