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

Use 'Field' to define fields-checking:

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

Use them:

```
new A(1, 2).volume(3); // 6
new B(2).volume(3); // 12
```

### use custom validator

Define:

```
const func = Overridable((a, b) => {
    return a * b;
});
func.override(Validator(x => x < 0), Number, (a, b) => {
    return -a * b;
});

const func = Overridable(function() {
    return this.a * this.b;
});
func.override(Field('a', Validator(x => x < 0)), Field('b', Number), function() {
    return -this.a * this.b;
});
class C {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}
C.prototype.func = func;
```

### Typed list

Define:

```
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
```

Use:

```
func([1, 2, 3]); // 6
func(['1', '2', '3']); // 6
{ list: [-1, 2, 3], func2 }.func2(); // 4
{ list: [-1, -2, -3], func2 }.func2(); // 6
```

### Rest

Use RestParams to skip rest params:

```
const func = Overridable(function() {
    throw new Error('not implemented');
});
func.override(Number, Number, RestParams, function(...params) {
    return params.reduce((sum, x) => sum + x, 0);
});

func(1, 2, 3); // 6
func(1, 2, '3'); // '33'
```
