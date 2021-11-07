function SectionSeddlePointSolver(functionBoxId, aBoxId, bBoxId, buttonId, solveBoxId) {
    this.functionBox = document.getElementById(functionBoxId)

    this.aBox = document.getElementById(aBoxId)
    this.bBox = document.getElementById(bBoxId)

    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

SectionSeddlePointSolver.prototype.ParseFunction = function() {
    let expression = this.functionBox.value.replace(/[\s*]/gi, '')
    let tokens = expression.match(/[-+]?((\d+\/\d+)|(\d+((\.|\,)\d+)?))?(x\^2|y\^2|xy|x|y)?/gi)

    if (tokens.join('') != expression)
        throw "Некорректное выражение..."

    let c = 0
    let x = 0
    let y = 0
    let xy = 0
    let xx = 0
    let yy = 0

    let parts = {
        'x': new Fraction('0'),
        'y': new Fraction('0'),
        'xy': new Fraction('0'),
        'x^2': new Fraction('0'),
        'y^2': new Fraction('0'),
        '': new Fraction('0'),
    }

    for (let token of tokens) {
        if (token == '')
            continue

        let part = ''

        for (let end of ['x^2', 'y^2', 'xy', 'x', 'y']) {
            if (token.endsWith(end)) {
                part = end
                break
            }
        }

        if (!parts[part].isZero())
            throw "Некорректное выражение"

        let value = token.substr(0, token.length - part.length)

        if (value == '+' && part == '')
            throw "Некорректное выражение"

        if (value == '' || value == '+')
            value = '1'
        else if (value == '-')
            value = '-1'

        parts[part] = new Fraction(value)
    }

    return parts
}

SectionSeddlePointSolver.prototype.JoinTokens = function(tokens) {
    let resultTokens = []

    tokens.sort((a, b) => b[1].length - a[1].length)

    for (let token of tokens) {
        let sign = ''
        let coef = token[0].abs()

        if (resultTokens.length == 0) {
            sign = token[0].isNeg() ? '-' : ''
        }
        else {
            sign = token[0].isPos() ? ' + ' : ' - '
        }

        if (coef.isOne() && token[1] != '')
            coef = ''

        resultTokens.push(`${sign}${coef}${token[1]}`.replace('^2', '<sup>2</sup>'))
    }

    return resultTokens.join('')
}

SectionSeddlePointSolver.prototype.PrintFunction = function(f) {
    let tokens = []

    for (let arg of ['x^2', 'x', 'xy', 'y', 'y^2', '']) {
        if (!(arg in f) || f[arg].isZero())
            continue

        tokens.push([f[arg], arg])
    }

    return this.JoinTokens(tokens)
}

SectionSeddlePointSolver.prototype.Plot = function(a, b, p, f_a_y, f_b_y) {
    let div = document.createElement('div')

    let x = []
    let y = []
    let y1 = []
    let y2 = []

    let xi = a
    let h = b.sub(a).div(new Fraction('100'))

    while (xi.lt(b.add(h))) {
        x.push(xi.print(2))
        let v1 = f_b_y[''].add(f_b_y['y'].mult(xi)).add(f_b_y['y^2'].mult(xi).mult(xi)).print(2)
        let v2 = f_a_y[''].add(f_a_y['y'].mult(xi)).add(f_a_y['y^2'].mult(xi).mult(xi)).print(2)

        if (xi.lt(p)) {
            y.push(v1)
        }
        else {
            y.push(v2)
        }

        y1.push(v1)
        y2.push(v2)

        xi = xi.add(h)
    }

    let data = { x: x, y: y, mode: 'lines', name: 'F(x(y), y)'};
    let data1 = { x: x, y: y1, mode: 'lines', name: `F(${a}, y)`};
    let data2 = { x: x, y: y2, mode: 'lines', name: `F(${b}, y)`};

    let layout = {
        width: 500,
        height: 400,
        margin: { l: 20, r: 20, b: 20, t: 20 },
        yaxis: {
            rangemode: 'tozero'
        }
    };

    Plotly.newPlot(div, [data1, data2, data], layout);

    return div
}

SectionSeddlePointSolver.prototype.Solve = function() {
    try {
        let f = this.ParseFunction()

        let a = new Fraction(this.aBox.value)
        let b = new Fraction(this.bBox.value)

        this.solveBox.innerHTML = `<h2>Решение</h2>`
        this.solveBox.innerHTML += `<p class='math'><b>Введённая функция</b>: ${this.PrintFunction(f)}</p>`
        this.solveBox.innerHTML += `<p class='math'><b>X = Y</b>: [${a}, ${b}]</p><br>`


        if (!f['x'].isZero() || !f['y'].isZero() || !f[''].isZero())
            throw "Сорян :)"

        let yx = f['xy'].div(f['y^2'].mult(new Fraction('-2')))

        let f_x_yx1 = f['x^2']
        let f_x_yx2 = yx.mult(f['xy'])
        let f_x_yx3 = f['y^2'].mult(yx).mult(yx)

        let f_x_yx = f_x_yx1.add(f_x_yx2).add(f_x_yx3)
        let f_x_yx_a = f_x_yx.mult(a).mult(a)
        let f_x_yx_b = f_x_yx.mult(b).mult(b)
        let v_down = f_x_yx_a.gt(f_x_yx_b) ? f_x_yx_a : f_x_yx_b
        let x0 = f_x_yx_a.gt(f_x_yx_b) ? a : b

        let f_a_y = { 'y^2': f['y^2'], 'y': f['xy'].mult(a), '': f['x^2'].mult(a).mult(a) }
        let f_b_y = { 'y^2': f['y^2'], 'y': f['xy'].mult(b), '': f['x^2'].mult(b).mult(b) }

        let pa = f_a_y['y'].div(f_a_y['y^2'].mult(new Fraction('-2')))
        let pb = f_b_y['y'].div(f_b_y['y^2'].mult(new Fraction('-2')))

        let p = f_a_y[''].sub(f_b_y['']).div(f_b_y['y'].sub(f_a_y['y']))
        let y0 = p
        let v_up = f_a_y[''].add(f_a_y['y'].mult(y0)).add(f_a_y['y^2'].mult(y0).mult(y0))

        if (pa.gt(p)) {
            y0 = pa
            v_up = f_a_y[''].add(f_a_y['y'].mult(pa)).add(f_a_y['y^2'].mult(pa).mult(pa))
        }
        else if (pb.lt(p)) {
            y0 = pb
            v_up = f_b_y[''].add(f_b_y['y'].mult(pb)).add(f_b_y['y^2'].mult(pb).mult(pb))
        }

        this.solveBox.innerHTML += `<p class='math'>v̲ = max<sub>x</sub> min<sub>y</sub> F(x, y)</p>`
        this.solveBox.innerHTML += `<p class='math'>y(x) = ${yx}x</p>`
        this.solveBox.innerHTML += `<p class='math'>v̲ = max F(x, y(x)) = ${this.JoinTokens([[f_x_yx1, 'x^2'], [f_x_yx2, 'x^2'], [f_x_yx3, 'x^2']])} = ${f_x_yx}x<sup>2</sup><br>`
        this.solveBox.innerHTML += `Максимум либо в ${a}, либо в ${b}:<br>`
        this.solveBox.innerHTML += `x = ${a}: ${f_x_yx_a}<br>`
        this.solveBox.innerHTML += `x = ${b}: ${f_x_yx_b}<br>`
        this.solveBox.innerHTML += `x⁰ = ${x0}, v̲ = ${v_down}</p><br>`
        
        this.solveBox.innerHTML += `<p class='math'>v̅ = min<sub>y</sub> max<sub>x</sub> F(x, y)</p>`
        this.solveBox.innerHTML += `<p class='math'>Max<sub>x</sub> либо в ${a}, либо в ${b}:</p>`
        this.solveBox.innerHTML += `<p class='math'>F(${a}, y) = ${this.PrintFunction(f_a_y)}</p>`
        this.solveBox.innerHTML += `<p class='math'>F(${b}, y) = ${this.PrintFunction(f_b_y)}</p>`
        this.solveBox.innerHTML += `<p class='math'>x(y) = { ${a}, y &ge; ${p}, иначе ${b} }</p>`
        this.solveBox.innerHTML += `<p class='math'>F(x(y), y) = { ${this.PrintFunction(f_a_y)}, y &ge; ${p}, иначе ${this.PrintFunction(f_b_y)} }</p>`
        this.solveBox.appendChild(this.Plot(a, b, p, f_a_y, f_b_y))
        this.solveBox.innerHTML += `<p class='math'>У параболы F(${a}, y) вершина находится в ${pa}</p>`
        this.solveBox.innerHTML += `<p class='math'>У параболы F(${b}, y) вершина находится в ${pb}</p>`
        this.solveBox.innerHTML += `y⁰ = ${y0}, v̅ = ${v_up}</p><br>`

        if (v_down.eq(v_up)) {
            this.solveBox.innerHTML += `<p class='math'>v̅ = v̲ = v → <b>имеется седловая точка</b>: (${x0}, ${y0})</p>`
        }
        else {
            this.solveBox.innerHTML += `<p class='math'>v̅ ≠ v̲ → <b>седловых точек нет</b></p>`
        }
    }
    catch (error) {
        alert(error)
    }
}