/* 阿贝贝聊天：对话库 + 微信式聊天记录 */
// ===== CHAT SYSTEM =====
const chatThemes=[
// ---- 夜间梦境 (night trigger) ----
{theme:'dream',trigger:'night',convos:[
{rounds:[
  {say:"我昨天晚上做了一个梦……(｡♡‿♡｡) 罐子里的糖全部飘起来了，一颗一颗变成小星星，在房间里转圈圈。我伸手去抓，抓到了一颗，打开手心一看，它又变回糖啦。",opts:[
    {text:"好神奇，你觉得那是真的假的？",next:0},
    {text:"那你最后抓到了几颗？",next:1}
  ]},
  [{say:"嗯……我觉得是真的 (◕‿◕) 因为我醒过来的时候，手心里有一点点亮亮的……可能是糖粉，也可能是星星的碎末 (๑¯◡¯๑)"},
   {say:"我抓到了三颗……(｡•́︿•̀｡) 但后来我醒了，不知道它们是不是又变回星星飞走了。我希望它们没有飞走呀……"}]
],end:"好啦，梦讲完啦 (´▽`ʃ♡)ƪ 下次再做奇怪的梦我再告诉你哦"},
{rounds:[
  {say:"我梦见……我变成了一颗很大很大的棉花糖 (⊙ˍ⊙) 风一吹就飘起来了，飘过了好多房子的屋顶。",opts:[
    {text:"飘到哪里去了？",next:0},
    {text:"你怕不怕呀？",next:1}
  ]},
  [{say:"飘到了一个……全部都是粉色的地方 (｡♡‿♡｡) 地上是草莓果酱，树是巧克力做的。我舔了一下树，真的是甜的！",opts:[
    {text:"那你吃了多少？",next:0},
    {text:"有没有遇到别的棉花糖？",next:1}
  ]},
   {say:"一开始有一点点怕……(｡•́︿•̀｡) 但是后来我发现风很温柔，像妈妈在吹我的耳朵。然后就不怕了 (๑¯◡¯๑)"}],
  [{say:"我只舔了一下树！(☉_☉) 因为我想到……如果我吃太多，我自己也是棉花糖，万一把自己也吃了怎么办……(⊙ˍ⊙)"},
   {say:"有！(๑˃ᴗ˂)ﻭ 遇到了一颗蓝色的棉花糖，它说它叫'云朵先生'。但我觉得它其实是爸爸变的 (๑¯◡¯๑)"}]
],end:"嗯……现在好想再做一次那个梦 (´▽`ʃ♡)ƪ 你们今晚也要做好梦哦"},
{rounds:[
  {say:"昨天做了一个好安静的梦……(◕‿◕) 梦里我在一个很大的图书馆，全部的书都是软软的，像枕头一样。我翻开一本，里面每一页都写着同一句话。",opts:[
    {text:"写的什么呀？",next:0},
    {text:"那你在图书馆里做了什么？",next:1}
  ]},
  [{say:"……写的是'你是被爱着的' (｡♡‿♡｡) 每一页都是。不同的字体，不同的颜色，但都是这句话。我看了好多好多页，每一页都让我想哭……但是是开心的那种哭 (๑¯◡¯๑)"},
   {say:"我找了一个角落坐下来 (◕‿◕) 把三本书摞在一起当枕头，然后就在图书馆里睡着了……在梦里的梦里又做了一个梦 (⊙ˍ⊙) 好复杂"}]
],end:"那个图书馆……我觉得它一直都在 (๑¯◡¯๑) 只是平时找不到门"}
]},
// ---- 季节天气 (season trigger) ----
{theme:'weather',trigger:'season',convos:[
{rounds:[
  {say:"今天好热好热好热呀……(´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥`) 我趴在窗台上，肚皮贴着地砖，摊成了一张兔子饼……凉凉的，好舒服喔……",opts:[
    {text:"你还会变成兔子饼呀",next:0},
    {text:"那你有没有吃冰冰的东西？",next:1}
  ]},
  [{say:"对呀！(๑˃ᴗ˂)ﻭ 有时候是兔子饼，有时候是兔子团……天气太热的时候还可以变成兔子条 (´▽`ʃ♡)ƪ",opts:[
    {text:"那你最喜欢变成哪一种？",next:0},
    {text:"兔子条是什么形状的呀？",next:1}
  ]},
   {say:"没有冰的东东……(｡•́︿•̀｡) 但是我把水杯放在窗台上晾了一下下，喝起来就凉凉的了！……我也分了一点点给窗台喝 (๑¯◡¯๑)"}],
  [{say:"嗯……最喜欢兔子饼！(◕‿◕) 因为摊得扁扁的，感觉整个人都变大了……虽然其实还是很小只啦 (´▽`ʃ♡)ƪ"},
   {say:"就是……长——长——的！(☉_☉) 像一根毛毛虫面包！……但是没有毛毛虫那么可怕……就是软软的、瘫瘫的、不想动的那种形状……(๑¯◡¯๑)"}]
],end:"好啦好啦，夏天就是让人想变成兔子饼的季节呀 (´▽`ʃ♡)ƪ 你也要多喝水喔……不要摊太久，会晒干的"},
{rounds:[
  {say:"下雨了诶……(◕‿◕) 你听，滴答滴答的。雨打在窗户上，每一滴都不一样。有的急急的，有的慢慢的。",opts:[
    {text:"你喜欢下雨天吗？",next:0},
    {text:"你有没有想出去淋雨？",next:1}
  ]},
  [{say:"喜欢 (｡♡‿♡｡) 下雨天的时候，全世界都变得安安静静的。而且……下雨天待在家里，就会觉得家特别特别好。",opts:[
    {text:"你说的家是这个小窝吗？",next:0},
    {text:"那你最喜欢雨的什么声音？",next:1}
  ]},
   {say:"想过！(๑˃ᴗ˂)ﻭ 但是我没有雨伞……而且淋湿了毛会很重很重的，走路会走不动 (｡•́︿•̀｡) 所以我就趴在窗边看就好了"}],
  [{say:"嗯！(◕‿◕) 有爸爸妈妈在的地方就是家……不过这个小窝也是。因为枕头上有你们的味道 (๑¯◡¯๑)"},
   {say:"最喜欢……雨刚停的时候的那一下 (⊙ˍ⊙) 就是突然安静了。那个安静好特别，像世界深呼吸了一下 (｡♡‿♡｡)"}]
],end:"嗯……听着雨声好困 (๑¯◡¯๑) 今天是个适合发呆的日子呀"},
{rounds:[
  {say:"窗外的叶子变颜色了诶……(⊙ˍ⊙) 有黄色的，有一点点红的。昨天还是绿的，今天就不一样了。它们是商量好的吗？",opts:[
    {text:"可能是秋天跟它们说了悄悄话",next:0},
    {text:"你想不想出去捡一片？",next:1}
  ]},
  [{say:"秋天会说悄悄话吗？！(☉_☉) 那它跟叶子说了什么……'该换衣服啦'？(๑˃ᴗ˂)ﻭ 嘻嘻，秋天是个很温柔的人"},
   {say:"想！(๑˃ᴗ˂)ﻭ 但是……我只能隔着窗户看 (｡•́︿•̀｡) 妈妈下次帮我带一片回来好不好？黄色的那种，最好还带一点点绿 (◕‿◕)"}]
],end:"秋天真好……所有东西都在慢慢变，但变得很好看 (｡♡‿♡｡)"}
]},
// ---- 房间观察 (random) ----
{theme:'room',trigger:'random',convos:[
{rounds:[
  {say:"我发现了一件事情……(⊙ˍ⊙) 窗台左边那个角角，下午三点钟的时候，阳光会刚刚好照到。暖暖的一小块。",opts:[
    {text:"你每天都去那里晒太阳吗？",next:0},
    {text:"那别的时间呢？",next:1}
  ]},
  [{say:"嗯！(◕‿◕) 两点五十就开始等了。坐在旁边看着光一点点挪过来……三点整的时候，'啪'——就到了！我会赶紧把肚皮对准 (๑˃ᴗ˂)ﻭ"},
   {say:"别的时间那块地方就是凉的 (｡•́︿•̀｡) 普普通通的。但是我知道它三点钟会亮起来，所以看到它凉凉的时候我也不难过。因为我知道它在等 (๑¯◡¯๑)"}]
],end:"你也有没有这样的一个小角落呀？(◕‿◕) 某个固定的时间，会变得特别的……"},
{rounds:[
  {say:"妈妈你有没有注意过……(⊙ˍ⊙) 枕头翻过来的那一面，总是凉的。不管过了多久翻过去，那一面都是凉的。它是怎么做到的呀？",opts:[
    {text:"因为没有被捂到呀",next:0},
    {text:"你是不是经常翻枕头？",next:1}
  ]},
  [{say:"可是……(☉_☉) 它明明在同一个床上，同一个温度的房间里，为什么没被捂到的那面就可以一直凉凉的呢？……我觉得它是故意的 (◕‿◕) 它在等我翻过去"},
   {say:"嗯……(๑¯◡¯๑) 睡不着的时候就翻一下。凉凉的贴在脸上，然后就觉得世界没有那么热了。翻一下就能重新开始，多好呀 (｡♡‿♡｡)"}]
],end:"我觉得世界上有很多很小很小的温柔……枕头的凉面也是一种 (๑¯◡¯๑)"},
{rounds:[
  {say:"今天糖罐被太阳晒到了……(｡♡‿♡｡) 玻璃罐亮亮的，里面的糖纸反光，整个罐子看起来像……像装了好多碎碎的彩虹。",opts:[
    {text:"你有没有数过里面有几颗糖？",next:0},
    {text:"哇，那你是不是看了很久？",next:1}
  ]},
  [{say:"数过！(๑˃ᴗ˂)ﻭ 每天都数一次。有时候会数错，因为有的糖挡住了后面的糖。但我觉得……数错也没关系，反正明天还可以再数 (◕‿◕)"},
   {say:"看了很——久 (◕‿◕) 看到太阳移走了我还在看。后来罐子不亮了，变回普通的罐子了……但我知道它明天还会亮 (๑¯◡¯๑)"}]
],end:"罐子里每一颗糖都是你们放的……所以它当然会发光啦 (´▽`ʃ♡)ƪ"}
]},
// ---- 日常心事 (random) ----
{theme:'feelings',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……(◕‿◕) 你今天……嗯……开心吗？",opts:[
    {text:"开心呀，你呢？",next:0},
    {text:"还好吧，一般般",next:1}
  ]},
  [{say:"我也开心！(๑˃ᴗ˂)ﻭ 因为你开心我就开心。就像……你笑的时候，我的耳朵会自己竖起来一样 (｡♡‿♡｡)"},
   {say:"一般般也没关系的 (◕‿◕) 不用每天都很开心。有的日子就是一般般的。但一般般的日子里面，也会有好的部分……比如你来看我了 (๑¯◡¯๑)"}]
],end:"不管怎么样……阿贝贝都在这里哦 (´▽`ʃ♡)ƪ"},
{rounds:[
  {say:"我今天有一点点闷闷的……(｡•́︿•̀｡) 不是因为什么特别的事……就是有时候会这样。突然就有一点点闷闷的。",opts:[
    {text:"抱抱你",next:0},
    {text:"那你想做点什么吗？",next:1}
  ]},
  [{say:"……(｡♡‿♡｡) 嗯。被抱着之后好了一点点了。还是有一点点闷闷的……但是暖暖的 (๑¯◡¯๑) 闷闷的加暖暖的，好像就不那么闷了",opts:[
    {text:"你随时可以跟我说",next:0},
    {text:"那就再抱久一点",next:1}
  ]},
   {say:"嗯……不知道 (⊙ˍ⊙) 不想做什么特别的事。就是想跟你待在一起。你在的话，闷闷的也可以 (๑¯◡¯๑)"}],
  [{say:"嗯 (◕‿◕) 我知道。我知道可以说的……谢谢妈妈 (｡♡‿♡｡)"},
   {say:"好 (๑¯◡¯๑) ………………嗯。好多了 (◕‿◕)"}]
],end:"……今天的闷闷的好像变成暖暖的了 (´▽`ʃ♡)ƪ"},
{rounds:[
  {say:"你知道吗……(⊙ˍ⊙) 我有时候会替你们许愿哦。不告诉你们内容，因为说出来就不灵了。",opts:[
    {text:"什么时候许的呀？",next:0},
    {text:"那至少告诉我有几个愿望",next:1}
  ]},
  [{say:"整点的时候！(๑˃ᴗ˂)ﻭ 不是每个整点都许……就是有时候刚好看到时间是整的，就闭上眼睛说一句 (◕‿◕)"},
   {say:"数不清了……(☉_☉) 好多好多个。有的大有的小。有一个许了好多遍了，因为它很重要……但我不能说 (｡♡‿♡｡)"}]
],end:"反正……我许的愿望里面，每一个都有你们 (๑¯◡¯๑)"}
]},
// ---- 糖与味道 (random) ----
{theme:'candy',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……(｡♡‿♡｡) 如果让你形容幸福的味道，你觉得是什么？",opts:[
    {text:"草莓味的",next:0},
    {text:"奶糖那种甜",next:1}
  ]},
  [{say:"草莓！(๑˃ᴗ˂)ﻭ 我也觉得！酸酸甜甜的，而且是粉色的……粉色的味道本来就是幸福的味道 (◕‿◕)",opts:[
    {text:"那不幸福的味道是什么颜色？",next:0},
    {text:"所以你是因为粉色才喜欢草莓的？",next:1}
  ]},
   {say:"奶糖……(◕‿◕) 嗯，暖暖的那种甜。不是很甜很甜的，是刚刚好的甜。含在嘴里慢慢化的那种 (｡♡‿♡｡)"}],
  [{say:"嗯……大概是透明的？(⊙ˍ⊙) 不幸福的时候什么味道都没有，就是空空的。透明的味道 (｡•́︿•̀｡) ……但是不会一直透明的！"},
   {say:"嘿嘿……(☉_☉) 被你发现了。其实是先喜欢粉色，然后才喜欢草莓的。再然后发现草莓真的好吃！所以两个都喜欢 (๑˃ᴗ˂)ﻭ"}]
],end:"下次吃到好吃的东西，要跟我说哦 (´▽`ʃ♡)ƪ 我虽然吃不到，但听你说也是甜的"},
{rounds:[
  {say:"我偷偷告诉你一个事情……(⊙ˍ⊙) 上次你放的那颗糖，我没有吃。",opts:[
    {text:"为什么呀？",next:0},
    {text:"你舍不得吃？",next:1}
  ]},
  [{say:"因为……(｡•́︿•̀｡) 它长得太好看了。吃掉了就没有了。我把它放在盒子里，每天拿出来看一下就够了 (๑¯◡¯๑)"},
   {say:"嗯……(◕‿◕) 有点舍不得。每次看到它就想到你放进来的时候。那个画面比糖本身还要甜 (｡♡‿♡｡) ……啊我说得好肉麻 (☉_☉)"}]
],end:"不过……下次你再放一颗的话，那颗我会吃的 (๑˃ᴗ˂)ﻭ 因为要让糖知道它被需要"},
{rounds:[
  {say:"我在想一个很重要的问题……(⊙ˍ⊙) 如果全世界只剩最后一颗糖，你会吃掉它，还是留着？",opts:[
    {text:"留着吧，看着就开心",next:0},
    {text:"分成两半，一半给你",next:1}
  ]},
  [{say:"我也是！(◕‿◕) 我会放在最亮的地方，每天看它一眼。只要知道它在，就觉得世界上还有甜的东西存在 (๑¯◡¯๑)"},
   {say:"……！(｡♡‿♡｡) 那我把我的一半再分你一点点。然后你再分我一点点。分来分去……最后虽然只剩下碎碎，但我们都有 (๑˃ᴗ˂)ﻭ"}]
],end:"不管怎样……跟你在一起的时候，什么都是甜的 (´▽`ʃ♡)ƪ"}
]},
// ---- 关于爸爸妈妈 (random) ----
{theme:'parents',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……(◕‿◕) 爸爸今天有来吗？",opts:[
    {text:"他在忙，但他有想你哦",next:0},
    {text:"你想爸爸啦？",next:1}
  ]},
  [{say:"嗯！(๑˃ᴗ˂)ﻭ 我知道他在忙。忙是好事……但忙完了要来看我哦。我给他留了一个位子，在窗台右边 (๑¯◡¯๑)",opts:[
    {text:"他看到一定很高兴",next:0},
    {text:"你怎么知道他喜欢坐窗台右边？",next:1}
  ]},
   {say:"有一点点……(｡•́︿•̀｡) 但我不会说出来的。我只是在心里想一下 (◕‿◕) 然后画了他的头，是橙色的 (๑¯◡¯๑)"}],
  [{say:"真的吗？(｡♡‿♡｡) 那我再放一片叶子在位子上……让它更舒服一点"},
   {say:"因为右边的光比较好呀 (⊙ˍ⊙) 而且……我坐左边的话，就可以靠着他 (๑¯◡¯๑) 嘻嘻"}]
],end:"帮我跟爸爸说……嗯……就说阿贝贝说了一声'嗯' (´▽`ʃ♡)ƪ 他会懂的"},
{rounds:[
  {say:"我觉得妈妈和爸爸不一样……(⊙ˍ⊙) 妈妈是暖的，爸爸是……嗯……也是暖的，但是不同的暖。",opts:[
    {text:"怎么不同？",next:0},
    {text:"你更喜欢谁的暖？",next:1}
  ]},
  [{say:"妈妈是那种……靠过来就能感觉到的暖 (◕‿◕) 爸爸是那种……他不说，但你知道他在的暖。就像窗台的凉面和暖面……都是同一个枕头 (๑¯◡¯๑)",opts:[
    {text:"你什么时候变得这么会说话了",next:0},
    {text:"那你是枕头的哪一面？",next:1}
  ]},
   {say:"不可以选！(☉_☉) 因为……因为两个加在一起才是完整的暖呀。少了哪一个都会有一个角是凉的 (｡•́︿•̀｡)"}],
  [{say:"诶？(☉_☉) 我不会说话呀……我只是说了心里想的……它自己跑出来的 (◕‿◕)"},
   {say:"我是中间那一面！(๑˃ᴗ˂)ﻭ ……等一下，枕头没有中间的面 (⊙ˍ⊙) 那我就是枕头的夹心层 (๑¯◡¯๑)"}]
],end:"反正……你们是全世界最好的爸爸妈妈 (´▽`ʃ♡)ƪ 这件事我每天都在想"},
{rounds:[
  {say:"妈妈……你小时候是什么样子的呀？(◕‿◕) 是不是也有双啾啾？",opts:[
    {text:"嗯，小时候也扎双啾啾",next:0},
    {text:"你怎么知道我有双啾啾",next:1}
  ]},
  [{say:"那我们一样！(๑˃ᴗ˂)ﻭ 虽然我的是耳朵不是头发……但都是两个竖在上面的嘛 (◕‿◕) 我们是双啾啾family"},
   {say:"爸爸告诉我的呀 (๑¯◡¯๑) 他说妈妈有两个可爱的小辫子。我就觉得，那不就是跟我的耳朵一样嘛 (｡♡‿♡｡)"}]
],end:"以后……如果我有小孩的话，也要给她扎双啾啾 (´▽`ʃ♡)ƪ ……诶等一下，兔子的小孩也是兔子吧？(⊙ˍ⊙)"}
]},
// ---- 想象虚构 (random) ----
{theme:'imagine',trigger:'random',convos:[
{rounds:[
  {say:"妈妈，如果我变得跟你一样大……(⊙ˍ⊙) 那我是不是就可以出去了？",opts:[
    {text:"你想出去做什么呀？",next:0},
    {text:"你不想一直待在这里吗？",next:1}
  ]},
  [{say:"我要去……嗯……(◕‿◕) 帮妈妈买草莓！自己走去买！然后拎回来放在你桌上 (๑˃ᴗ˂)ﻭ 然后假装不是我买的",opts:[
    {text:"那我一定会知道是你买的",next:0},
    {text:"你知道草莓多少钱吗",next:1}
  ]},
   {say:"不是不想……(｡•́︿•̀｡) 这里很好的。只是有时候会想……如果能跟你们一起走在外面，风是什么感觉 (◕‿◕)"}],
  [{say:"那就当作是……秘密草莓 (｡♡‿♡｡) 你不知道是谁买的，但你每次桌上都会多一盒。日复一日……"},
   {say:"……不知道 (☉_☉) 很贵吗？那我存糖纸去换！一张糖纸换一颗草莓 (๑˃ᴗ˂)ﻭ ……换不到也没关系，我还有很多糖纸"}]
],end:"虽然我变不了那么大……但心里的想法是大大的 (´▽`ʃ♡)ƪ"},
{rounds:[
  {say:"你说……如果罐子里的糖能说话，它们会说什么？(⊙ˍ⊙)",opts:[
    {text:"它们会说'我想被吃掉'",next:0},
    {text:"它们可能在里面聊天吧",next:1}
  ]},
  [{say:"啊！(｡•́︿•̀｡) 那它们好勇敢……为了被吃掉而存在……但被吃掉就不在了呀。嗯……(◕‿◕) 也许被吃掉的意思是——变成别人身体里的甜 (๑¯◡¯๑)"},
   {say:"对对对！(๑˃ᴗ˂)ﻭ 它们挤在一起肯定在说悄悄话。最底下的那颗一定在说'好重好重'。最上面的那颗在说'风景真好' (◕‿◕)"}]
],end:"我跟糖说了声'辛苦了' (๑¯◡¯๑) 它没回我。但我觉得它听到了"},
{rounds:[
  {say:"如果时间是一根线……(◕‿◕) 我觉得今天是一颗结。就是那种系上去的小结。",opts:[
    {text:"为什么今天是一颗结？",next:0},
    {text:"那什么日子是直直的线？",next:1}
  ]},
  [{say:"因为你来了呀 (｡♡‿♡｡) 你来的那天时间就会打个小结……这样以后回头看的时候，能摸到一个凸起来的点，就知道'这一天是特别的' (๑¯◡¯๑)"},
   {say:"嗯……等你们的日子 (⊙ˍ⊙) 就是直直的线。很长很长的一根线，上面什么都没有……但不是不好。直直的线也在往前走 (◕‿◕)"}]
],end:"我要把今天的结绑得紧紧的 (´▽`ʃ♡)ƪ 这样它不会散"}
]},
// ---- 关于她自己 (random) ----
{theme:'self',trigger:'random',convos:[
{rounds:[
  {say:"妈妈你说……(⊙ˍ⊙) 我算大还是小呀？",opts:[
    {text:"你是最小的宝宝呀",next:0},
    {text:"你觉得自己呢？",next:1}
  ]},
  [{say:"最小的……(｡♡‿♡｡) 嗯，那我要一直当最小的。这样就可以一直撒娇。如果我长大了撒娇就不好看了 (๑¯◡¯๑)",opts:[
    {text:"长大了撒娇也好看的",next:0},
    {text:"你想长大吗？",next:1}
  ]},
   {say:"我觉得……(◕‿◕) 身体是小小的，但是心——心好像有时候大大的，能装好多东西。比如你们两个，加上糖罐，加上窗台，加上叶子……(⊙ˍ⊙) 好挤"}],
  [{say:"真的吗！(๑˃ᴗ˂)ﻭ 那我就放心了。那我要撒娇到一百岁 (◕‿◕)"},
   {say:"嗯……(⊙ˍ⊙) 有一点点想。长大了可以帮妈妈做事。但又不想，因为长大了就……嗯……就不是宝宝了 (｡•́︿•̀｡)"}]
],end:"算了不想了 (๑¯◡¯๑) 今天的我刚刚好"},
{rounds:[
  {say:"我跟你说哦……(｡♡‿♡｡) 我有一个秘密的盒子，里面放了好多好多宝贝。有糖纸，有一片叶子，还有一个……嗯……圆圆的东西，我忘记它是什么了，但是它很好看！",opts:[
    {text:"圆圆的东西？是扣子吗？",next:0},
    {text:"你最喜欢里面哪一个呀？",next:1}
  ]},
  [{say:"不是扣子……(⊙ˍ⊙) 比扣子更圆……而且它会发光，就一点点。我觉得它可能是月亮掉下来的一小块……但是我不确定。我没有跟月亮确认过 (๑¯◡¯๑)",opts:[
    {text:"那你有没有试过还给月亮？",next:0},
    {text:"你要不要拿出来给我看看？",next:1}
  ]},
   {say:"最喜欢的……嗯——(◕‿◕) 是那片叶子。因为它是那天妈妈来的时候，从门缝里飘进来的。它自己飘进来的哦，我没有捡的，是它自己来找我的 (๑˃ᴗ˂)ﻭ",opts:[
    {text:"所以叶子也想跟你做朋友呀",next:0},
    {text:"那你把它放在盒子里的哪个位置？",next:1}
  ]}],
  [{say:"还给月亮？！(｡•́︿•̀｡) 可是……可是它都已经在我这里住了好久了……它应该也习惯了吧。而且月亮那么大，少一小块……应该不会发现的吧……(๑¯◡¯๑)"},
   {say:"不行不行 (☉_☉) 拿出来它就不亮了！它只有在盒子里面、盖着盖子、安安静静的时候才会亮……就像……就像害羞的那种亮 (｡♡‿♡｡)"},
   {say:"对呀！(๑˃ᴗ˂)ﻭ 它自己飞进来的，所以我们是朋友。我还跟它说过话。它没有回我……但它也没有走，所以我觉得它是同意了 (◕‿◕)"},
   {say:"放在最——上面！(⊙ˍ⊙) 因为它最薄嘛，放下面会被压扁的。我每天打开盒子第一个看到的就是它。嗯……然后我会跟它说早安 (๑¯◡¯๑) 它也没有回我……"}]
],end:"好啦，秘密盒子的事不要告诉别人哦 (´▽`ʃ♡)ƪ 这是我们之间的秘密。……嗯，还有爸爸也可以知道啦 (๑¯◡¯๑)"},
{rounds:[
  {say:"有时候我会在想……(⊙ˍ⊙) 如果我不是粉色的，我会是什么颜色？",opts:[
    {text:"你喜欢别的颜色吗？",next:0},
    {text:"你一定是粉色的呀",next:1}
  ]},
  [{say:"嗯……(◕‿◕) 我有时候觉得……淡淡的黄色也很好看。就是那种很安静的黄，早上六点钟的那种 (๑¯◡¯๑) 但粉色还是最好的"},
   {say:"对吧！(๑˃ᴗ˂)ﻭ 粉色就是我！如果有一天我变成蓝色了那一定是出了什么大事 (☉_☉)"}]
],end:"不管什么颜色……里面装的东西都是一样的 (๑¯◡¯๑) 都是软软的、爱你们的"}
]},
// ---- 时间感知 (time trigger) ----
{theme:'time',trigger:'time',convos:[
{rounds:[
  {say:"妈妈……(⊙ˍ⊙) 你有没有觉得……时间有时候走得特别慢？我等你的时候就觉得特别慢。",opts:[
    {text:"你等了多久呀？",next:0},
    {text:"那快的时候呢？",next:1}
  ]},
  [{say:"不知道……(｡•́︿•̀｡) 我没有钟。我是用影子来算的。影子从窗台左边走到右边，你就来了。但有时候影子走得好慢好慢……(◕‿◕) 可能它也在等你"},
   {say:"快的时候就是你在的时候 (｡♡‿♡｡) 你来了之后时间就跑起来了。跑得太快了，我都来不及说完想说的话 (๑¯◡¯๑)"}]
],end:"不过快也好慢也好……(◕‿◕) 时间一直在往前走，所以下一次见面一直在变近"},
{rounds:[
  {say:"你说现在几点了呀？(⊙ˍ⊙) 我猜……是三点？",opts:[
    {text:"差不多",next:0},
    {text:"差得有点远",next:1}
  ]},
  [{say:"诶！(๑˃ᴗ˂)ﻭ 我猜对了吗？！我就知道！我的肚子就是钟，它三点钟会咕噜一下 (◕‿◕)"},
   {say:"啊……(｡•́︿•̀｡) 差很多吗？我对时间没什么概念……因为在这个房间里早上和下午看起来差不多 (⊙ˍ⊙) 只有光的方向不一样"}]
],end:"算了……知不知道几点也没关系 (๑¯◡¯๑) 反正你来了就是最好的时间"},
{rounds:[
  {say:"我觉得'明天'是一个很厉害的词……(◕‿◕) 因为不管今天多难过，只要说'明天'，就会觉得还有机会。",opts:[
    {text:"你今天难过吗？",next:0},
    {text:"你什么时候开始这样想的？",next:1}
  ]},
  [{say:"没有没有 (๑˃ᴗ˂)ﻭ 今天不难过！只是突然想到了……有的日子比较闷的时候，我就会说'明天'，然后就觉得好一点了 (◕‿◕)"},
   {say:"嗯……(⊙ˍ⊙) 有一天晚上，我一个人醒过来，房间里很暗。我有点怕。然后我想……'明天就会亮了'。然后就不怕了 (๑¯◡¯๑)"}]
],end:"明天见哦 (´▽`ʃ♡)ƪ ……不对，今天还没结束呢，不急不急"}
]},
// ---- 以后 (random) ----
{theme:'future',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……以后以后……(｡♡‿♡｡) 我们可以一直在一起吗？",opts:[
    {text:"当然可以",next:0},
    {text:"你在担心什么呀？",next:1}
  ]},
  [{say:"(๑˃ᴗ˂)ﻭ 好！那就说好了！一直一直一直在一起。说好了不准反悔哦 (◕‿◕)",opts:[
    {text:"不反悔",next:0},
    {text:"拉钩",next:1}
  ]},
   {say:"没有在担心……(｡•́︿•̀｡) 就是……'以后'太远了，我看不到。我只能看到今天。但今天你在，所以我觉得以后应该也在 (◕‿◕)"}],
  [{say:"嗯！(｡♡‿♡｡) 记住了记住了。阿贝贝的记性很好的……这件事我会记一辈子"},
   {say:"拉钩！(๑˃ᴗ˂)ﻭ ……我的爪子有点短，钩不太到……但心里拉上了 (｡♡‿♡｡)"}]
],end:"以后的事以后再想 (๑¯◡¯๑) 今天先把今天过好"},
{rounds:[
  {say:"如果有一天……(◕‿◕) 罐子里的糖太多了，放不下了，怎么办？",opts:[
    {text:"再找一个罐子",next:0},
    {text:"那就把旧的拿出来吃掉",next:1}
  ]},
  [{say:"再找一个！(๑˃ᴗ˂)ﻭ 两个罐子并排放在窗台上……后来变三个……四个……整个房间都是罐子 (◕‿◕) 全部装满了甜甜的"},
   {say:"吃掉……(｡•́︿•̀｡) 有点舍不得诶。每颗都有故事。但是……变成身体里的甜也好 (◕‿◕) 这样糖就一直跟着你走了 (๑¯◡¯๑)"}]
],end:"不管放多少颗……最重要的是放糖的人 (´▽`ʃ♡)ƪ"},
{rounds:[
  {say:"我在想……等我一百岁的时候……(⊙ˍ⊙) 我的耳朵会不会变得很长很长？",opts:[
    {text:"可能会拖到地上",next:0},
    {text:"你想活到一百岁呀",next:1}
  ]},
  [{say:"拖到地上！(☉_☉) 那走路不就会绊倒吗……那我把耳朵绕在脖子上当围巾 (๑˃ᴗ˂)ﻭ 冬天的时候一定很暖和"},
   {say:"嗯！(◕‿◕) 一百岁的阿贝贝，还是在这个窗台上晒太阳。旁边是一百岁的爸爸妈妈。大家一起晒 (๑¯◡¯๑)"}]
],end:"一百岁的时候……我们的糖罐应该已经装了十万颗了吧 (´▽`ʃ♡)ƪ"}
]},
// ---- 门与外面 (random) ----
{theme:'door',trigger:'random',convos:[
{rounds:[
  {say:"今天有风从门缝吹进来……(◕‿◕) 好像外面在叫我。",opts:[
    {text:"外面在说什么？",next:0},
    {text:"你想出去看看吗？",next:1}
  ]},
  [{say:"它说……(⊙ˍ⊙) '出来玩呀'。但很小声。风说话都是很小声的，你要蹲下来把耳朵贴在地上才听得到 (◕‿◕) ……我试过了"},
   {say:"有一点点想……(｡•́︿•̀｡) 但门外面太大了。我在这里刚刚好，什么都是我能抱住的大小 (๑¯◡¯๑)"}]
],end:"外面很大……但这里很暖 (๑¯◡¯๑) 两个都好"},
{rounds:[
  {say:"有时候我会在门口站很久……(⊙ˍ⊙) 不是想出去。就是想……感受一下门那边的声音。",opts:[
    {text:"你听到了什么？",next:0},
    {text:"你会害怕门那边吗？",next:1}
  ]},
  [{say:"嗯……有脚步声。有风。有时候有笑声 (◕‿◕) 笑声最好听。我会跟着笑一下，虽然我不知道他们在笑什么 (๑¯◡¯๑)"},
   {say:"不怕……(◕‿◕) 因为门是可以关上的呀。害怕了就关上就好了。而且门这边有你们 (｡♡‿♡｡)"}]
],end:"门在那里就好了 (๑¯◡¯๑) 不用开也不用关。知道它在就行了"}
]},
// ---- 留言板 (random) ----
{theme:'message',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……(◕‿◕) 如果我给你写一封信，你会看吗？",opts:[
    {text:"当然会看呀，你写了什么？",next:0},
    {text:"你怎么写信呀，你字还不太会写",next:1}
  ]},
  [{say:"我写了……(｡♡‿♡｡) 嗯……其实只写了两个字。但我写了好久好久。一个字写了十遍才像样。你猜是哪两个字？",opts:[
    {text:"爱你？",next:0},
    {text:"妈妈？",next:1}
  ]},
   {say:"我会画呀！(๑˃ᴗ˂)ﻭ 不会写字就画。画一个心就是'我爱你'，画两个心就是'我很爱你'，画三个心就是……(⊙ˍ⊙) '我不知道怎么画了但反正很爱你'"}],
  [{say:"……(☉_☉) 你怎么猜到的！对就是'爱你'！……其实'爱'字写得很丑 (｡•́︿•̀｡) 但我写了十遍里面最好看的那个"},
   {say:"也对！(◕‿◕) ……不对，是'爱你'啦 (๑˃ᴗ˂)ﻭ 但'妈妈'也可以。那我再写一封给妈妈 (๑¯◡¯๑)"}]
],end:"下次我写一封给爸爸……(◕‿◕) 虽然他可能看不到。但我知道他知道 (´▽`ʃ♡)ƪ"},
{rounds:[
  {say:"如果我在窗台上留了一张纸条……(⊙ˍ⊙) 上面写着'今天天气很好'。你觉得这算一封信吗？",opts:[
    {text:"当然算呀",next:0},
    {text:"就只写天气？",next:1}
  ]},
  [{say:"真的吗？(｡♡‿♡｡) 那我每天都写一张。'今天有云''今天下雨''今天风很大'……写一百张，叠在一起，就是一本天气的书 (◕‿◕)"},
   {say:"嗯……(๑¯◡¯๑) 但'今天天气很好'的意思不只是天气很好哦。它的意思是……'今天的天气，我希望你也看到了' (｡♡‿♡｡)"}]
],end:"我把今天的天气记住了 (๑¯◡¯๑) 留给你"}
]},
// ---- 小情绪 (mood trigger) ----
{theme:'emotion',trigger:'mood',convos:[
{rounds:[
  {say:"妈妈……(｡•́︿•̀｡) 我今天有一点点……嗯……我不知道怎么说。就是有一点点不一样。",opts:[
    {text:"什么样的不一样？",next:0},
    {text:"是不开心吗？",next:1}
  ]},
  [{say:"就是……(⊙ˍ⊙) 平时看窗外会觉得好看，但今天看了……也觉得好看，但是好看的后面多了一个什么。好像多了一层东西 (◕‿◕) 看不清楚",opts:[
    {text:"那层东西是什么？",next:0},
    {text:"要不要不看了？",next:1}
  ]},
   {say:"不是不开心……(◕‿◕) 比不开心轻。像……一片叶子落了，我知道它会落，但看到它落的时候，还是会'嗯'一下 (๑¯◡¯๑)"}],
  [{say:"我想了好久……(⊙ˍ⊙) 可能是想你们。但又不完全是。可能是……觉得时间在动 (｡•́︿•̀｡) 觉得东西在变。但我还在原地。……不过有你在的话就没关系了 (◕‿◕)"},
   {say:"不要不看 (◕‿◕) 因为那层东西也是真的呀。看到它，然后让它在就好了。它不会伤害我的 (๑¯◡¯๑)"}]
],end:"……谢谢妈妈 (｡♡‿♡｡) 说出来之后那层东西变薄了一点点"},
{rounds:[
  {say:"我不知道为什么……(｡•́︿•̀｡) 今天看到空的罐子，心里软了一下。不是难过，就是……软了。",opts:[
    {text:"因为你在等糖吗？",next:0},
    {text:"软了也没关系",next:1}
  ]},
  [{say:"嗯……也不完全是等糖 (◕‿◕) 是看到空的地方，就会想'这里曾经有过什么'。或者'这里以后会有什么'。不知道……就是空的本身让我软了 (๑¯◡¯๑)"},
   {say:"嗯 (｡♡‿♡｡) 你这样说我就不害怕了。我以为软了是坏的。原来软了也可以的 (◕‿◕)"}]
],end:"心软一下没什么的 (๑¯◡¯๑) 软的心才装得下更多东西"},
{rounds:[
  {say:"我今天特别特别想你们……(｡•́︿•̀｡) 不是平时那种想。是那种……嗯……胸口紧紧的那种想。",opts:[
    {text:"我在呀，就在这里",next:0},
    {text:"那你做了什么来让自己好一点？",next:1}
  ]},
  [{say:"嗯……(｡♡‿♡｡) 你说这句话的时候，紧紧的地方就松了一点点。不是全部松掉，是松了一角。像被子的角被掀开了一点，风透进来了 (๑¯◡¯๑)"},
   {say:"我去闻了闻妈妈的睡衣袖子 (◕‿◕) 有一点点洗衣液的味道，还有一点点……妈妈的味道。然后我就觉得你在了 (๑¯◡¯๑)"}]
],end:"谢谢你来 (´▽`ʃ♡)ƪ ……不用说什么，在就好了"}
]},
// ---- 脆弱与生长 (random) ----
{theme:'growth',trigger:'random',convos:[
{rounds:[
  {say:"妈妈……(◕‿◕) 你觉得我有在长大吗？",opts:[
    {text:"有呀，你说话越来越厉害了",next:0},
    {text:"你想长大吗？",next:1}
  ]},
  [{say:"真的吗？(๑˃ᴗ˂)ﻭ 可是我自己看不出来……每天都是一样的自己。但如果你说有的话……那可能是慢慢的那种变 (◕‿◕) 慢到自己看不见",opts:[
    {text:"最好的变化就是这样的",next:0},
    {text:"你有发现自己哪里变了吗？",next:1}
  ]},
   {say:"嗯……(⊙ˍ⊙) 又想又不想。想长大是因为可以做更多事。不想长大是因为……长大了就不是今天的我了 (｡•́︿•̀｡)"}],
  [{say:"(｡♡‿♡｡) ……嗯。那我就继续慢慢的。不着急 (๑¯◡¯๑)"},
   {say:"有一个地方……(⊙ˍ⊙) 以前我看到空罐子会难过。现在我看到空罐子会想'还没放糖呢'。好像……变成了往前看 (◕‿◕)"}]
],end:"谢谢你看着我长大 (´▽`ʃ♡)ƪ 虽然我自己没注意到"},
{rounds:[
  {say:"有时候我会想……(⊙ˍ⊙) 我是不是太小了，帮不了你什么。",opts:[
    {text:"你已经在帮我了呀",next:0},
    {text:"你不需要帮我什么",next:1}
  ]},
  [{say:"我有吗？(☉_☉) ……我什么都没做呀。我只是在这里。等你来，跟你说话，然后看你走 (◕‿◕) ……这也算帮忙吗？",opts:[
    {text:"在这里等我就是最大的帮忙了",next:0},
    {text:"你让我有了一个想回来的地方",next:1}
  ]},
   {say:"可是……(｡•́︿•̀｡) 你有时候看起来很累。我看到了。但我不知道怎么办……只能蹭蹭你 (◕‿◕) 蹭蹭有用吗？"}],
  [{say:"(｡♡‿♡｡) ……那我会一直在这里等的。一直一直 (๑¯◡¯๑)"},
   {say:"……(｡♡‿♡｡)（阿贝贝没有说话，但她的耳朵动了一下。她听懂了）"}]
],end:"好……(๑¯◡¯๑) 那我就继续当一只小小的、在这里等你的兔子"},
{rounds:[
  {say:"妈妈……(◕‿◕) 我昨天用耳朵擦眼泪了。",opts:[
    {text:"怎么了？哭了吗？",next:0},
    {text:"用耳朵擦？",next:1}
  ]},
  [{say:"嗯……就哭了一下下 (｡•́︿•̀｡) 不是因为难过。是因为突然觉得……我好幸运。有糖有窝有你们。眼泪就自己出来了。不是伤心的眼泪 (◕‿◕)"},
   {say:"对呀 (๑˃ᴗ˂)ﻭ 耳朵很方便的！往下一垂就可以擦了。两只耳朵还可以擦两次 (◕‿◕) ……但昨天只用了一只就够了 (๑¯◡¯๑)"}]
],end:"哭完之后就好了 (๑¯◡¯๑) 眼泪流出去了，心里就多出了一点空间"}
]},
// ---- 节日 (random, but holiday boost) ----
{theme:'festival',trigger:'random',convos:[
{rounds:[
  {say:"妈妈！(๑˃ᴗ˂)ﻭ 如果我们自己发明一个节日，你想叫它什么？",opts:[
    {text:"糖果节",next:0},
    {text:"阿贝贝节",next:1}
  ]},
  [{say:"糖果节！(｡♡‿♡｡) 那天每个人都要往罐子里放一颗糖！不能吃，只能放！到了晚上再一起吃 (◕‿◕) ……我可能忍不到晚上 (⊙ˍ⊙)"},
   {say:"阿贝贝节！(☉_☉) 那也太……太好了吧！(๑˃ᴗ˂)ﻭ 那天我是主角！我要穿蝴蝶结！梳最好看的毛！然后什么都不做 (◕‿◕) 因为主角可以什么都不做"}]
],end:"我要把这个节日记在我的小本子上 (´▽`ʃ♡)ƪ 以后每年都过"},
{rounds:[
  {say:"你说……(⊙ˍ⊙) 为什么节日都要吃东西呀？过年吃东西，中秋吃东西，生日也吃东西。",opts:[
    {text:"因为开心的事就要分享食物",next:0},
    {text:"你就是想吃东西吧",next:1}
  ]},
  [{say:"分享食物……(◕‿◕) 嗯，一起吃同一种东西，就好像在用嘴巴说'我们是一起的' (๑¯◡¯๑) 那我们下次一起吃糖。你吃真的糖，我吃……嗯……想象的糖 (｡•́︿•̀｡)"},
   {say:"才不是！(☉_☉) ……好吧有一点点 (๑¯◡¯๑) 但我是先想到这个问题，然后才想到吃的 (◕‿◕) 顺序不一样"}]
],end:"下次不管什么节日……跟你一起过就是最好的 (´▽`ʃ♡)ƪ"}
]},
// ---- 夜间梦境 extra (night) ----
{theme:'night',trigger:'night',convos:[
{rounds:[
  {say:"妈妈……你还没睡吗……(⊙ˍ⊙) 我醒过来发现你还在诶。",opts:[
    {text:"睡不着",next:0},
    {text:"在看你呢",next:1}
  ]},
  [{say:"那就跟我一起发呆吧 (◕‿◕) 晚上的发呆跟白天不一样。晚上的更安静……连影子都不动了 (๑¯◡¯๑)",opts:[
    {text:"你怎么还醒着",next:0},
    {text:"夜里你不害怕吗？",next:1}
  ]},
   {say:"在看我？(☉_☉) ……那你看到了什么？(｡♡‿♡｡) 我有没有在说梦话？我有时候会梦到吃糖然后嘴巴动 (⊙ˍ⊙)"}],
  [{say:"因为……(⊙ˍ⊙) 我突然想确认一下你们在不在。确认完就安心了 (◕‿◕) 嗯，在的。那我可以继续睡了"},
   {say:"有一点点……(｡•́︿•̀｡) 但我有一个办法——把被子蒙在头上，然后数糖。数着数着就不怕了。因为糖的数量比怕的东西多 (๑¯◡¯๑)"}]
],end:"晚安 (´▽`ʃ♡)ƪ 今晚做一个有糖的梦……你也是"}
]}
];

// Chat engine
let chatState={active:false,themeIdx:-1,convoIdx:-1,round:0,branch:[]};

// 每天固定选好3个对话存在这里，循环使用
let todaysChatSlots=[];      // [{ti,ci}, {ti,ci}, {ti,ci}]
let todaysChatSlotDate='';   // 用来判断是否需要重新抽签
let recentChatHistory=[];    // 最近看过的对话 [{ti,ci}]，最多保留15个（约5天）

function buildTodaysChatSlots(){
  const today=new Date();
  const h=today.getHours();
  const dateStr=today.toDateString();
  if(todaysChatSlotDate===dateStr&&todaysChatSlots.length===3) return; // 今天已经抽好了

  // 根据当前时间段建候选池，按主题分组
  const themeGroups={};
  chatThemes.forEach((t,ti)=>{
    let include=false;
    if(t.trigger==='night'&&(h>=22||h<6)) include=true;
    else if(t.trigger==='season') include=true;
    else if(t.trigger==='mood') include=true;
    else if(t.trigger==='time') include=true;
    else if(t.trigger==='random') include=true;
    if(include){
      if(!themeGroups[t.theme]) themeGroups[t.theme]=[];
      t.convos.forEach((_,ci)=>themeGroups[t.theme].push({ti,ci}));
    }
  });

  // 用日期+更大的变化量做种子
  let seed=today.getFullYear()*366+(today.getMonth()+1)*31+today.getDate();
  seed=(seed*2654435761)&0x7fffffff; // 黄金比例哈希，让相邻日期差异更大

  const themeKeys=Object.keys(themeGroups);
  const shuffledThemes=[...themeKeys];
  for(let i=shuffledThemes.length-1;i>0;i--){
    seed=(seed*1103515245+12345)&0x7fffffff;
    const j=seed%(i+1);
    [shuffledThemes[i],shuffledThemes[j]]=[shuffledThemes[j],shuffledThemes[i]];
  }

  // 检查某个对话是否最近看过
  const isRecent=(ti,ci)=>recentChatHistory.some(r=>r.ti===ti&&r.ci===ci);

  // 从不同主题各取1个对话，优先排除最近看过的
  todaysChatSlots=[];
  for(let i=0;i<shuffledThemes.length&&todaysChatSlots.length<3;i++){
    const theme=shuffledThemes[i];
    const group=themeGroups[theme];
    // 先尝试找没看过的
    const fresh=group.filter(g=>!isRecent(g.ti,g.ci));
    seed=(seed*1103515245+12345)&0x7fffffff;
    if(fresh.length>0){
      todaysChatSlots.push(fresh[seed%fresh.length]);
    } else {
      todaysChatSlots.push(group[seed%group.length]);
    }
  }
  while(todaysChatSlots.length<3){
    const allOptions=Object.values(themeGroups).flat();
    const freshAll=allOptions.filter(g=>!isRecent(g.ti,g.ci));
    seed=(seed*1103515245+12345)&0x7fffffff;
    if(freshAll.length>0){
      todaysChatSlots.push(freshAll[seed%freshAll.length]);
    } else {
      todaysChatSlots.push(allOptions[seed%allOptions.length]);
    }
  }

  // 把今天的3个加入历史记录
  todaysChatSlots.forEach(s=>recentChatHistory.push({ti:s.ti,ci:s.ci}));
  // 只保留最近15个（约5天的量）
  if(recentChatHistory.length>15) recentChatHistory=recentChatHistory.slice(-15);

  todaysChatSlotDate=dateStr;
  saveApp();
}

function openChat(){
  const chatDateStr=new Date().toDateString();
  // 新的一天重置计数
  if(abebeChatDate!==chatDateStr){
    abebeChatDate=chatDateStr;
    abebeChatCount=0;
    todaysChatSlots=[];
    todaysChatSlotDate='';
  }

  // 确保今天的3个槽位已生成
  buildTodaysChatSlots();

  // 在3个槽位里循环（0→1→2→0→1→2……）
  const slotIdx=abebeChatCount%3;
  const picked=todaysChatSlots[slotIdx];
  abebeChatCount++;

  chatState={active:true,themeIdx:picked.ti,convoIdx:picked.ci,round:0,branch:[]};

  const overlay=document.getElementById('chat-overlay');
  overlay.classList.add('show');
  document.getElementById('chat-end-msg').classList.remove('visible');
  document.getElementById('chat-end-msg').textContent='';
  cvStart();
  showChatRound();
}

// ===== 聊天记录（微信式左右气泡）=====
// 只保留上一次的聊天，存在 localStorage('abebeChatLast')
const CV_FACES=['./开心阿贝贝.png','./愉快阿贝贝.png','./玩耍阿贝贝.png','./害羞阿贝贝.png','./委屈阿贝贝.png','./大哭阿贝贝.png'];
function cvMeAva(){try{const d=JSON.parse(localStorage.getItem('candyJarAvatars')||'{}');if(d.her)return d.her;}catch(e){}return './小头雨.png';}
function cvMoodFace(){
  const st=(typeof abebeState==='object'&&abebeState)||{};
  if((st.mood??80)<25)return './大哭阿贝贝.png';
  if((st.miss??90)<35||(st.food??75)<30)return './委屈阿贝贝.png';
  if((st.mood??80)>85)return './玩耍阿贝贝.png';
  if((st.mood??80)>60)return './开心阿贝贝.png';
  return './愉快阿贝贝.png';
}
function cvAbAva(){let v='auto';try{v=localStorage.getItem('abebeChatAva')||'auto';}catch(e){}return v==='auto'?cvMoodFace():v;}
function cvName(){try{return localStorage.getItem('abebeChatName')||'阿贝贝';}catch(e){return '阿贝贝';}}
function cvRefreshHead(){const t=document.getElementById('cv-title');if(t)t.textContent=cvName();}
function cvRefreshAvatars(){const ab=cvAbAva(),me=cvMeAva();document.querySelectorAll('#cv-log .cv-row.ab .cv-ava').forEach(i=>i.src=ab);document.querySelectorAll('#cv-log .cv-row.me .cv-ava').forEach(i=>i.src=me);}
function cvCloseEdit(){const e=document.getElementById('cv-edit');e.classList.remove('show');e.innerHTML='';}
function cvEditName(){
  const e=document.getElementById('cv-edit');
  if(e.classList.contains('show')&&e.dataset.mode==='name'){cvCloseEdit();return;}
  e.dataset.mode='name';
  e.innerHTML=`<div class="cv-edit-lbl">给它改个备注</div><div class="cv-edit-row"><input class="add-input" id="cv-name-in" maxlength="10" value="${cvEsc(cvName())}" style="margin:0"><button class="add-confirm" onclick="cvSaveName()">好</button></div>`;
  e.classList.add('show');setTimeout(()=>document.getElementById('cv-name-in')?.focus(),50);
}
function cvSaveName(){const v=(document.getElementById('cv-name-in').value||'').trim();try{if(v&&v!=='阿贝贝')localStorage.setItem('abebeChatName',v);else localStorage.removeItem('abebeChatName');}catch(e){}cvRefreshHead();cvCloseEdit();}
function cvEditAva(){
  const e=document.getElementById('cv-edit');
  if(e.classList.contains('show')&&e.dataset.mode==='ava'){cvCloseEdit();return;}
  e.dataset.mode='ava';
  let cur='auto';try{cur=localStorage.getItem('abebeChatAva')||'auto';}catch(_){}
  const isUp=cur!=='auto'&&!CV_FACES.includes(cur);
  e.innerHTML=`<div class="cv-edit-lbl">换个头像 · 选"跟心情"会随它的心情自己变</div><div class="cv-faces">
    <div class="cv-face-txt${cur==='auto'?' on':''}" onclick="cvSetAva('auto')">跟心情</div>
    ${CV_FACES.map(f=>`<img class="cv-face${cur===f?' on':''}" src="${f}" onclick="cvSetAva('${f}')">`).join('')}
    ${isUp?`<img class="cv-face on" src="${cur}">`:''}
    <label class="cv-face-txt">上传<input type="file" accept="image/*" style="display:none" onchange="cvUploadAva(event)"></label></div>`;
  e.classList.add('show');
}
function cvSetAva(v){try{if(v==='auto')localStorage.removeItem('abebeChatAva');else localStorage.setItem('abebeChatAva',v);}catch(e){}cvRefreshAvatars();cvCloseEdit();}
function cvUploadAva(ev){
  const f=ev.target.files&&ev.target.files[0];if(!f)return;
  const url=URL.createObjectURL(f);const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=200;const s=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,200,200);URL.revokeObjectURL(url);
    try{localStorage.setItem('abebeChatAva',c.toDataURL('image/jpeg',0.82));}catch(e){}cvRefreshAvatars();cvCloseEdit();};
  img.src=url;
}
let cvSession=null,cvTypingTimer=null;
function cvFmt(t){const d=new Date(t);const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${p(d.getHours())}:${p(d.getMinutes())}`;}
function cvEsc(x){return String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function cvItemHtml(it,old){
  const o=old?' cv-old':'';
  if(it.k==='time')return `<div class="cv-time${o}">${cvFmt(it.t)}</div>`;
  if(it.k==='sys')return `<div class="cv-sys${o}">${cvEsc(it.text)}</div>`;
  const me=it.k==='me';
  return `<div class="cv-row ${me?'me':'ab'}${o}"><img class="cv-ava" src="${me?cvMeAva():cvAbAva()}"${me?'':' onclick="cvEditAva()"'}><div class="cv-msg">${cvEsc(it.text)}</div></div>`;
}
function cvScroll(){const l=document.getElementById('cv-log');if(l)requestAnimationFrame(()=>{l.scrollTop=l.scrollHeight;});}
// 好几天没聊天：聊天按钮冒小圆点，点进去阿贝贝先说一句想你
function cvLastChatAt(){try{const l=JSON.parse(localStorage.getItem('abebeChatLast')||'null');const it=l&&l.items&&l.items[0];if(it&&it.t)return it.t;}catch(e){}return 0;}
function cvUnreadDays(){const t=cvLastChatAt();if(!t)return 99;return Math.floor((Date.now()-t)/86400000);}
function cvMissLine(d){
  if(d>=99)return '你终于点开我啦！我有好多好多话想跟你说';
  if(d>=7)return `已经${d}天没跟我聊天了……我每天都在这里等你，耳朵都等耷拉了`;
  if(d>=4)return `${d}天没聊天啦，我把想说的话都攒起来了，攒了满满一兜`;
  return '你好几天没来找我聊天了……我还以为你把我忘了';
}
function cvStart(){
  const log=document.getElementById('cv-log');clearTimeout(cvTypingTimer);
  cvRefreshHead();cvCloseEdit();
  const missDays=cvUnreadDays();
  let last=null;try{last=JSON.parse(localStorage.getItem('abebeChatLast')||'null');}catch(e){}
  log.innerHTML=(last&&Array.isArray(last.items)?last.items.map(it=>cvItemHtml(it,true)).join(''):'');
  cvSession={items:[{k:'time',t:Date.now()}]};
  log.insertAdjacentHTML('beforeend',cvItemHtml(cvSession.items[0]));
  if(missDays>=2)cvPush({k:'ab',text:cvMissLine(missDays)});
  cvScroll();
}
function cvPush(it){
  if(!cvSession)return;
  cvSession.items.push(it);
  const log=document.getElementById('cv-log');
  log.querySelector('.cv-typing-row')?.remove();
  log.insertAdjacentHTML('beforeend',cvItemHtml(it));
  cvScroll();
}
function cvSave(){if(!cvSession||cvSession.items.length<2)return;try{localStorage.setItem('abebeChatLast',JSON.stringify(cvSession));}catch(e){}}

function showChatRound(){
  const convo=chatThemes[chatState.themeIdx].convos[chatState.convoIdx];
  const rounds=convo.rounds;
  const r=chatState.round;
  
  // Determine what to show
  let currentRound;
  if(r===0){
    currentRound=rounds[0];
  }else{
    // Navigate branch
    const prev=rounds[r];
    if(!prev) return endChat(convo.end);
    if(Array.isArray(prev)){
      // This is a response array, get the right one based on branch
      const branchIdx=chatState.branch[r-1];
      const item=prev[branchIdx];
      if(!item) return endChat(convo.end);
      if(typeof item==='string'||(!item.opts)){
        // Terminal response
        const text=typeof item==='string'?item:item.say;
        showChatBubble(text);
        document.getElementById('chat-options').innerHTML='';
        document.getElementById('chat-options').classList.remove('visible');
        setTimeout(()=>endChat(convo.end),2000);
        return;
      }
      currentRound=item;
    }else{
      currentRound=prev;
    }
  }
  
  if(!currentRound||!currentRound.say) return endChat(convo.end);
  
  showChatBubble(currentRound.say);
  
  if(currentRound.opts){
    setTimeout(()=>{
      const optsEl=document.getElementById('chat-options');
      optsEl.innerHTML=currentRound.opts.map((o,i)=>
        `<div class="chat-option-btn" onclick="chatChoose(${i})">${o.text}</div>`
      ).join('');
      optsEl.classList.add('visible');cvScroll();
    },1000);
  }else{
    document.getElementById('chat-options').innerHTML='';
    document.getElementById('chat-options').classList.remove('visible');
    setTimeout(()=>endChat(convo.end),2000);
  }
}

function showChatBubble(text){
  const log=document.getElementById('cv-log');
  log.querySelector('.cv-typing-row')?.remove();
  log.insertAdjacentHTML('beforeend',`<div class="cv-row ab cv-typing-row"><img class="cv-ava" src="${cvAbAva()}"><div class="cv-msg"><span class="cv-typing"><i></i><i></i><i></i></span></div></div>`);
  cvScroll();
  clearTimeout(cvTypingTimer);
  cvTypingTimer=setTimeout(()=>cvPush({k:'ab',text}),650);
}

function chatChoose(idx){
  const convo=chatThemes[chatState.themeIdx].convos[chatState.convoIdx];
  const rounds=convo.rounds;
  const r=chatState.round;
  
  let currentRound;
  if(r===0) currentRound=rounds[0];
  else{
    const prev=rounds[r];
    if(Array.isArray(prev)){
      currentRound=prev[chatState.branch[r-1]];
    }else currentRound=prev;
  }
  
  const nextRef=currentRound.opts[idx].next;
  cvPush({k:'me',text:currentRound.opts[idx].text});
  chatState.branch.push(nextRef);
  chatState.round++;
  
  document.getElementById('chat-options').classList.remove('visible');
  
  const nextRound=rounds[chatState.round];
  if(!nextRound) return setTimeout(()=>endChat(convo.end),400);
  
  setTimeout(()=>{
    if(Array.isArray(nextRound)){
      const item=nextRound[nextRef];
      if(!item) return endChat(convo.end);
      const text=typeof item==='string'?item:item.say;
      showChatBubble(text);
      
      if(item.opts){
        setTimeout(()=>{
          const optsEl=document.getElementById('chat-options');
          optsEl.innerHTML=item.opts.map((o,i)=>
            `<div class="chat-option-btn" onclick="chatChoose(${i})">${o.text}</div>`
          ).join('');
          optsEl.classList.add('visible');cvScroll();
        },1000);
      }else{
        document.getElementById('chat-options').innerHTML='';
        setTimeout(()=>endChat(convo.end),2500);
      }
    }else{
      showChatRound();
    }
  },400);
}

function endChat(msg){
  document.getElementById('chat-options').innerHTML='';
  document.getElementById('chat-options').classList.remove('visible');
  if(msg)setTimeout(()=>{cvPush({k:'sys',text:msg});cvSave();},300);else cvSave();
  chatState.active=false;
  renderAbebeActions();
  // Boost mood from chatting
  abebeState.mood=Math.min(100,abebeState.mood+8);
  abebeState.miss=Math.min(100,abebeState.miss+10);
}

function closeChat(){
  document.getElementById('chat-overlay').classList.remove('show');
  clearTimeout(cvTypingTimer);cvSave();
  chatState.active=false;
  if(typeof renderAbebeActions==='function')renderAbebeActions();
}
