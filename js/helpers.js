function ParseMatrix(content) {
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