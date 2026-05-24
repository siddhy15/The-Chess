// script.js
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// Unicode map for crisp vector rendering
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    '': ''
};

// Capital letters = White pieces, Lowercase = Black pieces
let boardState = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['',  '',  '',  '',  '',  '',  '',  ''],
    ['',  '',  '',  '',  '',  '',  '',  ''],
    ['',  '',  '',  '',  '',  '',  '',  ''],
    ['',  '',  '',  '',  '',  '',  '',  ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let turn = 'W'; // 'W' = White, 'B' = Black
let selectedSquare = null;
let validMoves = [];

function createBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((r + c) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = r;
            square.dataset.col = c;
            
            const piece = boardState[r][c];
            square.textContent = pieces[piece] || '';
            
            // Contrast leveling for black vs white unicode symbols
            if (piece === piece.toLowerCase() && piece !== '') {
                square.style.color = '#000000';
            } else {
                square.style.color = '#ffffff';
                square.style.textShadow = '0px 1px 2px rgba(0,0,0,0.8)';
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            boardElement.appendChild(square);
        }
    }
}

function handleSquareClick(r, c) {
    const piece = boardState[r][c];
    const isWhitePiece = piece !== '' && piece === piece.toUpperCase();
    const isBlackPiece = piece !== '' && piece === piece.toLowerCase();

    // Execute move if clicking a valid target dot
    if (selectedSquare && validMoves.some(m => m.r === r && m.c === c)) {
        movePiece(selectedSquare.r, selectedSquare.c, r, c);
        return;
    }

    // Highlighting / Selection filtering based on who's turn it is
    if ((turn === 'W' && isWhitePiece) || (turn === 'B' && isBlackPiece)) {
        selectedSquare = { r, c };
        validMoves = getBasicMoves(r, c, piece);
        updateVisuals();
    } else {
        selectedSquare = null;
        validMoves = [];
        updateVisuals();
    }
}

function movePiece(fromR, fromC, toR, toC) {
    boardState[toR][toC] = boardState[fromR][fromC];
    boardState[fromR][fromC] = '';
    
    turn = turn === 'W' ? 'B' : 'W';
    statusElement.textContent = turn === 'W' ? "White's Turn" : "Black's Turn";
    
    selectedSquare = null;
    validMoves = [];
    createBoard();
}

function updateVisuals() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        const r = parseInt(sq.dataset.row);
        const c = parseInt(sq.dataset.col);
        
        sq.classList.remove('selected', 'valid-move');
        
        if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
            sq.classList.add('selected');
        }
        if (validMoves.some(m => m.r === r && m.c === c)) {
            sq.classList.add('valid-move');
        }
    });
}

function getBasicMoves(r, c, piece) {
    let moves = [];
    const type = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();
    const enemy = isWhite ? 'black' : 'white';

    function getPieceColor(row, col) {
        const p = boardState[row][col];
        if (!p) return null;
        return p === p.toUpperCase() ? 'white' : 'black';
    }

    function addSlideMove(dr, dc) {
        let currR = r + dr;
        let currC = c + dc;
        while (currR >= 0 && currR < 8 && currC >= 0 && currC < 8) {
            const col = getPieceColor(currR, currC);
            if (!col) {
                moves.push({r: currR, c: currC});
            } else {
                if (col === enemy) moves.push({r: currR, c: currC});
                break;
            }
            currR += dr;
            currC += dc;
        }
    }

    if (type === 'p') {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        if (r + dir >= 0 && r + dir < 8 && !boardState[r + dir][c]) {
            moves.push({r: r + dir, c});
            if (r === startRow && !boardState[r + 2 * dir][c]) {
                moves.push({r: r + 2 * dir, c});
            }
        }
        [-1, 1].forEach(dc => {
            const targetR = r + dir;
            const targetC = c + dc;
            if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
                if (getPieceColor(targetR, targetC) === enemy) moves.push({r: targetR, c: targetC});
            }
        });
    } 
    else if (type === 'n') {
        const offsets = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        offsets.forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (getPieceColor(nr, nc) !== (isWhite ? 'white' : 'black')) moves.push({r: nr, c: nc});
            }
        });
    }
    else if (type === 'b' || type === 'q') {
        addSlideMove(-1, -1); addSlideMove(-1, 1); addSlideMove(1, -1); addSlideMove(1, 1);
    }
    if (type === 'r' || type === 'q') {
        addSlideMove(-1, 0); addSlideMove(1, 0); addSlideMove(0, -1); addSlideMove(0, 1);
    }
    else if (type === 'k') {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    if (getPieceColor(nr, nc) !== (isWhite ? 'white' : 'black')) moves.push({r: nr, c: nc});
                }
            }
        }
    }
    return moves;
}

// Initial structural build
createBoard();
                         
