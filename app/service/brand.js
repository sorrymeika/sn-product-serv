const { Service } = require('sonorpc');

class BrandService extends Service {
    async queryBrands(params) {
        const {
            app,
            schema
        } = this;
        app.validate(schema.brand.queryParams, params);
        const res = await app.dao.brand.queryBrands(params);
        return { success: true, ...res };
    }

    async getBrandById(id) {
        const rows = await this.app.dao.brand.getBrandById(id);
        return { success: true, code: 0, data: rows && rows[0] };
    }

    async addBrand(brand) {
        const res = await this.app.dao.brand.addBrand(brand);
        return { success: !!res.insertId, id: res.insertId };
    }

    async updateBrand(brand) {
        const res = await this.app.dao.brand.updateBrand(brand);
        return { success: true, data: res };
    }
}

module.exports = BrandService;