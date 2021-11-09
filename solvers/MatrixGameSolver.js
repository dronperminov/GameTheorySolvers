function MatrixGameSolver(matrixBoxId, buttonId, solveBoxId) {
    this.matrixBox = document.getElementById(matrixBoxId)
    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

MatrixGameSolver.prototype.ParseMatrix = function() {
    let content = this.matrixBox.value
    let rows = content.split('\n')

    if (rows.length < 1)
        throw "Матрица не введена"

    let matrix = []
    let columns = -1

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i].trim().split(/\s+/)

        if (i == 0) {
            columns = row.length
        }
        else if (row.length != columns) {
            throw `Некорректное количество столбцов в строке ${i + 1}. Ожидалось ${columns}, а получено ${row.length}`
        }

        matrix.push([])

        for (let j = 0; j < columns; j++) {
            let value

            try {
                value = new Fraction(row[j])
            }
            catch (error) {
                throw `Некорректное значение в строке ${i + 1}: ${row[j]} (столбец ${j + 1})`
            }

            matrix[i].push(value)
        }
    }

    return matrix
}

MatrixGameSolver.prototype.MakeMatrixTable = function(matrix, rows = null, columns = null) {
    let table = document.createElement('div')
    table.className = 'matrix'

    for (let i = 0; i < matrix.length; i++) {
        let row = document.createElement('div')

        for (let j = 0; j < matrix[i].length; j++) {
            let cell = document.createElement('div')
            cell.className = 'matrix-cell'
            cell.innerHTML = matrix[i][j]

            if (rows && rows.indexOf(i) == -1)
                cell.classList.add('removed-row')

            if (columns && columns.indexOf(j) == -1)
                cell.classList.add('removed-column')

            row.appendChild(cell)
        }

        table.appendChild(row)
    }
    return table
}

MatrixGameSolver.prototype.IsAllNonNegative = function(array) {
    for (let i = 0; i < array.length; i++)
        if (array[i].isNeg())
            return false

    return true
}

MatrixGameSolver.prototype.GenerateSequences = function(i, n, m, current, sequences, sum, one) {
    if (sum.gt(one))
        return

    if (i < n) {
        for (let j = 0; j <= m; j++) {
            current[i] = new Fraction(`${j}/${m}`)
            this.GenerateSequences(i + 1, n, m, current, sequences, sum.add(current[i]), one)
        }
    }
    else if (sum.eq(one)) {
        sequences.push(current.map((v) => v))
    }
}

MatrixGameSolver.prototype.GenerateAllSequences = function(size, nmax) {
    let sequences = []
    let zero = new Fraction('0')
    let one = new Fraction('1')

    for (let n = 1; n <= nmax; n++) {
        this.GenerateSequences(0, size, n, [], sequences, zero, one)
    }

    return sequences
}

MatrixGameSolver.prototype.GetOneHotIndex = function(sequence) {
    let one = new Fraction('1')
    let zero = new Fraction('0')

    for (let i = 0; i < sequence.length; i++)
        if (sequence[i].eq(one))
            return i

    return -1
}

MatrixGameSolver.prototype.RemoveDominantRowByCombination = function(matrix, sequences, rows, columns, row) {
    let p = []
    let indexes = []

    for (let i = 0; i < rows.length; i++)
        if (rows[i] != rows[row])
            indexes.push(rows[i])

    for (let sequence of sequences) {
        let values = []

        for (let j = 0; j < columns.length; j++) {
            values[j] = matrix[rows[row]][columns[j]].neg()

            for (let i = 0; i < indexes.length; i++) {
                values[j] = values[j].add(matrix[indexes[i]][columns[j]].mult(sequence[i]))
            }
        }

        if (this.IsAllNonNegative(values)) {
            let index = this.GetOneHotIndex(sequence)

            if (index > -1) {
                this.solveBox.innerHTML += `<p><b>Строка ${rows[row] + 1} доминируется строкой ${indexes[index] + 1}, удаляем её:</b></p>`
            }
            else {
                this.solveBox.innerHTML += `<p><b>Строка ${rows[row] + 1} доминируется выпуклой комбинацией строк {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.toString()).join(', ')}}, удаляем её:</b></p>`
            }

            rows.splice(row, 1)
            this.solveBox.appendChild(this.MakeMatrixTable(matrix, rows, columns))
            return true
        }
    }

    return false
}

MatrixGameSolver.prototype.RemoveDominantColumnByCombination = function(matrix, sequences, rows, columns, column) {
    let p = []
    let indexes = []

    for (let i = 0; i < columns.length; i++)
        if (columns[i] != columns[column])
            indexes.push(columns[i])

    for (let sequence of sequences) {
        let values = []

        for (let i = 0; i < rows.length; i++) {
            values[i] = matrix[rows[i]][columns[column]]

            for (let j = 0; j < indexes.length; j++) {
                values[i] = values[i].sub(matrix[rows[i]][indexes[j]].mult(sequence[j]))
            }
        }

        if (this.IsAllNonNegative(values)) {
            let index = this.GetOneHotIndex(sequence)

            if (index > -1) {
                this.solveBox.innerHTML += `<p><b>Столбец ${columns[column] + 1} доминирует столбец ${indexes[index] + 1}, удаляем его:</b></p>`
            }
            else {
                this.solveBox.innerHTML += `<p><b>Столбец ${columns[column] + 1} доминирует выпуклую комбинацию столбцов {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.toString()).join(', ')}}, удаляем его:</b></p>`
            }
            columns.splice(column, 1)
            this.solveBox.appendChild(this.MakeMatrixTable(matrix, rows, columns))
            return true
        }
    }

    return false
}

MatrixGameSolver.prototype.RemoveDominant = function(matrix) {
    let nmax = 5
    let rows = []
    let columns = []

    for (let i = 0; i < matrix.length; i++)
        rows.push(i)

    for (let i = 0; i < matrix[0].length; i++)
        columns.push(i)

    let haveDominant = true

    while (haveDominant && rows.length > 1 && columns.length > 1) {
        haveDominant = false
        let sequences = this.GenerateAllSequences(rows.length - 1, nmax)

        for (let i = rows.length - 1; i >= 0; i--) {
            if (this.RemoveDominantRowByCombination(matrix, sequences, rows, columns, i)) {
                sequences = this.GenerateAllSequences(rows.length - 1, nmax)
                haveDominant = true
            }
        }

        sequences = this.GenerateAllSequences(columns.length - 1, nmax)

        for (let i = columns.length - 1; i >= 0; i--) {
            if (this.RemoveDominantColumnByCombination(matrix, sequences, rows, columns, i)) {
                sequences = this.GenerateAllSequences(columns.length - 1, nmax)
                haveDominant = true
            }
        }
    }

    return { rows: rows, columns: columns }
}

MatrixGameSolver.prototype.MakeSystem = function(rows) {
    let div = document.createElement('div')
    div.className = 'system'

    for (let row of rows) {
        let cell = document.createElement('div')
        cell.className = 'system-cell'
        cell.innerHTML = row
        div.appendChild(cell)
    }

    return div
}

MatrixGameSolver.prototype.Solve2x2 = function(matrix, indexes, p, q) {
    let a11 = matrix[indexes.rows[0]][indexes.columns[0]]
    let a12 = matrix[indexes.rows[0]][indexes.columns[1]]
    let a21 = matrix[indexes.rows[1]][indexes.columns[0]]
    let a22 = matrix[indexes.rows[1]][indexes.columns[1]]

    let den = a22.sub(a12).add(a11).sub(a21)

    let v = a11.mult(a22).sub(a12.mult(a21)).div(a11.sub(a12).sub(a21).add(a22))

    p[indexes.rows[0]] = a22.sub(a21).div(den)
    p[indexes.rows[1]] = a11.sub(a12).div(den)

    q[indexes.columns[0]] = a22.sub(a12).div(den)
    q[indexes.columns[1]] = a11.sub(a21).div(den)

    this.solveBox.innerHTML += '<b>Решаем две системы уравнений</b>:<br>'
    this.solveBox.appendChild(this.MakeSystem([`v = ${a11}p<sub>1</sub> ${a21.signStr()}p<sub>2</sub>`, `v = ${a12}p<sub>1</sub> ${a22.signStr()}p<sub>2</sub>`, `p<sub>1</sub> + p<sub>2</sub> = 1`]))
    this.solveBox.appendChild(this.MakeSystem([`v = ${a11}q<sub>1</sub> ${a12.signStr()}q<sub>2</sub>`, `v = ${a21}q<sub>1</sub> ${a22.signStr()}q<sub>2</sub>`, `q<sub>1</sub> + q<sub>2</sub> = 1`]))
    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `p<sub>1</sub> = 1 - p<sub>2</sub> → ${a11} ${a21.sub(a11).signStr()}p<sub>2</sub> = ${a12} ${a22.sub(a12).signStr()}p<sub>2</sub> → ${a11.sub(a12)} = ${a11.sub(a21).sub(a12.sub(a22))}p<sub>2</sub> → p<sub>2</sub> = ${p[indexes.rows[1]]}, p<sub>1</sub> = ${p[indexes.rows[0]]}<br>`
    this.solveBox.innerHTML += `q<sub>1</sub> = 1 - q<sub>2</sub> → ${a11} ${a12.sub(a11).signStr()}q<sub>2</sub> = ${a21} ${a22.sub(a21).signStr()}q<sub>2</sub> → ${a11.sub(a21)} = ${a11.sub(a12).sub(a21.sub(a22))}q<sub>2</sub> → q<sub>2</sub> = ${q[indexes.columns[1]]}, q<sub>1</sub> = ${q[indexes.columns[0]]}<br>`
    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v}<br>`
}

MatrixGameSolver.prototype.IntersectLines = function(line1, line2) {
    let x = line2.b.sub(line1.b).div(line1.k.sub(line2.k))
    let y = line1.k.mult(x).add(line1.b)

    return { x: x, y: y }
}

MatrixGameSolver.prototype.EvalLine = function(line, x) {
    return line.k.mult(x).add(line.b)
}

MatrixGameSolver.prototype.GetIntersections = function(lines, name) {
    let points = []
    let one = new Fraction('1')
    let zero = new Fraction('0')

    this.solveBox.innerHTML += `<br><b>Ищем точки пересечения построенных функций</b>:<br>`

    for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
            let p = this.IntersectLines(lines[i], lines[j])

            if (p.x.lt(zero) || p.x.gt(one))
                continue

            p.i = i
            p.j = j

            points.push(p)

            this.solveBox.innerHTML += `l<sub>${i + 1}</sub> и l<sub>${j + 1}</sub>: ${lines[i].k}${name}<sub>1</sub> ${lines[i].b.signStr()} = ${lines[j].k}${name}<sub>1</sub> ${lines[j].b.signStr()} → ${lines[i].k.sub(lines[j].k)}${name}<sub>1</sub> = ${lines[j].b.sub(lines[i].b)} → ${name}<sub>1</sub> = ${p.x}, l<sub>${i + 1}</sub>(${name}<sub>1</sub>) = ${p.y}<br>`
        }
    }

    return points
}

MatrixGameSolver.prototype.GetEnvelopeOfLines = function(lines, x, isMin) {
    let y = lines[0].k.mult(x).add(lines[0].b)

    for (let j = 1; j < lines.length; j++) {
        if (isMin) {
            y = y.min(this.EvalLine(lines[j], x))
        }
        else {
            y = y.max(this.EvalLine(lines[j], x))
        }
    }

    return y
}

MatrixGameSolver.prototype.ArgMaxOfPoints = function(points, lines, isP) {
    let imax = 0
    let ymax = this.GetEnvelopeOfLines(lines, points[0], isP)

    for (let i = 1; i < points.length; i++) {
        let y = this.GetEnvelopeOfLines(lines, points[i], isP)

        if ((y.gt(ymax) && isP) || (y.lt(ymax) && !isP)) {
            imax = i
            ymax = y
        }
    }

    return imax
}

MatrixGameSolver.prototype.MakeLines = function(matrix, indexes, isHorizontal) {
    let lines = []
    let name = isHorizontal ? 'p' : 'q'
    let n = isHorizontal ? indexes.columns.length : indexes.rows.length

    this.solveBox.innerHTML += `<b>Строим линейные функции</b>:<br>`

    for (let i = 0; i < n; i++) {
        let a1i = isHorizontal ? matrix[indexes.rows[0]][indexes.columns[i]] : matrix[indexes.rows[i]][indexes.columns[0]]
        let a2i = isHorizontal ? matrix[indexes.rows[1]][indexes.columns[i]] : matrix[indexes.rows[i]][indexes.columns[1]]

        let k = a1i.sub(a2i)
        lines.push({ k: k, b: a2i })

        this.solveBox.innerHTML += `l<sub>${i + 1}</sub>: ${a1i}${name}<sub>1</sub> ${a2i.signStr()}(1 - ${name}<sub>1</sub>) = ${k}${name}<sub>1</sub> ${a2i.signStr()}<br>`
    }

    return lines
}

MatrixGameSolver.prototype.PlotLines = function(lines, points, isMin) {
    let div = document.createElement('div')
    div.id = 'plot'
    let data = []
    let n = 1000

    for (let i = 0; i < lines.length; i++) {
        let x = [0, 1]
        let y = [lines[i].b.toFloat(), lines[i].k.add(lines[i].b).toFloat()]
        let text = [`(${x[0]}, ${lines[i].b})`, `(${x[1]}, ${lines[i].k.add(lines[i].b)})`]

        data.push({ x: x, y: y, text: text, hovertemplate: '<b>%{text}</b>', mode: 'scatter', name: `l${i + 1} = ${lines[i].k}p<sub>1</sub> ${lines[i].b.signStr()}`})
    }

    let xi = []
    let yi = []
    let text = []

    for (let point of points) {
        xi.push(point.x.toFloat())
        yi.push(point.y.toFloat())
        text.push(`(${point.x}, ${point.y})`)
    }

    let xl = []
    let yl = []

    for (let i = 0; i <= n; i++) {
        let x = new Fraction(`${i}/${n}`)
        let y = this.GetEnvelopeOfLines(lines, x, isMin)

        xl.push(x.toFloat())
        yl.push(y.toFloat())
    }

    data.push({ x: xi, y: yi, text: text, mode: 'markers', hovertemplate: '<b>%{text}</b>', marker: { size: 9 }, name: 'пересечения' })
    data.push({ x: xl, y: yl, mode: 'lines', name: 'огибающая', line: { width: 4 } })

    let layout = {
        width: 700,
        height: 500,
        margin: { l: 20, r: 20, b: 20, t: 20 },
        yaxis: { rangemode: 'tozero' }
    };

    this.solveBox.appendChild(div)
    return { data: data, layout: layout }
}

MatrixGameSolver.prototype.GetLinesForFind = function(lines, x, points) {
    for (let i = 0; i < points.length; i++) {
        if (!points[i].x.eq(x))
            continue

        let j1 = points[i].i
        let j2 = points[i].j

        if (lines[j1].k.isPos() && lines[j2].k.isNeg())
            return { j1: j1, j2: j2 }

        if (lines[j2].k.isPos() && lines[j1].k.isNeg())
            return { j1: j2, j2: j1 }
    }

    return null
}

MatrixGameSolver.prototype.GetLineForBorder = function(lines, x, v) {
    for (let i = 0; i < lines.length; i++)
        if (this.EvalLine(lines[i], x).eq(v))
            return i

    return -1
}

// matrix == 2xn
MatrixGameSolver.prototype.SolveGraphically2xN = function(matrix, indexes, p, q) {
    let lines = this.MakeLines(matrix, indexes, true)
    let points = this.GetIntersections(lines, 'p')
    let plot = this.PlotLines(lines, points)

    let zero = new Fraction('0')
    let one = new Fraction('1')

    let ps = points.map((v) => v.x)
    ps.push(zero)
    ps.push(one)

    let imax = this.ArgMaxOfPoints(ps, lines, true)
    let p1 = ps[imax]
    let p2 = one.sub(p1)
    let v

    p[indexes.rows[0]] = p1
    p[indexes.rows[1]] = p2

    this.solveBox.innerHTML += `Ищем максимальную точку на огибающей среди (${ps.join(', ')}): p<sub>1</sub> = ${p1}, p<sub>2</sub> = ${p2}<br>`

    if (p1.gt(zero) && p1.lt(one)) {
        let l = this.GetLinesForFind(lines, p1, points)
        let j1 = l.j1
        let j2 = l.j2

        let q_star = lines[j2].k.div(lines[j2].k.sub(lines[j1].k))
        v = this.EvalLine(lines[points[imax].i], p1)

        q[indexes.columns[j1]] = q_star
        q[indexes.columns[j2]] = one.sub(q_star)

        this.solveBox.innerHTML += `Искомая точка является пересечением прямых l<sub>${j1 + 1}</sub> и l<sub>${j2 + 1}</sub>, q<sup>*</sup> = ${q_star}<br>`
    }
    else {
        v = this.GetEnvelopeOfLines(lines, p1, true)
        let j = this.GetLineForBorder(lines, p1, v)

        q[indexes.columns[j]] = one
        this.solveBox.innerHTML += `Через точку (${p1}, ${v}) проходит прямая l<sub>${j + 1}</sub>, q<sub>${j + 1}</sub> = ${one}<br>`
    }

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v}<br>`

    Plotly.newPlot('plot', plot.data, plot.layout);
}

// matrix == nx2
MatrixGameSolver.prototype.SolveGraphicallyNx2 = function(matrix, indexes, p, q) {
    let lines = this.MakeLines(matrix, indexes, false)
    let points = this.GetIntersections(lines, 'q')
    let plot = this.PlotLines(lines, points)

    let zero = new Fraction('0')
    let one = new Fraction('1')

    let qs = points.map((v) => v.x)
    qs.push(zero)
    qs.push(one)

    let imax = this.ArgMaxOfPoints(qs, lines, false)
    let q1 = qs[imax]
    let q2 = one.sub(q1)
    let v

    q[indexes.columns[0]] = q1
    q[indexes.columns[1]] = q2

    this.solveBox.innerHTML += `Ищем минимальную точку на огибающей среди (${qs.join(', ')}): q<sub>1</sub> = ${q1}, q<sub>2</sub> = ${q2}<br>`

    if (q1.gt(zero) && q1.lt(one)) {
        let l = this.GetLinesForFind(lines, q1, points)
        let j1 = l.j1
        let j2 = l.j2

        let p_star = lines[j2].k.div(lines[j2].k.sub(lines[j1].k))
        v = this.EvalLine(lines[points[imax].i], q1)

        p[indexes.rows[j1]] = p_star
        p[indexes.rows[j2]] = one.sub(p_star)

        this.solveBox.innerHTML += `Искомая точка является пересечением прямых l<sub>${j1 + 1}</sub> и l<sub>${j2 + 1}</sub>, p<sup>*</sup> = ${p_star}<br>`
    }
    else {
        v = this.GetEnvelopeOfLines(lines, q1, false)
        let j = this.GetLineForBorder(lines, q1, v)

        p[indexes.rows[j]] = one
        this.solveBox.innerHTML += `Через точку (${q1}, ${v}) проходит прямая l<sub>${j + 1}</sub>, p<sub>${j + 1}</sub> = ${one}<br>`
    }

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v}<br>`

    Plotly.newPlot('plot', plot.data, plot.layout);
}

MatrixGameSolver.prototype.Solve = function() {
    let matrix = this.ParseMatrix()

    let table = this.MakeMatrixTable(matrix)

    let p = new Array(matrix.length).fill(new Fraction('0'))
    let q = new Array(matrix[0].length).fill(new Fraction('0'))
    let v = new Fraction('0')

    this.solveBox.innerHTML = `<h2>Решение</h2>`
    this.solveBox.innerHTML += `<b>Введённая матрица игры:</b><br>`
    this.solveBox.appendChild(table)

    let indexes = this.RemoveDominant(matrix)

    if (indexes.rows.length == 2 && indexes.columns.length == 2) {
        this.Solve2x2(matrix, indexes, p, q)
    }
    else if (indexes.rows.length == 2) {
        this.SolveGraphically2xN(matrix, indexes, p, q)
    }
    else if (indexes.columns.length == 2) {
        this.SolveGraphicallyNx2(matrix, indexes, p, q)
    }
    else {
        return // TODO
    }
}