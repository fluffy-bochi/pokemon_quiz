import { useState, useEffect, useCallback, useRef } from "react";

// ── localStorage を window.storage と同じ形で使う互換レイヤー ──
const storage = {
  get: async (key) => {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch { return null; }
  },
  set: async (key, value) => {
    try { localStorage.setItem(key, value); return { value }; } catch { return null; }
  },
};

const SESSION_KEY = "pokemon-quiz-session";
const SRS_KEY = "pokemon-srs";
const MAX_REVIEW = 20;
const MAX_NEW = 5;

const POKE_NAMES = {
  1:"フシギダネ",2:"フシギソウ",3:"フシギバナ",4:"ヒトカゲ",5:"リザード",6:"リザードン",7:"ゼニガメ",8:"カメール",9:"カメックス",10:"キャタピー",
  11:"トランセル",12:"バタフリー",13:"ビードル",14:"コクーン",15:"スピアー",16:"ポッポ",17:"ピジョン",18:"ピジョット",19:"コラッタ",20:"ラッタ",
  21:"オニスズメ",22:"オニドリル",23:"アーボ",24:"アーボック",25:"ピカチュウ",26:"ライチュウ",27:"サンド",28:"サンドパン",29:"ニドラン♀",30:"ニドリーナ",
  31:"ニドクイン",32:"ニドラン♂",33:"ニドリーノ",34:"ニドキング",35:"ピッピ",36:"ピクシー",37:"ロコン",38:"キュウコン",39:"プリン",40:"プクリン",
  41:"ズバット",42:"ゴルバット",43:"ナゾノクサ",44:"クサイハナ",45:"ラフレシア",46:"パラス",47:"パラセクト",48:"コンパン",49:"モルフォン",50:"ディグダ",
  51:"ダグトリオ",52:"ニャース",53:"ペルシアン",54:"コダック",55:"ゴルダック",56:"マンキー",57:"オコリザル",58:"ガーディ",59:"ウインディ",60:"ニョロモ",
  61:"ニョロゾ",62:"ニョロボン",63:"ケーシィ",64:"ユンゲラー",65:"フーディン",66:"ワンリキー",67:"ゴーリキー",68:"カイリキー",69:"マダツボミ",70:"ウツドン",
  71:"ウツボット",72:"メノクラゲ",73:"ドククラゲ",74:"イシツブテ",75:"ゴローン",76:"ゴローニャ",77:"ポニータ",78:"ギャロップ",79:"ヤドン",80:"ヤドラン",
  81:"コイル",82:"レアコイル",83:"カモネギ",84:"ドードー",85:"ドードリオ",86:"パウワウ",87:"ジュゴン",88:"ベトベター",89:"ベトベトン",90:"シェルダー",
  91:"パルシェン",92:"ゴース",93:"ゴースト",94:"ゲンガー",95:"イワーク",96:"スリープ",97:"スリーパー",98:"クラブ",99:"キングラー",100:"ビリリダマ",
  101:"マルマイン",102:"タマタマ",103:"ナッシー",104:"カラカラ",105:"ガラガラ",106:"サワムラー",107:"エビワラー",108:"ベロリンガ",109:"ドガース",110:"マタドガス",
  111:"サイホーン",112:"サイドン",113:"ラッキー",114:"モンジャラ",115:"ガルーラ",116:"タッツー",117:"シードラ",118:"トサキント",119:"アズマオウ",120:"ヒトデマン",
  121:"スターミー",122:"バリヤード",123:"ストライク",124:"ルージュラ",125:"エレブー",126:"ブーバー",127:"カイロス",128:"ケンタロス",129:"コイキング",130:"ギャラドス",
  131:"ラプラス",132:"メタモン",133:"イーブイ",134:"シャワーズ",135:"サンダース",136:"ブースター",137:"ポリゴン",138:"オムナイト",139:"オムスター",140:"カブト",
  141:"カブトプス",142:"プテラ",143:"カビゴン",144:"フリーザー",145:"サンダー",146:"ファイヤー",147:"ミニリュウ",148:"ハクリュー",149:"カイリュー",150:"ミュウツー",
  151:"ミュウ",152:"チコリータ",153:"ベイリーフ",154:"メガニウム",155:"ヒノアラシ",156:"マグマラシ",157:"バクフーン",158:"ワニノコ",159:"アリゲイツ",160:"オーダイル",
  161:"オタチ",162:"オオタチ",163:"ホーホー",164:"ヨルノズク",165:"レディバ",166:"レディアン",167:"イトマル",168:"アリアドス",169:"クロバット",170:"チョンチー",
  171:"ランターン",172:"ピチュー",173:"ピィ",174:"ププリン",175:"トゲピー",176:"トゲチック",177:"ネイティ",178:"ネイティオ",179:"メリープ",180:"モココ",
  181:"デンリュウ",182:"キレイハナ",183:"マリル",184:"マリルリ",185:"ウソッキー",186:"ニョロトノ",187:"ハネッコ",188:"ポポッコ",189:"ワタッコ",190:"エイパム",
  191:"ヒマナッツ",192:"キマワリ",193:"ヤンヤンマ",194:"ウパー",195:"ヌオー",196:"エーフィ",197:"ブラッキー",198:"ヤミカラス",199:"ヤドキング",200:"ムウマ",
  201:"アンノーン",202:"ソーナンス",203:"キリンリキ",204:"クヌギダマ",205:"フォレトス",206:"ノコッチ",207:"グライガー",208:"ハガネール",209:"ブルー",210:"グランブル",
  211:"ハリーセン",212:"ハッサム",213:"ツボツボ",214:"ヘラクロス",215:"ニューラ",216:"ヒメグマ",217:"リングマ",218:"マグマッグ",219:"マグカルゴ",220:"ウリムー",
  221:"イノムー",222:"サニーゴ",223:"テッポウオ",224:"オクタン",225:"デリバード",226:"マンタイン",227:"エアームド",228:"デルビル",229:"ヘルガー",230:"キングドラ",
  231:"ゴマゾウ",232:"ドンファン",233:"ポリゴン２",234:"オドシシ",235:"ドーブル",236:"バルキー",237:"カポエラー",238:"ムチュール",239:"エレキッド",240:"ブビィ",
  241:"ミルタンク",242:"ハピナス",243:"ライコウ",244:"エンテイ",245:"スイクン",246:"ヨーギラス",247:"サナギラス",248:"バンギラス",249:"ルギア",250:"ホウオウ",
  251:"セレビィ",252:"キモリ",253:"ジュプトル",254:"ジュカイン",255:"アチャモ",256:"ワカシャモ",257:"バシャーモ",258:"ミズゴロウ",259:"ヌマクロー",260:"ラグラージ",
  261:"ポチエナ",262:"グラエナ",263:"ジグザグマ",264:"マッスグマ",265:"ケムッソ",266:"カラサリス",267:"アゲハント",268:"マユルド",269:"ドクケイル",270:"ハスボー",
  271:"ハスブレロ",272:"ルンパッパ",273:"タネボー",274:"コノハナ",275:"ダーテング",276:"スバメ",277:"オオスバメ",278:"キャモメ",279:"ペリッパー",280:"ラルトス",
  281:"キルリア",282:"サーナイト",283:"アメタマ",284:"アメモース",285:"キノココ",286:"キノガッサ",287:"ナマケロ",288:"ヤルキモノ",289:"ケッキング",290:"ツチニン",
  291:"テッカニン",292:"ヌケニン",293:"ゴニョニョ",294:"ドゴーム",295:"バクオング",296:"マクノシタ",297:"ハリテヤマ",298:"ルリリ",299:"ノズパス",300:"エネコ",
  301:"エネコロロ",302:"ヤミラミ",303:"クチート",304:"ココドラ",305:"コドラ",306:"ボスゴドラ",307:"アサナン",308:"チャーレム",309:"ラクライ",310:"ライボルト",
  311:"プラスル",312:"マイナン",313:"バルビート",314:"イルミーゼ",315:"ロゼリア",316:"ゴクリン",317:"マルノーム",318:"キバニア",319:"サメハダー",320:"ホエルコ",
  321:"ホエルオー",322:"ドンメル",323:"バクーダ",324:"コータス",325:"バネブー",326:"ブーピッグ",327:"パッチール",328:"ナックラー",329:"ビブラーバ",330:"フライゴン",
  331:"サボネア",332:"ノクタス",333:"チルット",334:"チルタリス",335:"ザングース",336:"ハブネーク",337:"ルナトーン",338:"ソルロック",339:"ドジョッチ",340:"ナマズン",
  341:"ヘイガニ",342:"シザリガー",343:"ヤジロン",344:"ネンドール",345:"リリーラ",346:"ユレイドル",347:"アノプス",348:"アーマルド",349:"ヒンバス",350:"ミロカロス",
  351:"ポワルン",352:"カクレオン",353:"カゲボウズ",354:"ジュペッタ",355:"ヨマワル",356:"サマヨール",357:"トロピウス",358:"チリーン",359:"アブソル",360:"ソーナノ",
  361:"ユキワラシ",362:"オニゴーリ",363:"タマザラシ",364:"トドグラー",365:"トドゼルガ",366:"パールル",367:"ハンテール",368:"サクラビス",369:"ジーランス",370:"ラブカス",
  371:"タツベイ",372:"コモルー",373:"ボーマンダ",374:"ダンバル",375:"メタング",376:"メタグロス",377:"レジロック",378:"レジアイス",379:"レジスチル",380:"ラティアス",
  381:"ラティオス",382:"カイオーガ",383:"グラードン",384:"レックウザ",385:"ジラーチ",386:"デオキシス",387:"ナエトル",388:"ハヤシガメ",389:"ドダイトス",390:"ヒコザル",
  391:"モウカザル",392:"ゴウカザル",393:"ポッチャマ",394:"ポッタイシ",395:"エンペルト",396:"ムックル",397:"ムクバード",398:"ムクホーク",399:"ビッパ",400:"ビーダル",
  401:"コロボーシ",402:"コロトック",403:"コリンク",404:"ルクシオ",405:"レントラー",406:"スボミー",407:"ロズレイド",408:"ズガイドス",409:"ラムパルド",410:"タテトプス",
  411:"トリデプス",412:"ミノムッチ",413:"ミノマダム",414:"ガーメイル",415:"ミツハニー",416:"ビークイン",417:"パチリス",418:"ブイゼル",419:"フローゼル",420:"チェリンボ",
  421:"チェリム",422:"カラナクシ",423:"トリトドン",424:"エテボース",425:"フワンテ",426:"フワライド",427:"ミミロル",428:"ミミロップ",429:"ムウマージ",430:"ドンカラス",
  431:"ニャルマー",432:"ブニャット",433:"リーシャン",434:"スカンプー",435:"スカタンク",436:"ドーミラー",437:"ドータクン",438:"ウソハチ",439:"マネネ",440:"ピンプク",
  441:"ペラップ",442:"ミカルゲ",443:"フカマル",444:"ガバイト",445:"ガブリアス",446:"ゴンベ",447:"リオル",448:"ルカリオ",449:"ヒポポタス",450:"カバルドン",
  451:"スコルピ",452:"ドラピオン",453:"グレッグル",454:"ドクロッグ",455:"マスキッパ",456:"ケイコウオ",457:"ネオラント",458:"タマンタ",459:"ユキカブリ",460:"ユキノオー",
  461:"マニューラ",462:"ジバコイル",463:"ベロベルト",464:"ドサイドン",465:"モジャンボ",466:"エレキブル",467:"ブーバーン",468:"トゲキッス",469:"メガヤンマ",470:"リーフィア",
  471:"グレイシア",472:"グライオン",473:"マンムー",474:"ポリゴンＺ",475:"エルレイド",476:"ダイノーズ",477:"ヨノワール",478:"ユキメノコ",479:"ロトム",480:"ユクシー",
  481:"エムリット",482:"アグノム",483:"ディアルガ",484:"パルキア",485:"ヒードラン",486:"レジギガス",487:"ギラティナ",488:"クレセリア",489:"フィオネ",490:"マナフィ",
  491:"ダークライ",492:"シェイミ",493:"アルセウス",494:"ビクティニ",495:"ツタージャ",496:"ジャノビー",497:"ジャローダ",498:"ポカブ",499:"チャオブー",500:"エンブオー",
  501:"ミジュマル",502:"フタチマル",503:"ダイケンキ",504:"ミネズミ",505:"ミルホッグ",506:"ヨーテリー",507:"ハーデリア",508:"ムーランド",509:"チョロネコ",510:"レパルダス",
  511:"ヤナップ",512:"ヤナッキー",513:"バオップ",514:"バオッキー",515:"ヒヤップ",516:"ヒヤッキー",517:"ムンナ",518:"ムシャーナ",519:"マメパト",520:"ハトーボー",
  521:"ケンホロウ",522:"シママ",523:"ゼブライカ",524:"ダンゴロ",525:"ガントル",526:"ギガイアス",527:"コロモリ",528:"ココロモリ",529:"モグリュー",530:"ドリュウズ",
  531:"タブンネ",532:"ドッコラー",533:"ドテッコツ",534:"ローブシン",535:"オタマロ",536:"ガマガル",537:"ガマゲロゲ",538:"ナゲキ",539:"ダゲキ",540:"クルミル",
  541:"クルマユ",542:"ハハコモリ",543:"フシデ",544:"ホイーガ",545:"ペンドラー",546:"モンメン",547:"エルフーン",548:"チュリネ",549:"ドレディア",550:"バスラオ",
  551:"メグロコ",552:"ワルビル",553:"ワルビアル",554:"ダルマッカ",555:"ヒヒダルマ",556:"マラカッチ",557:"イシズマイ",558:"イワパレス",559:"ズルッグ",560:"ズルズキン",
  561:"シンボラー",562:"デスマス",563:"デスカーン",564:"プロトーガ",565:"アバゴーラ",566:"アーケン",567:"アーケオス",568:"ヤブクロン",569:"ダストダス",570:"ゾロア",
  571:"ゾロアーク",572:"チラーミィ",573:"チラチーノ",574:"ゴチム",575:"ゴチミル",576:"ゴチルゼル",577:"ユニラン",578:"ダブラン",579:"ランクルス",580:"コアルヒー",
  581:"スワンナ",582:"バニプッチ",583:"バニリッチ",584:"バイバニラ",585:"シキジカ",586:"メブキジカ",587:"エモンガ",588:"カブルモ",589:"シュバルゴ",590:"タマゲタケ",
  591:"モロバレル",592:"プルリル",593:"ブルンゲル",594:"ママンボウ",595:"バチュル",596:"デンチュラ",597:"テッシード",598:"ナットレイ",599:"ギアル",600:"ギギアル",
  601:"ギギギアル",602:"シビシラス",603:"シビビール",604:"シビルドン",605:"リグレー",606:"オーベム",607:"ヒトモシ",608:"ランプラー",609:"シャンデラ",610:"キバゴ",
  611:"オノンド",612:"オノノクス",613:"クマシュン",614:"ツンベアー",615:"フリージオ",616:"チョボマキ",617:"アギルダー",618:"マッギョ",619:"コジョフー",620:"コジョンド",
  621:"クリムガン",622:"ゴビット",623:"ゴルーグ",624:"コマタナ",625:"キリキザン",626:"バッフロン",627:"ワシボン",628:"ウォーグル",629:"バルチャイ",630:"バルジーナ",
  631:"クイタラン",632:"アイアント",633:"モノズ",634:"ジヘッド",635:"サザンドラ",636:"メラルバ",637:"ウルガモス",638:"コバルオン",639:"テラキオン",640:"ビリジオン",
  641:"トルネロス",642:"ボルトロス",643:"レシラム",644:"ゼクロム",645:"ランドロス",646:"キュレム",647:"ケルディオ",648:"メロエッタ",649:"ゲノセクト",650:"ハリマロン",
  651:"ハリボーグ",652:"ブリガロン",653:"フォッコ",654:"テールナー",655:"マフォクシー",656:"ケロマツ",657:"ゲコガシラ",658:"ゲッコウガ",659:"ホルビー",660:"ホルード",
  661:"ヤヤコマ",662:"ヒノヤコマ",663:"ファイアロー",664:"コフキムシ",665:"コフーライ",666:"ビビヨン",667:"シシコ",668:"カエンジシ",669:"フラベベ",670:"フラエッテ",
  671:"フラージェス",672:"メェークル",673:"ゴーゴート",674:"ヤンチャム",675:"ゴロンダ",676:"トリミアン",677:"ニャスパー",678:"ニャオニクス",679:"ヒトツキ",680:"ニダンギル",
  681:"ギルガルド",682:"シュシュプ",683:"フレフワン",684:"ペロッパフ",685:"ペロリーム",686:"マーイーカ",687:"カラマネロ",688:"カメテテ",689:"ガメノデス",690:"クズモー",
  691:"ドラミドロ",692:"ウデッポウ",693:"ブロスター",694:"エリキテル",695:"エレザード",696:"チゴラス",697:"ガチゴラス",698:"アマルス",699:"アマルルガ",700:"ニンフィア",
  701:"ルチャブル",702:"デデンネ",703:"メレシー",704:"ヌメラ",705:"ヌメイル",706:"ヌメルゴン",707:"クレッフィ",708:"ボクレー",709:"オーロット",710:"バケッチャ",
  711:"パンプジン",712:"カチコール",713:"クレベース",714:"オンバット",715:"オンバーン",716:"ゼルネアス",717:"イベルタル",718:"ジガルデ",719:"ディアンシー",720:"フーパ",
  721:"ボルケニオン",722:"モクロー",723:"フクスロー",724:"ジュナイパー",725:"ニャビー",726:"ニャヒート",727:"ガオガエン",728:"アシマリ",729:"オシャマリ",730:"アシレーヌ",
  731:"ツツケラ",732:"ケララッパ",733:"ドデカバシ",734:"ヤングース",735:"デカグース",736:"アゴジムシ",737:"デンヂムシ",738:"クワガノン",739:"マケンカニ",740:"ケケンカニ",
  741:"オドリドリ",742:"アブリー",743:"アブリボン",744:"イワンコ",745:"ルガルガン",746:"ヨワシ",747:"ヒドイデ",748:"ドヒドイデ",749:"ドロバンコ",750:"バンバドロ",
  751:"シズクモ",752:"オニシズクモ",753:"カリキリ",754:"ラランテス",755:"ネマシュ",756:"マシェード",757:"ヤトウモリ",758:"エンニュート",759:"ヌイコグマ",760:"キテルグマ",
  761:"アマカジ",762:"アママイコ",763:"アマージョ",764:"キュワワー",765:"ヤレユータン",766:"ナゲツケサル",767:"コソクムシ",768:"グソクムシャ",769:"スナバァ",770:"シロデスナ",
  771:"ナマコブシ",772:"タイプ：ヌル",773:"シルヴァディ",774:"メテノ",775:"ネッコアラ",776:"バクガメス",777:"トゲデマル",778:"ミミッキュ",779:"ハギギシリ",780:"ジジーロン",
  781:"ダダリン",782:"ジャラコ",783:"ジャランゴ",784:"ジャラランガ",785:"カプ・コケコ",786:"カプ・テテフ",787:"カプ・ブルル",788:"カプ・レヒレ",789:"コスモッグ",790:"コスモウム",
  791:"ソルガレオ",792:"ルナアーラ",793:"ウツロイド",794:"マッシブーン",795:"フェローチェ",796:"デンジュモク",797:"テッカグヤ",798:"カミツルギ",799:"アクジキング",800:"ネクロズマ",
  801:"マギアナ",802:"マーシャドー",803:"ベベノム",804:"アーゴヨン",805:"ツンデツンデ",806:"ズガドーン",807:"ゼラオラ",808:"メルタン",809:"メルメタル",810:"サルノリ",
  811:"バチンキー",812:"ゴリランダー",813:"ヒバニー",814:"ラビフット",815:"エースバーン",816:"メッソン",817:"ジメレオン",818:"インテレオン",819:"ホシガリス",820:"ヨクバリス",
  821:"ココガラ",822:"アオガラス",823:"アーマーガア",824:"サッチムシ",825:"レドームシ",826:"イオルブ",827:"クスネ",828:"フォクスライ",829:"ヒメンカ",830:"ワタシラガ",
  831:"ウールー",832:"バイウールー",833:"カムカメ",834:"カジリガメ",835:"ワンパチ",836:"パルスワン",837:"タンドン",838:"トロッゴン",839:"セキタンザン",840:"カジッチュ",
  841:"アップリュー",842:"タルップル",843:"スナヘビ",844:"サダイジャ",845:"ウッウ",846:"サシカマス",847:"カマスジョー",848:"エレズン",849:"ストリンダー",850:"ヤクデ",
  851:"マルヤクデ",852:"タタッコ",853:"オトスパス",854:"ヤバチャ",855:"ポットデス",856:"ミブリム",857:"テブリム",858:"ブリムオン",859:"ベロバー",860:"ギモー",
  861:"オーロンゲ",862:"タチフサグマ",863:"ニャイキング",864:"サニゴーン",865:"ネギガナイト",866:"バリコオル",867:"デスバーン",868:"マホミル",869:"マホイップ",870:"タイレーツ",
  871:"バチンウニ",872:"ユキハミ",873:"モスノウ",874:"イシヘンジン",875:"コオリッポ",876:"イエッサン",877:"モルペコ",878:"ゾウドウ",879:"ダイオウドウ",880:"パッチラゴン",
  881:"パッチルドン",882:"ウオノラゴン",883:"ウオチルドン",884:"ジュラルドン",885:"ドラメシヤ",886:"ドロンチ",887:"ドラパルト",888:"ザシアン",889:"ザマゼンタ",890:"ムゲンダイナ",
  891:"ダクマ",892:"ウーラオス",893:"ザルード",894:"レジエレキ",895:"レジドラゴ",896:"ブリザポス",897:"レイスポス",898:"バドレックス",899:"アヤシシ",900:"バサギリ",
  901:"ガチグマ",902:"イダイトウ",903:"オオニューラ",904:"ハリーマン",905:"ラブトロス",906:"ニャオハ",907:"ニャローテ",908:"マスカーニャ",909:"ホゲータ",910:"アチゲータ",
  911:"ラウドボーン",912:"クワッス",913:"ウェルカモ",914:"ウェーニバル",915:"グルトン",916:"パフュートン",917:"タマンチュラ",918:"ワナイダー",919:"マメバッタ",920:"エクスレッグ",
  921:"パモ",922:"パモット",923:"パーモット",924:"ワッカネズミ",925:"イッカネズミ",926:"パピモッチ",927:"バウッツェル",928:"ミニーブ",929:"オリーニョ",930:"オリーヴァ",
  931:"イキリンコ",932:"コジオ",933:"ジオヅム",934:"キョジオーン",935:"カルボウ",936:"グレンアルマ",937:"ソウブレイズ",938:"ズピカ",939:"ハラバリー",940:"カイデン",
  941:"タイカイデン",942:"オラチフ",943:"マフィティフ",944:"シルシュルー",945:"タギングル",946:"アノクサ",947:"アノホラグサ",948:"ノノクラゲ",949:"リククラゲ",950:"ガケガニ",
  951:"カプサイジ",952:"スコヴィラン",953:"シガロコ",954:"ベラカス",955:"ヒラヒナ",956:"クエスパトラ",957:"カヌチャン",958:"ナカヌチャン",959:"デカヌチャン",960:"ウミディグダ",
  961:"ウミトリオ",962:"オトシドリ",963:"ナミイルカ",964:"イルカマン",965:"ブロロン",966:"ブロロローム",967:"モトトカゲ",968:"ミミズズ",969:"キラーメ",970:"キラフロル",
  971:"ボチ",972:"ハカドッグ",973:"カラミンゴ",974:"アルクジラ",975:"ハルクジラ",976:"ミガルーサ",977:"ヘイラッシャ",978:"シャリタツ",979:"コノヨザル",980:"ドオー",
  981:"リキキリン",982:"ノココッチ",983:"ドドゲザン",984:"イダイナキバ",985:"サケブシッポ",986:"アラブルタケ",987:"ハバタクカミ",988:"チヲハウハネ",989:"スナノケガワ",990:"テツノワダチ",
  991:"テツノツツミ",992:"テツノカイナ",993:"テツノコウベ",994:"テツノドクガ",995:"テツノイバラ",996:"セビエ",997:"セゴール",998:"セグレイブ",999:"コレクレー",1000:"サーフゴー",
  1001:"チオンジェン",1002:"パオジアン",1003:"ディンルー",1004:"イーユイ",1005:"トドロクツキ",1006:"テツノブジン",1007:"コライドン",1008:"ミライドン",1009:"ウネルミナモ",1010:"テツノイサハ",
  1011:"カミッチュ",1012:"チャデス",1013:"ヤバソチャ",1014:"イイネイヌ",1015:"マシマシラ",1016:"キチキギス",1017:"オーガポン",1018:"ブリジュラス",1019:"カミツオロチ",1020:"ウガツホムラ",
  1021:"タケルライコ",1022:"テツノイワオ",1023:"テツノカシラ",1024:"テラパゴス",1025:"モモワロウ",
};

const REGIONS = [
  { name:"全て",    emoji:"✨", min:1,   max:1025, color:"#7c6aff" },
  { name:"カントー", emoji:"🔴", min:1,   max:151,  color:"#e05c3a" },
  { name:"ジョウト", emoji:"🌕", min:152, max:251,  color:"#d4a017" },
  { name:"ホウエン", emoji:"🌊", min:252, max:386,  color:"#2980b9" },
  { name:"シンオウ", emoji:"❄️", min:387, max:493,  color:"#6c7fe8" },
  { name:"イッシュ", emoji:"🏙️", min:494, max:649,  color:"#778ca3" },
  { name:"カロス",  emoji:"🗼", min:650, max:721,  color:"#c0579a" },
  { name:"アローラ", emoji:"🌺", min:722, max:809,  color:"#16a085" },
  { name:"ガラル",  emoji:"⚔️", min:810, max:905,  color:"#4a90d9" },
  { name:"パルデア", emoji:"🍊", min:906, max:1025, color:"#d35400" },
];

const BOX_WEIGHTS=[12,6,3,1,0.3];
const BOX_COLORS=["#ef4444","#f97316","#eab308","#22c55e","#60a5fa"];
const BOX_LABELS=["未習得","学習中","定着中","習熟","マスター"];

// ── SRS helpers ──────────────────────────────────────────────────────────────
function getTodayStr(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function addDays(dateStr,n){
  const d=new Date(dateStr+"T00:00:00");
  d.setDate(d.getDate()+n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// rating: 'again' | 'hard' | 'good' | 'easy'
function calcSrsUpdate(card,rating){
  const today=getTodayStr();
  const rc=card.reviewCount??0;
  let {interval=1,easeFactor=2.5,lapses=0}=card;
  if(rating==="again"){
    return{interval:1,easeFactor:Math.max(1.3,easeFactor),lapses:lapses+1,reviewCount:0,nextReview:today};
  }
  if(rating==="hard") easeFactor=Math.max(1.3,easeFactor-0.15);
  else if(rating==="easy") easeFactor=easeFactor+0.15;
  let newInterval;
  if(rc===0) newInterval=1;
  else if(rc===1) newInterval=4;
  else{
    if(rating==="hard") newInterval=Math.round(interval*1.2);
    else if(rating==="easy") newInterval=Math.round(interval*easeFactor*1.3);
    else newInterval=Math.round(interval*easeFactor);
    newInterval=Math.max(1,newInterval);
  }
  return{interval:newInterval,easeFactor,lapses,reviewCount:rc+1,nextReview:addDays(today,newInterval)};
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  return arr;
}

function buildReviewQueue(srsData){
  const today=getTodayStr();
  const due=[],newCards=[];
  for(const[idStr,card]of Object.entries(srsData)){
    if(card.nextReview<=today) due.push(parseInt(idStr));
  }
  const srsIds=new Set(Object.keys(srsData).map(Number));
  for(let id=1;id<=1025;id++){if(!srsIds.has(id)) newCards.push(id);}
  shuffle(due); shuffle(newCards);
  return [...due.slice(0,MAX_REVIEW),...newCards.slice(0,MAX_NEW)];
}

function getSrsStats(srsData){
  const today=getTodayStr();
  const tomorrow=addDays(today,1);
  const ids=Object.keys(srsData);
  const dueToday=ids.filter(id=>srsData[id].nextReview<=today).length;
  const dueTomorrow=ids.filter(id=>srsData[id].nextReview>today&&srsData[id].nextReview<=tomorrow).length;
  const newAvail=Math.min(MAX_NEW,1025-ids.length);
  return{dueToday,dueTomorrow,newAvail};
}

// ─────────────────────────────────────────────────────────────────────────────
function normalizeColon(s){return s.replace(/:/g,"：").trim();}
function checkAnswer(input,name){return normalizeColon(input)===normalizeColon(name);}

function getStats(region,progress){
  const total=region.max-region.min+1;
  const boxes=[0,0,0,0,0];
  for(let id=region.min;id<=region.max;id++) boxes[Math.min(progress[id]??0,4)]++;
  return {total,boxes};
}

function selectId(region,progress,reviewOnly,answeredInSession){
  const ids=[],weights=[];
  for(let id=region.min;id<=region.max;id++){
    const box=progress[id]??0;
    if(reviewOnly&&box>2) continue;
    if(answeredInSession.has(id)) continue;
    ids.push(id); weights.push(BOX_WEIGHTS[Math.min(box,4)]);
  }
  if(!ids.length) return null;
  const total=weights.reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(let i=0;i<ids.length;i++){r-=weights[i];if(r<=0)return ids[i];}
  return ids[ids.length-1];
}

function PokeImage({id, mode}){
  const small=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const hd=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const [src,setSrc]=useState(mode === 'small' ? small : hd);
  const [isHd,setIsHd]=useState(mode === 'hd');
  useEffect(()=>{
    setSrc(mode === 'small' ? small : hd); setIsHd(mode === 'hd');
    if(mode === 'hd'){
      const img=new Image();
      img.onload=()=>{setSrc(hd);setIsHd(true);};
      img.onerror=()=>{};
      img.src=hd;
      return()=>{img.onload=null;img.onerror=null;};
    }
  },[id, mode]); // eslint-disable-line
  return(
    <img src={src} alt="" onError={()=>setSrc(small)} style={{
      width:"100%",height:"100%",objectFit:"contain",
      imageRendering:isHd?"auto":"pixelated",
      filter:"drop-shadow(0 4px 20px rgba(120,140,255,0.25))",
    }}/>
  );
}

export default function App(){
  const [screen,setScreen]=useState("home");
  const [progress,setProgress]=useState({});
  const [loaded,setLoaded]=useState(false);
  const [region,setRegion]=useState(null);
  const [reviewOnly,setReviewOnly]=useState(false);
  const [question,setQuestion]=useState(null);
  const [input,setInput]=useState("");
  const [phase,setPhase]=useState("answering");
  const [wasCorrect,setWasCorrect]=useState(null);
  const [session,setSession]=useState({correct:0,wrong:0});
  const [savedSession,setSavedSession]=useState(null);
  const [questionCount,setQuestionCount]=useState(0);
  const [answeredInSession,setAnsweredInSession]=useState(new Set());
  const [imageMode,setImageMode]=useState('hd');
  const [isComposing,setIsComposing]=useState(false);
  const [totalPokes,setTotalPokes]=useState(0);
  // SRS state
  const [srsData,setSrsData]=useState({});
  const [isReviewMode,setIsReviewMode]=useState(false);
  const regionRef=useRef(null);
  const reviewRef=useRef(false);
  const progressRef=useRef({});
  const inputRef=useRef(null);
  const questionCountRef=useRef(0);
  const enterPressedRef=useRef(false);
  // SRS refs
  const srsDataRef=useRef({});
  const isReviewModeRef=useRef(false);
  const reviewQueueRef=useRef([]);
  const againQueueRef=useRef([]);

  useEffect(()=>{
    (async()=>{
      try{
        const r=await storage.get("pokemon-progress");
        if(r?.value){const p=JSON.parse(r.value);setProgress(p);progressRef.current=p;}
      }catch{}
      try{
        const s=await storage.get(SESSION_KEY);
        if(s?.value){const d=JSON.parse(s.value);if(d?.questionId) setSavedSession(d);}
      }catch{}
      try{
        const srs=await storage.get(SRS_KEY);
        if(srs?.value){const d=JSON.parse(srs.value);setSrsData(d);srsDataRef.current=d;}
      }catch{}
      setLoaded(true);
    })();
  },[]);

  const save=useCallback(async p=>{
    try{await storage.set("pokemon-progress",JSON.stringify(p));}catch{}
  },[]);

  const saveSrs=useCallback(async d=>{
    try{await storage.set(SRS_KEY,JSON.stringify(d));}catch{}
  },[]);

  // 復習モード: キューから次の問題を取得
  const nextReviewQuestion=useCallback(()=>{
    setInput("");setPhase("answering");setWasCorrect(null);setQuestion(null);
    let id=reviewQueueRef.current.shift();
    if(id===undefined&&againQueueRef.current.length>0){
      reviewQueueRef.current=shuffle([...againQueueRef.current]);
      againQueueRef.current=[];
      id=reviewQueueRef.current.shift();
    }
    if(id===undefined){setQuestion({id:null});return;}
    const newCount=questionCountRef.current+1;
    questionCountRef.current=newCount;setQuestionCount(newCount);
    setQuestion({id,name:POKE_NAMES[id]||`No.${id}`});
    setTimeout(()=>inputRef.current?.focus(),80);
  },[]);

  // 4段階評価ボタン押下
  const applyRating=useCallback((rating)=>{
    if(!question?.id) return;
    const card=srsDataRef.current[question.id]??{interval:1,easeFactor:2.5,lapses:0,reviewCount:0};
    const updated=calcSrsUpdate(card,rating);
    const newSrs={...srsDataRef.current,[question.id]:updated};
    srsDataRef.current=newSrs;setSrsData(newSrs);saveSrs(newSrs);
    const correct=rating!=="again";
    setSession(s=>({correct:s.correct+(correct?1:0),wrong:s.wrong+(correct?0:1)}));
    if(rating==="again") againQueueRef.current.push(question.id);
    nextReviewQuestion();
  },[question,saveSrs,nextReviewQuestion]);

  const startReview=()=>{
    const queue=buildReviewQueue(srsDataRef.current);
    reviewQueueRef.current=queue;againQueueRef.current=[];
    isReviewModeRef.current=true;setIsReviewMode(true);
    setRegion(REGIONS[0]);regionRef.current=REGIONS[0];
    reviewRef.current=false;setReviewOnly(false);
    setSession({correct:0,wrong:0});
    questionCountRef.current=0;setQuestionCount(0);
    setAnsweredInSession(new Set());
    setTotalPokes(queue.length);
    storage.set(SESSION_KEY,"");setSavedSession(null);
    setScreen("quiz");
    // nextReviewQuestion をここで呼ぶと stale closure になるため直接処理
    setTimeout(()=>{
      setInput("");setPhase("answering");setWasCorrect(null);setQuestion(null);
      const id=reviewQueueRef.current.shift();
      if(id===undefined){setQuestion({id:null});return;}
      questionCountRef.current=1;setQuestionCount(1);
      setQuestion({id,name:POKE_NAMES[id]||`No.${id}`});
      setTimeout(()=>inputRef.current?.focus(),80);
    },0);
  };

  const nextQuestion=useCallback((r,rOnly,prog)=>{
    setInput("");setPhase("answering");setWasCorrect(null);setQuestion(null);
    const id=selectId(r,prog,rOnly,answeredInSession);
    if(id===null){setQuestion({id:null});return;}
    const newCount=questionCountRef.current+1;
    questionCountRef.current=newCount;
    setQuestionCount(newCount);
    setQuestion({id,name:POKE_NAMES[id]||`No.${id}`});
    setTimeout(()=>inputRef.current?.focus(),80);
  },[answeredInSession]);

  const startQuiz=(r,rOnly=false)=>{
    isReviewModeRef.current=false;setIsReviewMode(false);
    regionRef.current=r;reviewRef.current=rOnly;
    setRegion(r);setReviewOnly(rOnly);
    setSession({correct:0,wrong:0});
    questionCountRef.current=0;setQuestionCount(0);
    setAnsweredInSession(new Set());
    setTotalPokes(rOnly ? getStats(r, progress).boxes[0] : (r.max - r.min + 1));
    storage.set(SESSION_KEY,"");setSavedSession(null);
    setScreen("quiz");
    nextQuestion(r,rOnly,progressRef.current);
  };

  const submitAnswer=(giveUp=false)=>{
    if(phase!=="answering"||!question?.name) return;
    const correct=!giveUp&&checkAnswer(input,question.name);
    setWasCorrect(correct);setPhase("result");

    if(isReviewModeRef.current){
      // 復習モードでは評価ボタン押下時にSRS更新するため、ここでは何もしない
      return;
    }

    // 通常モード: ボックス更新
    const curBox=progress[question.id]??0;
    const newProg={...progress,[question.id]:correct?Math.min(curBox+1,4):0};
    progressRef.current=newProg;setProgress(newProg);save(newProg);

    // 不正解 → SRSに未登録なら今日のキューへ自動追加
    if(!correct&&!srsDataRef.current[question.id]){
      const newCard={interval:1,easeFactor:2.5,lapses:1,reviewCount:0,nextReview:getTodayStr()};
      const newSrs={...srsDataRef.current,[question.id]:newCard};
      srsDataRef.current=newSrs;setSrsData(newSrs);saveSrs(newSrs);
    }

    const newSess={correct:session.correct+(correct?1:0),wrong:session.wrong+(correct?0:1)};
    setSession(newSess);
    if(correct) setAnsweredInSession(prev=>new Set([...prev,question.id]));
    if(regionRef.current&&question?.id){
      const data={regionName:regionRef.current.name,reviewOnly:reviewRef.current,questionId:question.id,phase:"result",wasCorrect:correct,input,session:newSess,questionCount:questionCountRef.current,answeredInSession:[...answeredInSession],totalPokes};
      storage.set(SESSION_KEY,JSON.stringify(data));
      setSavedSession(data);
    }
  };

  const handleKey=e=>{
    if(e.key!=="Enter") return;
    // IME変換中のEnterは無視
    if(isComposing) return;
    // 連続Enter防止
    if(enterPressedRef.current) return;
    if(phase==="answering"){
      enterPressedRef.current = true;
      submitAnswer();
      setTimeout(() => enterPressedRef.current = false, 200);
    } else if(phase==="result"&&!isReviewModeRef.current) {
      nextQuestion(regionRef.current,reviewRef.current,progressRef.current);
    }
  };

  const handleCompositionStart=()=>{
    setIsComposing(true);
  };

  const handleCompositionEnd=()=>{
    setIsComposing(false);
  };

  const resumeSession=()=>{
    if(!savedSession) return;
    const r=REGIONS.find(reg=>reg.name===savedSession.regionName);
    if(!r) return;
    regionRef.current=r;reviewRef.current=savedSession.reviewOnly;
    setRegion(r);setReviewOnly(savedSession.reviewOnly);
    setSession(savedSession.session);
    questionCountRef.current=savedSession.questionCount;
    setQuestionCount(savedSession.questionCount);
    setPhase(savedSession.phase);
    setWasCorrect(savedSession.wasCorrect);
    setInput(savedSession.input||"");
    setAnsweredInSession(new Set(savedSession.answeredInSession || []));
    setTotalPokes(savedSession.totalPokes || (savedSession.reviewOnly ? getStats(r, progress).boxes[0] : (r.max - r.min + 1)));
    setQuestion({id:savedSession.questionId,name:POKE_NAMES[savedSession.questionId]||`No.${savedSession.questionId}`});
    setScreen("quiz");
    if(savedSession.phase==="answering") setTimeout(()=>inputRef.current?.focus(),80);
  };

  const clearSavedSession=async()=>{
    await storage.set(SESSION_KEY,"");setSavedSession(null);
  };

  if(screen==="home") return(
    <div style={S.page}>
      <div style={S.homeWrap}>
        <div style={{fontSize:50,filter:"drop-shadow(0 0 18px #facc1570)",marginBottom:6}}>⚡</div>
        <h1 style={S.homeTitle}>ポケモン名前クイズ</h1>
        <p style={S.homeSub}>Ankiスタイルで全1025匹を制覇しよう</p>
        {!loaded&&<p style={{color:"#475569",fontSize:13}}>準備中...</p>}
        {loaded&&<>
          {savedSession&&(
            <div style={S.resumeCard}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:26}}>⏸️</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#f1f5f9"}}>中断中のクイズがあります</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>
                    {savedSession.regionName} · 第{savedSession.questionCount}問 · {savedSession.session.correct}正解/{savedSession.session.correct+savedSession.session.wrong}問
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={resumeSession} style={{...S.btnP,background:"#7c6aff"}}>▶ 続きから再開</button>
                <button onClick={clearSavedSession} style={{...S.btnO,borderColor:"#334155",color:"#64748b",flex:"none",padding:"9px 14px"}}>削除</button>
              </div>
            </div>
          )}
          {(()=>{
            const{dueToday,dueTomorrow,newAvail}=getSrsStats(srsData);
            const sessionSize=Math.min(dueToday,MAX_REVIEW)+Math.min(newAvail,MAX_NEW);
            return(
              <div style={{...S.regionCard,borderColor:"rgba(124,106,255,0.3)",marginBottom:4}}>
                <div style={S.rcHead}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>📅</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>復習モード</div>
                      <div style={{fontSize:10,color:"#475569"}}>間隔反復（Anki方式）</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#7c6aff"}}>{dueToday}</div>
                    <div style={{fontSize:10,color:"#475569"}}>今日の復習</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:16,fontSize:11,color:"#475569"}}>
                  <span>🆕 新規 {newAvail}匹</span>
                  {dueTomorrow>0&&<span>📆 明日 {dueTomorrow}匹</span>}
                  <span>合計 {Object.keys(srsData).length}匹登録済み</span>
                </div>
                <button onClick={startReview} disabled={sessionSize===0}
                  style={{...S.btnP,background:sessionSize>0?"#7c6aff":"#1e293b",cursor:sessionSize>0?"pointer":"not-allowed"}}>
                  {sessionSize>0?`復習を始める（${sessionSize}匹）`:"今日の復習は完了！"}
                </button>
              </div>
            );
          })()}
          <div style={S.regionList}>
            {REGIONS.map(r=>{
              const {total,boxes}=getStats(r,progress);
              const mastered=boxes[3]+boxes[4];
              const pct=Math.round((mastered/total)*100);
              const unknown=boxes[0];
              return(
                <div key={r.name} style={S.regionCard}>
                  <div style={S.rcHead}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:20}}>{r.emoji}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{r.name}</div>
                        <div style={{fontSize:10,color:"#475569"}}>No.{r.min}–{r.max} / {total}匹</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:18,fontWeight:800,color:r.color}}>{pct}%</div>
                      <div style={{fontSize:10,color:"#475569"}}>{mastered}/{total} 習熟</div>
                    </div>
                  </div>
                  <div style={S.miniBar}>
                    {boxes.map((cnt,i)=>cnt>0&&<div key={i} style={{height:"100%",width:`${(cnt/total)*100}%`,background:BOX_COLORS[i]}}/>)}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>startQuiz(r,false)} style={{...S.btnP,background:r.color}}>通常モード</button>
                    <button onClick={()=>startQuiz(r,true)} disabled={unknown===0}
                      style={{...S.btnO,borderColor:unknown>0?r.color:"#1e293b",color:unknown>0?r.color:"#334155",cursor:unknown>0?"pointer":"not-allowed"}}>
                      復習のみ {unknown>0?`(${unknown})`:"✓"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>setScreen("pokedex")} style={{...S.btnP,background:"#7c6aff"}}>📖 習熟度一覧</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(progress)); alert('データがクリップボードにコピーされました');}} style={{...S.btnO,borderColor:"#7c6aff",color:"#7c6aff"}}>📤 エクスポート</button>
            <button onClick={()=>{const data=prompt('JSONデータを貼り付けてください'); if(data){try{const p=JSON.parse(data);setProgress(p);progressRef.current=p;save(p);alert('インポート完了');}catch{alert('無効なデータ');}}}} style={{...S.btnO,borderColor:"#7c6aff",color:"#7c6aff"}}>📥 インポート</button>
            {BOX_LABELS.map((l,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:BOX_COLORS[i]}}/>
                <span style={{fontSize:10,color:"#475569"}}>{l}</span>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );

  if(screen==="pokedex") return(
    <div style={S.page}>
      <div style={S.homeWrap}>
        <h1 style={S.homeTitle}>📖 習熟度一覧</h1>
        <p style={S.homeSub}>全国図鑑風にポケモンの習熟度を確認</p>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={()=>setScreen("home")} style={S.backBtn}>← ホーム</button>
          <button onClick={()=>setImageMode(imageMode === 'hd' ? 'small' : 'hd')} style={{...S.btnP,background: imageMode === 'hd' ? '#7c6aff' : '#475569'}}>
            {imageMode === 'hd' ? '軽量' : 'HD'}
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:12,width:"100%",maxWidth:600}}>
          {Object.keys(POKE_NAMES).map(idStr=>{
            const id=parseInt(idStr);
            const box=progress[id]??0;
            const name=POKE_NAMES[id];
            return(
              <div key={id} style={{...S.pokeCard,borderColor:BOX_COLORS[box]}}>
                <div style={{width:80,height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <PokeImage id={id} mode={imageMode}/>
                </div>
                <div style={{fontSize:10,color:"#475569",textAlign:"center"}}>No.{String(id).padStart(4,"0")}</div>
                <div style={{fontSize:12,fontWeight:700,color:"#f1f5f9",textAlign:"center"}}>{name}</div>
                <div style={{fontSize:10,color:BOX_COLORS[box],textAlign:"center"}}>{BOX_LABELS[box]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const {correct,wrong}=session;
  const total=correct+wrong;
  const curBox=question?.id?(progress[question.id]??0):0;
  const newBox=question?.id?(progress[question.id]??0):0;

  if(question?.id===null&&isReviewMode){
    const{dueToday:nextDue}=getSrsStats(srsData);
    return(
      <div style={S.page}>
        <div style={{...S.card,justifyContent:"center",padding:"48px 24px",gap:16}}>
          <div style={{fontSize:56}}>🎊</div>
          <h2 style={{color:"#f1f5f9",margin:0,textAlign:"center"}}>今日の復習完了！</h2>
          <div style={{display:"flex",gap:24,justifyContent:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color:"#4ade80"}}>{session.correct}</div>
              <div style={{fontSize:11,color:"#475569"}}>正解</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color:"#f87171"}}>{session.wrong}</div>
              <div style={{fontSize:11,color:"#475569"}}>もう一度</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color:"#e2e8f0"}}>{questionCount}</div>
              <div style={{fontSize:11,color:"#475569"}}>問</div>
            </div>
          </div>
          {nextDue>0
            ?<p style={{color:"#64748b",textAlign:"center",fontSize:13,margin:0}}>次の復習：今日あと {nextDue} 匹</p>
            :<p style={{color:"#64748b",textAlign:"center",fontSize:13,margin:0}}>今日の復習はすべて完了 🎉</p>
          }
          <button onClick={()=>{isReviewModeRef.current=false;setIsReviewMode(false);storage.set(SESSION_KEY,"");setSavedSession(null);setScreen("home");}}
            style={{...S.btnP,background:"#7c6aff",marginTop:8}}>← ホームへ</button>
        </div>
      </div>
    );
  }

  if(question?.id===null) return(
    <div style={S.page}>
      <div style={{...S.card,justifyContent:"center",padding:"48px 24px",gap:16}}>
        <div style={{fontSize:56}}>🎉</div>
        <h2 style={{color:"#f1f5f9",margin:0,textAlign:"center"}}>完璧！</h2>
        <p style={{color:"#64748b",textAlign:"center",fontSize:14,margin:0}}>{region.name}の未習得ポケモンはいません</p>
        <button onClick={()=>{storage.set(SESSION_KEY,"");setSavedSession(null);setScreen("home");}} style={{...S.btnP,background:region.color,marginTop:8}}>← ホームへ</button>
      </div>
    </div>
  );

  return(
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={()=>{
          if(question?.id&&region){
            const data={regionName:region.name,reviewOnly,questionId:question.id,phase,wasCorrect,input,session:{...session},questionCount};
            storage.set(SESSION_KEY,JSON.stringify(data));
            setSavedSession(data);
          }
          setScreen("home");
        }} style={S.backBtn}>← ホーム</button>
        <div style={{textAlign:"center"}}>
          <div style={{color:region.color,fontWeight:700,fontSize:13}}>{region.emoji} {region.name}</div>
          <div style={{color:"#334155",fontSize:11}}>{isReviewMode?"📅 間隔復習モード":reviewOnly?"復習のみ":"通常モード"}</div>
        </div>
        <div style={{textAlign:"right",fontSize:14,minWidth:64}}>
          {questionCount>0
            ?<><span style={{color:"#e2e8f0",fontWeight:800}}>{session.correct}</span><span style={{color:"#334155"}}> / {totalPokes}</span></>
            :<span style={{color:"#1e293b",fontSize:11}}>スタート！</span>
          }
        </div>
      </div>
      <div style={S.card}>
        {question?.id&&(
          <div style={{...S.boxBadge,background:`${BOX_COLORS[curBox]}18`,border:`1px solid ${BOX_COLORS[curBox]}50`,color:BOX_COLORS[curBox]}}>
            {BOX_LABELS[curBox]}
          </div>
        )}
        <div style={S.imgWrap}>
          {question?.id&&<PokeImage key={question.id} id={question.id} mode={imageMode}/>}
        </div>
        {question?.id&&(
          <div style={{color:"#1e293b",fontSize:11,letterSpacing:1,marginBottom:14}}>
            No.{String(question.id).padStart(4,"0")}
          </div>
        )}
        {question?.name&&phase==="answering"&&(
          <>
            <p style={{color:"#475569",fontSize:13,margin:"0 0 10px"}}>
              このポケモンの名前は？<span style={{color:"#334155",fontSize:11}}> カタカナで入力</span>
            </p>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey} onCompositionStart={handleCompositionStart} onCompositionEnd={handleCompositionEnd}
              style={S.input} autoComplete="off" autoCorrect="off" spellCheck="false"/>
            <div style={{display:"flex",gap:8,marginTop:10,width:"100%"}}>
              <button onClick={()=>submitAnswer(true)} style={S.giveUpBtn}>わからない</button>
              <button onClick={()=>submitAnswer(false)} style={{...S.answerBtn,background:region.color}}>こたえる</button>
            </div>
          </>
        )}
        {phase==="result"&&question?.id&&(
          <div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            {wasCorrect?(
              <div style={{...S.resultBox,background:"#4ade8012",border:"1px solid #4ade8040"}}>
                <span style={{fontSize:28}}>⭕</span>
                <span style={{fontSize:24,fontWeight:900,color:"#4ade80",letterSpacing:1.5}}>{question.name}</span>
              </div>
            ):(
              <div style={{...S.resultBox,background:"#f8717112",border:"1px solid #f8717130",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:24}}>❌</span>
                  {input&&<span style={{color:"#f87171",fontSize:13}}>「{input}」</span>}
                </div>
                <div style={{color:"#fbbf24",fontSize:21,fontWeight:900,letterSpacing:1.5}}>正解：{question.name}</div>
                {!isReviewMode&&<div style={{color:"#ef4444",fontSize:11}}>→ 未習得に戻ります</div>}
              </div>
            )}
            {!isReviewMode&&wasCorrect&&<div style={{fontSize:12,color:"#334155"}}>{newBox>=4?"🎉 マスター達成！":`→ ${BOX_LABELS[Math.min(newBox,4)]} にアップ`}</div>}

            {isReviewMode?(()=>{
              const card=srsDataRef.current[question.id]??{interval:1,easeFactor:2.5,lapses:0,reviewCount:0};
              const hints={
                again:"今日",
                hard:calcSrsUpdate(card,"hard").interval+"日後",
                good:calcSrsUpdate(card,"good").interval+"日後",
                easy:calcSrsUpdate(card,"easy").interval+"日後",
              };
              return(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,width:"100%"}}>
                    <button onClick={()=>applyRating("again")} style={{...S.ratingBtn,background:"#ef444420",border:"1px solid #ef444460",color:"#f87171"}}>
                      <span style={{fontSize:13,fontWeight:700}}>もう一度</span>
                      <span style={{fontSize:10,opacity:0.7}}>{hints.again}</span>
                    </button>
                    <button onClick={()=>applyRating("hard")} style={{...S.ratingBtn,background:"#f9731620",border:"1px solid #f9731660",color:"#fb923c"}}>
                      <span style={{fontSize:13,fontWeight:700}}>むずかしい</span>
                      <span style={{fontSize:10,opacity:0.7}}>{hints.hard}</span>
                    </button>
                    <button onClick={()=>applyRating("good")} style={{...S.ratingBtn,background:"#22c55e20",border:"1px solid #22c55e60",color:"#4ade80"}}>
                      <span style={{fontSize:13,fontWeight:700}}>わかった</span>
                      <span style={{fontSize:10,opacity:0.7}}>{hints.good}</span>
                    </button>
                    <button onClick={()=>applyRating("easy")} style={{...S.ratingBtn,background:"#60a5fa20",border:"1px solid #60a5fa60",color:"#93c5fd"}}>
                      <span style={{fontSize:13,fontWeight:700}}>かんたん</span>
                      <span style={{fontSize:10,opacity:0.7}}>{hints.easy}</span>
                    </button>
                  </div>
                  <div style={{fontSize:10,color:"#334155"}}>残り {reviewQueueRef.current.length + againQueueRef.current.length} 枚</div>
                </>
              );
            })():(
              <button onClick={()=>nextQuestion(regionRef.current,reviewRef.current,progressRef.current)}
                onKeyDown={handleKey} style={{...S.answerBtn,background:region.color,width:"100%"}} autoFocus>
                次へ → <span style={{fontSize:11,opacity:0.6}}>Enter</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div style={{position:"absolute",bottom:10,left:10}}>
        <button onClick={()=>setImageMode(imageMode === 'hd' ? 'small' : 'hd')} style={{...S.modeBtn, background: imageMode === 'hd' ? '#7c6aff' : '#475569'}}>
          {imageMode === 'hd' ? '軽量' : 'HD'}
        </button>
      </div>
    </div>
  );
}

const S={
  page:{minHeight:"100vh",background:"linear-gradient(160deg,#060a10 0%,#0d1117 100%)",display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 14px 56px",fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif",color:"#e2e8f0"},
  homeWrap:{width:"100%",maxWidth:480,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:18},
  homeTitle:{fontSize:26,fontWeight:900,margin:"0 0 4px",letterSpacing:"-0.5px",color:"#f8fafc"},
  homeSub:{fontSize:12,color:"#475569",margin:"0 0 24px"},
  regionList:{width:"100%",display:"flex",flexDirection:"column",gap:9},
  regionCard:{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"14px 15px",display:"flex",flexDirection:"column",gap:10},
  rcHead:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  miniBar:{height:4,borderRadius:4,overflow:"hidden",background:"rgba(255,255,255,0.04)",display:"flex"},
  btnP:{flex:1,border:"none",borderRadius:10,padding:"9px 0",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  btnO:{flex:1,background:"transparent",border:"1px solid",borderRadius:10,padding:"9px 0",fontWeight:600,fontSize:13,fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  header:{width:"100%",maxWidth:460,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},
  backBtn:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"7px 12px",color:"#475569",cursor:"pointer",fontSize:12,fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  card:{width:"100%",maxWidth:460,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:24,padding:"18px 20px 22px",display:"flex",flexDirection:"column",alignItems:"center",position:"relative"},
  boxBadge:{borderRadius:8,padding:"2px 10px",fontSize:11,fontWeight:700,letterSpacing:0.3,marginBottom:6},
  imgWrap:{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center"},
  input:{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.13)",borderRadius:12,padding:"14px 16px",color:"#f1f5f9",fontSize:20,fontWeight:700,fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif",outline:"none",textAlign:"center",letterSpacing:2,boxSizing:"border-box"},
  answerBtn:{flex:3,border:"none",borderRadius:12,padding:"13px 0",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  giveUpBtn:{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"13px 0",color:"#475569",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  resultBox:{display:"flex",alignItems:"center",justifyContent:"center",gap:12,borderRadius:14,padding:"16px 20px",width:"100%"},
  modeBtn:{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"8px 12px",color:"#475569",cursor:"pointer",fontSize:12,fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif"},
  pokeCard:{background:"rgba(255,255,255,0.035)",border:"1px solid",borderRadius:12,padding:"12px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4},
  ratingBtn:{borderRadius:12,padding:"12px 8px",fontWeight:700,cursor:"pointer",fontFamily:"'Hiragino Sans','Noto Sans JP',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:3},
};
