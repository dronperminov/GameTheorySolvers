function BimatrixStackelbergEquilibrium(matrixBox1Id, matrixBox2Id, buttonId, solveBoxId) {
    this.matrix1Box = document.getElementById(matrixBox1Id)
    this.matrix2Box = document.getElementById(matrixBox2Id)
    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

BimatrixStackelbergEquilibrium.prototype.ArgmaxAtRow = function(matrix, row) {
    let imax = 0
    let imaxs = [0]

    for (let i = 1; i < matrix[row].length; i++) {
        if (matrix[row][i].gt(matrix[row][imax])) {
            imax = i
            imaxs = [i]
        }
        else if (matrix[row][i].eq(matrix[row][imax])) {
            imaxs.push(i)
        }
    }

    return imaxs
}

BimatrixStackelbergEquilibrium.prototype.MaxOfIndexesAtRow = function(matrix, row, indexes) {
    let imax = 0

    for (let i = 1; i < indexes.length; i++)
        if (matrix[row][indexes[i]].gt(matrix[row][indexes[imax]]))
            imax = i

    return matrix[row][indexes[imax]]
}

BimatrixStackelbergEquilibrium.prototype.FindPoints = function(matrix, value) {
    let points = []

    for (let i = 0; i < matrix.length; i++)
        for (let j = 0; j < matrix.length; j++)
            if (matrix[i][j].eq(value))
                points.push({ i: i, j: j })

    return points
}

BimatrixStackelbergEquilibrium.prototype.Solve = function() {
    let matrix1 = ParseMatrix(this.matrix1Box.value)
    let matrix2 = ParseMatrix(this.matrix2Box.value)

    if (matrix1.length != matrix2.length || matrix1[0].length != matrix2[0].length)
        throw "Размеры матриц должны совпадать"

    this.solveBox.innerHTML = `<h2>Решение</h2>`
    this.solveBox.innerHTML += `Y(i) = argmax<sub>1 &le; j &le; ${matrix1[0].length}</sub> b<sub>ij</sub><br>`
    this.solveBox.innerHTML += `W(i) = max<sub>j ∊ Y(i)</sub> a<sub>ij</sub><br>`
    this.solveBox.innerHTML += `(i<sup>0</sup>, j<sup>0</sup>): max<sub>1 &le; j &le; ${matrix1.length}</sub> W<sub>i</sub> = F<br><br>`

    let y = []
    let w = []
    let F = null

    for (let i = 0; i < matrix1.length; i++) {
        y[i] = this.ArgmaxAtRow(matrix2, i)
        w[i] = this.MaxOfIndexesAtRow(matrix1, i, y[i])

        F = i == 0 ? w[i] : F.max(w[i])

        this.solveBox.innerHTML += `<b>Y(${i + 1})</b> = {${y[i].map((v) => v + 1).join(', ')}}<br>`
    }

    this.solveBox.innerHTML += `<br>`

    for (let i = 0; i < matrix1.length; i++) {
        this.solveBox.innerHTML += `<b>W(${i + 1})</b> = ${w[i].html()}<br>`
    }

    this.solveBox.innerHTML += `<br><b>Ответ:<br>`
    this.solveBox.innerHTML += `<b>F</b> = ${F.html()}<br>`

    let points = this.FindPoints(matrix1, F)
    this.solveBox.innerHTML += `<b>(i<sup>0</sup>, j<sup>0</sup>)</b>: ${points.map((p) => '(' + (p.i + 1) + ', ' + (p.j + 1) + ')').join(', ')}<br>`
}