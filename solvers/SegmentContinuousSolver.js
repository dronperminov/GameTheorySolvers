function SegmentContinuousSolver(x1BoxId, y1BoxId, c1BoxId, x2BoxId, y2BoxId, c2BoxId, aBoxId, bBoxId, buttonId, solveBoxId) {
    this.x1Box = document.getElementById(x1BoxId)
    this.y1Box = document.getElementById(y1BoxId)
    this.c1Box = document.getElementById(c1BoxId)

    this.x2Box = document.getElementById(x2BoxId)
    this.y2Box = document.getElementById(y2BoxId)
    this.c2Box = document.getElementById(c2BoxId)

    this.aBox = document.getElementById(aBoxId)
    this.bBox = document.getElementById(bBoxId)

    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

SegmentContinuousSolver.prototype.ShowInputFunction = function() {
    let table = document.createElement('table')
    let tr = document.createElement('tr')
    let cell1 = document.createElement('td')
    let cell2 = document.createElement('td')

    cell1.innerHTML = 'f(x, y) = '

    let system = document.createElement('div')
    system.className = 'system'

    let eq1 = document.createElement('div')
    let eq2 = document.createElement('div')
    let eq3 = document.createElement('div')

    eq1.className = 'system-cell'
    eq2.className = 'system-cell'
    eq3.className = 'system-cell'

    eq1.innerHTML = `-(x ${this.x1.neg().signHtml()})<sup>2</sup> + y<sup>2</sup> ${this.y1.signHtml()}y ${this.c1.signHtml()}, x &le; y`
    eq2.innerHTML = '&nbsp;'
    eq3.innerHTML = `-(x ${this.x2.neg().signHtml()})<sup>2</sup> + y<sup>2</sup> ${this.y2.signHtml()}y ${this.c2.signHtml()}, x &ge; y`

    system.appendChild(eq1)
    system.appendChild(eq2)
    system.appendChild(eq3)

    cell2.appendChild(system)

    tr.appendChild(cell1)
    tr.appendChild(cell2)

    table.appendChild(tr)
    this.solveBox.appendChild(table)
}

SegmentContinuousSolver.prototype.ShowInputFunctionWord = function() {
    let f1 = `-(x${this.x1.neg().signStr()})^2+y^2${this.y1.signStr()}y${this.c1.signStr()}, x&le;y`.replace(/ /g, '')
    let f2 = `-(x${this.x2.neg().signStr()})^2+y^2${this.y2.signStr()}y${this.c2.signStr()}, x&ge;y`.replace(/ /g, '')

    this.solveBox.innerHTML += `f(x, y) = {█(${f1}@${f2})┤<br>`
}

SegmentContinuousSolver.prototype.F = function(x, y) {
    if (x.le(y)) {
        let dx = x.sub(this.x1)
        return dx.mult(dx).neg().add(y.mult(y)).add(this.y1.mult(y)).add(this.c1)
    }

    let dx = x.sub(this.x2)
    return dx.mult(dx).neg().add(y.mult(y)).add(this.y2.mult(y)).add(this.c2)
}

SegmentContinuousSolver.prototype.PlotFunction = function(a, b, n = 100) {
    let h = b.sub(a).div(new Fraction(`${n}`))
    let z = []

    let x = []
    let y = []

    for (let i = 0; i <= n; i++) {
        let p = a.add(h.mult(new Fraction(`${i}`)))
        x.push(p)
        y.push(p)
    }

    for (let i = 0; i <= n; i++) {
        z[i] = []

        for (let j = 0; j <= n; j++)
            z[i][j] = this.F(x[i], y[j]).toFloat()
    }

    let layout = {
        width: 500,
        height: 400,
        margin: { l: 20, r: 20, b: 20, t: 20 },
    };

    let data = { x: x.map((v) => v.toFloat()), y: y.map((v) => v.toFloat()), z: z, type: 'surface'}
    Plotly.newPlot('plot-fxy', [data], layout)
}

SegmentContinuousSolver.prototype.PlotFunctionX = function(a, b, y0, n = 100) {
    let h = b.sub(a).div(new Fraction(`${n}`))

    let x = []
    let y = []

    for (let i = 0; i <= n; i++) {
        x.push(a.add(h.mult(new Fraction(`${i}`))))
        y.push(this.F(x[i], y0))
    }

    let layout = {
        width: 600,
        height: 400,
        margin: { l: 20, r: 20, b: 20, t: 20 },
        showlegend: true
    };

    let data = { x: x.map((v) => v.toFloat()), y: y.map((v) => v.toFloat()), mode: 'lines', name: `F(x, y₀)`}
    Plotly.newPlot('plot-fx', [data], layout)
}

SegmentContinuousSolver.prototype.SolveWord = function(a, b) {
    this.solveBox.innerHTML += `<h2>Решение для Word</h2>`
    this.solveBox.innerHTML += `<b>Введённые данные:</b><br>`
    this.ShowInputFunctionWord()
    this.solveBox.innerHTML += `X=Y= [${a}, ${b}]<br><br>`
    this.solveBox.innerHTML += `F(x_1,y)=F(x_2,y),x_1&le;y&le;x_2<br><br>`

    let y = this.y1.sub(this.y2)
    let c = this.c1.sub(this.c2)

    this.solveBox.innerHTML += `-(x_1${this.x1.neg().signStr()})^2+y^2 ${this.y1.signStr()}y ${this.c1.signStr()}=-(x_2${this.x2.neg().signStr()})^2+y^2${this.y2.signStr()}y${this.c2.signStr()}<br>`
    this.solveBox.innerHTML += `(x_1${this.x1.neg().signStr()})^2-(x_2 ${this.x2.neg().signStr()})^2=${y}y${c.signStr()}<br><br>`

    let smin = a.sub(this.x1).square()
    let smax = b.sub(this.x1).square()
    let s_sign = new Fraction('1')

    let tmin = a.sub(this.x2).square()
    let tmax = b.sub(this.x2).square()
    let t_sign = new Fraction('1')

    if (tmin.gt(tmax)) {
        let tmp = tmin
        tmin = tmax
        tmax = tmp
        t_sign = t_sign.neg()
    }

    if (smin.gt(smax)) {
        let tmp = smin
        smin = smax
        smax = tmp
        s_sign = s_sign.neg()
    }

    this.solveBox.innerHTML += `Замена:<br>`
    this.solveBox.innerHTML += `s=(x_1${this.x1.neg().signStr()})^2, s\\in[${smin}, ${smax}], x_1=${this.x1}±\\sqrt(s)<br>`
    this.solveBox.innerHTML += `t=(x_2${this.x2.neg().signStr()})^2, t\\in[${tmin}, ${tmax}], x_2=${this.x2}±\\sqrt(t)<br>`
    this.solveBox.innerHTML += `s-t=${y}y${c.signStr()}<br><br>`

    let k1 = (new Fraction('1')).div(y)
    let k2 = c.neg().div(y)

    let ky = k1.mult(this.y1)
    let kc = k2.mult(this.y1).add(this.c1)

    this.solveBox.innerHTML += `ŷ=${k1} (s-t)${k2.signStr()}<br>`
    this.solveBox.innerHTML += `F(x,ŷ)→max<br>`
    this.solveBox.innerHTML += `F̅(s,t)=-s+(${k1} (s - t)${k2.signStr()})^2 ${ky.signStr()} (s-t)${kc.sub(this.c1).signStr()}${this.c1.signStr()}=-s+(${k1} (s-t)${k2.signStr()})^2 ${ky.signStr()} (s-t)${kc.signStr()} → max_(s, t)<br>`

    let f_st = []
    let s = [smin, smax]
    let t = [tmin, tmax]

    let f_max = null
    let s_max = smin
    let t_max = tmin

    this.solveBox.innerHTML += `<br>Проверяем граничные значения для переменных s и t:<br>`
    for (let si of s) {
        for (let ti of t) {
            let s_t = si.sub(ti)
            let f = si.neg().add(k1.mult(s_t).add(k2).square()).add(ky.mult(s_t)).add(kc)
            f_st.push(f)

            this.solveBox.innerHTML += `F̅(${si}, ${ti})=${f}<br>`

            if (f_max === null || f.gt(f_max)) {
                f_max = f
                s_max = si
                t_max = ti
            }
        }
    }

    let x1_1 = s_max.sqrt().add(this.x1)
    let x1_2 = s_max.sqrt().neg().add(this.x1)

    let x2_1 = t_max.sqrt().add(this.x2)
    let x2_2 = t_max.sqrt().neg().add(this.x2)

    let x1_norm = s_max.sqrt().mult(s_sign).add(this.x1)
    let x2_norm = t_max.sqrt().mult(t_sign).add(this.x2)
    let y0 = k1.mult(s_max.sub(t_max)).add(k2)

    let v = this.F(x1_norm, y0)

    this.solveBox.innerHTML += `<br>Максимальное значение F̅(s, t)=${f_max} достигается при s=${s_max} и t=${t_max}</b><br>`
    this.solveBox.innerHTML += `Подставляем замену:<br>`
    this.solveBox.innerHTML += `x_1=${this.x1}±\\sqrt(${s_max})={${x1_1}, ${x1_2}}=${x1_norm}<br>`
    this.solveBox.innerHTML += `x_2=${this.x2}±\\sqrt(${t_max})={${x2_1}, ${x2_2}}=${x2_norm}<br>`
    this.solveBox.innerHTML += `y_0=${y0}, v=${v}<br>`

    let c1 = this.c1.sub(a.sub(this.x1).square())
    let c2 = this.c2.sub(b.sub(this.x2).square())

    let one = new Fraction('1')
    let two = new Fraction('2')

    let k_p = this.y1.sub(this.y2)
    let k_cp = y0.mult(two).add(this.y2)

    let p = k_cp.neg().div(k_p)
    let q = one.sub(p)

    this.solveBox.innerHTML += `Φ(p, y)=p⋅F(${a}, y)+(1-p)⋅F(${b}, y)=p⋅(y^2 ${this.y1.signStr()}y${c1.signStr()})+(1-p)⋅(y^2 ${this.y2.signStr()}y${c2.signStr()})<br>`
    this.solveBox.innerHTML += `Φ^'_y (p, y_0)=0 → p⋅(2y_0 ${this.y1.signStr()})+(1-p)⋅(2y_0 ${this.y2.signStr()})=0<br>`
    this.solveBox.innerHTML += `${k_p} p${k_cp.signStr()}=0 → p=${p}<br>`
    this.solveBox.innerHTML += `pΦ_0 = ${p} I_0 +${q} I_1<br>`

    this.solveBox.innerHTML += `<br><b>Ответ:</b><br>`
    this.solveBox.innerHTML += `v=${v}<br>`
    this.solveBox.innerHTML += `y_0=${y0}<br>`
    this.solveBox.innerHTML += `pΦ_0=${p} I_0 +${q} I_1<br>`
}

SegmentContinuousSolver.prototype.Solve = function() {
    this.x1 = new Fraction(this.x1Box.value)
    this.y1 = new Fraction(this.y1Box.value)
    this.c1 = new Fraction(this.c1Box.value)

    this.x2 = new Fraction(this.x2Box.value)
    this.y2 = new Fraction(this.y2Box.value)
    this.c2 = new Fraction(this.c2Box.value)

    let a = new Fraction(this.aBox.value)
    let b = new Fraction(this.bBox.value)

    this.solveBox.innerHTML = `<h2>Решение</h2>`
    this.solveBox.innerHTML += `<b>Введённые данные:</b><br>`
    this.ShowInputFunction()
    this.solveBox.innerHTML += `X = Y = [${a.html()}, ${b.html()}]<br><br>`

    let plot = document.createElement('div')
    plot.id = 'plot-fxy'
    this.solveBox.appendChild(plot)

    this.solveBox.innerHTML += `F(x<sub>1</sub>, y) = F(x<sub>2</sub>, y), x<sub>1</sub> &le; y &le; x<sub>2</sub><br><br>`

    let y = this.y1.sub(this.y2)
    let c = this.c1.sub(this.c2)

    this.solveBox.innerHTML += `-(x<sub>1</sub> ${this.x1.neg().signHtml()})<sup>2</sup> + y<sup>2</sup> ${this.y1.signHtml()}y ${this.c1.signHtml()} = -(x<sub>2</sub> ${this.x2.neg().signHtml()})<sup>2</sup> + y<sup>2</sup> ${this.y2.signHtml()}y ${this.c2.signHtml()}<br>`
    this.solveBox.innerHTML += `(x<sub>1</sub> ${this.x1.neg().signHtml()})<sup>2</sup> - (x<sub>2</sub> ${this.x2.neg().signHtml()})<sup>2</sup> = ${y.html()}y ${c.signHtml()}<br><br>`

    let smin = a.sub(this.x1).square()
    let smax = b.sub(this.x1).square()
    let s_sign = new Fraction('1')

    let tmin = a.sub(this.x2).square()
    let tmax = b.sub(this.x2).square()
    let t_sign = new Fraction('1')

    if (tmin.gt(tmax)) {
        let tmp = tmin
        tmin = tmax
        tmax = tmp
        t_sign = t_sign.neg()
    }

    if (smin.gt(smax)) {
        let tmp = smin
        smin = smax
        smax = tmp
        s_sign = s_sign.neg()
    }

    this.solveBox.innerHTML += `<b>Замена</b>:<br>`
    this.solveBox.innerHTML += `s = (x<sub>1</sub> ${this.x1.neg().signHtml()})<sup>2</sup>, s ∊ [${smin.html()}, ${smax.html()}], x<sub>1</sub> = ${this.x1.html()} ± sqrt(s)<br>`
    this.solveBox.innerHTML += `t = (x<sub>2</sub> ${this.x2.neg().signHtml()})<sup>2</sup>, t ∊ [${tmin.html()}, ${tmax.html()}], x<sub>2</sub> = ${this.x2.html()} ± sqrt(t)<br>`
    this.solveBox.innerHTML += `s - t = ${y.html()}y ${c.signHtml()}<br><br>`

    let k1 = (new Fraction('1')).div(y)
    let k2 = c.neg().div(y)

    let ky = k1.mult(this.y1)
    let kc = k2.mult(this.y1).add(this.c1)

    this.solveBox.innerHTML += `ŷ = ${k1.html()}(s - t) ${k2.signHtml()}<br>`
    this.solveBox.innerHTML += `F(x, ŷ) → max<br>`
    this.solveBox.innerHTML += `F̅(s, t) = -s + (${k1.html()}(s - t) ${k2.signHtml()})<sup>2</sup> ${ky.signHtml()}(s - t) ${kc.sub(this.c1).signHtml()} ${this.c1.signHtml()} = -s + (${k1.html()}(s - t) ${k2.signHtml()})<sup>2</sup> ${ky.signHtml()}(s - t) ${kc.signHtml()} → max<sub>s, t</sub><br>`

    let f_st = []
    let s = [smin, smax]
    let t = [tmin, tmax]

    let f_max = null
    let s_max = smin
    let t_max = tmin

    this.solveBox.innerHTML += `<br><b>Проверяем граничные значения для переменных s и t:</b><br>`
    for (let si of s) {
        for (let ti of t) {
            let s_t = si.sub(ti)
            let f = si.neg().add(k1.mult(s_t).add(k2).square()).add(ky.mult(s_t)).add(kc)
            f_st.push(f)

            this.solveBox.innerHTML += `F̅(${si.html()}, ${ti.html()}) = ${f.html()}<br>`

            if (f_max === null || f.gt(f_max)) {
                f_max = f
                s_max = si
                t_max = ti
            }
        }
    }

    let x1_1 = s_max.sqrt().add(this.x1)
    let x1_2 = s_max.sqrt().neg().add(this.x1)

    let x2_1 = t_max.sqrt().add(this.x2)
    let x2_2 = t_max.sqrt().neg().add(this.x2)

    let x1_norm = s_max.sqrt().mult(s_sign).add(this.x1)
    let x2_norm = t_max.sqrt().mult(t_sign).add(this.x2)
    let y0 = k1.mult(s_max.sub(t_max)).add(k2)

    let v = this.F(x1_norm, y0)

    this.solveBox.innerHTML += `<br>Максимальное значение F̅(s, t) = ${f_max.html()} достигается при s = ${s_max.html()} и t = ${t_max.html()}</b><br>`
    this.solveBox.innerHTML += `<b>Подставляем замену</b>:<br>`
    this.solveBox.innerHTML += `x<sub>1</sub> = ${this.x1.html()} ± sqrt(${s_max.html()}) = {${x1_1.html()}, ${x1_2.html()}} = ${x1_norm.html()}<br>`
    this.solveBox.innerHTML += `x<sub>2</sub> = ${this.x2.html()} ± sqrt(${t_max.html()}) = {${x2_1.html()}, ${x2_2.html()}} = ${x2_norm.html()}<br>`
    this.solveBox.innerHTML += `<b>y<sub>0</sub> = ${y0.html()}</b>, <b>v = ${v.html()}<br>`

    let plotFx = document.createElement('div')
    plotFx.id = 'plot-fx'
    this.solveBox.appendChild(plotFx)

    let c1 = this.c1.sub(a.sub(this.x1).square())
    let c2 = this.c2.sub(b.sub(this.x2).square())

    let one = new Fraction('1')
    let two = new Fraction('2')

    let k_p = this.y1.sub(this.y2)
    let k_cp = y0.mult(two).add(this.y2)

    let p = k_cp.neg().div(k_p)
    let q = one.sub(p)

    this.solveBox.innerHTML += `Φ(p, y) = p⋅F(${a.html()}, y) + (1 - p)⋅F(${b.html()}, y) = p⋅(y<sup>2</sup> ${this.y1.signHtml()}y ${c1.signHtml()}) + (1 - p)⋅(y<sup>2</sup> ${this.y2.signHtml()}y ${c2.signHtml()})<br>`
    this.solveBox.innerHTML += `Φ'<sub>y</sub>(p, y<sub>0</sub>) = 0 → p⋅(2y<sub>0</sub> ${this.y1.signHtml()}) + (1 - p)⋅(2y<sub>0</sub> ${this.y2.signHtml()}) = 0<br>`
    this.solveBox.innerHTML += `${k_p.html()}p ${k_cp.signHtml()} = 0 → <b>p = ${p.html()}</b><br>`
    this.solveBox.innerHTML += `<b>pΦ<sub>0</sub> = ${p.html()}I<sub>0</sub> + ${q.html()}I<sub>1</sub></b><br>`

    this.solveBox.innerHTML += `<br><b>Ответ:</b><br>`
    this.solveBox.innerHTML += `<b>v = ${v.html()}</b><br>`
    this.solveBox.innerHTML += `<b>y<sub>0</sub> = ${y0.html()}</b><br>`
    this.solveBox.innerHTML += `<b>pΦ<sub>0</sub> = ${p.html()}I<sub>0</sub> + ${q.html()}I<sub>1</sub></b><br>`

    this.SolveWord(a, b)
    this.PlotFunction(a, b)
    this.PlotFunctionX(a, b, y0)
}