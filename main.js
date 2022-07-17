setTimeout(function () {
console.log("Waiting for website to load...")
}, 10);

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function checkBox(colNumber, RowNumber, Rows)
{
    const valid = [];
    if (!RowNumber)
    {
        return valid;
    }

    let startCol = Math.floor(colNumber / 3) * 3;
    let endCol = startCol + 3;

    let startRow = Math.floor(RowNumber / 3) * 3;
    let endRow = Math.min(startRow + 3, Rows.length);

    for (let i = startCol; i < endCol; ++i)
    {
        for (let j = startRow; j < endRow; ++j)
        {
            const item = Rows[j][i];
            if (item !== undefined)
            {
                valid.push(item);
            }
        }
    }

    return valid;
}

const checkColumn = (colNumber, Rows) =>
{
    const col = [];
    for (let i = 0; i < Rows.length; ++i)
    {
        const Row = Rows[i];
        col.push(Row[colNumber]);
    }
    return col;
};




const genRow = (Rows) =>
{
    const Row = [];
    let selectables = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 9; ++i)
    {
        const column = checkColumn(i, Rows);

        let allowed;

        // Remove column items
        allowed = isValid(column, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

        // Remove Row items
        allowed = isValid(Row, allowed);

        // remove Box items
        const Box = checkBox(i, Rows.length, Rows);
        allowed = isValid(Box, allowed);

        const random = allowed.length > 1 ? Math.floor(Math.random() * allowed.length) : 0;

        const chosen = allowed[random];
        if (chosen === undefined)
        {
            return false;
        }
        Row.push(chosen);

        selectables.splice(selectables.indexOf(chosen), 1);
    }

    return Row;
};

const genSudoku = () =>
{
    let iterations;
    do
    {
        const grid = [];
        iterations = 0;
        do
        {
            ++iterations;
            if (iterations > 500)
            {
                iterations = -1;
                // Invalid
                break;
            }

            const Row = genRow(grid);
            if (!Row)
            {
                continue;
            }
            grid.push(Row);


        } while (grid.length < 9);

        if (iterations !== -1)
        {
            return grid;
        }

    } while (true);

};

const isValid = (column, picks) =>
{
    const choosable = [];
    for (let i = 0; i < picks.length; ++i)
    {
        const pick = picks[i];
        if (!column.includes(pick))
        {
            choosable.push(pick);
        }
    }
    return choosable;
};

var CellContainer = document.getElementById('cell-container')
const sudoku = genSudoku()

let added = 0

for (var i = 1; i < 82; i++) {
  var Grid = document.createElement('div')
  var Label = document.createElement('Label')

  for (let j = 0; j < 9; ++j) {
    const Row = sudoku[j]
    for (let n = 0; n < 9; ++n) {
         const number = Row[n]
         if (i == (j*9)+(n+1)) {
           Label.setAttribute('num', number)
         }
   }
  }

  if (randomIntFromInterval(0,54-added) <= (54-added)/2 && added <= 54) {
    added += 1
    Label.innerHTML = Label.getAttribute('num')
  }

  Label.setAttribute('id',"content")

  Grid.append(Label)

  Grid.setAttribute('class', 'grid')
  Grid.setAttribute('id', i)

  switch (i) {
    case 1:
    Grid.style.borderTopLeftRadius = '5px'
    break;
    case 9:
    Grid.style.borderTopRightRadius = '5px'
    break;
    case 73:
    Grid.style.borderBottomLeftRadius = '5px'
    break;
    case 81:
    Grid.style.borderBottomRightRadius = '5px'
    break;
  }

  CellContainer.append(Grid)
}
