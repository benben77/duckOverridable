const duckOverridable = require('./dist/index.js');
const { Overridable, Validator, Field, TypedList, RestParams } = duckOverridable;

describe("Can override function", () => {
    const calc = Overridable((a, b) => {
        return a + b;
    });
    calc.override(String, String, (a, b) => {
        return +a + +b;
    });
    calc.override(null, null, Number, (a, b, c) => {
        return calc(a, b) * c;
    });

    test("use default cb", () => {
        expect(calc(1, 2)).toBe(3);
    });
    test("with different types", () => {
        expect(calc('1', '2')).toBe(3);
    });
    test("with different number of parameters", () => {
        expect(calc('1', '2', 3)).toBe(9);
        expect(calc(1, '2', 3)).toBe(36);
        expect(calc([1], 2)).toBe('12');
    });
});

describe("Can override methods", () => {
    const volume = Overridable(() => {
        throw new Error('not implemented');
    });
    volume.override(Field('length', Number), Field('width', Number), Number, function(height) {
        return this.length * this.width * height;
    });
    volume.override(Field('radius', Number),  Number, function(height) {
        return this.radius * this.radius * height;
    });
    class A {
        constructor(length, width) {
            this.length = length;
            this.width = width;
        }
    }
    A.prototype.volume = volume;
    class B {
        constructor(radius) {
            this.radius = radius;
        }
        volume(height) {
            return volume.call(this, height);
        }
    }

    test("used by prototype", () => {
        expect(new A(1, 2).volume(3)).toBe(6);
    });
    test("used by .call", () => {
        expect(new B(2).volume(3)).toBe(12);
    });
});

describe("Can use custom validator", () => {
    const func = Overridable((a, b) => {
        return a * b;
    });
    func.override(Validator(x => x < 0), Number, (a, b) => {
        return -a * b;
    });

    test("custom validator", () => {
        expect(func(2, 3)).toBe(6);
        expect(func(-2, 3)).toBe(6);
    });
});

describe("Can use custom validator with methods", () => {
    const func = Overridable(function() {
        return this.a * this.b;
    });
    func.override(Field('a', Validator(function(x) {
        // return x < 0;
        return this.a < 0;
    })), Field('b', Number), function() {
        return -this.a * this.b;
    });
    class C {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
    }
    C.prototype.func = func;

    test("custom validator with methods", () => {
        expect(new C(2, 3).func()).toBe(6);
        expect(new C(-2, 3).func()).toBe(6);
    });
});

describe("Override with typed list", () => {
    const func = Overridable(function() {
        throw new Error('not implemented');
    });
    func.override(TypedList(Number), function(list) {
        return list.reduce((sum, x) => sum + x, 0);
    });
    func.override(TypedList(String), function(list) {
        return list.reduce((sum, x) => sum + parseFloat(x, 10), 0);
    });

    const func2 = Overridable(function() {
        return this.list.reduce((sum, x) => sum + x, 0);
    });
    func2.override(Field('list', TypedList(Validator(x => x < 0))), function() {
        return this.list.reduce((sum, x) => sum - x, 0);
    });

    test("typed list", () => {
        expect(func([1, 2, 3])).toBe(6);
        expect(func(['1', '2', '3'])).toBe(6);

        expect({ list: [-1, 2, 3], func2 }.func2()).toBe(4);
        expect({ list: [-1, -2, -3], func2 }.func2()).toBe(6);
    });
});

describe("Use RestParams", () => {
    const func = Overridable(function() {
        throw new Error('not implemented');
    });
    func.override(Number, Number, RestParams, function(...params) {
        return params.reduce((sum, x) => sum + x, 0);
    });

    test("RestParams", () => {
        expect(func(1, 2, 3)).toBe(6);
        expect(func(1, 2, '3')).toBe('33');
    });
});
