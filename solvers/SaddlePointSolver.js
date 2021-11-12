function SaddlePointSolver(matrixBoxId, buttonId, solveBoxId) {
    this.matrixBox = document.getElementById(matrixBoxId)
    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

SaddlePointSolver.prototype.AppendTableCell = function(row, value, color = null, asBorder = true) {
    let cell = document.createElement('div')
    cell.className = 'matrix-cell'

    if (color) {
        if (asBorder) {
            let span = document.createElement('span')
            span.innerHTML = value
            span.className = 'circle'
            span.style.border = '2px solid ' + color
            cell.appendChild(span)
        }
        else {
            cell.innerHTML = value
            cell.style.color = color
        }
    }
    else {
        cell.innerHTML = value
    }

    row.appendChild(cell)
}

SaddlePointSolver.prototype.MakeMatrixTable = function(matrix, mins, maxs) {
    let table = document.createElement('div')
    let minBlocks = document.createElement('div')
    let maxBlocks = document.createElement('div')

    let minColor = 'rgb(0, 120, 212)'
    let maxColor = 'rgb(255, 170, 68)'

    table.className = 'matrix'
    minBlocks.style.borderLeft = '2px solid ' + minColor
    maxBlocks.style.borderTop = '2px solid ' + maxColor

    for (let i = 0; i < matrix.length; i++) {
        let tr = document.createElement('div')
        let minTr = document.createElement('div')

        for (let j = 0; j < matrix[i].length; j++) {
            let color = null

            if (maxs[j].eq(matrix[i][j]) && mins[i].eq(matrix[i][j])) {
                color = 'rgb(0, 173, 86)'
            }
            else if (maxs[j].eq(matrix[i][j])) {
                color = maxColor
            }
            else if (mins[i].eq(matrix[i][j])) {
                color = minColor
            }

            this.AppendTableCell(tr, matrix[i][j], color)
        }

        this.AppendTableCell(minTr, mins[i], minColor, false)
        table.appendChild(tr)
        minBlocks.appendChild(minTr)
    }

    for (let i = 0; i < matrix[0].length; i++)
        this.AppendTableCell(maxBlocks, maxs[i], maxColor, false)

    let block = document.createElement('table')
    let row = document.createElement('tr')
    let cell1 = document.createElement('td')
    let cell2 = document.createElement('td')
    cell1.appendChild(table)
    cell1.appendChild(maxBlocks)
    cell2.appendChild(minBlocks)
    cell2.style.verticalAlign = 'top'
    row.appendChild(cell1)
    row.appendChild(cell2)
    block.appendChild(row)

    return block
}

SaddlePointSolver.prototype.MaxInColumns = function(matrix) {
    let maxs = []

    for (let j = 0; j < matrix[0].length; j++) {
        maxs[j] = matrix[0][j]

        for (let i = 1; i < matrix.length; i++)
            maxs[j] = maxs[j].max(matrix[i][j])
    }

    return maxs
}

SaddlePointSolver.prototype.MinInRows = function(matrix) {
    let mins = []

    for (let i = 0; i < matrix.length; i++) {
        mins[i] = matrix[i][0]

        for (let j = 1; j < matrix[i].length; j++)
            mins[i] = mins[i].min(matrix[i][j])
    }

    return mins
}

SaddlePointSolver.prototype.MinValue = function(array) {
    let min = array[0]

    for (let i = 1; i < array.length; i++)
        min = min.min(array[i])

    return min
}

SaddlePointSolver.prototype.MaxValue = function(array) {
    let max = array[0]

    for (let i = 1; i < array.length; i++)
        max = max.max(array[i])

    return max
}

SaddlePointSolver.prototype.GetStrategy = function(extremums, value) {
    let strategy = []

    for (let i = 0; i < extremums.length; i++)
        if (extremums[i].eq(value))
            strategy.push(i + 1)

    return strategy
}

SaddlePointSolver.prototype.Solve = function() {
    try {
        let matrix = ParseMatrix(this.matrixBox.value)
        let rows = matrix.length
        let columns = matrix[0].length

        let maxs = this.MaxInColumns(matrix)
        let mins = this.MinInRows(matrix)

        let v_down = this.MaxValue(mins)
        let v_up = this.MinValue(maxs)

        let x_strategy = this.GetStrategy(mins, v_down)
        let y_strategy = this.GetStrategy(maxs, v_up)

        let table = this.MakeMatrixTable(matrix, mins, maxs)

        this.solveBox.innerHTML = `<h2>Решение</h2>`
        this.solveBox.innerHTML += `<b>Матрица игры:</b><br>`
        this.solveBox.appendChild(table)
        this.solveBox.innerHTML += `<br><span class='math'><b>W(i)</b> = min<sub>1&le;j&le;${columns}</sub> a<sub>ij</sub>: ${mins.map((v) => v.html()).join(', ')}</p>`
        this.solveBox.innerHTML += `<span class='math'><b>M(j)</b> = max<sub>1&le;i&le;${rows}</sub> a<sub>ij</sub>: ${maxs.map((v) => v.html()).join(', ')}</p><br>`

        this.solveBox.innerHTML += `<span class='math'><b>Нижнее значение игры (v̲)</b> = max<sub>1&le;i&le;${rows}</sub> W(i) = ${v_down.html()}</p>`
        this.solveBox.innerHTML += `<span class='math'><b>Верхнее значение игры (v̅)</b> = min<sub>1&le;j&le;${columns}</sub> M(j) = ${v_up.html()}</p><br>`

        if (v_down != v_up) {
            this.solveBox.innerHTML += `<span class='math'>v̅ ≠ v̲ → <b>седловых точек нет</b></p>`
        }
        else {
            let seddle_points = []

            for (let x of x_strategy)
                for (let y of y_strategy)
                    seddle_points.push(`(${x}, ${y})`)

            if (seddle_points.length > 1) {
                this.solveBox.innerHTML += `<span class='math'>v̅ = v̲ = v → <b>имеются седловые точки</b></p>`
                this.solveBox.innerHTML += `<span class='math'><b>Седловые точки</b>: ${seddle_points.join(', ')}</p>`
            }
            else {
                this.solveBox.innerHTML += `<span class='math'>v̅ = v̲ = v → <b>имеется седловая точка</b>: ${seddle_points.join(', ')}</p>`
            }
        }
        
        this.solveBox.innerHTML += `<span class='math'><b>Максимин стратегия</b>: X⁰ = {${x_strategy.join(', ')}}</p>`
        this.solveBox.innerHTML += `<span class='math'><b>Минимакс стратегия</b>: Y⁰ = {${y_strategy.join(', ')}}</p>`
    }
    catch (error) {
        alert(error)
    }
}