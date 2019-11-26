const { Service } = require('sonorpc');
const { PARAM_ERROR } = require('../constants/error');

class FdCategoryService extends Service {
    async getLevel1Cates(sellerId) {
        if (typeof sellerId !== 'number') {
            return { ...PARAM_ERROR, message: '必须传入sellerId' };
        }

        const rows = await this.ctx.mysql.query('select id,name,level,pid,sort from fdCategory where sellerId=@p0 and level=1 order by sort desc', [sellerId]);

        return { success: true, data: rows };
    }

    async getSubCatesTreeByPid(pid) {
        if (typeof pid !== 'number') {
            return { ...PARAM_ERROR, message: '必须传入pid' };
        }

        const conn = await this.ctx.mysql.connect();
        try {
            const rows = await conn.query('select id,name,level,pid,sort from fdCategory where pid=@p0 order by sort desc', [pid]);
            if (rows.length) {
                const ids = rows.map(row => row.id);
                const subSubCates = await conn.query('select id,name,level,pid,sort,picture,formulaId,linkType,link from fdCategory where pid in (' + ids.join(',') + ') order by sort desc');

                rows.forEach((row) => {
                    row.children = subSubCates.filter(subSubCate => subSubCate.pid === row.id);
                });
            }
            return { success: true, data: rows };
        } finally {
            conn.release();
        }
    }

    async add({ sellerId, name, pid, level, sort, picture, linkType, link, formulaId, creator }) {
        if (typeof pid !== "number" || !name || !level) {
            return PARAM_ERROR;
        }

        const res = await this.ctx.mysql.insert('fdCategory', {
            sellerId,
            name,
            picture,
            pid,
            level,
            sort,
            linkType,
            link,
            formulaId,
            creator,
            createDt: new Date()
        });
        return { success: !!res.insertId, id: res.insertId };
    }

    async update({ name, id, sort, picture, linkType, link, formulaId, modifyer }) {
        if (typeof id !== "number" || !name) {
            return PARAM_ERROR;
        }

        const res = await this.ctx.mysql.update('fdCategory', {
            name,
            sort,
            picture,
            linkType,
            link,
            formulaId,
            modifyer,
            modifyDt: new Date()
        }, { id });
        return { success: true, data: res };
    }

    async deleteById(id) {
        const children = await this.ctx.mysql.query('select id from fdCategory where pid=@p0 limit 1', [id]);
        if (children.length) {
            return { success: false, message: '不能删除有子类的类目！' };
        }

        await this.ctx.mysql.query('delete from fdCategory where id=@p0', [id]);
        return { success: true };
    }
}

module.exports = FdCategoryService;
