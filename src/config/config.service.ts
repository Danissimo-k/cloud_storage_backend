import {TypeOrmModuleOptions} from '@nestjs/typeorm';

class ConfigService {

    constructor(private env: { [k: string]: string | undefined }) {
    }

    private getValue(key: string, throwOnMissing = true): string {
        const value = this.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing env.${key}`);
        }

        return value;
    }

    public ensureValues(keys: string[]) {
        keys.forEach(k => this.getValue(k, true));
        return this;
    }

    public getPort() {
        return this.getValue('PORT', true);
    }

    public isProduction() {
        const mode = this.getValue('MODE', false);
        return mode != 'DEV';
    }

    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            type: 'postgres',

            host: this.getValue('HOST'),
            port: parseInt(this.getValue('PORT')),
            username: this.getValue('DB_USER'),
            password: this.getValue('PASSWORD'),
            database: this.getValue('DATABASE'),

            entities: ['**/*.entity{.ts,.js}'],
        };
    }

}

export default () => {
    const obj = {}
    Object.keys(process.env).forEach(k => {
        obj[k] = process.env[k]
    })

    return obj
}

