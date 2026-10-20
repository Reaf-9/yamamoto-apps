// バナナ育成ゲーム：マスターデータ（設計図 v0.1 準拠）
// 数値バランスを変えるときはここだけを直す。
const DATA = {
  GAME_NAME: 'バナイク',
  GAME_SUB: 'バナナの育成ゲーム',
  // 進化のしきい値：8で第1進化、16で最終進化
  THRESH: [8, 16],

  // 系統（10＋シークレット）
  LINEAGES: [
    { id: 'inu',         name: '犬系',           hint: '毎日たくさんプレイ',       s1: 'ワンナナ',         s2: '忠犬バナ公',             fav: 'hachimitsu' },
    { id: 'amaenbo',     name: '甘えん坊系',     hint: '連続ログインが長い',       s1: 'あまえナナ',       s2: '抱っこひもバナナ',       fav: 'whip' },
    { id: 'neko',        name: '猫系',           hint: '焦らした日数が多い',       s1: 'ニャナナ',         s2: '気まぐれ招きバナナ',     fav: 'freezer' },
    { id: 'rollcabbage', name: 'ロールキャベツ系', hint: '焦らし成功が多い',       s1: 'キャベ巻きバナナ', s2: '煮込みロールキャベナナ', fav: 'kinako' },
    { id: 'kojirase',    name: 'こじらせ系',     hint: 'セルフバナナが多い',       s1: 'こじらせナナ',     s2: '自己完結バナナ',         fav: 'hammock' },
    { id: 'nikushoku',   name: '肉食系',         hint: 'アイテム使用が多い',       s1: 'ガツガツバナナ',   s2: '骨付き肉バナナ',         fav: 'choco' },
    { id: 'oresama',     name: '俺様系',         hint: 'イベントプレイが多い',     s1: 'オレサマナナ',     s2: 'バナナ皇帝',             fav: 'kinpaku' },
    { id: 'ouji',        name: '王子様系',       hint: 'オシャレ装備が多い',       s1: 'プリンスナナ',     s2: '白馬のバナナ王子',       fav: 'kinpaku' },
    { id: 'soushoku',    name: '草食系',         hint: '熟し（放置）経験が多い',   s1: '草バナナ',         s2: '仙人バナナ',             fav: 'hammock' },
    { id: 'iyashi',      name: '癒し系',         hint: 'どれにも偏らない',         s1: 'ほっこりバナナ',   s2: '縁側バナナ',             fav: 'hachimitsu' },
    { id: 'secret',      name: 'シークレット',   hint: '7日焦らし成功のみ',        s1: 'ダイヤモンドバナナ', s2: 'ブリリアントカットバナナ', fav: 'kinpaku', secret: true },
  ],

  // アイテム（7種）。base＝通常効果、fav＝得意系統のとき
  ITEMS: [
    { id: 'hachimitsu', name: 'ハチミツ',       price: 10, base: 1, fav: 3, desc: '+1バナナ（得意：+3）' },
    { id: 'whip',       name: 'ホイップ',       price: 15, base: 2, fav: 4, desc: '+2バナナ（得意：+4）' },
    { id: 'kinako',     name: 'きなこ',         price: 15, base: 2, fav: 4, desc: '+2バナナ（得意：+4）' },
    { id: 'choco',      name: 'チョコがけ',     price: 20, base: 3, fav: 5, desc: '+3バナナ（得意：+5）' },
    { id: 'freezer',    name: 'ひんやり冷凍庫', price: 20, base: 0, fav: 0, selfCut: 0.20, selfCutFav: 0.35,
      desc: '焦らし明けの1回目に使うとセルフバナナ率−20%（得意：−35%）。7日目は使えない' },
    { id: 'hammock',    name: 'ハンモック',     price: 25, base: 2, fav: 4, stops: 1, stopsFav: 2,
      desc: '+2バナナ、翌日の熟しを1回止める（得意：+4、2回止める）' },
    { id: 'kinpaku',    name: '金箔',           price: 40, base: 5, fav: 8, desc: '+5バナナ（得意：+8）' },
  ],

  // オシャレ（見た目だけ。次の世代に引き継ぐ）
  FASHION_SLOTS: [
    { id: 'head', name: '頭' }, { id: 'face', name: '顔' }, { id: 'neck', name: '首' }, { id: 'hand', name: '手' }, { id: 'bg', name: '背景' },
  ],
  FASHION: [
    { id: 'strawhat',  slot: 'head', name: '麦わら帽子',   price: 20 },
    { id: 'crown',     slot: 'head', name: '王冠',         price: 60 },
    { id: 'hachimaki', slot: 'head', name: 'ハチマキ',     price: 30 },
    { id: 'sunglass',  slot: 'face', name: 'サングラス',   price: 30 },
    { id: 'mustache',  slot: 'face', name: 'ちょびひげ',   price: 20 },
    { id: 'glasses',   slot: 'face', name: '丸メガネ',     price: 40 },
    { id: 'bowtie',    slot: 'neck', name: '蝶ネクタイ',   price: 20 },
    { id: 'chain',     slot: 'neck', name: '金のチェーン', price: 50 },
    { id: 'bib',       slot: 'neck', name: 'よだれかけ',   price: 30 },
    { id: 'bouquet',   slot: 'hand', name: '花束',         price: 30 },
    { id: 'dumbbell',  slot: 'hand', name: 'ダンベル',     price: 40 },
    { id: 'uchiwa',    slot: 'hand', name: 'うちわ',       price: 20 },
    { id: 'engawa',    slot: 'bg',   name: '縁側',         price: 50 },
    { id: 'night',     slot: 'bg',   name: '夜景',         price: 80 },
    { id: 'beach',     slot: 'bg',   name: '南国ビーチ',   price: 60 },
    { id: 'outdoor',   slot: 'bg',   name: 'おさんぽ道',   price: 60 },
  ],

  // 焦らし判定：日数 → [成功時の最小, 最大, セルフバナナ率]
  TEASE: {
    1: [3, 6, 0.10],
    2: [6, 9, 0.15],
    3: [8, 13, 0.20],
    4: [12, 18, 0.35],
    5: [18, 30, 0.55],
    6: [35, 58, 0.75],
    7: [60, 60, 0.95],   // 成功5%＝シークレット確定
  },
  TEASE_MAX: 7,
  SELF_GAIN: 0.5,

  // イベントプレイ：結果4種。確率は場所のリスクで変わる（期待値はどれも +1.0）
  EVENT: [
    { name: '大成功', d: +10 },
    { name: '成功',   d: +5 },
    { name: '失敗',   d: -3 },
    { name: '大失敗', d: -8 },
  ],
  RISK: {
    safe:   { label: '安全',       p: [0.05, 0.45, 0.45, 0.05] },
    normal: { label: 'ふつう',     p: [0.15, 0.35, 0.35, 0.15] },
    high:   { label: 'ハイリスク', p: [0.30, 0.20, 0.20, 0.30] },
  },
  // 「〇〇でプレイしますか？」の候補。毎日2つがランダムに出る
  EVENTS: [
    { id: 'car',     icon: '🚗', place: '車の中',           risk: 'normal', desc: '駐車場で、ちょっとだけ' },
    { id: 'bath',    icon: '🛁', place: 'お風呂',           risk: 'normal', desc: 'すべるので注意' },
    { id: 'park',    icon: '🌳', place: '公園のベンチ',     risk: 'safe',   desc: '天気がいい。のんびり' },
    { id: 'train',   icon: '🚃', place: '満員電車',         risk: 'high',   desc: '見られたら終わり' },
    { id: 'cinema',  icon: '🎬', place: '映画館の暗闇',     risk: 'high',   desc: 'クライマックスで' },
    { id: 'parents', icon: '🏠', place: '実家の居間',       risk: 'safe',   desc: 'みかんを食べながら' },
    { id: 'camp',    icon: '🔥', place: '焚き火の前',       risk: 'normal', desc: '星がきれい' },
    { id: 'wheel',   icon: '🎡', place: '観覧車のてっぺん', risk: 'high',   desc: '一周12分。勝負は一瞬' },
    { id: 'library', icon: '📚', place: '図書館の片すみ',   risk: 'high',   desc: 'しずかに……' },
    { id: 'cafe',    icon: '☕', place: 'カフェのテラス',   risk: 'safe',   desc: 'ラテを片手に' },
    { id: 'conv',    icon: '🏪', place: '深夜のコンビニ前', risk: 'normal', desc: '肉まんのにおい' },
    { id: 'sea',     icon: '🌊', place: '夕方の海辺',       risk: 'normal', desc: '波の音を聞きながら' },
  ],

  // プレイのミニゲーム（3種からランダム）とボーナス
  PLAY_GAMES: ['timing', 'roulette', 'tap'],
  PLAY_BONUS: { perfect: 1, good: 0.5, miss: 0 },
  TAP_GAME: { seconds: 3, perfect: 20, good: 12 },

  // 報酬
  LOGIN_BANANA: 1,
  LOGIN_BK: 10,
  STREAK_BONUS_BK: 30,   // 7日連続ごと
  PLAY_BK: 2,
  DEX_BK: 100,
  SECRET_BK: 100,
  PLAYS_PER_DAY: 2,

  // 熟し（放置）：未ログイン日数 → 見た目レベル（0黄 1シュガースポット 2茶まだら 3ほぼ茶 4真っ黒＝腐り）
  ROT_DAYS: 7,
  ROT_RECOVER_LOGINS: 3,
  CURRENCY: 'BK',

  // キャラの目の種類（E1〜E8。一覧は 02_キャラデザ のキャラデザ案E）
  FACE_STYLE: 'E1',   // ノーマル（系統が決まる前）
  // 系統ごとの目（第1進化で系統が決まった瞬間に顔が変わる）
  LIN_FACE: { inu: 'E3', amaenbo: 'E6', neko: 'E8', rollcabbage: 'E1', kojirase: 'E5', nikushoku: 'E4', oresama: 'E4', ouji: 'E3', soushoku: 'E6', iyashi: 'E7', secret: 'E2' },
};

DATA.LIN = Object.fromEntries(DATA.LINEAGES.map(l => [l.id, l]));
DATA.ITEM = Object.fromEntries(DATA.ITEMS.map(i => [i.id, i]));
DATA.FASH = Object.fromEntries(DATA.FASHION.map(f => [f.id, f]));
DATA.EV = Object.fromEntries(DATA.EVENTS.map(e => [e.id, e]));
