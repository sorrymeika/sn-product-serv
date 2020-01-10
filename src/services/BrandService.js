const { Service } = require('sonorpc');

class BrandService extends Service {
    async queryBrands({ id, sellerId, name, status, brandType, hasBrandAuth, pageIndex, pageSize }) {
        let where = '1=1';
        const args = [];
        const start = Math.max(0, pageIndex - 1) * pageSize;

        if (name) {
            where += ' and name like CONCAT(\'%\',@p' + args.length + ',\'%\')';
            args.push(name);
        }

        if (id) {
            where += ' and id=@p' + args.length;
            args.push(id);
        }

        if (sellerId) {
            where += ' and sellerId=@p' + args.length;
            args.push(sellerId);
        }

        if (status != null) {
            where += ' and status=@p' + args.length;
            args.push(status);
        }

        if (brandType != null) {
            where += ' and brandType=@p' + args.length;
            args.push(brandType);
        }

        if (hasBrandAuth != null) {
            where += ' and hasBrandAuth=@p' + args.length;
            args.push(hasBrandAuth);
        }

        const conn = await this.app.mysql.connect();

        try {
            const rows = await conn.query('select id,name,logo,status,sellerId,brandType,note,hasBrandAuth from brand where ' + where + ' limit ' + start + ',' + pageSize, args);
            const count = await conn.query('select count(1) as total from brand where ' + where, args);

            return { success: true, code: 0, data: rows, total: count && count[0] ? count[0].total : 0 };
        } finally {
            conn.release();
        }
    }

    async getBrandById(id) {
        const rows = await this.app.mysql.query('select id,name,logo,status,sellerId,brandType,countryId,note,hasBrandAuth,brandExp,trademarkRegPic,brandAuthPic,inspectionReportPic,companyBLPic,prdLicencePic,approvalLicencePic,oemAgreementPic,oosBrandAuthPic,oosPurchaseInvoicePic from brand where id=@p0', [id]);
        return { success: true, code: 0, data: rows && rows[0] };
    }

    async addBrand({
        name,
        logo,
        sellerId,
        countryId,
        brandType,
        note,
        hasBrandAuth,
        brandExp,
        trademarkRegPic,
        brandAuthPic,
        inspectionReportPic,
        companyBLPic,
        prdLicencePic,
        approvalLicencePic,
        oemAgreementPic,
        oosBrandAuthPic,
        oosPurchaseInvoicePic,
        creator
    }) {
        const res = await this.app.mysql.insert('brand', {
            name,
            logo,
            status: 2,
            sellerId,
            countryId,
            brandType,
            note,
            hasBrandAuth,
            brandExp,
            trademarkRegPic,
            brandAuthPic,
            inspectionReportPic,
            companyBLPic,
            prdLicencePic,
            approvalLicencePic,
            oemAgreementPic,
            oosBrandAuthPic,
            oosPurchaseInvoicePic,
            creator,
            createDt: new Date()
        });

        return { success: !!res.insertId, id: res.insertId };
    }

    async updateBrand({
        id,
        name,
        logo,
        countryId,
        brandType,
        note,
        hasBrandAuth,
        brandExp,
        trademarkRegPic,
        brandAuthPic,
        inspectionReportPic,
        companyBLPic,
        prdLicencePic,
        approvalLicencePic,
        oemAgreementPic,
        oosBrandAuthPic,
        oosPurchaseInvoicePic,
        modifyer
    }) {
        const res = await this.app.mysql.update('brand', {
            name,
            logo,
            countryId,
            brandType,
            note,
            hasBrandAuth,
            brandExp,
            trademarkRegPic,
            brandAuthPic,
            inspectionReportPic,
            companyBLPic,
            prdLicencePic,
            approvalLicencePic,
            oemAgreementPic,
            oosBrandAuthPic,
            oosPurchaseInvoicePic,
            modifyer,
            modifyDt: new Date()
        }, { id });

        return { success: !!res.affectedRows, data: res };
    }
}

module.exports = BrandService;