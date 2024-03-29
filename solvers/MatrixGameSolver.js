function MatrixGameSolver(matrixBoxId, buttonId, solveBoxId) {
    this.matrixBox = document.getElementById(matrixBoxId)
    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    if (this.button) {
        this.button.addEventListener('click', () => this.Solve())
    }
}

MatrixGameSolver.prototype.MakeMatrixTable = function(matrix, rows = null, columns = null) {
    let table = document.createElement('div')
    table.className = 'matrix'

    for (let i = 0; i < matrix.length; i++) {
        let row = document.createElement('div')

        for (let j = 0; j < matrix[i].length; j++) {
            let cell = document.createElement('div')
            cell.className = 'matrix-cell'
            cell.innerHTML = matrix[i][j].html()

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
                this.solveBox.innerHTML += `<span><b>Строка ${rows[row] + 1} доминируется строкой ${indexes[index] + 1}, удаляем её:</b></p>`
            }
            else {
                this.solveBox.innerHTML += `<span><b>Строка ${rows[row] + 1} доминируется выпуклой комбинацией строк {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.html()).join(', ')}}, удаляем её:</b></p>`
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
                this.solveBox.innerHTML += `<span><b>Столбец ${columns[column] + 1} доминирует столбец ${indexes[index] + 1}, удаляем его:</b></p>`
            }
            else {
                this.solveBox.innerHTML += `<span><b>Столбец ${columns[column] + 1} доминирует выпуклую комбинацию столбцов {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.html()).join(', ')}}, удаляем его:</b></p>`
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
    this.solveBox.appendChild(this.MakeSystem([`v = ${a11.html()}p<sub>1</sub> ${a21.signHtml()}p<sub>2</sub>`, `v = ${a12.html()}p<sub>1</sub> ${a22.signHtml()}p<sub>2</sub>`, `p<sub>1</sub> + p<sub>2</sub> = 1`]))
    this.solveBox.appendChild(this.MakeSystem([`v = ${a11.html()}q<sub>1</sub> ${a12.signHtml()}q<sub>2</sub>`, `v = ${a21.html()}q<sub>1</sub> ${a22.signHtml()}q<sub>2</sub>`, `q<sub>1</sub> + q<sub>2</sub> = 1`]))
    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `p<sub>1</sub> = 1 - p<sub>2</sub> → ${a11.html()} ${a21.sub(a11).signHtml()}p<sub>2</sub> = ${a12.html()} ${a22.sub(a12).signHtml()}p<sub>2</sub> → ${a11.sub(a12)} = ${a11.sub(a21).sub(a12.sub(a22))}p<sub>2</sub> → p<sub>2</sub> = ${p[indexes.rows[1]]}, p<sub>1</sub> = ${p[indexes.rows[0]]}<br>`
    this.solveBox.innerHTML += `q<sub>1</sub> = 1 - q<sub>2</sub> → ${a11.html()} ${a12.sub(a11).signHtml()}q<sub>2</sub> = ${a21.html()} ${a22.sub(a21).signHtml()}q<sub>2</sub> → ${a11.sub(a21)} = ${a11.sub(a12).sub(a21.sub(a22))}q<sub>2</sub> → q<sub>2</sub> = ${q[indexes.columns[1]]}, q<sub>1</sub> = ${q[indexes.columns[0]]}<br>`

    this.CheckSolve(q, matrix, indexes.rows, indexes.columns, v, false)
    this.CheckSolve(p, matrix, indexes.rows, indexes.columns, v, true)

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v.html()}<br>`

    return v
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

            this.solveBox.innerHTML += `l<sub>${i + 1}</sub> и l<sub>${j + 1}</sub>: ${lines[i].k.html()}${name}<sub>1</sub> ${lines[i].b.signHtml()} = ${lines[j].k.html()}${name}<sub>1</sub> ${lines[j].b.signHtml()} → ${lines[i].k.sub(lines[j].k).html()}${name}<sub>1</sub> = ${lines[j].b.sub(lines[i].b).html()} → ${name}<sub>1</sub> = ${p.x.html()}, l<sub>${i + 1}</sub>(${name}<sub>1</sub>) = ${p.y.html()}<br>`
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

MatrixGameSolver.prototype.ArgMaxOfPoints = function(points, intersectionPoints, lines, isP) {
    let imax = -1
    let ymax = null

    for (let i = 0; i < points.length; i++) {
        let y = this.GetEnvelopeOfLines(lines, points[i], isP)

        if (i < points.length - 2 && !intersectionPoints[i].y.eq(y))
            continue

        if (imax == -1 || (y.gt(ymax) && isP) || (y.lt(ymax) && !isP)) {
            imax = i
            ymax = y
        }
    }

    return { i: imax, v: ymax }
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

        this.solveBox.innerHTML += `l<sub>${i + 1}</sub>: ${a1i.html()}${name}<sub>1</sub> ${a2i.signHtml()}(1 - ${name}<sub>1</sub>) = ${k.html()}${name}<sub>1</sub> ${a2i.signHtml()}<br>`
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

MatrixGameSolver.prototype.GetLinesForFind = function(lines, x, y, points) {
    for (let i = 0; i < points.length; i++) {
        if (!points[i].x.eq(x) || !points[i].y.eq(y))
            continue

        let j1 = points[i].i
        let j2 = points[i].j

        if (!lines[j1].k.isNeg() && !lines[j2].k.isPos())
            return { j1: j1, j2: j2 }

        if (!lines[j2].k.isNeg() && !lines[j1].k.isPos())
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
    let plot = this.PlotLines(lines, points, true)

    let zero = new Fraction('0')
    let one = new Fraction('1')

    let ps = points.map((v) => v.x)
    ps.push(zero)
    ps.push(one)

    let argmax = this.ArgMaxOfPoints(ps, points, lines, true)
    let p1 = ps[argmax.i]
    let p2 = one.sub(p1)
    let v = argmax.v

    p[indexes.rows[0]] = p1
    p[indexes.rows[1]] = p2

    this.solveBox.innerHTML += `Ищем максимальную точку на огибающей среди (${ps.map((v) => v.html()).join(', ')}): p<sub>1</sub> = ${p1.html()}, p<sub>2</sub> = ${p2.html()}, v = ${v.html()}<br>`

    if (p1.gt(zero) && p1.lt(one)) {
        let l = this.GetLinesForFind(lines, p1, v, points)
        let j1 = l.j1
        let j2 = l.j2

        let q_star = lines[j2].k.div(lines[j2].k.sub(lines[j1].k))

        q[indexes.columns[j1]] = q_star
        q[indexes.columns[j2]] = one.sub(q_star)

        this.solveBox.innerHTML += `Искомая точка является пересечением прямых l<sub>${j1 + 1}</sub> и l<sub>${j2 + 1}</sub>, q<sup>*</sup> = k<sub>l<sub>${j2 + 1}</sub></sub> / (k<sub>l<sub>${j2 + 1}</sub></sub> - k<sub>l<sub>${j1 + 1}</sub></sub>) = ${lines[j2].k.html()} / (${lines[j2].k.html()} ${lines[j1].k.neg().signHtml()}) = ${q_star.html()}<br>`
    }
    else {
        let j = this.GetLineForBorder(lines, p1, v)

        q[indexes.columns[j]] = one
        this.solveBox.innerHTML += `Через точку (${p1.html()}, ${v.html()}) проходит прямая l<sub>${j + 1}</sub>, q<sub>${j + 1}</sub> = ${one.html()}<br>`
    }

    this.CheckSolve(q, matrix, indexes.rows, indexes.columns, v, false)
    this.CheckSolve(p, matrix, indexes.rows, indexes.columns, v, true)

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v.html()}<br>`

    Plotly.newPlot('plot', plot.data, plot.layout);
    return v
}

// matrix == nx2
MatrixGameSolver.prototype.SolveGraphicallyNx2 = function(matrix, indexes, p, q) {
    let lines = this.MakeLines(matrix, indexes, false)
    let points = this.GetIntersections(lines, 'q')
    let plot = this.PlotLines(lines, points, false)

    let zero = new Fraction('0')
    let one = new Fraction('1')

    let qs = points.map((v) => v.x)
    qs.push(zero)
    qs.push(one)

    let argmax = this.ArgMaxOfPoints(qs, points, lines, false)
    let q1 = qs[argmax.i]
    let q2 = one.sub(q1)
    let v = argmax.v

    q[indexes.columns[0]] = q1
    q[indexes.columns[1]] = q2

    this.solveBox.innerHTML += `Ищем минимальную точку на огибающей среди (${qs.map((v) => v.html()).join(', ')}): q<sub>1</sub> = ${q1.html()}, q<sub>2</sub> = ${q2.html()}, v = ${v.html()}<br>`

    if (q1.gt(zero) && q1.lt(one)) {
        let l = this.GetLinesForFind(lines, q1, v, points)
        let j1 = l.j1
        let j2 = l.j2

        let p_star = lines[j2].k.div(lines[j2].k.sub(lines[j1].k))

        p[indexes.rows[j1]] = p_star
        p[indexes.rows[j2]] = one.sub(p_star)

        this.solveBox.innerHTML += `Искомая точка является пересечением прямых l<sub>${j1 + 1}</sub> и l<sub>${j2 + 1}</sub>, p<sup>*</sup> = k<sub>l<sub>${j2 + 1}</sub></sub> / (k<sub>l<sub>${j2 + 1}</sub></sub> - k<sub>l<sub>${j1 + 1}</sub></sub>) = ${lines[j2].k.html()} / (${lines[j2].k.html()} ${lines[j1].k.neg().signHtml()}) = ${p_star.html()}<br>`
    }
    else {
        let j = this.GetLineForBorder(lines, q1, v)

        p[indexes.rows[j]] = one
        this.solveBox.innerHTML += `Через точку (${q1.html()}, ${v.html()}) проходит прямая l<sub>${j + 1}</sub>, p<sub>${j + 1}</sub> = ${one.html()}<br>`
    }

    this.CheckSolve(q, matrix, indexes.rows, indexes.columns, v, false)
    this.CheckSolve(p, matrix, indexes.rows, indexes.columns, v, true)

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v.html()}<br>`

    Plotly.newPlot('plot', plot.data, plot.layout);
    return v
}

MatrixGameSolver.prototype.CopyMatrix = function(matrix) {
    let copy = []

    for (let i = 0; i < matrix.length; i++) {
        copy[i] = []

        for (let j = 0; j < matrix[i].length; j++)
            copy[i][j] = matrix[i][j]
    }

    return copy
}

MatrixGameSolver.prototype.MakeSubmatrixSystem = function(matrix, rows, columns, isTransposed = false) {
    let system = []

    for (let i = 0; i < rows.length; i++) {
        system[i] = []

        for (let j = 0; j < columns.length; j++) {
            system[i][j] = isTransposed ? matrix[rows[j]][columns[i]] : matrix[rows[i]][columns[j]]
        }

        system[i][columns.length] = new Fraction('-1')
        system[i][columns.length + 1] = new Fraction('0')
    }

    system.push([])
    for (let i = 0; i < columns.length; i++)
        system[rows.length][i] = new Fraction('1')

    system[rows.length][columns.length] = new Fraction('0')
    system[rows.length][columns.length + 1] = new Fraction('1')

    return system
}

MatrixGameSolver.prototype.GenerateIndexesSequences = function(i, n, m, sequence, sequences) {
    if (i == n) {
        sequences.push(sequence.map((v) => v))
        return
    }

    let start = i == 0 ? 0 : sequence[i - 1] + 1

    for (let j = start; j <= m - n + i; j++) {
        sequence[i] = j
        this.GenerateIndexesSequences(i + 1, n, m, sequence, sequences)
    }
}

MatrixGameSolver.prototype.GetIndexesSequences = function(rows, columns) {
    let sequences = []
    this.GenerateIndexesSequences(0, rows, columns, [], sequences)
    return sequences
}

// переместить строку row1 перед строкой row2 (row1 > row2)
MatrixGameSolver.prototype.MoveRow = function(matrix, row1, row2) {
    let row = matrix[row1].slice()

    for (let j = 0; j < matrix[0].length; j++) {
        for (let i = row1; i > row2; i--)
            matrix[i][j] = matrix[i - 1][j]

        matrix[row2][j] = row[j]
    }
}

MatrixGameSolver.prototype.DivideRow = function(matrix, row, value) {
    for (let i = 0; i < matrix.length; i++) {
        matrix[row][i] = matrix[row][i].div(value)
    }
}

// вычитание из строки row1 строки row2, умноженной на value
MatrixGameSolver.prototype.SubstractRow = function(matrix, row1, row2, value) {
    for (let i = 0; i < matrix[0].length; i++) {
        matrix[row1][i] = matrix[row1][i].sub(matrix[row2][i].mult(value))
    }
}

MatrixGameSolver.prototype.FindRowWithMinAbs = function(matrix, start) {
    let imax = -1

    for (let i = start; i < matrix.length; i++) {
        if (matrix[i][start].isZero())
            continue

        if (imax == -1 || matrix[i][start].abs().lt(matrix[imax][start].abs()))
            imax = i
    }

    return imax
}

// TODO: more clever solvation?
MatrixGameSolver.prototype.SolveSystem = function(matrix, header) {
    matrix = this.CopyMatrix(matrix)

    let details = document.createElement('details')
    let summary = document.createElement('summary')
    summary.innerHTML = header
    summary.appendChild(this.MakeMatrixTable(matrix))

    details.appendChild(summary)
    details.innerHTML += `<br>`

    let haveSolve = true

    for (let i = 0; i < matrix.length && haveSolve; i++) {
        let imax = this.FindRowWithMinAbs(matrix, i)

        if (imax == -1) {
            haveSolve = false
            break
        }

        if (imax != i) {
            this.MoveRow(matrix, imax, i)
            details.innerHTML += `<b>Переставляем строку ${imax + 1} на место строки ${i + 1}</b>:<br>`
            details.appendChild(this.MakeMatrixTable(matrix))
            details.innerHTML += `<br>`
        }

        for (let j = i + 1; j < matrix.length; j++)
            this.SubstractRow(matrix, j, i, matrix[j][i].div(matrix[i][i]))

        details.appendChild(this.MakeMatrixTable(matrix))
        details.innerHTML += `<br>`
    }

    if (!haveSolve) {
        details.innerHTML += `Решения СЛАУ нет<br>`
    }

    this.solveBox.innerHTML += `<br>`
    this.solveBox.appendChild(details)

    if (!haveSolve)
        return null

    let solve = []

    for (let i = matrix.length - 1; i >= 0; i--) {
        solve[i] = matrix[i][matrix.length]

        for (let j = matrix.length - 1; j > i; j--)
            solve[i] = solve[i].sub(matrix[i][j].mult(solve[j]))

        solve[i] = solve[i].div(matrix[i][i])
    }

    return solve
}

MatrixGameSolver.prototype.CheckSolve = function(solve, matrix, rows, columns, v, isP) {
    this.solveBox.innerHTML += `<b>Проверяем решение:</b><br>`

    for (let i = 0; i < solve.length; i++) {
        if (solve[i].isNeg()) {
            this.solveBox.innerHTML += `${isP ? 'p' : 'q'}<sub>${i}</sub> < 0 - <b>решение не подходит, ищем дальше</b><br><br>`
            return false
        }
    }

    let zero = new Fraction('0')

    if (isP) {
        for (let j = 0; j < columns.length; j++) {
            let sum = zero

            this.solveBox.innerHTML += `A(p<sup>0</sup>, ${j + 1}) = `

            for (let i = 0; i < rows.length; i++) {
                let aij = matrix[rows[i]][columns[j]]
                sum = sum.add(aij.mult(solve[rows[i]]))

                this.solveBox.innerHTML += ` ${i == 0 ? aij.html() : aij.signHtml()}⋅${solve[rows[i]].html()}`
            }

            this.solveBox.innerHTML += ` = ${sum.html()}`

            if (sum.lt(v)) {
                this.solveBox.innerHTML += ` < ${v.html()} - <b>решение не подходит, ищем дальше</b><br><br>`
                return false
            }
            else {
                this.solveBox.innerHTML += ` &ge; ${v.html()}<br>`
            }
        }
    }
    else {
        for (let i = 0; i < rows.length; i++) {
            let sum = zero

            this.solveBox.innerHTML += `A(${i + 1}, q<sup>0</sup>) = `

            for (let j = 0; j < columns.length; j++) {
                let aij = matrix[rows[i]][columns[j]]
                sum = sum.add(aij.mult(solve[columns[j]]))

                this.solveBox.innerHTML += ` ${j == 0 ? aij.html() : aij.signHtml()}⋅${solve[columns[j]].html()}`
            }

            this.solveBox.innerHTML += ` = ${sum.html()}`

            if (sum.gt(v)) {
                this.solveBox.innerHTML += ` > ${v.html()} - <b>решение не подходит, ищем дальше</b><br><br>`
                return false
            }
            else {
                this.solveBox.innerHTML += ` &le; ${v.html()}<br>`
            }
        }
    }

    return true
}

// число столбцов не меньше числа строк
MatrixGameSolver.prototype.SolveSubmatrixSystem = function(matrix, indexes, p, q) {
    for (let rowCount = indexes.rows.length; rowCount > 0; rowCount--) {
        let rowSecuences = this.GetIndexesSequences(rowCount, indexes.rows.length)

        for (let rowSecuence of rowSecuences) {
            let rows = []

            for (let i = 0; i < rowCount; i++)
                rows.push(indexes.rows[rowSecuence[i]])

            let columnSequences = this.GetIndexesSequences(rowCount, indexes.columns.length)

            for (let columnSequence of columnSequences) {
                let columns = []

                for (let i = 0; i < rowCount; i++)
                    columns.push(indexes.columns[columnSequence[i]])

                let system = this.MakeSubmatrixSystem(matrix, rows, columns)
                let solve_q = this.SolveSystem(system, `<b>Решаем СЛАУ относительно q, используя строки ${rows.map((v) => v + 1).join(', ')} и столбцы ${columns.map((v) => v + 1).join(', ')}</b>:<br>`)

                if (solve_q === null)
                    continue

                let vq = solve_q.pop()

                for (let i = 0; i < q.length; i++)
                    q[i] = new Fraction('0')

                for (let i = 0; i < columns.length; i++)
                    q[columns[i]] = solve_q[i]

                this.solveBox.innerHTML += `${solve_q.map((v, i) => 'q<sub>' + (i + 1) + '</sub> = ' + v.html()).join(', ')}, v = ${vq.html()}<br>`
                this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`

                if (!this.CheckSolve(q, matrix, indexes.rows, indexes.columns, vq, false)) {
                    continue
                }

                system = this.MakeSubmatrixSystem(matrix, rows, columns, true)
                let solve_p = this.SolveSystem(system, `<b>Решаем СЛАУ относительно p, используя строки ${rows.map((v) => v + 1).join(', ')} и столбцы ${columns.map((v) => v + 1).join(', ')}</b>:<br>`)

                if (solve_p === null)
                    continue

                let vp = solve_p.pop()

                for (let i = 0; i < p.length; i++)
                    p[i] = new Fraction('0')

                for (let i = 0; i < rows.length; i++)
                    p[rows[i]] = solve_p[i]

                this.solveBox.innerHTML += `${solve_p.map((v, i) => 'p<sub>' + (i + 1) + '</sub> = ' + v.html()).join(', ')}, v = ${vp.html()}<br>`
                this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`

                if (!this.CheckSolve(p, matrix, indexes.rows, indexes.columns, vp, true)) {
                    continue
                }

                this.solveBox.innerHTML += `<br><b>Ответ:</b><br>`
                this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`
                this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`
                this.solveBox.innerHTML += `<b>Цена игры</b>: ${vp.html()}<br>`
                return vp
            }
        }
    }
}

MatrixGameSolver.prototype.IsCyclicMatrix = function(matrix, rows, columns) {
    if (rows.length != columns.length)
        return false

    for (let i = 1; i < rows.length; i++)
        for (let j = 0; j < columns.length; j++)
            if (!matrix[rows[i]][columns[j]].eq(matrix[rows[0]][columns[(j + columns.length - i) % columns.length]]))
                return false

    return true
}

MatrixGameSolver.prototype.SolveCyclic = function(matrix, indexes, p, q) {
    this.solveBox.innerHTML += `Матрица циклическая → p<sub>i</sub> = q<sub>j</sub> = 1 / ${indexes.rows.length}<br>`

    let v = new Fraction('0')

    for (let i = 0; i < indexes.rows.length; i++) {
        p[indexes.rows[i]] = new Fraction(`1/${indexes.rows.length}`)
        q[indexes.columns[i]] = new Fraction(`1/${indexes.columns.length}`)
        v = v.add(matrix[indexes.rows[0]][indexes.columns[i]])
    }

    v = v.div(new Fraction(`${indexes.rows.length}`))

    this.CheckSolve(q, matrix, indexes.rows, indexes.columns, v, false)
    this.CheckSolve(p, matrix, indexes.rows, indexes.columns, v, true)

    this.solveBox.innerHTML += '<br>'
    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: (${p.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: (${q.map((v) => v.html()).join(', ')})<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v.html()}<br>`

    return v
}

MatrixGameSolver.prototype.SolveMatrix = function(matrix) {
    let table = this.MakeMatrixTable(matrix)

    let p = new Array(matrix.length).fill(new Fraction('0'))
    let q = new Array(matrix[0].length).fill(new Fraction('0'))
    let v = new Fraction('0')

    this.solveBox.innerHTML = `<h2>Решение</h2>`
    this.solveBox.innerHTML += `<b>Введённая матрица игры:</b><br>`
    this.solveBox.appendChild(table)

    let indexes = this.RemoveDominant(matrix)

    if (indexes.rows.length == 2 && indexes.columns.length == 2) {
        v = this.Solve2x2(matrix, indexes, p, q)
    }
    else if (this.IsCyclicMatrix(matrix, indexes.rows, indexes.columns)) {
        v = this.SolveCyclic(matrix, indexes, p, q)
    }
    else if (indexes.rows.length == 2) {
        v = this.SolveGraphically2xN(matrix, indexes, p, q)
    }
    else if (indexes.columns.length == 2) {
        v = this.SolveGraphicallyNx2(matrix, indexes, p, q)
    }
    else {
        v = this.SolveSubmatrixSystem(matrix, indexes, p, q)
    }

    return { p: p, q: q, v: v }
}

MatrixGameSolver.prototype.Solve = function() {
    let matrix = ParseMatrix(this.matrixBox.value)
    let solve = this.SolveMatrix(matrix)

    console.log(`p: {${solve.p.join(', ')}}`)
    console.log(`q: {${solve.q.join(', ')}}`)
    console.log(`v: ${solve.v}`)
}