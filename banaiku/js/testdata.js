// テスト用データ（スマホで触るときに読み込む）。個人情報は入れない。
const TestData = {
  // 第2世代・第1進化（犬系）・BKとアイテム多め・図鑑に数体
  make() {
    const st = newState('テスト');
    const p = st.player, g = st.gen;
    p.testMode = true; p.testNoLimit = true;
    p.bk = 500;
    p.items = { hachimitsu: 3, whip: 2, kinako: 2, choco: 2, freezer: 2, hammock: 2, kinpaku: 2 };
    p.fashionOwned = ['strawhat', 'bowtie', 'sunglass', 'bouquet'];
    p.fashionEquipped = { head: 'strawhat', face: null, neck: 'bowtie', hand: null, bg: null };
    p.generation = 2; p.totalLogins = 12; p.loginStreak = 5;
    p.dex.seen = { neko_1: true, neko_2: true, inu_1: true };
    p.dex.entries = [{ gen: 1, name: 'さき', lineage: 'neko', form: '気まぐれ招きバナナ', days: 9, maxBanana: 19, longestTease: 4, self: 1, date: Days.add(Days.today(st), -3) }];
    g.days = 4; g.startDate = Days.add(Days.today(st), -3);
    g.stage = 1; g.lineage = 'inu'; g.banana = 11; g.stats.maxBanana = 11; g.stats.plays = 6;
    p.log = [
      { d: Days.today(st), t: 'テストデータを読み込んだ' },
      { d: Days.add(Days.today(st), -1), t: 'ワンナナ に進化！' },
    ];
    p.lastDate = Days.today(st);
    return st;
  },
};
