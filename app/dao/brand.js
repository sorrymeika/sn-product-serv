const { Dao } = require('sonorpc');

const DEFAULT_COLUMNS = ['id', 'name', 'logo', 'status', 'sellerId', 'brandType', 'note', 'hasBrandAuth'];
const ALL_COLUMNS = [...DEFAULT_COLUMNS, 'countryId', 'brandExp', 'trademarkRegPic', 'brandAuthPic', 'inspectionReportPic', 'companyBLPic', 'prdLicencePic', 'approvalLicencePic', 'oemAgreementPic', 'oosBrandAuthPic', 'oosPurchaseInvoicePic'];

class BrandDao extends Dao {
    async queryBrands({ id, sellerId, name, status, brandType, hasBrandAuth, pageIndex, pageSize }) {
        let where = {};
        if (name) where['name like ?'] = `%${name}%`;
        if (id) where.id = id;
        if (sellerId) where.sellerId = sellerId;
        if (status != null) where.status = status;
        if (brandType != null) where.brandType = brandType;
        if (hasBrandAuth != null) where.hasBrandAuth = hasBrandAuth;
        return this.connection.selectPage(
            DEFAULT_COLUMNS,
            'brand',
            {
                where,
                pageIndex,
                pageSize
            }
        );
    }

    getBrandsByIds(ids) {
        return this.connection.select(DEFAULT_COLUMNS, 'brand', {
            id: ids
        });
    }

    getBrandById(id) {
        return this.connection.select(ALL_COLUMNS, 'brand', {
            where: {
                id
            }
        });
    }

    addBrand(brand) {
        const values = [ALL_COLUMNS.filter(col => col != 'id'), 'creator'].reduce((values, key) => {
            values[key] = brand[key];
            return values;
        }, {
            status: 2,
            createDt: new Date()
        });
        return this.connection.insert('brand', values);
    }

    async updateBrand(data) {
        const values = [ALL_COLUMNS.filter(col => col != 'id'), 'modifyer'].reduce((values, key) => {
            if (key in data) {
                values[key] = data[key];
            }
            return values;
        }, {
            modifyDt: new Date()
        });
        return this.connection.update('brand', values, { id: data.id });
    }
}

module.exports = BrandDao;