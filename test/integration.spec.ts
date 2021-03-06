import { bootstrap } from '../src/index';
import { sp, Web } from '@pnp/sp-commonjs';
import { expect } from 'chai';
import { AuthConfig } from 'node-sp-auth-config';

import { subSiteUrl, webTitle } from './settings';

describe('pnp-auth integration testing', () => {

    it('should read creds from file and use site url from file', async function () {
        this.timeout(60 * 1000);

        bootstrap(sp, './config/private.json');

        const web = await sp.web.get();
        expect(web.Title).to.equal(webTitle);
    });

    it('should use creds from AuthConfig and use site url from file', async function () {
        this.timeout(60 * 1000);

        const authConfig = new AuthConfig({
            configPath: './config/private.json',
            encryptPassword: true,
            saveConfigOnDisk: true
        });

        bootstrap(sp, authConfig);

        const web = await sp.web.get();
        expect(web.Title).to.equal(webTitle);
    });

    it('should use real creds (IAuthOptions) and use site url from file', async function () {
        this.timeout(60 * 1000);

        const authConfig = new AuthConfig({
            configPath: './config/private.json',
            encryptPassword: true,
            saveConfigOnDisk: true
        });
        const ctx = await authConfig.getContext();

        bootstrap(sp, ctx.authOptions, ctx.siteUrl);

        const web = await sp.web.get();
        expect(web.Title).to.equal(webTitle);
    });

    it('should use creds when constructing SP objects', async function () {
        this.timeout(60 * 1000);

        const authConfig = new AuthConfig({
            configPath: './config/private.json',
            encryptPassword: true,
            saveConfigOnDisk: true
        });
        const ctx = await authConfig.getContext();

        bootstrap(sp, ctx.authOptions);

        const web = Web(ctx.siteUrl);

        const webInfo = await web.get();
        expect(webInfo.Title).to.equal(webTitle);
    });

    it('should override site url with url supplied with bootstrap method', async function () {
        this.timeout(60 * 1000);

        bootstrap(sp, './config/private.json', subSiteUrl);

        const web = await sp.web.get();

        expect(web.Title).not.to.equal(webTitle);
    });

    it('should throw an error when no siteUrl supplied', async function () {
        this.timeout(60 * 1000);

        const authConfig = new AuthConfig({
            configPath: './config/private.json',
            encryptPassword: true,
            saveConfigOnDisk: true
        });
        const ctx = await authConfig.getContext();

        bootstrap(sp, ctx.authOptions);

        try {
            await sp.web.get();
        } catch (e) {
            expect(e.message).to.contain('You should provide siteUrl');
        }
    });
});
