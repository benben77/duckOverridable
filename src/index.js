const matchType = function(item, type) {
    if (type instanceof Validator) return type.cb.call(this, item);
    if (type instanceof TypedList) return (item instanceof Array) && !item.some(x => !matchType(x, type.type));
    if (type == null) return true;
    if (type === Number && typeof item === 'number') return true;
    if (type === String && typeof item === 'string') return true;
    return item instanceof type;
};

function Overridable(cb) {
    const list = [];
    const func = function(...params) {
        for (let i = 0; i < list.length; i++) {
            const { matcher, cb } = list[i];
            if (matcher.match(this, params)) return cb.call(this, ...params);
        }
        return cb.call(this, ...params);
    };
    func.override = function(...l) {
        const cb = l.pop();
        list.push({
            matcher: new Matcher(l),
            cb,
        });
    };
    return func;
}

function Matcher(l) {
    const types = [];
    const fields = [];
    let rest = false;
    l.forEach((x, i) => {
        if (x === RestParams) {
            if (i !== l.length - 1) throw new Error('RestParams must be last');
            rest = true;
        } else if (x instanceof Field) {
            fields.push(x);
        } else {
            types.push(x);
        }
    });
    this.types = types;
    this.fields = fields;
    this.rest = rest;
}
Matcher.prototype.match = function(ctx, params) {
    const { types, fields, rest } = this;
    if (!rest && types.length !== params.length) return false;
    if (rest && types.length > params.length) return false;
    const notMatch = types.some((type, idx) => !matchType.call(ctx, params[idx], type));
    if (notMatch) return false;
    const fieldsNotMatch = fields.some(({ key, type }) => /*!(key in ctx)*/ctx[key] === undefined || !matchType.call(ctx, ctx[key], type));
    return !fieldsNotMatch;
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

function TypedList(type) {
    if (this instanceof TypedList) {
        this.type = type;
    } else {
        return new TypedList(type);
    }
}

const RestParams = Symbol();

export {
    Field,
    Validator,
    Matcher,
    TypedList,
    RestParams,
    Overridable,
};
