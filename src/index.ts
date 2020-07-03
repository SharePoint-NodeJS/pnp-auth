import NodeFetchClient from './NodeFetchClient';
import { IAuthOptions } from 'node-sp-auth';
import { AuthConfig } from 'node-sp-auth-config';
import { SPRest } from '@pnp/sp-commonjs';

export * from './NodeFetchClient';

export function bootstrap(sp: SPRest, authData: IAuthOptions | AuthConfig | string, url?: string) {
  sp.setup({
    sp: {
      fetchClientFactory: () => new NodeFetchClient(authData, url),
      baseUrl: url
    }
  });
}
