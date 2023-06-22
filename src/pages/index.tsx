import type { MouseEvent } from 'react';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

// number × number の二次元配列
//      ": number" は左にいるやつの型を数値型にするもの

const Home = () => {
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
  // gameStateがとりうるそれぞれの値の意味は以下の通り
  // 0: ゲーム開始前
  // 1: ゲーム中
  // 2: 勝利
  // 3: 敗北
  let gameState: 0 | 1 | 2 | 3 = 0;
  const boardWidth: number = userInputs[0].length;
  const boardHeight: number = userInputs.length;
  // boardのすべての要素が-1になることによってboardのすべてをいったん石にしている
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
  //  5. "cell !== 1"でcellが1以外の数字の場合はtrueを返す(つまりcellにボムが有ったらtrueでなかったらfalse)
  // 左クリックの処理のところを読めばわかるが、石のところは軒並み1になっている
  // つまり、石がないところはisFirstがtrueになる
  const isFirst: boolean = userInputs.every((row) => row.every((cell) => cell !== 1));

  //    空白連鎖
  // bombs = 0 : 爆弾あり
  // bombs = 1 : 爆弾なし
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
    const bombs = 0;
    for (const dir of dirList) {
      if (bombMap[y + dir[1]] !== undefined && bombMap[y + dir[1]][x + dir[0]] === 1) {
        bombs;
      }
    }

    // boardのy行x列に爆弾を設置
    // [y][x]という順番になっている理由は配列やリストなどのデータ構造を扱うときは「行→列」という順番になっているから
    // ||を使っているのは今回は真偽値を扱っているからである
    // 数値を扱っているとき: 「|」
    // 真偽値を扱っているとき: 「||」
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
  // "gameState = 3;"で敗北する変数であることを示す
  // "bombMap[j][i] && userInputs[j][i] < 2"で「爆弾があるマス目」かつ「そのマス目が2回未満クリックされた」の時
  // javascriptの性質として0がfalsyでそれ以外の値がtruthy
  // 今回の場合は、爆弾があればtruthyでなければfalsyである
  // また、&&は「かつ」を表すものではあるが、左がtrueでない限り右に進まないという性質がある
  // これらのことからbombMapがtrueつまり「1」、つまり「爆弾があるマス目」かつということになっている
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

  // 数字をクリックした時
  // 上の説明文よりわかるようにboard[y + dir[1]][x + dir[0]]がtrue(つまり爆弾がない)の時の次の処理が動くようになっている
  // "board[y + dir[1]] !== undefined && board[y + dir[1]][x + dir[0]]"でboardの上下の盤面があるかつ8方向に画像無しセル以外のセルがある場合、
  // userInputs[hoge][fuga] === 3が石に旗が立っているという設定になっているらしい <------要確認
  // "flagCount += userInputs[y + dir[1]][x + dir[0]] === 3 ? 1 : 0;"でuserが旗を立てた時に1、立てていないときに0
  // "bombs += bombMap[y + dir[1]][x + dir[0]];"で8方向の一つに爆弾があるかを調べて、あったらbombsの値が1増える
  //
  // "(board[y + dir[1]] !== undefined && board[y + dir[1]][x + dir[0]] < 9)"でもし「上下に盤面がある」かつ「石か画像無しセルか数字セル」であるとき
  // newUserInputsの八方向のどれかに1が入る
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

  // ゲームリセット
  const resetGame = () => {
    setUserInputs(createBoard(boardWidth, boardHeight, 0));
    setBombMap(createBoard(boardWidth, boardHeight, 0));
    setTime({
      startTime: 0,
      currentTime: 0,
    });
    gameState = 0;
  };

  // ゲームエンド
  // "ameState = 2;"より下のほうのif文が勝利することを示している
  // javascriptにはif(条件){処理}の処理の部分が一文だった場合、{};を省略できるという性質がある
  // つまり、if(条件)処理 と if(条件){処理} は同じ意味になる
  //
  // 特定のセルに「石」か「石 + はてな」か「石 + 旗」がある場合、stoneCountが1増える
  // どのような形であれ、石が10個とそれ以外は石ではない場合（ボムは10個しかないのでつまりそれらの石すべてがボムであるということになる）、
  // 見たセルがボムがあるセルだった場合、そのセルが「石 + 旗」になる
  const finishGame = () => {
    let stoneCount = 0;
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        if (board[y][x] === -1 || board[y][x] === 9 || board[y][x] === 10) stoneCount++;
      }
    }
    if (stoneCount === 10) {
      gameState = 2;
      for (let x = 0; x < boardWidth; x++) {
        for (let y = 0; y < boardHeight; y++) {
          if (bombMap[y][x] === 1) board[y][x] = 10;
        }
      }
    }
  };

  // 横に並ぶマスの数を変える
  const changeWidth = (width: number) => {
    if (width !== undefined && width > 0 && width < 100) {
      const height: number = userInputs.length;
      resetGame();
      setUserInputs(createBoard(width, height, 0));
      setBombMap(createBoard(width, height, 0));
    }
  };

  // 置ける旗の数
  // "count = 10"で旗が置ける使用制限があるらしく、それの最大値を10に設定
  // "userInputs[y][x] === 3"でそのセルに旗が立っているかを調べ、立っている場合はcountを1減らす
  const countCanPutFlag = (digit: 1 | 2 | 3) => {
    let count = 10;
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        if (userInputs[y][x] === 3) count--;
      }
    }
    switch (digit) {
      case 1:
        return Math.floor(Math.abs(count) % 10);
      case 2:
        return Math.floor((Math.abs(count) % 100) / 10);
      case 3:
        if (count < 0) {
          return 'minus';
        } else {
          return Math.floor(count / 100);
        }
    }
  };
  // ボードの計算値
  // "userInputs[y][x]が1"でそのセルに石がある場合、
  // "if (!isFirst && !bombMap[y][x]) checkAround(x, y)"で「初手じゃない」かつ「そのセルにボムがない」場合
  // "checkAround(x, y)"で空白連鎖をさせる
  // "if (bombMap[y][x] === 1) burstBomb(x, y)"でそのセルにボムがある場合、
  // "burstBomb(x, y)"でボムを爆発させる

  // case 3の場合、
  // userInputsでは、プレイヤーのアクションは以下のように表されます：

  // 2: プレイヤーがマスにフラグを立てた
  // 3: プレイヤーがマスに疑問符をつけた
  // 一方で、boardではそれぞれのアクションは別の値で表されます：

  // 9: プレイヤーがマスにフラグを立てた
  // 10: プレイヤーがマスに疑問符をつけた
  const setBoard = () => {
    if (!isFirst) gameState = 1;
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        switch (userInputs[y][x]) {
          case 1:
            if (!isFirst && !bombMap[y][x]) checkAround(x, y);
            if (bombMap[y][x] === 1) burstBomb(x, y);
            break;
          case 2:
          case 3:
            if (board[y][x] === -1) board[y][x] = userInputs[y][x] + 7;
            break;
        }
      }
    }
    finishGame();
  };
  setBoard();

  // 左クリックの処理
  // "event: MouseEvent<HTMLDivElement>"でhtmlのdiv要素で起きたマウスイベントを取得
  // "event.button === 0"でマウスの左ボタンが押された場合(※中央ボタンは1、右ボタンは2)
  // gameStateが0か1の場合(つまり「ゲーム開始前」か「ゲーム中」)、
  // 初手の場合、
  // gameStateを1(ゲーム中)に変更し、ボムを設置
  // そして、とりあえず時間を両方とも今にしている
  // "newUserInputs[y][x] = 1;"でそのマス目を開けた状態にした
  // ちなみに、newUserInputs[y][x]の値が示すものは以下のようになっていると予想される <--- これは間違い
  // 0: まだ開けていないマス目
  // 1: 開けたマス目
  // 2: 地雷があるマス目（あるいは他の特殊な状態）
  // 3: 何か他の特殊な状態
  //
  // "else if (board[y][x] > 0 && board[y][x] < 9)"でもしboard[y][x]が数字セルだった場合、
  //
  const clickLeft = (x: number, y: number, event: MouseEvent<HTMLDivElement>) => {
    if (event.button === 0 && gameState <= 1) {
      if (isFirst) {
        gameState = 1;
        setBomb(x, y);
        setTime({
          startTime: Date.now(),
          currentTime: Date.now(),
        });
      }
      if (board[y][x] === -1) {
        const newUserInputs: (0 | 1 | 2 | 3)[][] = JSON.parse(JSON.stringify(userInputs));
        newUserInputs[y][x] = 1;
        setUserInputs(newUserInputs);
      } else if (board[y][x] > 0 && board[y][x] < 9) {
        clickNumber(x, y);
      }
    }
  };

    //右クリックの処理
  // "event.preventDefault();"ですべてのデフォルトの動作をキャンセルして新しい動きを作る
  // "board[y][x] = -1"の場合、
  // newUserInputs[y][x]がもつそれぞれの値の意味は以下のようになっている
  // 0: まだ開けていないマス目
  // 1: 左クリックで開けたマス目
  // 2: 右クリックではてなを立てたマス目
  // 3: 右クリックでフラグをつけたマス目
  //
  // "case -1:
  // newUserInputs[y][x] = 3;
  // board[y][x] = 10;
  // break;"
  // でそのマス目に石がある場合、
  // 公開される形の盤面のそのマス目にフラグを立てて、board上の盤面にもフラグを立てる
  // "case 9:
  // newUserInputs[y][x] = 0;
  // board[y][x] = 0;
  // break;"
  // でそのマス目に石とはてな場合、
  // 公開される形の盤面のそのマス目は何もない状態にリセットして、board上の盤面も何もない状態にリセット
  // "case 10:
  // newUserInputs[y][x] = 2;
  // board[y][x];
  // break;"
  // でそのマス目に石と旗がある場合、
  // 公開される形の盤面のそのマス目に旗をつけて、board上の盤面にはなにもしない
  //
  // そして条件分岐がおわったら、
  // "setUserInputs(newUserInputs);"でuserInputsにnewUserInputsを情報を入れる
    const clickRight = (x: number, y: number, event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      const newUserInputs: (0 | 1 | 2 | 3)[][] = JSON.parse(JSON.stringify(userInputs));
      switch (board[y][x]) {
        case -1:
          newUserInputs[y][x] = 3;
          board[y][x] = 10;
          break;
        case 9:
          newUserInputs[y][x] = 0;
          board[y][x] = 0;
          break;
        case 10:
          newUserInputs[y][x] = 2;
          board[y][x];
          break;
      }
      setUserInputs(newUserInputs);
    };

    // "return()"で画面に表示するものを返す
// ${}は式を埋め込むためのもの。つまり、{}の中に式を書くと、その式の結果が埋め込まれる    
// ${styles[`num-${countCanPutFlag(3)}`]}`}にあるように、
// []は動的なプロパティ名を使うためのもの。つまり、[]の中に式を書くと、その式の結果がプロパティ名として使われる
// ${}はその中の式から得られた値を文字列にする
// そして``で囲われているので、numとか-とかの文字列と連結できる（つまり、num-1とかnum-2とかになる）
// javascriptではプロパティを指定して、値を取得する方法が二つある
// 一つは、オブジェクト.プロパティ名
// もう一つは、オブジェクト[プロパティ名]
// なぜ二つが使われるかというと、前者は既知のプロパティ名、後者は変化するもしくは本来ダメなプロパティ名という使い分けがあるから
// また、num-${countCanPutFlag(3)}を囲んでいるのが""ではないのは、
// ${}を使った式を扱うときはその式全体をテンプレートリテラルの文字列として全体を``で囲わなければいけない
// onClickはイベントハンドラ(イベントが発生したときに実行させる処理)の一種
// {}を使用することによってJavaScriptの式や変数を書き込むことができる
    return (
      <div className={styles.container}>
        <div className={styles.minesweeper}>
          <header className={styles.header}>
            <div className={styles.counter}>
              <div className={`${styles.num} ${styles[`num-${countCanPutFlag(3)}`]}`}>
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
              <div className={`${styles.num} ${styles[`num-${countCanPutFlag(2)}`]}`}>
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
              <div className={`${styles.num} ${styles[`num-${countCanPutFlag(1)}`]}`}>
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
            </div>
            <button
              className={styles['reset-button']}
              onClick={resetGame}
              style={{ backgroundPosition: !gameState ? '-1100%' : `${(gameState + 10) * -100}%` }}
            />
            <div className={styles.counter}>
              <div
                className={`${styles.num} ${
                  styles[`num-${Math.floor((time.currentTime - time.startTime) / 100000)}`]
                }`}
              >
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
              <div
                className={`${styles.num} ${
                  styles[`num-${Math.floor(((time.currentTime - time.startTime) % 100000) / 10000)}`]
                }`}
              >
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
              <div
                className={`${styles.num} ${
                  styles[`num-${Math.floor(((time.currentTime - time.startTime) % 10000) / 1000)}`]
                }`}
              >
                <div className={styles['num-top']} />
                <div className={styles['num-bottom']} />
              </div>
            </div>
          </header>
          <div
            className={styles.board}
            style={{ gridTemplate: `repeat(${boardHeight}, 1fr) / repeat(${boardWidth}, 1fr)` }}
          >
            {board.map((row, y) =>
              row.map((cell, x) => (
                <div
                  className={`${styles.cell} ${bombMap[y][x] ? styles['has-bomb'] : ''}`}
                  style={{ backgroundColor: board[y][x] === 12 ? '#f00' : '#0000' }}
                  key={`${x}_${y}`}
                  onContextMenu={(event) => clickRight(x, y, event)}
                  onMouseUp={(event) => clickLeft(x, y, event)}
                >
                  {(board[y][x] === -1 || (board[y][x] > 8 && board[y][x] < 11)) && (
                    <div className={styles.stone}>
                      {(board[y][x] === 9 || board[y][x] === 10) && (
                        <div
                          className={styles.icon}
                          style={{ backgroundPosition: `${(board[y][x] - 1) * -100}%` }}
                        />
                      )}
                    </div>
                  )}
                  {board[y][x] !== 0 && (
                    <div
                      className={styles.icon}
                      style={{
                        backgroundPosition:
                          board[y][x] === 12 ? '-1000%' : `${(board[y][x] - 1) * -100}%`,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          <footer className={styles.footer}>
            <input
              type="number"
              name="width"
              value={boardWidth}
              min="1"
              max="50"
              onInput={(e) => changeWidth(parseInt(e.currentTarget.value))}
            />
            <input
              type="number"
              name="height"
              value={boardHeight}
              min="1"
              max="50"
              onInput={(e) => changeHeight(parseInt(e.currentTarget.value))}
            />
          </footer>
        </div>
      </div>
  );
};



export default Home;
