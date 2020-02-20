const { Service } = require('sonorpc');

const DEFAULT_COLUMNS = ['id', 'name', 'level', 'pid', 'sort'];
const ALL_COLUMNS = [...DEFAULT_COLUMNS, 'picture', 'formulaId', 'linkType', 'link'];

class FdCategoryService extends Service {
    getCatesBySellerId(sellerId) {
        return this.connection.select(DEFAULT_COLUMNS, 'fdCategory', {
            where: {
                sellerId
            },
            orderBy: {
                sort: false
            }
        });
    }

    getSubCatesByPid(pid) {
        return this.connection.select(DEFAULT_COLUMNS, 'fdCategory', {
            where: {
                pid
            },
            orderBy: {
                sort: false
            }
        });
    }

    getSubSubCatesByPids(pids) {
        return this.connection.select(ALL_COLUMNS, 'fdCategory', {
            where: {
                pid: pids
            },
            orderBy: {
                sort: false
            }
        });
    }

    add({ sellerId, name, pid, level, sort, picture, linkType, link, formulaId, creator }) {
        return this.connection.insert('fdCategory', {
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
    }

    update({ name, id, sort, picture, linkType, link, formulaId, modifyer }) {
        return this.connection.update('fdCategory', {
            name,
            sort,
            picture,
            linkType,
            link,
            formulaId,
            modifyer,
            modifyDt: new Date()
        }, { id });
    }

    async deleteById(id) {
        const children = await this.connection.query('select id from fdCategory where pid=@p0 limit 1', [id]);
        if (children.length) {
            throw new Error('不能删除有子类的类目！');
        }
        return this.connection.query('delete from fdCategory where id=@p0', [id]);
    }
}

module.exports = FdCategoryService;
