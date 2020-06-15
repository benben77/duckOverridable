const matchType = function(item, type) {
    if (type instanceof Validator) return type.cb.call(this, item);
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
            const notMatch = types.some((type, idx) => !matchType.call(this, params[idx], type));
            const fieldsNotMatch = fields.some(({ key, type }) => /*!(key in this)*/this[key] === undefined || !matchType.call(this, this[key], type));
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

function Validator(cb) {
    if (this instanceof Validator) {
        this.cb = cb;
    } else {
        return new Validator(cb);
    }
}

/**
 * TODO
 * 1. support typed array
 * 2. support rest
 */

export {
    Field,
    Validator,
    Overridable,
};
