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

    eq1.innerHTML = `-(x ${this.x1.neg().signStr()})<sup>2</sup> + y<sup>2</sup> ${this.y1.signStr()}y ${this.c1.signStr()}, x &le; y`
    eq2.innerHTML = '&nbsp;'
    eq3.innerHTML = `-(x ${this.x2.neg().signStr()})<sup>2</sup> + y<sup>2</sup> ${this.y2.signStr()}y ${this.c2.signStr()}, x &ge; y`

    system.appendChild(eq1)
    system.appendChild(eq2)
    system.appendChild(eq3)

    cell2.appendChild(system)

    tr.appendChild(cell1)
    tr.appendChild(cell2)

    table.appendChild(tr)
    this.solveBox.appendChild(table)
}

SegmentContinuousSolver.prototype.F = function(x, y) {
    if (x.le(y)) {
        let dx = x.sub(this.x1)
        return dx.mult(dx).neg().add(y.mult(y)).add(this.y1.mult(y)).add(this.c1)
    }

    let dx = x.sub(this.x2)
    return dx.mult(dx).neg().add(y.mult(y)).add(this.y2.mult(y)).add(this.c2)
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
    this.solveBox.innerHTML += `X = Y = [${a}, ${b}]<br><br>`

    this.solveBox.innerHTML += `F(x<sub>1</sub>, y) = F(x<sub>2</sub>, y), x<sub>1</sub> &le; y &le; x<sub>2</sub><br><br>`

    let y = this.y1.sub(this.y2)
    let c = this.c1.sub(this.c2)

    this.solveBox.innerHTML += `-(x<sub>1</sub> ${this.x1.neg().signStr()})<sup>2</sup> + y<sup>2</sup> ${this.y1.signStr()}y ${this.c1.signStr()} = -(x<sub>2</sub> ${this.x2.neg().signStr()})<sup>2</sup> + y<sup>2</sup> ${this.y2.signStr()}y ${this.c2.signStr()}<br>`
    this.solveBox.innerHTML += `(x<sub>1</sub> ${this.x1.neg().signStr()})<sup>2</sup> - (x<sub>2</sub> ${this.x2.neg().signStr()})<sup>2</sup> = ${y}y ${c.signStr()}<br><br>`

    let smin = a.sub(this.x1).square()
    let smax = b.sub(this.x1).square()

    let tmin = a.sub(this.x2).square()
    let tmax = b.sub(this.x2).square()

    if (tmin.gt(tmax)) {
        let tmp = tmin
        tmin = tmax
        tmax = tmp
    }

    if (smin.gt(smax)) {
        let tmp = smin
        smin = smax
        smax = tmp
    }

    this.solveBox.innerHTML += `<b>Замена</b>:<br>`
    this.solveBox.innerHTML += `s = (x<sub>1</sub> ${this.x1.neg().signStr()})<sup>2</sup>, s ∊ [${smin}, ${smax}]<br>`
    this.solveBox.innerHTML += `t = (x<sub>2</sub> ${this.x2.neg().signStr()})<sup>2</sup>, t ∊ [${tmin}, ${tmax}]<br>`
    this.solveBox.innerHTML += `s - t = ${y}y ${c.signStr()}<br><br>`

    let k1 = (new Fraction('1')).div(y)
    let k2 = c.neg().div(y)

    let ky = k1.mult(this.y1)
    let kc = k2.add(this.c1)

    this.solveBox.innerHTML += `ŷ = ${k1}(s - t) ${k2.signStr()}<br>`
    this.solveBox.innerHTML += `F(x, ŷ) → max<br>`
    this.solveBox.innerHTML += `F̅(s, t) = -s + (${k1}(s - t) ${k2.signStr()})<sup>2</sup> ${ky.signStr()}(s - t) ${k2.signStr()} ${this.c1.signStr()} = -s + (${k1}(s - t) ${k2.signStr()})<sup>2</sup> ${ky.signStr()}(s - t) ${kc.signStr()} → max<sub>s, t</sub><br>`

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

            this.solveBox.innerHTML += `F̅(${si}, ${ti}) = ${f}<br>`

            if (f_max === null || f.gt(f_max)) {
                f_max = f
                s_max = si
                t_max = ti
            }
        }
    }

    let x1 = s_max.sqrt().add(this.x1)
    let x2 = t_max.sqrt().add(this.x2)

    let x1_norm = x1.max(a).min(b)
    let x2_norm = x2.max(a).min(b)
    let y0 = k1.mult(s_max.sub(t_max)).add(k2)

    let v = this.F(x1_norm, y0)

    this.solveBox.innerHTML += `<br>Максимальное значение F̅(s, t) = ${f_max} достигается при s = ${s_max} и t = ${t_max}</b><br>`
    this.solveBox.innerHTML += `<b>Подставляем замену</b>: x<sub>1</sub> = max(${a}, min(${b}, ${x1})) = ${x1_norm}, x<sub>2</sub> = max(${a}, min(${b}, ${x2})) = ${x2_norm}, <b>y<sub>0</sub> = ${y0}</b>, <b>v = ${v}<br>`

    let c1 = this.c1.sub(a.sub(this.x1).square())
    let c2 = this.c2.sub(b.sub(this.x2).square())

    let one = new Fraction('1')
    let two = new Fraction('2')

    let k_p = this.y1.sub(this.y2)
    let k_cp = y0.mult(two).add(this.y2)

    let p = k_cp.neg().div(k_p)
    let q = one.sub(p)

    this.solveBox.innerHTML += `Φ(p, y) = p⋅F(${a}, y) + (1 - p)⋅F(${b}, y) = p⋅(y<sup>2</sup> ${this.y1.signStr()}y ${c1.signStr()}) + (1 - p)⋅(y<sup>2</sup> ${this.y2.signStr()}y ${c2.signStr()})<br>`
    this.solveBox.innerHTML += `Φ'<sub>y</sub>(p, y<sub>0</sub>) = 0 → p⋅(2y<sub>0</sub> ${this.y1.signStr()}) + (1 - p)⋅(2y<sub>0</sub> ${this.y2.signStr()}) = 0<br>`
    this.solveBox.innerHTML += `${k_p}p ${k_cp.signStr()} = 0 → <b>p = ${p}</b><br>`
    this.solveBox.innerHTML += `<b>pΦ<sub>0</sub> = ${p}I<sub>0</sub> + ${q}I<sub>1</sub></b><br>`

    this.solveBox.innerHTML += `<br><b>Ответ:</b><br>`
    this.solveBox.innerHTML += `<b>v = ${v}</b><br>`
    this.solveBox.innerHTML += `<b>y<sub>0</sub> = ${y0}</b><br>`
    this.solveBox.innerHTML += `<b>pΦ<sub>0</sub> = ${p}I<sub>0</sub> + ${q}I<sub>1</sub></b><br>`
}