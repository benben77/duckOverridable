# duckOverridable

Create functions that can be overrided.

## Usage

```
import { Overridable, Field } from 'duckOverridable';
```

### as function

Define a function:

```
const calc = Overridable((a, b) => {
    return a + b;
});
calc.override(String, String, (a, b) => {
    return +a + +b;
});
// use null or undefined as 'any'
calc.override(null, null, Number, (a, b, c) => {
    return calc(a, b) * c;
});
```

Use the function:

```
calc(1, 2); // 3
calc('1', '2'); // 3
calc('1', '2', 3); // 9 as calc('1', '2') * 3
calc(1, '2'); // 1 + '2' = '12'
calc(1, '2', 3); // 36
calc(1, 2, 3, 4); // 3
```

### as methods

Define a function:

```
const volume = Overridable(() => {
    throw new Error('not implemented');
});
volume.override(Field('length', Number), Field('width', Number), Number, function(height) {
    return this.length * this.width * height;
});
volume.override(Field('radius', Number),  Number, function(height) {
    return this.radius * this.radius * height;
});
```

Use as methods:

```
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
```

Use the methods:

```
new A(1, 2).volume(3); // 6
new B(2).volume(3); // 12
```
