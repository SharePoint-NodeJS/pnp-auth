import { HttpClientImpl, FetchOptions, Util } from '@pnp/common';
import { IAuthOptions, getAuth } from 'node-sp-auth';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { AuthConfig } from 'node-sp-auth-config';
import { parse as urlParse } from 'url';
import * as https from 'https';

declare var global: any;

global.Headers = Headers;
global.Request = Request;
global.Response = Response;

export default class NodeFetchClient implements HttpClientImpl {

    private authSettings: IAuthOptions = null;

    constructor(private authData: IAuthOptions | AuthConfig | string, private siteUrl?: string) { }

    public async fetch(url: string, options: FetchOptions): Promise<any> {
        await this.initAuthOptions();

        if (!Util.isUrlAbsolute(url)) {
            url = Util.combinePaths(this.siteUrl, url);
        }

        let authData = await getAuth(url, this.authSettings);

        /* attach headers and options received from node-sp-auth */
        const headers: Headers = new Headers();
        this.mergeHeaders(headers, options.headers);
        this.mergeHeaders(headers, authData.headers);

        let host: string = (urlParse(url)).host;
        let isOnPrem: boolean = host.indexOf('.sharepoint.com') === -1 && host.indexOf('.sharepoint.cn') === -1;

        // explicit full metadata for on-premise
        if (isOnPrem) {
            headers.set('accept', 'application/json;odata=verbose');
        }

        Util.extend(options, {
            headers: headers
        });

        Util.extend(options, authData.options);

        let isHttps: boolean = urlParse(url).protocol === 'https:';

        if (isHttps && !(options as any).agent) {
            /* bypassing ssl certificate errors (self signed, etc) for on-premise */
            (options as any).agent = new https.Agent({ rejectUnauthorized: false });
        }

        /* perform actual request with node-fetch */
        return fetch(url, options as any);
    }

    private async initAuthOptions() {
        if (this.authSettings != null) {
            return;
        }
        if (typeof this.authData === 'string') {
            let authConfig = new AuthConfig({
                configPath: this.authData,
                encryptPassword: true,
                saveConfigOnDisk: true
            });

            await this.initAuthOptionsFromAuthConfig(authConfig);

        } else if (this.authData instanceof AuthConfig) {
            await this.initAuthOptionsFromAuthConfig(this.authData);
        } else {
            this.authSettings = this.authData;
        }
    }

    private async initAuthOptionsFromAuthConfig(config: AuthConfig) {
        let ctx = await config.getContext();
        this.authSettings = ctx.authOptions;
        if (!this.siteUrl) {
            this.siteUrl = ctx.siteUrl;
        }
    }

    private mergeHeaders(target: Headers, source: any): void {
        if (typeof source !== 'undefined' && source !== null) {
            const temp: any = new Request('', { headers: source });
            temp.headers.forEach((value: string, name: string) => {
                target.set(name, value);
            });
        }
    }
}
