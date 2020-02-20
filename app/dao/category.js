const { Dao } = require('sonorpc');
const { PARAM_ERROR } = require('../constants/error');

class CategoryDao extends Dao {
    getCatesByPid(pid) {
        return this.connection.query('select id,name,level,creator from category where pid=@p0', [pid]);
    }

    addCate({ name, pid, level, creator }) {
        return this.connection.insert('category', {
            name,
            pid,
            level,
            creator,
            createDt: new Date()
        });
    }

    updateCate({ name, id, modifyer }) {
        return this.connection.update('category', {
            name,
            modifyer,
            modifyDt: new Date()
        }, {
            id
        });
    }

    getSpuPropDefinitions(categoryId) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }
        const columns = ['categoryId', 'type', 'inputType', 'label', 'field', 'rules', 'inputProps', 'options'];
        return this.connection.select(columns, 'spuPropDefinition', {
            where: {
                status: 1,
                categoryId
            }
        });
    }

    getSpuPropFields(categoryId) {
        return this.connection.select('id,label,field', ' spuPropDefinition', {
            where: {
                status: 1,
                categoryId
            }
        });
    }

    addSpuPropDefinition({ categoryId, type, inputType, label, field, rules, inputProps, options, status }) {
        return this.connection.insert('spuPropDefinition', {
            categoryId,
            type,
            inputType,
            label,
            field,
            rules,
            inputProps,
            options,
            status
        });
    }

    updateSpuPropDefinition({ id, type, inputType, label, field, rules, inputProps, options }) {
        return this.connection.update('spuPropDefinition', {
            type,
            inputType,
            label,
            field,
            rules,
            inputProps,
            options
        }, { id });
    }
}

module.exports = CategoryDao;