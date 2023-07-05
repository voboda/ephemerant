# Ephemerant

Ephemerant is a primitive that allows you to interact with people you cross paths with.

When implemented in a website or app, users' paths are recorded (locally only) but as their paths weave and overlap with others, they're placed in an **ephemeral cohort** and can choose to engage with each other. (Anonymously by default.)

Paths are created through recursively-referenced Links objects, which each contain a URL and reference to the previous Link. (The URL can be substituted for any other data referencing a user event.)

This mechanism is opt-in and zero knowledge, so the user can choose to join or not at any point. If they join, no personal information is needed, they simply share a common key with others on their path, **an ephemerant cohort key**. 

### Use cases
This key can be used in many ways, for example to create a group chat, specify a secret meeting link, or expose an airdrop to visitors who find their way to the right pages on a site.

This might also be used to create a channel for multi-party key generation.

Broadly, this primitive opens new opportunities for social interaction, education, group coordination and access control - all without the need to share personal information.

### Simple variations
With little modification, the definition of a matching path can be modified to:
 - include a time window (e.g. 5 minutes, 1 month, etc.)
 - a dynamic number of previous pages, optimising for cohorts with more in common or of specific sizes


## Test scenario
The test runs based on a scenario of 5 users entering a website at different points. They can meet others on the same path (defined as visiting the same page and the same previous pages)

A first user visits 3 pages, and is joined by 2 others on the way. 

Two others arrive on a separate page, but are not considered on the same path, since a path requires 2 common pages.

Each user's path is recorded on a separate "local" merkle trees, but made consistent using the same on-chain tree root.

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

[MIT](LICENSE)
