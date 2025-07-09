export default class Page { 
    constructor(url, config) {
        const defaultConf = {
            closeable: true,

        };
        this.url = url || 'alora://new';
        this.config = {defaultConf, ...config}
    }
}