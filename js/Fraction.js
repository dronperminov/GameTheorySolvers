const fractionTemplate = "^[-+]?\\d+\/\\d+$";
const realTemplate = "^[-+]?\\d+([\\.\\,]\\d+)?$";

function Fraction(text = "0") {
    if (text != "" && text.match(new RegExp(fractionTemplate)) == null && text.match(new RegExp(realTemplate)) == null)
        throw "Некорректная дробь: " + text;

    text = text.replace(/,/gi, ".");
    
    var index = text.indexOf("/"); 

    this.n = bigInt.zero;
    this.m = bigInt.one;

    if (index > -1) {
        this.n = bigInt(text.substr(0, index));
        this.m = bigInt(text.substr(index + 1));
    }
    else if ((index = text.indexOf("e")) > -1) {
        throw "Невозможно получить дробь. Используйте обычную форму записи вместо экспонециальной.";
    }
    else {
        index = text.indexOf(".");

        if (index > -1) {
            var sign = text[0] == "-" ? -1 : 1;
            var int = bigInt(text.substr(0, index));
            var float = text.substr(index + 1);

            index = float.length - 1;

            while (index > 0 && float[index] == "0") 
                index--;

            float = bigInt(float.substr(0, index + 1));

            this.m = bigInt(10).pow(index + 1);
            this.n = bigInt(int).abs().multiply(this.m).add(float);
            this.n = this.n.multiply(sign);
        }
        else {
            this.n = bigInt(text);
            this.m = bigInt.one;
        }
    } 
    
    this.reduce();
}

Fraction.prototype.reduce = function() {
    var nod = bigInt.gcd(this.n, this.m).abs();

    this.n = this.n.divide(nod);
    this.m = this.m.divide(nod);
}

// view:
// -1 - вывод через /
// 0 - обыкновенная неправильная дробь
// 1 - обыкновенная правильная дробь
// 2 - десятичная дробь
Fraction.prototype.print = function(view = 1, digits = 5) {
    if (view == -1) {
        var result = this.n.toString();

        if (!this.m.equals(bigInt.one)) 
            result += "/" + this.m.toString();

        return result;
    }

    if (view == 2) {
        var s = this.n.abs().multiply(bigInt(10).pow(digits)).divide(this.m).toString();

        while (s.length < digits)
            s = "0" + s;

        var int = s.substr(0, s.length - digits);
        var real = s.substr(s.length - digits, digits);

        if (int == "")
            int = "0";  
        
        var index = real.length;
        while (index > 1 && real[index - 1] == "0")
            index--;

        real = real.substr(0, index);

        return (this.n.isNegative() ? "-" : "") + int + (real == "0" ? "" : "." + real);
    }
    
    if (this.m.equals(bigInt.one))
        return this.n.toString();

    var html = "";

    if (this.n.isNegative())
        html += "- ";

    if (view == 0) {
        var int = this.n.divide(this.m).abs();
        var n = this.n.abs().mod(this.m);

        if (!int.isZero())
            html += int.toString();

        if (!n.isZero())
            html += "<div class='fraction'><div class='numerator'>" + n.toString() + "</div><div class='denumerator'>" + this.m.toString() + "</div></div>";
    } else {
        html += "<div class='fraction'><div class='numerator'>" + this.n.abs().toString() + "</div><div class='denumerator'>" + this.m.toString() + "</div></div>";
    }

    return html;
}

Fraction.prototype.printNg = function(view, digits) {
    return this.n.isNegative() ? "(" + this.print(view, digits) + ")" : this.print(view, digits);
}

Fraction.prototype.toString = function() {
    if (this.m.equals(bigInt.one))
        return this.n.toString();

    return this.n.toString() + "/" + this.m.toString();
}

Fraction.prototype.mult = function(b) {
    let result = new Fraction();
    result.n = this.n.multiply(b.n)
    result.m = this.m.multiply(b.m)
    result.reduce()
    
    return result;
}

Fraction.prototype.div = function(b) {
    let result = new Fraction();
    result.n = this.n.multiply(b.m)
    result.m = this.m.multiply(b.n)

    if (result.m.isNegative()) {
        result.m = result.m.abs();
        result.n = result.n.multiply(bigInt(-1));
    }
    
    result.reduce()

    return result;
}

Fraction.prototype.add = function(b) {
    let nod = bigInt.gcd(this.m, b.m).abs();
    let nok = bigInt.lcm(this.m, b.m).abs();

    let result = new Fraction();

    result.n = this.n.multiply(nok).divide(this.m).plus(b.n.multiply(nok).divide(b.m));
    result.m = nok;
    result.reduce();

    return result;
}

Fraction.prototype.sub = function(b) {
    let nod = bigInt.gcd(this.m, b.m).abs();
    let nok = bigInt.lcm(this.m, b.m).abs();

    let result = new Fraction()
    result.n = this.n.multiply(nok).divide(this.m).minus(b.n.multiply(nok).divide(b.m));
    result.m = nok;
    result.reduce();

    return result;
}

Fraction.prototype.changeSign = function() {
    this.n = this.n.multiply(-1);
}

Fraction.prototype.isNeg = function() {
    return this.n.isNegative();
}

Fraction.prototype.isPos = function() {
    return this.n.isPositive();
}

Fraction.prototype.isZero = function() {
    return this.n.isZero()
}

Fraction.prototype.isOne = function() {
    return this.n.equals(bigInt.one) && this.m.equals(bigInt.one);
}

Fraction.prototype.isInf = function() {
    return this.m.isZero()
}

// дробь больше
Fraction.prototype.gt = function(b) {
    return this.sub(b).isPos();
}

// дробь меньше
Fraction.prototype.lt = function(b) {
    return this.sub(b).isNeg();
}

Fraction.prototype.eq = function(b) {
    return this.n.equals(b.n) && this.m.equals(b.m);
}

Fraction.prototype.abs = function() {
    let result = new Fraction();

    result.n = this.n;
    result.m = this.m;

    if (result.isNeg())
        result.changeSign();

    return result;
}

Fraction.prototype.neg = function() {
    let result = new Fraction();

    result.n = this.n;
    result.m = this.m;
    result.changeSign();

    return result;
}

Fraction.prototype.signStr = function() {
    let sign = '+ '
    if (this.isNeg())
        sign = '- '

    return sign + this.abs().toString()
}