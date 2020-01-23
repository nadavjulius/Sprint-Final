'use strict'

const MINE = {
    minesAroundCount: '💣',
    isFlag: false,
    isMine: true,
    isMarked: false,
};

var gGameOver = false;
var gGameIsOn = false;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gMarkedHintedNegs = [];
var gLivesCount = 3;
var gHintCounter = 3;
var gFlagCount = gLevel.MINES;
var gCellCount = (gLevel.SIZE ** 2) - gLevel.MINES;
var gElSelctedCell = null;

function init() {
    // pre-setting the high scores
    var easyHighscore = localStorage.getItem('easyHighscore');
    document.querySelector('.ehighscore').innerHTML = "Easy High Score: " + easyHighscore;
    var mediumHighscore = localStorage.getItem('mediumHighscore');
    document.querySelector('.mhighscore').innerHTML = "Less Easy High Score: " + mediumHighscore;
    var hardHighscore = localStorage.getItem('hardHighscore');
    document.querySelector('.hhighscore').innerHTML = "Least Easy High Score: " + hardHighscore;

    gGameIsOn = false;
    gBoard = buildBoard();
    renderBoard(gBoard);
    gLivesCount = 3;
    for (var i = 0; i < gLivesCount; i++) {
        var elLives = document.querySelector(`.lives${i}`);
        elLives.innerHTML = '💊';
    }
}

// Builds the board and places mines randomly
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isHinted: false,
                isFlag: false,
                isMine: false,
                isMarked: false,
            };
        }
    }
    return board;
}

// Renders the board
function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j].minesAroundCount;
            var className = 'cell';
            var tdId = 'cell-' + i + '-' + j;
            strHTML += '<td id="' + tdId + '" oncontextmenu="rightCellClicked(event)" onclick="cellClicked(this)" class="' + className + ' hide">' + cell + '</td>';
        }
        strHTML += '</tr>';
    }
    strHTML += '</table></tbody>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

// Set the mines and then the numbers bassed on placed mines
function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var idxI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var idxJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (gBoard[idxI][idxJ].isMarked === true) {
            i--;
            continue;
        } else if (gBoard[idxI][idxJ].minesAroundCount === '💣') {
            i--;
            continue;
        } else {
            var mineClone = {};
            mineClone = { ...MINE };
            gBoard[idxI][idxJ] = mineClone;
        }
    }

    // looops over the bored cells
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (gBoard[i][j].minesAroundCount === '💣') continue;
            var numOfMines = countMines(i, j);
            gBoard[i][j].minesAroundCount = numOfMines;

        }
    }
    renderBoard(gBoard);
}

// counts negs for gboared number placement
function countMines(posI, posJ) {
    var minesCount = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].minesAroundCount === '💣') minesCount++;
        }
    }
    return minesCount;
}

// flag placement
function rightCellClicked(e) {
    // cellCoord is a object with i and j keys
    var cellCoord = getCellCoord(e.target.id);
    var cellI = cellCoord.i;
    var cellJ = cellCoord.j;
    var elCellId = document.getElementById(`cell-${cellI}-${cellJ}`)
    // do i need you?
    // if (gBoard[cellI][cellJ].isMarked && gLivesCount === 0) return;
    // do i need you?

    if (elCellId.classList.contains('flag')) {
        elCellId.classList.remove('flag')
        gFlagCount++;
    } else {
        elCellId.classList.add('flag')
        gFlagCount--;
        if (gCellCount <= 0 && gFlagCount === 0) {
            console.log('YOU WIN!');
            document.querySelector('.reset').innerHTML = '😎'
            endGame();
            return;
        }
    }
    e.preventDefault();
    return false;
}


function cellClicked(elCell) {
    if (gGameOver) return;
    if (elCell.classList.contains('flag')) return;
    // cellCoord is a object with i and j keys
    var cellCoord = getCellCoord(elCell.id);
    var cellI = cellCoord.i
    var cellJ = cellCoord.j

    // so user cant reduce the cellcount counter on already clicked cells
    if (gBoard[cellI][cellJ].isMarked) return;
    gBoard[cellI][cellJ].isMarked = true;
    elCell.classList.remove('hide')

    // this is for the first click
    if (!gGameIsOn) {
        gGameIsOn = true;
        stopwatch.restart();
        setMinesNegsCount(gBoard);
        var elCellById = document.getElementById(`cell-${cellI}-${cellJ}`)
        elCellById.classList.remove('hide')
    }
    // the hint
    if (gBoard[cellI][cellJ].isHinted === true) {
        gGameOver = true;
        gMarkedHintedNegs = [];
        openSafeNegs(cellI, cellJ);
        // closing the hint
        setTimeout(function () {
            gGameOver = false;
            gHintCounter--;
            gCellCount--;
            console.log(gCellCount);
            gBoard[cellI][cellJ].isHinted = false;
            elCell.classList.remove('safe');
            closeSafeNegs(cellI, cellJ);
            if (gHintCounter === 2) {
                document.querySelector('.hint').innerHTML = '2️⃣'
            } else if (gHintCounter === 1) {
                document.querySelector('.hint').innerHTML = '1️⃣'
            } else if (gHintCounter === 0) {
                document.querySelector('.hint').innerHTML = '0️⃣'
            }

        }, 1000);
        return;
    }
    // you clicked on a MINE!
    if (elCell.innerHTML === '💣') {
        if (gLivesCount > 0) {
            gLivesCount--;
            var elLives = document.querySelector(`.lives${gLivesCount}`)
            elLives.innerHTML = null;
            setTimeout(function () {
                elCell.classList.add('hide')
            }, 1000);
            return;
        }
        console.log('YOU LOOSE MADAFAKA');
        var audio = new Audio('sound/bomb.mp3');
        audio.play();
        var allCells = document.querySelectorAll('.cell')
        for (var i = 0; i < allCells.length; i++) {
            if (allCells[i].innerHTML === '💣') {
                allCells[i].classList.remove('hide');
            }
        }
        document.querySelector('.reset').innerHTML = '😬';
        endGame();
        return;
    }
    // if you made it this far your a number and were reducing the num count - congrats!
    gCellCount--;
    console.log(gCellCount);

    // if you make it in here you're a winner - you get a cookie
    if (gCellCount === 0 && gFlagCount === 0) {
        console.log('WINNER WINNER CHICKEN DINNER!');
        document.querySelector('.reset').innerHTML = '😎';
        endGame();
        return;
    }

    // opening negs when zero is clicked
    if (gBoard[cellI][cellJ].minesAroundCount === 0) {
        var elCellById = document.getElementById(`cell-${cellI}-${cellJ}`)
        elCellById.classList.remove('hide')
        openNonMineNegs(cellI, cellJ);
    }
}

// 
// END OF CELL CLICKED
// 

function openNonMineNegs(posI, posJ) {
    if (gBoard[posI][posJ].minesAroundCount > 0) return;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].minesAroundCount === '💣') continue;
            if (gBoard[i][j].isMarked) continue;
            // open the Neg
            gCellCount--;
            console.log(gCellCount);
            gBoard[i][j].isMarked = true;
            var elCurrCellId = document.getElementById(`cell-${i}-${j}`)
            elCurrCellId.classList.remove('hide')
            if (gCellCount === 0 && gFlagCount === 0) {
                console.log('YOU WIN!');
                document.querySelector('.reset').innerHTML = '😎'
                endGame();
                return;
            }

            // Recursive open
            var cellCoord = getCellCoord(elCurrCellId.id);
            var cellI = cellCoord.i;
            var cellJ = cellCoord.j;
            var currNegCell = gBoard[i][j];

            if (currNegCell.minesAroundCount === 0) openNonMineNegs(cellI, cellJ);
        }
    }
}


// all roads lead here in the end
function endGame() {
    gGameOver = true;
    stopwatch.stop();
    // high score happens here
    if (gCellCount <= 0 && gFlagCount === 0) {
        if (gLevel.SIZE === 4) {
            // easy
            var score = document.querySelector('.stopwatch').innerHTML;
            var easyHighscore = localStorage.getItem('easyHighscore');

            if (!easyHighscore || score < easyHighscore) {
                localStorage.setItem('easyHighscore', score);
            }
            document.querySelector('.ehighscore').innerHTML = "Easy High Score: " + easyHighscore;

        } else if (gLevel.SIZE === 8) {
            // medium
            var score = document.querySelector('.stopwatch').innerHTML;
            var mediumHighscore = localStorage.getItem('mediumHighscore');

            if (!mediumHighscore || score < mediumHighscore) {
                localStorage.setItem('mediumHighscore', score);
            }
            document.querySelector('.mhighscore').innerHTML = "Less Easy High Score: " + mediumHighscore;
        } else if (gLevel.SIZE === 12) {
            // hard
            var score = document.querySelector('.stopwatch').innerHTML;
            var hardHighscore = localStorage.getItem('hardHighscore');

            if (!hardHighscore || score < hardHighscore) {
                localStorage.setItem('hardHighscore', score);
            }
            document.querySelector('.hhighscore').innerHTML = "Least Easy High Score: " + hardHighscore;
        }

    }
}


function reset() {
    gGameOver = false;
    gGameIsOn = false;
    stopwatch.stop();

    document.querySelector('.reset').innerHTML = '😊'
    gCellCount = (gLevel.SIZE ** 2) - gLevel.MINES;
    gFlagCount = gLevel.MINES;
    init();
}


function easy() {
    gGameOver = false;
    gGameIsOn = false;
    stopwatch.stop();
    gLevel = {
        SIZE: 4,
        MINES: 2
    };
    document.querySelector('.reset').innerHTML = '😊'
    gCellCount = (gLevel.SIZE ** 2) - gLevel.MINES;
    gFlagCount = gLevel.MINES;
    init();
}

function medium() {
    gGameOver = false;
    gGameIsOn = false;
    stopwatch.stop();
    gLevel = {
        SIZE: 8,
        MINES: 12
    };
    document.querySelector('.reset').innerHTML = '😊'
    gCellCount = (gLevel.SIZE ** 2) - gLevel.MINES;
    gFlagCount = gLevel.MINES;
    init();
}

function hard() {
    gGameOver = false;
    gGameIsOn = false;
    stopwatch.stop();
    gLevel = {
        SIZE: 12,
        MINES: 30
    };
    document.querySelector('.reset').innerHTML = '😊'
    gCellCount = (gLevel.SIZE ** 2) - gLevel.MINES;
    gFlagCount = gLevel.MINES;
    init();
}

// the hint finds safe cell for user to click and flashs its negs for 1 sec
function hint() {
    if (gHintCounter <= 0) return;
    var elAllCells = document.querySelectorAll('.cell')
    for (var i = 0; i < 1; i++) {
        var randomElCellNum = getRandomIntInclusive(0, (gLevel.SIZE ** 2))
        var elSafeCell = elAllCells[randomElCellNum]
        if (elSafeCell.innerHTML === '💣') {
            i--;
            continue;
        }
        var cellCoord = getCellCoord(elSafeCell.id);
        var cellI = cellCoord.i
        var cellJ = cellCoord.j
        // to make sure we dont reveal clicked cells
        if (gBoard[cellI][cellJ].isMarked === true) {
            i--;
            continue;
        }
        elSafeCell.classList.add('safe')
        gBoard[cellI][cellJ].isHinted = true;
    }
}

// neg Count For Safe Hint
function openSafeNegs(posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            var elCurrCellId = document.getElementById(`cell-${i}-${j}`)
            if (gBoard[i][j].isMarked) gMarkedHintedNegs.push({ i: i, j: j })
            elCurrCellId.classList.remove('hide')
        }
    }
}

function closeSafeNegs(posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            var elCurrCellId = document.getElementById(`cell-${i}-${j}`)
            elCurrCellId.classList.add('hide')
        }
    }
    // re-marks the marked cells + the hinted cell
    for (i = 0; i < gMarkedHintedNegs.length; i++) {
        var long = gMarkedHintedNegs[i].i;
        var lat = gMarkedHintedNegs[i].j;
        var elCurrCellId = document.getElementById(`cell-${long}-${lat}`)
        elCurrCellId.classList.remove('hide')
    }
}

function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}

// we go dark here - yes, its super cool
function darkmode(elDark) {

    if (elDark.innerHTML === '🌖') {
        elDark.innerHTML = '🌘';
        document.body.style.backgroundColor = "black";
        document.body.style.color = 'white';
    } else if (elDark.innerHTML === '🌘') {
        elDark.innerHTML = '🌖';
        document.body.style.backgroundColor = "whitesmoke";
        document.body.style.color = 'black';
    }
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


