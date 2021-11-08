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

MatrixGameSolver.prototype.Submatrix = function(matrix, rows, columns) {
    let submatrix = []

    for (let i = 0; i < rows.length; i++) {
        submatrix[i] = []

        for (let j = 0; j < columns.length; j++)
            submatrix[i][j] = matrix[rows[i]][columns[j]]
    }

    return submatrix
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
            this.solveBox.innerHTML += `<p><b>Строка ${rows[row] + 1} доминируется выпуклой комбинацией строк {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.toString()).join(', ')}}, удаляем её:</b></p>`
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
            this.solveBox.innerHTML += `<p><b>Столбец ${columns[column] + 1} доминируется выпуклой комбинацией столбцов {${indexes.map((v) => v + 1).join(', ')}} с коэффициентами {${sequence.map((v) => v.toString()).join(', ')}}, удаляем его:</b></p>`
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

MatrixGameSolver.prototype.Solve = function() {
    let matrix = this.ParseMatrix()

    let table = this.MakeMatrixTable(matrix)

    let p = new Array(matrix[0].length).fill(new Fraction('0'))
    let q = new Array(matrix.length).fill(new Fraction('0'))
    let v = new Fraction('0')

    this.solveBox.innerHTML = `<h2>Решение</h2>`
    this.solveBox.innerHTML += `<b>Введённая матрица игры:</b><br>`
    this.solveBox.appendChild(table)

    let indexes = this.RemoveDominant(matrix)

    if (indexes.rows.length == 2 && indexes.columns.length == 2) {
        let a11 = matrix[indexes.rows[0]][indexes.columns[0]]
        let a12 = matrix[indexes.rows[0]][indexes.columns[1]]
        let a21 = matrix[indexes.rows[1]][indexes.columns[0]]
        let a22 = matrix[indexes.rows[1]][indexes.columns[1]]

        let den = a22.sub(a12).add(a11).sub(a21)

        v = a11.mult(a22).sub(a12.mult(a21)).div(a11.sub(a12).sub(a21).add(a22))

        p[indexes.rows[0]] = a22.sub(a21).div(den)
        p[indexes.rows[1]] = a11.sub(a12).div(den)

        q[indexes.columns[0]] = a22.sub(a12).div(den)
        q[indexes.columns[1]] = a11.sub(a21).div(den)

        this.solveBox.innerHTML += '<b>Решаем две системы уравнений</b>:<br>'
        this.solveBox.appendChild(this.MakeSystem([`v = ${a11}p<sub>1</sub> + ${a21}p<sub>2</sub>`, `v = ${a12}p<sub>1</sub> + ${a22}p<sub>2</sub>`, `p<sub>1</sub> + p<sub>2</sub> = 1`]))
        this.solveBox.appendChild(this.MakeSystem([`v = ${a11}q<sub>1</sub> + ${a12}q<sub>2</sub>`, `v = ${a21}q<sub>1</sub> + ${a22}q<sub>2</sub>`, `q<sub>1</sub> + q<sub>2</sub> = 1`]))
        this.solveBox.innerHTML += '<br>'
        this.solveBox.innerHTML += `p<sub>1</sub> = 1 - p<sub>2</sub> → ${a11} - ${a11.sub(a21)}p<sub>2</sub> = ${a12} - ${a12.sub(a22)}p<sub>2</sub> → ${a11.sub(a12)} = ${a11.sub(a21).sub(a12.sub(a22))}p<sub>2</sub> → p<sub>2</sub> = ${p[indexes.rows[1]]}, p<sub>1</sub> = ${p[indexes.rows[0]]}<br>`
        this.solveBox.innerHTML += `q<sub>1</sub> = 1 - q<sub>2</sub> → ${a11} - ${a11.sub(a12)}q<sub>2</sub> = ${a21} - ${a21.sub(a22)}q<sub>2</sub> → ${a11.sub(a21)} = ${a11.sub(a12).sub(a21.sub(a22))}q<sub>2</sub> → q<sub>2</sub> = ${q[indexes.columns[1]]}, q<sub>1</sub> = ${q[indexes.columns[0]]}<br>`
        this.solveBox.innerHTML += '<br>'
    }
    else {
        return // TODO
    }

    this.solveBox.innerHTML += `<b>Оптимальная стратегия первого игрока (p)</b>: ${p.join(', ')}<br>`
    this.solveBox.innerHTML += `<b>Оптимальная стратегия второго игрока (q)</b>: ${q.join(', ')}<br>`
    this.solveBox.innerHTML += `<b>Цена игры</b>: ${v}<br>`
}