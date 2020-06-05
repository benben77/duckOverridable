const duckOverridable = require('./dist/index.js');
const { Overridable, Field } = duckOverridable;

const calc = Overridable((a, b) => {
    return a + b;
});
calc.override(String, String, (a, b) => {
    return +a + +b;
});
calc.override(null, null, Number, (a, b, c) => {
    return calc(a, b) * c;
});

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

test("calc(1, 2) to equal 3", () => {
    expect(calc(1, 2)).toBe(3);
});
test("calc('1', '2') to equal 3", () => {
    expect(calc('1', '2')).toBe(3);
});
test("calc('1', '2', 3) to equal 9", () => {
    expect(calc('1', '2', 3)).toBe(9);
});
test("calc(1, '2', 3) to equal 36", () => {
    expect(calc(1, '2', 3)).toBe(36);
});
test("calc([1], 2) to equal '12'", () => {
    expect(calc([1], 2)).toBe('12');
});

test("new A(1, 2).volume(3) to equal 6", () => {
    expect(new A(1, 2).volume(3)).toBe(6);
});
test("new B(2).volume(3) to equal 12", () => {
    expect(new B(2).volume(3)).toBe(12);
});
