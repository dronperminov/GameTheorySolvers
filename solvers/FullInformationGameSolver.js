function FullInformationGameSolver(matrixBoxId, buttonId, solveBoxId) {
    this.matrixBox = document.getElementById(matrixBoxId)
    this.button = document.getElementById(buttonId)
    this.solveBox = document.getElementById(solveBoxId)

    this.button.addEventListener('click', () => this.Solve())
}

FullInformationGameSolver.prototype.MakeMatrixTable = function(matrix) {
    let table = document.createElement('div')
    table.className = 'matrix'

    for (let i = 0; i < matrix.length; i++) {
        let row = document.createElement('div')

        for (let j = 0; j < matrix[i].length; j++) {
            let cell = document.createElement('div')
            cell.className = 'matrix-cell'
            cell.innerHTML = matrix[i][j]
            row.appendChild(cell)
        }

        table.appendChild(row)
    }

    return table
}

FullInformationGameSolver.prototype.SplitMatrix = function(matrix, size) {
    let submatrices = []

    for (let i0 = 0; i0 < matrix.length; i0 += size) {
        for (let j0 = 0; j0 < matrix[0].length; j0 += size) {
            let submatrix = []

            for (let i = 0; i < size && i + i0 < matrix.length; i++) {
                submatrix[i] = []

                for (let j = 0; j < size && j + j0 < matrix[0].length; j++)
                    submatrix[i][j] = matrix[i + i0][j + j0]
            }

            submatrices.push(submatrix)
        }
    }

    return submatrices
}

FullInformationGameSolver.prototype.GetIndexes = function(n, m, size) {
    let indexesN = []
    let indexesM = []

    for (let i = 0; i < n; i += size) {
        indexesN[i / size] = []

        for (let j = 0; j < size; j++)
            indexesN[i / size].push(i + j)
    }

    for (let i = 0; i < m; i += size) {
        indexesM[i / size] = []

        for (let j = 0; j < size; j++)
            indexesM[i / size].push(i + j)
    }

    return { n: indexesN, m: indexesM }
}

FullInformationGameSolver.prototype.MakeNode = function(value, left = null, right = null) {
    return { value: value, left: left, right: right }
}

// матрица 2 на 2
FullInformationGameSolver.prototype.SubmatrixToTree = function(matrix) {
    let a11 = this.MakeNode(matrix[0][0])
    let a12 = this.MakeNode(matrix[0][1])
    let a21 = this.MakeNode(matrix[1][0])
    let a22 = this.MakeNode(matrix[1][1])

    let left = this.MakeNode(a11.value.min(a12.value), a11, a12)
    let right = this.MakeNode(a21.value.min(a22.value), a21, a22)

    return this.MakeNode(left.value.max(right.value), left, right)
}

FullInformationGameSolver.prototype.TreeHeight = function(node) {
    if (node == null)
        return 0

    return 1 + Math.max(this.TreeHeight(node.left), this.TreeHeight(node.right))
}

FullInformationGameSolver.prototype.MakeCanvas = function(id) {
    let canvas = document.createElement('canvas')
    canvas.id = id
    return canvas
}

FullInformationGameSolver.prototype.EvaluateCoordinates = function(node, level, height, index) {
    if (node == null)
        return

    this.EvaluateCoordinates(node.left, level + 1, height, 2*index + 1)
    this.EvaluateCoordinates(node.right, level + 1, height, 2*index + 2)

    node.x = (index + 1.5) / (1 << level) - 1
    node.y = (level + 0.5) / height
    node.color = '#000'
    node.isMin = null
    node.level = level
    node.pathIndex = 2 - (index % 2)

    if (level == height - 1)
        return

    node.isMin = (height - level) % 2 == 0
    node.color = node.isMin ? '#0078d4' : '#ffaa44'
    node.text = node.isMin ? 'min' : 'max'
}

FullInformationGameSolver.prototype.DrawLine = function(ctx, x1, y1, x2, y2, color = '#000', width = 1) {
    ctx.strokeStyle = color
    ctx.lineWidth = width

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

FullInformationGameSolver.prototype.DrawText = function(ctx, x, y, text) {
    ctx.font = '16px Consolas'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#000'
    ctx.fillText(text, x, y)
}

FullInformationGameSolver.prototype.DrawNodes = function(node, width, height, radius, ctx, needPath) {
    if (node == null)
        return

    let x = width * node.x
    let y = height * node.y

    if (node.left != null) {
        let x1 = width * node.left.x
        let y1 = height * node.left.y
        
        if (node.isMin !== null && node.value.eq(node.left.value)) {
            this.DrawLine(ctx, x1, y1, x, y, '#00ad56', 3)
        }
        else {
            this.DrawLine(ctx, x1, y1, x, y)
        }

        if (needPath) {
            this.DrawText(ctx, (x + x1) / 2 - 15, (y + y1) / 2 - 5, `${'αβij'[node.left.level - 1]}=${node.left.pathIndex}`)
        }
    }

    if (node.right != null) {
        let x1 = width * node.right.x
        let y1 = height * node.right.y

        if (node.isMin !== null && node.value.eq(node.right.value)) {
            this.DrawLine(ctx, x1, y1, x, y, '#00ad56', 3)
        }
        else {
            this.DrawLine(ctx, x1, y1, x, y)
        }

        if (needPath) {
            this.DrawText(ctx, (x + x1) / 2 + 15, (y + y1) / 2 - 5, `${'αβij'[node.right.level - 1]}=${node.right.pathIndex}`)
        }
    }

    // рисуем поддеревья
    this.DrawNodes(node.left, width, height, radius, ctx, needPath)
    this.DrawNodes(node.right, width, height, radius, ctx, needPath)

    ctx.beginPath()
    ctx.strokeStyle = node.color
    ctx.lineWidth = 2
    ctx.fillStyle = '#fff'
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '16px Consolas'
    ctx.fillStyle = node.color
    ctx.fillText(node.value, x, y)

    if (node.text) {
        ctx.font = '12px Consolas'
        ctx.textBaseline = 'bottom'
        ctx.fillText(node.text, x, y - radius)  
    }
}

FullInformationGameSolver.prototype.DrawTree = function(tree, canvasId, needPath = false) {
    let padding = 10
    let radius = 15
    let treeHeight = this.TreeHeight(tree)

    let width = treeHeight <= 3 ? 200 : 800
    let height = treeHeight <= 3 ? 150 : 300

    let canvas = document.getElementById(canvasId)
    canvas.width = width
    canvas.height = height

    let ctx = canvas.getContext('2d')
    
    this.EvaluateCoordinates(tree, 0, treeHeight, 0)
    this.DrawNodes(tree, width, height, radius, ctx, needPath)
}

FullInformationGameSolver.prototype.MakeInitialTreeTables = function(submatrices, size) {
    let table = document.createElement('table')
    let tr = document.createElement('tr')

    for (let i = 0; i < submatrices.length; i++) {
        let cell = document.createElement('td')

        cell.style.border = '1px solid #000'
        cell.style.padding = '0 10px'
        cell.innerHTML += `<b>Строим дерево для M<sub>${Math.floor(i / size) + 1}</sub>, N<sub>${(i % size) + 1}</sub></b>:<br>`
        cell.appendChild(this.MakeMatrixTable(submatrices[i]))
        cell.appendChild(this.MakeCanvas(`canvas-${i}`))

        tr.appendChild(cell)
    }

    table.appendChild(tr)
    this.solveBox.appendChild(table)
}

FullInformationGameSolver.prototype.FindStrategies = function(node, level, strategy = [], strategies = []) {
    if (node == null) {
        return
    }

    if (node.left == null && node.right == null) {
        strategies.push(strategy)
        return
    }

    if (node.value.eq(node.left.value)) {
        this.FindStrategies(node.left, level + 1, strategy.concat([1]), strategies)
    }

    if (node.value.eq(node.right.value)) {
        this.FindStrategies(node.right, level + 1, strategy.concat([2]), strategies)
    }
}

FullInformationGameSolver.prototype.PrintStrategy = function(strategy, index) {
    this.solveBox.innerHTML += `α<sup>${index}</sup> = ${strategy[0]}, `
    this.solveBox.innerHTML += `β<sup>${index}</sup>(${strategy[0]}) = ${strategy[1]}, `
    this.solveBox.innerHTML += `i<sup>${index}</sup>(${strategy[0]}, ${strategy[1]}) = ${strategy[2]}, `
    this.solveBox.innerHTML += `j<sup>${index}</sup>(${strategy[0]}, ${strategy[1]}, ${strategy[2]}) = ${strategy[3]}<br>`
}

FullInformationGameSolver.prototype.Solve = function() {
    try {
        let matrix = ParseMatrix(this.matrixBox.value)

        if (matrix.length != 4 || matrix[0].length != 4)
            throw "Извините, только 4 на 4..."

        let size = 2
        let submatrices = this.SplitMatrix(matrix, size)
        let indexes = this.GetIndexes(matrix.length, matrix[0].length, size)
        let subtrees = submatrices.map((m) => this.SubmatrixToTree(m))

        let left = this.MakeNode(subtrees[0].value.min(subtrees[1].value), subtrees[0], subtrees[1])
        let right = this.MakeNode(subtrees[2].value.min(subtrees[3].value), subtrees[2], subtrees[3])
        let tree = this.MakeNode(left.value.max(right.value), left, right)

        this.solveBox.innerHTML = `<h2>Решение</h2>`
        this.solveBox.innerHTML += `<b>Введённая матрица</b>:<br>`
        this.solveBox.appendChild(this.MakeMatrixTable(matrix))

        this.solveBox.innerHTML += `<br><b>Разбиваем матрицу на блоки размера ${size}х${size}</b>:<br>`
        this.solveBox.innerHTML += `<b>Множества строк</b>: ` + indexes.n.map((indexes, i) => `M<sub>${i + 1}</sub> = {${indexes.map((v) => v + 1).join(', ')}}`).join(', ') + '<br>'
        this.solveBox.innerHTML += `<b>Множества столбцов</b>: ` + indexes.m.map((indexes, i) => `N<sub>${i + 1}</sub> = {${indexes.map((v) => v + 1).join(', ')}}`).join(', ') + ''

        this.MakeInitialTreeTables(submatrices, size)

        this.solveBox.innerHTML += `<br><b>Итоговое дерево игры:</b><br>`
        this.solveBox.appendChild(this.MakeCanvas(`canvas-tree`))

        this.solveBox.innerHTML += `<br><b>Цена игры v:</b> ${tree.value}<br>`
        this.solveBox.innerHTML += `<b>Оптимальные стратегии игроков:</b><br>`

        let strategies = []
        this.FindStrategies(tree, 0, [], strategies)

        for (let i = 0; i < strategies.length; i++)
            this.PrintStrategy(strategies[i], i)

        for (let i = 0; i < submatrices.length; i++) {
            this.DrawTree(subtrees[i], `canvas-${i}`)
        }

        this.DrawTree(tree, `canvas-tree`, true)
    }
    catch (error) {
        alert(error)

    }
}