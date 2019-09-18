const { Service } = require('sonorpc');

class FormulaService extends Service {
    async listFormula({ id, sellerId, name, pageIndex, pageSize }) {
        const args = [];
        const start = Math.max(0, pageIndex - 1) * pageSize;
        let where = '1=1';

        if (id) {
            where += ' and id=@p' + args.length;
            args.push(id);
        }

        if (sellerId != null) {
            where += ' and sellerId=@p' + args.length;
            args.push(sellerId);
        }

        if (name) {
            where += ' and name like CONCAT(\'%\',@p' + (args.length) + ',\'%\')';
            args.push(name);
        }

        const rows = await this.ctx.mysql.query(
            `select id,name,tagIds,sellerId,cates,types,keywords,brandName,minSales,maxSales,minPrice,maxPrice from formula where ${where} limit ${start},${pageSize}`,
            args
        );

        return { success: true, code: 0, data: rows };
    }

    async getFormulaById(id) {
        const rows = await this.ctx.mysql.query('select id,name,tagIds,sellerId,cates,types,keywords,brandName,minSales,maxSales,minPrice,maxPrice from formula where id=@p0', [id]);
        return { success: true, code: 0, data: rows && rows[0] };
    }

    async addFormula({
        name,
        tagIds,
        sellerId,
        cates,
        types,
        keywords,
        brandName,
        minSales,
        maxSales,
        minPrice,
        maxPrice
    }) {
        const res = await this.ctx.mysql.insert('formula', {
            name,
            tagIds,
            sellerId,
            cates,
            types,
            keywords,
            brandName,
            minSales,
            maxSales,
            minPrice,
            maxPrice
        });

        return { success: !!res.insertId, id: res.insertId };
    }

    async updateFormula({
        id,
        name,
        tagIds,
        sellerId,
        cates,
        types,
        keywords,
        brandName,
        minSales,
        maxSales,
        minPrice,
        maxPrice
    }) {
        const res = await this.ctx.mysql.update(`formula`, {
            name,
            tagIds,
            sellerId,
            cates,
            types,
            keywords,
            brandName,
            minSales,
            maxSales,
            minPrice,
            maxPrice
        }, { id });

        return { success: !!res.affectedRows, data: res };
    }
}

module.exports = FormulaService;