## `pnp-auth` adds additional authentication options for PnPjs library (pnp/pnp) via implementing custom NodeFetchClient

[![NPM](https://nodei.co/npm/pnp-auth.png?mini=true&downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/pnp-auth/)

[![npm version](https://badge.fury.io/js/pnp-auth.svg)](https://badge.fury.io/js/pnp-auth)
[![Downloads](https://img.shields.io/npm/dm/pnp-auth.svg)](https://www.npmjs.com/package/pnp-auth)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/sharepoint-node/Lobby)

`pnp-auth` uses [`node-sp-auth`](https://github.com/s-KaiNet/node-sp-auth) as authentication library, thus making all authentication options from `node-sp-auth` available for `pnp-auth`.

Supported versions:

- SharePoint 2013, 2016
- SharePoint Online

For full list of authentication options check out [`node-sp-auth`](https://github.com/s-KaiNet/node-sp-auth) readme.

## How to use

### Install

```bash
npm install pnp-auth --save
```

Install `@pnp/sp` libraries as well:

```bash
npm install @pnp/logging @pnp/common @pnp/odata @pnp/sp --save
```

We need more than just `@pnp/sp` because it depends on some other `@pnp/` packages.

### Bootstrap

Before using PnPjs library, you should make it aware of your authentication data. That should be performed at the start of your application. The code is fairly simple:

```TypeScript
import { bootstrap } from 'pnp-auth';
import { sp } from '@pnp/sp';

bootstrap(sp, authData, siteUrl); 
// That's it! Now you can use pnp-sp library:

sp.web.get().then(...);
```

### API:

#### bootstrap(sp, authData, siteUrl)

- `sp` - "sp" object obtained from `@pnp/sp` library via import: `import { sp } from '@pnp/sp';`
- `authData` - can be a `string`, `AuthConfig` object or raw `node-sp-auth` credentials:
  - `string` - absolute or relative path to your file with authentication data. File should be generated using [`node-sp-auth-config`](https://github.com/koltyakov/node-sp-auth-config) CLI. When string is provided, `pnp-auth` internally creates `AuthConfig` with below default parameters:
  ```TypeScript
  let authConfig = new AuthConfig({
    configPath: <your path to file>,
    encryptPassword: true,
    saveConfigOnDisk: true
  });
  ```
  - `AuthConfig` - you can provide [`AuthConfig`](https://github.com/koltyakov/node-sp-auth-config#usage-in-typescript) directly. To learn more checkout [`node-sp-auth-config`](https://github.com/koltyakov/node-sp-auth-config) repository
  - raw credentials - you can pass any credential options which are supported by `node-sp-auth`. For more information checkout [`node-sp-auth`](https://github.com/s-KaiNet/node-sp-auth) repository as well as [wiki](https://github.com/s-KaiNet/node-sp-auth/wiki)
- `siteUrl` - your SharePoint site url. You have two options when working with SharePoint data. When using `siteUrl` parameter, you can write a code `sp.web.get()` etc., in that case your `sp.web` object will be attached to your `siteUrl`. If you want to work with different webs, you can use Web constructor: `new Web(<url to SharePoint>)`

### Manual bootstrap
 
Of course, you can do bootstrap manually, if you want. `pnp-auth` exports `NodeFetchClient` which you can use in pnp's `setup` method:

```TypeScript
import NodeFetchClient from 'pnp-auth';
import { sp } from '@pnp/sp';

sp.setup({
  sp: {
    fetchClientFactory: () => {
      return new NodeFetchClient(authData, siteUrl);
    }
  }
});
```

## Development

1. `npm install`
2. `npm run build` - tslint & TS compile

## Testing

Library has a few integration tests:

1. `npm install`
2. Rename `settings.sample.ts` to `settings.ts`. Update `webTitle` and `subsiteUrl` to your real data.
3. Use `node-sp-auth-config` to generate credentials inside `./config/private.json` file. Site url in credentials should point to site with `webTitle` from step `#2`.
4. Run `npm test`
