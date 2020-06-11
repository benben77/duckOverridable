const matchType = function(item, type) {
    if (type == null) return true;
    if (type === Number && typeof item === 'number') return true;
    if (type === String && typeof item === 'string') return true;
    return item instanceof type;
};

function Overridable(cb) {
    const list = [];
    const func = function(...params) {
        for (let i = 0; i < list.length; i++) {
            const { types, cb, fields } = list[i];
            if (types.length !== params.length) continue;
            const notMatch = types.some((type, idx) => !matchType(params[idx], type));
            const fieldsNotMatch = fields.some(({ key, type }) => /*!(key in this)*/this[key] === undefined || !matchType(this[key], type));
            if (!notMatch && !fieldsNotMatch) return cb.call(this, ...params);
        }
        return cb.call(this, ...params);
    };
    func.override = function(...l) {
        const cb = l.pop();
        const types = [];
        const fields = [];
        l.forEach(x => {
            if (x instanceof Field) {
                fields.push(x);
            } else {
                types.push(x);
            }
        });
        list.push({
            types,
            fields,
            cb,
        });
    };
    return func;
}

function Field(key, type) {
    if (this instanceof Field) {
        this.key = key;
        this.type = type;
    } else {
        return new Field(key, type);
    }
}

/**
 * TODO
 * 1. support custom type function
 * 2. support typed array
 */

export {
    Field,
    Overridable,
};
