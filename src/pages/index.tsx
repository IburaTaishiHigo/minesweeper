import { useEffect, useState } from 'react';
import styles from './index.module.css';
import type { MouseEvent } from 'react';



// number × number の二次元配列
//      ": number" は左にいるやつの型を数値型にするもの
const createBoard = (width: number, height: number, value: number) => {
  //
  //                 左の変数の
  //                 性質を示す
  //      (変数名)    (型注釈)
  const newBoard: number[][] = [];
  for (let i = 0; i < height; i++) {
    const row: number[] = [];
    for (let j = 0; j < width; j++) {
      //  valueをrowに入れる
      row.push(value);
    }
    //  newBoardにrowつまり一列分追加される
    newBoard.push(row);
  }
  return newBoard;
};

//  状態

// つまり以下の一文は
// "useState"でステート変数(userInputs)とかステート更新関数(setUserInputs)を呼び出す
// "<number[][]>"でこれから右でいうやつは二次元配列ですよって言う
// "(createBoard(9, 9, 0))"で9×9ですべての要素が0の番を作ってそれをuseStateに返す

//   useStateの , ステート変数の値  = ステート変数と             useStateに
//   現在の値  , を変えるための関数 = ステート更新関数            値を返す
//                                   を呼び出す
// (ステート変数), (ステート更新関数) = ための関数   <型引数>      (戻り値)
//                                             ※型注釈ではない

const [userInputs, setUserInputs] = useState<number[][]>(createBoard(9, 9, 0));
const [bombMap, setBombMap] = useState<number[][]>(createBoard(9, 9, 0));
const [time, setTime] = useState({
  startTime: 0,
  currentTime: 0,
});

// gameStateを数値リテラル型で、０or1or2or3のどれかという性質をいって、初期値は0ですという
//
// userInputsの1"行"目の長さ
//
// userInputsの状態を考えてみよう
// userInputs = [[0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0]...etc]となっている
// これのuserInputs.lengthとは上の二次元配列の一番外の[]で見た時のその中に入っている[]の個数を数えることになる
// そしてuserInputsは小さい[]が縦に9個並んだやつだからちょうど縦の列と同じ数になるよねっていうこと
const gameState: 0 | 1 | 2 | 3 = 0;
const boardWidth: number = userInputs[0].length;
const boardHeight: number = userInputs.length;
// 要素がすべて-1になる理由はよくわからないので後で確認
const board: number[][] = createBoard(boardWidth, boardHeight, -1);

// 八方を-1,0,1の数字を使って表現（オセロと一緒）
const dirList: number[][] = [
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
];

// booleanはブーリアン変数といい、": boolean"で左のやつは真偽値しかとらないことを示す
//  .every((row) => {
//    return row.every((cell) => {
//      return cell !== 1;
//    });
//  })
//とも書けるらしい
//
//      解説
//  1. "userInputs.every()"で行を調べる
//  2. rowを引数にとる（rowという名前は別になんでもいい）
//  3. "row.every()"でその行の中のマスを調べる
//  4. cellを引数にとる
//  5. "cell !== 1"でcellが1以外の数字の場合はtrueを返す
const isFirst: boolean = userInputs.every((row) => row.every((cell) => cell !== 1));

//    空白連鎖
// 0は爆弾あり
// 1は爆弾なし
//
// pythonだと for a in bとできたが、javaではfor(条件)｛処理｝となっているので条件のところにforを書けない
// なのでfor (const a of/in b)とすると解決
//
//  "bombMap[y + dir[1]]"でbombMapの行を調べる
//  dir[1]は-1か0か1が入るので"bombMap[y + dir[1]] !== undefined"がそこか上か下に必ず盤面があるを表す
//  "bombMap[y + dir[1]][x + dir[0]]"が8方向を示していることは自明
//  "bombMap[y + dir[1]][x + dir[0]] === 1"で8方向に爆弾がないことを表す
//  つまりbombMap[y + dir[1]] !== undefined && bombMap[y + dir[1]][x + dir[0]] === 1で上下は盤面があるかつ8方向のどれかに爆弾がないことを示す
// "bombs === 0"で盤面がないか爆弾があるということを示す
// "board[y + dir[1]] !== undefined"で上下のどちらかに盤面がない
//
// -1 -> 石
// 0 -> 画像無しセル
// 1~8 -> 数字セル
// 9 -> 石 + はてな
// 10 -> 石 + 旗
// 11 -> ボムセル
//
// "board[y + dir[1]][x + dir[0]] === -1 ||
//  board[y + dir[1]][x + dir[0]] === 9 ||
//  board[y + dir[1]][x + dir[0]] === 10"で8方向のどこかが石 または 石+はてな または 石+旗がある
// つまりboard[y + dir[1]] !== undefined &&
// (board[y + dir[1]][x + dir[0]] === -1 ||
// board[y + dir[1]][x + dir[0]] === 9 ||
// board[y + dir[1]][x + dir[0]] === 10)で上下の盤面がないかつ8方向のどこかが石 または 石+はてな または 石+旗がある
const checkAround = (x: number, y: number) => {
  let bombs = 0;
  for (const dir of dirList) {
    if (bombMap[y + dir[1]] !== undefined && bombMap[y + dir[1]][x + dir[0]] === 1) {
      bombs++;
    }
  }

  // boardのy行x列に爆弾を設置
  // [y][x]という順番になっている理由は配列やリストなどのデータ構造を扱うときは「行→列」という順番になっているから
  board[y][x] = bombs;

  if (bombs === 0) {
    for (const dir of dirList) {
      if (
        board[y + dir[1]] !== undefined &&
        (board[y + dir[1]][x + dir[0]] === -1 ||
          board[y + dir[1]][x + dir[0]] === 9 ||
          board[y + dir[1]][x + dir[0]] === 10)
      ) {
        checkAround(x + dir[0], y + dir[1]);
      }
    }
  }
};

  // 爆弾を配置
// "JSON.stringify(bombMap)"でほかのパソコンにも共有できるような特殊な二次元配列に変換
// このままではコンピュータが理解できないから"JSON.parse()"でパソコンが理解できる二次元配列に変換
// "newBombMap"がほかのパソコンに共有できてかつパソコンが理解できるような二次元配列
//
// Math.random() * boardWidth * boardHeightで0~81までの小数を出す
// Math.floor(Math.random() * boardWidth * boardHeight)で整数を出す 
//
// その場所に爆弾がないかつおける場所すべてだった場合（条件）、爆弾を一つ置く
// これを10回繰り返す
// "setBombMap(newBombMap);"でステート更新関数を使い、newBombMapを引数として扱うことによってステート関数（bombMap）にそのnewBombMapが渡され値が更新される
const setBomb = (cannotPutX: number, cannotPutY: number) => {
  let bombs = 0;
  const newBombMap: number[][] = JSON.parse(JSON.stringify(bombMap));
  while (bombs < 10) {
    const n = Math.floor(Math.random() * boardWidth * boardHeight);
    const x = n % boardWidth;
    const y = Math.floor(n / boardWidth);
    if (newBombMap[y][x] === 0 && !(x === cannotPutX && y === cannotPutY)) {
      newBombMap[y][x] = 1;
      bombs++;
    }
  }
  setBombMap(newBombMap);
};

  // 爆弾をクリック時
// "bombMap[j][i] && userInputs[j][i] < 2"で「爆弾があるマス目」かつ「そのマス目が2回未満クリックされた」の時
// board[j][i]がボムセルになるということを示しているらしいが、よくわからないので後で確認
 const burstBomb = (x: number, y: number) => {
  gameState = 3;
  for (let i = 0; i < boardWidth; i++) {
    for (let j = 0; j < boardHeight; j++) {
      if (bombMap[j][i] && userInputs[j][i] < 2) {
        board[j][i] = 11;
      }
    }
  }
  board[y][x] = 12;
};

  // 数字クリックした時
  const clickNumber = (x: number, y: number) => {
    let flagCount = 0;
    let bombs = 0;
    for (const dir of dirList) {
      if (board[y + dir[1]] !== undefined && board[y + dir[1]][x + dir[0]]) {
        flagCount += userInputs[y + dir[1]][x + dir[0]] === 3 ? 1 : 0;
        bombs += bombMap[y + dir[1]][x + dir[0]];
      }
    }
    if (flagCount === bombs) {
      const newUserInputs: (0 | 1 | 2 | 3)[][] = JSON.parse(JSON.stringify(userInputs));
      for (const dir of dirList) {
        if (board[y + dir[1]] !== undefined && board[y + dir[1]][x + dir[0]] < 9) {
          newUserInputs[y + dir[1]][x + dir[0]] = 1;
        }
      }
      setUserInputs(newUserInputs);
    }
  };


export default Home;
