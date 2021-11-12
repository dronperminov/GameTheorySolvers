function SectionSaddlePointSolver(functionBoxId, aBoxId, bBoxId, buttonId, solveBoxId) {
    this.functionBox = document.getElementById(functionBoxId)

    this.aBox = document.getElementById(aBoxId)
    this.bBox = document.getElementById(bBoxId)

    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

SectionSaddlePointSolver.prototype.ParseFunction = function() {
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

SectionSaddlePointSolver.prototype.JoinTokens = function(tokens) {
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
        else
            coef = coef.html()

        resultTokens.push(`${sign}${coef}${token[1]}`.replace('^2', '<sup>2</sup>'))
    }

    return resultTokens.join('')
}

SectionSaddlePointSolver.prototype.PrintFunction = function(f) {
    let tokens = []

    for (let arg of ['x^2', 'x', 'xy', 'y', 'y^2', '']) {
        if (!(arg in f) || f[arg].isZero())
            continue

        tokens.push([f[arg], arg])
    }

    return this.JoinTokens(tokens)
}

SectionSaddlePointSolver.prototype.Plot = function(a, b, p, f_a_y, f_b_y) {
    let div = document.createElement('div')
    div.id = 'plot'

    let x = []
    let y = []
    let y1 = []
    let y2 = []

    let xi = a
    let h = new Fraction('1/1000')

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

    this.solveBox.appendChild(div)
    return { data: [data1, data2, data], layout: layout }
}

SectionSaddlePointSolver.prototype.SolveXX_XY_YY = function(f, a, b) {
    let yx = f['xy'].div(f['y^2'].mult(new Fraction('-2')))

    let f_x_yx1 = f['x^2']
    let f_x_yx2 = yx.mult(f['xy'])
    let f_x_yx3 = f['y^2'].mult(yx).mult(yx)

    let f_x_yx = f_x_yx1.add(f_x_yx2).add(f_x_yx3)
    let f_x_yx_a = f_x_yx.mult(a).mult(a)
    let f_x_yx_b = f_x_yx.mult(b).mult(b)
    let v_down = f_x_yx_a.gt(f_x_yx_b) ? f_x_yx_a : f_x_yx_b
    let x0 = f_x_yx_a.gt(f_x_yx_b) ? a : b

    this.solveBox.innerHTML += `<span class='math'>v̲ = max<sub>x</sub> min<sub>y</sub> F(x, y)</p>`
    this.solveBox.innerHTML += `<span class='math'>F(x, y) → min<sub>y</sub>: ${this.JoinTokens([[f['xy'], 'x'], [f['y^2'].mult(new Fraction('2')), 'y']])} = 0 → <b>y(x) = ${yx.html()}x</b> ∈ Y</p>`
    this.solveBox.innerHTML += `<span class='math'>F(x, y(x)) = ${this.JoinTokens([[f_x_yx1, 'x^2'], [f_x_yx2, 'x^2'], [f_x_yx3, 'x^2']])} = ${f_x_yx.html()}x<sup>2</sup> → max<br>`
    this.solveBox.innerHTML += `Максимум либо в ${a.html()}, либо в ${b.html()}:<br>`
    this.solveBox.innerHTML += `x = ${a.html()}: ${f_x_yx_a.html()}<br>`
    this.solveBox.innerHTML += `x = ${b.html()}: ${f_x_yx_b.html()}<br>`
    this.solveBox.innerHTML += `<b>x⁰ = ${x0.html()}, v̲ = ${v_down.html()}</b></p><br>`

    let f_a_y = { 'y^2': f['y^2'], 'y': f['xy'].mult(a), '': f['x^2'].mult(a).mult(a) }
    let f_b_y = { 'y^2': f['y^2'], 'y': f['xy'].mult(b), '': f['x^2'].mult(b).mult(b) }

    let pa = f_a_y['y'].div(f_a_y['y^2'].mult(new Fraction('-2')))
    let pb = f_b_y['y'].div(f_b_y['y^2'].mult(new Fraction('-2')))

    let p = f_a_y[''].sub(f_b_y['']).div(f_b_y['y'].sub(f_a_y['y']))
    let y0 = p
    let v_up = f_a_y[''].add(f_a_y['y'].mult(y0)).add(f_a_y['y^2'].mult(y0).mult(y0))

    this.solveBox.innerHTML += `<span class='math'>v̅ = min<sub>y</sub> max<sub>x</sub> F(x, y)</p>`
    this.solveBox.innerHTML += `<span class='math'>Max<sub>x</sub> либо в ${a.html()}, либо в ${b.html()}:</p>`
    this.solveBox.innerHTML += `<span class='math'>F(${a.html()}, y) = ${this.PrintFunction(f_a_y)}</p>`
    this.solveBox.innerHTML += `<span class='math'>F(${b.html()}, y) = ${this.PrintFunction(f_b_y)}</p>`
    this.solveBox.innerHTML += `<span class='math'>x(y) = { ${a.html()}, y &ge; ${p.html()}, иначе ${b.html()} }</p>`
    this.solveBox.innerHTML += `<span class='math'>F(x(y), y) = { ${this.PrintFunction(f_a_y)}, y &ge; ${p.html()}, иначе ${this.PrintFunction(f_b_y)} }</p>`
    let plot = this.Plot(a, b, p, f_a_y, f_b_y)
    this.solveBox.innerHTML += `<span class='math'>У параболы F(${a.html()}, y) вершина находится в ${pa.html()}</p>`
    this.solveBox.innerHTML += `<span class='math'>У параболы F(${b.html()}, y) вершина находится в ${pb.html()}</p>`
    if (pa.gt(p)) {
        y0 = pa
        v_up = f_a_y[''].add(f_a_y['y'].mult(pa)).add(f_a_y['y^2'].mult(pa).mult(pa))
        this.solveBox.innerHTML += `<span class='math'>Точка ${pa.html()} > ${p.html()}</p>`
    }
    else if (pb.lt(p)) {
        y0 = pb
        v_up = f_b_y[''].add(f_b_y['y'].mult(pb)).add(f_b_y['y^2'].mult(pb).mult(pb))
        this.solveBox.innerHTML += `<span class='math'>Точка ${pb.html()} < ${p.html()}</p>`
    }

    this.solveBox.innerHTML += `<b>y⁰ = ${y0.html()}, v̅ = ${v_up.html()}</b></p><br>`

    if (v_down.eq(v_up)) {
        this.solveBox.innerHTML += `<span class='math'>v̅ = v̲ = v → <b>имеется седловая точка</b>: (${x0.html()}, ${y0.html()})</p>`
    }
    else {
        this.solveBox.innerHTML += `<span class='math'>v̅ ≠ v̲ → <b>седловых точек нет</b></p>`
    }

    Plotly.newPlot('plot', plot.data, plot.layout);
}

SectionSaddlePointSolver.prototype.EvaluateF = function(f, x0, y0) {
    let xx = f['x^2'].mult(x0).mult(x0)
    let yy = f['y^2'].mult(y0).mult(y0)
    let xy = f['xy'].mult(x0).mult(y0)
    let x = f['x'].mult(x0)
    let y = f['y'].mult(y0)

    return xx.add(yy).add(xy).add(x).add(y).add(f[''])
}

SectionSaddlePointSolver.prototype.SolveCommon = function(f, a, b) {
    let dx = {
        'x^2': new Fraction('0'),
        'y^2': new Fraction('0'),
        'xy': new Fraction('0'),
        'x': f['x^2'].mult(new Fraction('2')),
        'y': f['xy'],
        '': f['x']
    }

    let dy = {
        'x^2': new Fraction('0'),
        'y^2': new Fraction('0'),
        'xy': new Fraction('0'),
        'x': f['xy'],
        'y': f['y^2'].mult(new Fraction('2')),
        '': f['y']
    }

    let xy = {
        'x^2': new Fraction('0'),
        'y^2': new Fraction('0'),
        'xy': new Fraction('0'),
        'x': new Fraction('0'),
        'y': dx['y'].neg().div(dx['x']),
        '': dx[''].neg().div(dx['x']) 
    }

    let yx = {
        'x^2': new Fraction('0'),
        'y^2': new Fraction('0'),
        'xy': new Fraction('0'),
        'x': dy['x'].neg().div(dy['y']),
        'y': new Fraction('0'),
        '': dy[''].neg().div(dy['y']) 
    }

    let f_xy_y = {
        'x^2': new Fraction('0'),
        'y^2': f['x^2'].mult(xy['y']).mult(xy['y']).add(f['y^2']).add(f['xy'].mult(xy['y'])),
        'xy': new Fraction('0'),
        'x': new Fraction('0'),
        'y': f['x^2'].mult(xy['y']).mult(xy['']).mult(new Fraction('2')).add(f['xy'].mult(xy[''])).add(f['x'].mult(xy['y'])).add(f['y']),
        '': f['x^2'].mult(xy['']).mult(xy['']).add(f['x'].mult(xy[''])).add(f['']),
    }

    let f_x_yx = {
        'y^2': new Fraction('0'),
        'x^2': f['y^2'].mult(yx['x']).mult(yx['x']).add(f['x^2']).add(f['xy'].mult(yx['x'])),
        'xy': new Fraction('0'),
        'y': new Fraction('0'),
        'x': f['y^2'].mult(yx['x']).mult(yx['']).mult(new Fraction('2')).add(f['xy'].mult(yx[''])).add(f['y'].mult(yx['x'])).add(f['x']),
        '': f['y^2'].mult(yx['']).mult(yx['']).add(f['y'].mult(yx[''])).add(f['']),
    }

    this.solveBox.innerHTML += `<span class='math'>max<sub>x</sub> F(x, y): ${this.PrintFunction(dx)} = 0 → x(y) = ${this.PrintFunction(xy)}</p>`
    this.solveBox.innerHTML += `<span class='math'>min<sub>y</sub> F(x(y), y): ${this.PrintFunction(f_xy_y)} → min</p>`

    let y0

    if (f_xy_y['y^2'].isPos()) {
        y0 = f_xy_y['y'].div(f_xy_y['y^2'].mult(new Fraction('-2')))
        this.solveBox.innerHTML += `<span class='math'>Минимум лежит на вершине параболы: </p>`
    }
    else {
        let fa = this.EvaluateF(f_xy_y, new Fraction('0'), a)
        let fb = this.EvaluateF(f_xy_y, new Fraction('0'), b)
        y0 = fa.lt(fb) ? a : b
        this.solveBox.innerHTML += `<span class='math'>Минимум лежит на границе (но это не точно): F(x(y), ${a.html()}) = ${fa.html()}, F(x(y), ${b.html()}) = ${fb.html()}</p>`
    }

    let v_up = this.EvaluateF(f_xy_y, new Fraction('0'), y0)

    this.solveBox.innerHTML += `<span class='math'><b>y⁰ = ${y0.html()}, v̅ = ${v_up.html()}</b></p><br>`

    this.solveBox.innerHTML += `<span class='math'>min<sub>y</sub> F(x, y): ${this.PrintFunction(dy)} = 0 → y(x) = ${this.PrintFunction(yx)}</p>`
    this.solveBox.innerHTML += `<span class='math'>max<sub>x</sub> F(x, y(x)): ${this.PrintFunction(f_x_yx)} → max</p>`

    let x0

    if (f_x_yx['x^2'].isNeg()) {
        x0 = f_x_yx['x'].div(f_x_yx['x^2'].mult(new Fraction('-2')))
        this.solveBox.innerHTML += `<span class='math'>Максимум лежит на вершине параболы: </p>`
    }
    else {
        let fa = this.EvaluateF(f_x_yx, a, new Fraction('0'))
        let fb = this.EvaluateF(f_x_yx, b, new Fraction('0'))
        x0 = fa.gt(fb) ? a : b
        this.solveBox.innerHTML += `<span class='math'>Максимум лежит на границе (но это не точно): F(${a.html()}, y(x)) = ${fa.html()}, F(${b.html()}, y(x)) = ${fb.html()}</p>`
    }

    let v_down = this.EvaluateF(f_x_yx, x0, new Fraction('0'))
    this.solveBox.innerHTML += `<span class='math'><b>x⁰ = ${x0.html()}, v̲ = ${v_down.html()}</b></p><br>`

    if (v_down.eq(v_up)) {
        this.solveBox.innerHTML += `<span class='math'>v̅ = v̲ = v → <b>имеется седловая точка</b>: (${x0.html()}, ${y0.html()})</p>`
    }
    else {
        this.solveBox.innerHTML += `<span class='math'>v̅ ≠ v̲ → <b>седловых точек нет</b></p>`
    }
}

SectionSaddlePointSolver.prototype.Solve = function() {
    try {
        let f = this.ParseFunction()

        let a = new Fraction(this.aBox.value)
        let b = new Fraction(this.bBox.value)

        this.solveBox.innerHTML = `<h2>Решение</h2>`
        this.solveBox.innerHTML += `<span class='math'><b>Введённая функция</b>: ${this.PrintFunction(f)}</p>`
        this.solveBox.innerHTML += `<span class='math'><b>X = Y</b>: [${a.html()}, ${b.html()}]</p><br>`

        if (!f['x'].isZero() || !f['y'].isZero() || !f[''].isZero() || f['x^2'].isNeg() || f['y^2'].isNeg()) {
            this.SolveCommon(f, a, b)
        }
        else {
            this.SolveXX_XY_YY(f, a, b)
        }
    }
    catch (error) {
        alert(error)
    }
}