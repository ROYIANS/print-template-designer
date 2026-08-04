import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(
  ROOT,
  '.trellis',
  'tasks',
  '08-04-editorial-magazine-demo',
  'research',
  'assets',
)
const OUTPUT_FILE = path.join(ROOT, 'examples', '夜读城市-独立书店人文杂志排版-demo.foliq.json')

const PAGE_WIDTH = 1050
const PAGE_HEIGHT = 1425
const PAPER = '#f6f4ef'
const INK = '#171717'
const DARK_GRAY = '#343434'
const MID_GRAY = '#777777'
const LIGHT_GRAY = '#c9c7c1'
const PALE_GRAY = '#e8e6e0'
const TITLE_FONT = "'Noto Serif SC', 'Source Han Serif SC', 'Noto Serif CJK SC', serif"
const BODY_FONT = "'SimSun', 'Songti SC', 'STSong', 'Noto Serif CJK SC', serif"
const QUOTE_FONT = "'KaiTi', 'Kaiti SC', 'STKaiti', 'Noto Serif CJK SC', serif"
const META_FONT = "'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei UI', sans-serif"

const article = {
  page1Left: [
    '色落到街面以后，书店才显出它真正的轮廓。白天，它被看作陈列、购买与库存周转的场所；夜里，它更像一间缓慢呼吸的公共客厅。推门的人未必带着书单，有人沿书脊寻找一个陌生名字，有人只想在回家以前多停留二十分钟。灯光把橱窗从商业街的背景里分离出来，也让读者获得一块暂时不用解释自己的地方。',
    '这类停留很难被报表准确记录。一次购买可以进入流水，一次活动可以统计报名人数，但一个人在雨停之前翻完十页小说，一位母亲在接孩子前读完一篇散文，或者两名陌生人因为同一本旧书交换几句话，都很难成为经营数据。它们却决定了一间书店是否真正与周围的生活发生关系。',
    '城市更新总喜欢谈论新的地标，阅读空间保存的却往往是旧的时间。某条路曾经种着法国梧桐，某座电影院拆除以前总在周四换片，某个工厂宿舍区的人习惯在月底买杂志；这些细节未必进入地方志，却会留在旧刊、地图、口述史与书店经营者的记忆里。当相关的书仍被放在可见之处，城市就没有彻底失去自己的注脚。',
    '因此，独立书店的意义并不来自怀旧。它不是把过去封存在玻璃柜里，而是让过去继续参与今天的判断。读者翻开一本二十年前出版的城市随笔，会发现熟悉的路名和已经改变的生活；他从差异里理解当下，也意识到眼前的秩序并非理所当然。阅读把时间叠在同一张桌面上。',
  ],
  page1Right: [
    '一间店成为街区坐标，靠的也不是醒目的门头，而是稳定的出现。它在工作日准时亮灯，在节假日贴出手写通知，在暴雨天把门口的伞桶挪到里面。人们经过时并不一定进去，却知道那扇窗仍在那里。长期重复的微小动作，使空间获得了可信度，也让附近居民在描述路线时自然说出它的名字。',
    '可信度建立以后，书店才可能成为一种低压力的公共空间。这里没有必须完成的消费任务，也不要求所有人热烈参与。有人坐在活动前排，有人站在最后听十分钟，有人什么都不参加，只在同一张桌旁安静阅读。不同浓度的参与能够同时发生，恰恰说明空间对人的边界保持尊重。',
    '我们在几个秋夜走访不同类型的阅读空间：旧街区里不足五十平方米的小店，商场高层仍坚持独立选书的柜台，社区共享书房，以及每周在不同公园停靠的移动书车。它们的规模、租金和客群并不相同，却有一个共同点：经营者谈到书时，最后总会谈到具体的人和具体的时间。',
    '于是这篇文章不试图给书店排名，也不提供一套可以复制的经营公式。我们更关心另一件事：当效率成为城市最响亮的语言，一间允许人慢下来、绕一点路、在陌生内容前停顿的空间，究竟保存了什么？答案也许不只属于出版与零售，它关系到一座城如何理解自己的公共生活。',
    '接下来的观察将从最普通的日常开始：一本新书如何进入架位，一场活动结束以后还留下哪些工作，一份地方刊物怎样在不同读者之间继续旅行。只有把目光放低到这些具体动作，我们才可能理解，所谓城市文化并不是抽象气氛，而是许多人反复维护出来的生活条件。',
  ],
  page2A: [
    '书店一天里最安静的时刻，通常出现在开门以前。卷帘门只升到一半，街上的声音从缝隙里进入；店员先开靠近工作台的灯，再沿书架逐排检查。昨晚读者放错位置的书被重新归类，活动留下的椅子收回墙边，新到的包裹拆开，书脊朝向统一的方向。这些准备看似琐碎，却决定了读者推门时感受到的是仓库还是房间。',
    '空间的秩序并非越整齐越好。过度规整会让人不敢触碰，过度拥挤又使选择变成体力劳动。经营者在两者之间不断调试：常被询问的书放到伸手可及的位置，儿童区给推车留下转弯的距离，地方文献旁边摆一张可以久站的窄桌，诗集则靠近光线柔和的墙面。所谓陈列，是把对阅读行为的观察转化为空间语言。',
    '这种观察需要时间。第一次来店的人可能只看畅销区，第三次开始留意小型出版物，第十次才会向店员询问一本已经绝版的书。关系不是一次服务完成的，而是在重复到访里逐渐形成。店员记住的也未必是姓名，更多时候是偏好、停留路径和出现时段：那位总在周三晚来读历史的人，或那位每个月给女儿挑一本自然读物的父亲。',
    '整理书架的过程也在训练判断。新书抵达时，店员不只确认数量和定价，还要阅读目录、前言与出版说明，辨认它与已有书目的关系。一部城市研究应该进入建筑、社会学还是地方史，常常没有唯一答案；摆放位置其实是一种解释。读者沿着分类行走，也就在不知不觉中阅读了经营者对知识的理解。',
  ],
  page2B: [
    '当经营者说“我们了解读者”，真正的含义不是掌握一组用户画像，而是理解具体生活怎样影响阅读。加班让长篇小说变得困难，通勤使短篇与播客受到欢迎，育儿阶段的读者需要能被中断的内容，退休以后则有人重新寻找年轻时错过的经典。书店若能感知这些变化，选书就会从静态分类转向对生活节奏的回应。',
    '回应并不意味着迎合。优秀的选书始终包含轻微阻力：在熟悉主题旁放一本不同立场的作品，在畅销新书中保留几本节奏缓慢的旧书，在显眼处展示本地作者、小型出版社和难以进入大型渠道的刊物。读者可以忽略它们，但至少有机会看见。实体空间最珍贵的能力之一，就是让并不相似的内容共享同一片视野。',
    '算法根据既有偏好推算下一次点击，书架则允许人绕路。读者原本寻找摄影集，可能被相邻的城市植物志吸引；准备购买推理小说的人，因为店员的一句话翻开了地方口述史。这样的偏离无法保证转化，却让阅读保持开放。发现不是被精准命中的结果，而是注意力与偶然相遇以后发生的改变。',
    '店员的推荐因此更接近一段共同推理，而不是替读者作出决定。他需要先听清对方在寻找怎样的情绪、问题或阅读难度，再从有限书目里提出几个方向。有时最合适的回答是承认店里没有，并写下书名帮助订购。一次诚实的落空，往往比勉强完成销售更能建立下一次对话。',
  ],
  page2C: [
    '夜间活动是这种关系最可见的部分，但不是全部。读书会、放映和分享会带来人群，也带来额外劳动：搬椅子、调试设备、确认嘉宾行程、准备饮水、清理场地，以及在活动结束以后继续回应读者的问题。许多小店没有专职团队，白天负责进货与销售的人，晚上仍要成为主持、摄影和现场协调者。',
    '活动真正产生价值的时刻，往往发生在流程以外。正式讨论结束，有人留在门口继续争论，一个沉默整晚的读者终于问出问题，第一次见面的两个人发现彼此住在同一条街。书店提供的不是单向内容，而是一种相遇条件。它无法保证关系发生，却可以通过座位距离、照明、语气与时间安排，降低陌生人开口的难度。',
    '也正因为如此，活动不应成为衡量公共性的唯一尺度。没有活动的夜晚同样重要：翻页声、轻声询问、门铃偶尔响起，构成一种无需表演的共同存在。人们在这里不必证明自己热爱阅读，也不必迅速融入群体。空间允许靠近，也允许保持距离；这种不强迫的开放，正是城市生活里越来越稀缺的礼貌。',
    '闭店以后，公共空间暂时退回劳动现场。当天的销售被核对，读者预订被逐一登记，活动照片要征得同意后才能发布，未回复的信息仍在手机里亮着。许多文化空间之所以显得从容，是因为有人在看不见的时间里处理细节。承认这些劳动，并为它保留合理报酬，是讨论书店公共价值时不能省略的前提。',
  ],
  page3A: [
    '公共空间常被误解为人越多越成功，声音越大越有活力。书店提供了另一种尺度：公共性也可以安静，可以由互不认识的人共同维护。一个读者把椅子轻轻推回原位，另一个人接过店员递来的延长线，有人发现身旁的人正在找书便让开一点。这些动作没有组织者，却让空间保持可用。',
    '低压力并不等于没有规则。相反，真正放松的环境往往依赖清楚而温和的边界：哪些书可以拆封，饮料可以放在哪里，活动拍照是否需要征得同意，儿童奔跑时谁来提醒。规则如果只以禁止出现，会制造紧张；如果被解释为对其他读者的照顾，就更容易成为共同习惯。空间治理最终仍是人与人之间的协商。',
    '书店的慢还体现在时间分配上。一本书可能在架上停留数月，才遇到真正需要它的人。从纯粹的库存效率看，这种等待并不合理；从文化选择看，等待本身就是工作。并非所有内容都适合快速售出，有些作品需要季节、事件或一次谈话为它建立入口。经营者承担了为少数内容保留可见性的成本。',
    '这种成本很少被浪漫叙事提及。租金、人工、物流和退货周期持续挤压小店，空间越愿意让人停留，可直接产生收入的面积就越少。经营者一面相信阅读需要时间，一面又必须在有限现金流里计算每个月的安全线。独立书店的困难不是理想与商业互相排斥，而是它们每天都需要重新取得平衡。',
    '平衡还要求经营者辨认哪些免费服务已经变成无边界的消耗。长时间咨询、活动策划、内容编辑和社群维护都具有专业价值，不能永远依赖热情补贴。清楚标明会员权益、活动成本和合作条件，并不会削弱文化空间的温度；相反，只有劳动被认真计算，温度才不必靠少数人的透支来维持。',
  ],
  page3B: [
    '平衡首先来自对规模的诚实。并非每间小店都要举办大型活动、经营咖啡或发展复杂会员体系。有些空间适合成为选书准确的社区店，有些依靠稳定的专业读者，有些与学校、剧场或设计机构形成合作。清楚自己能持续做什么，比模仿一个成功案例更重要。书店的个性并不是装饰风格，而是长期选择留下什么、拒绝什么。',
    '数字工具也不是实体书店的对立面。线上目录让远方读者找到小型出版物，社交媒体帮助活动信息越过街区边界，电子通讯可以把店员每周的阅读笔记送到读者邮箱。关键不在使用与否，而在工具是否仍服务于选择和关系。如果所有内容都被压缩成即时促销，线上渠道只会加速疲惫；如果它延长了书架的解释，数字空间也能成为店面的另一扇窗。',
    '很多读者通过线上内容认识一家店，真正到访时却记住了物理细节：木地板的声音、桌面被使用后的痕迹、旧书略带潮气的气味、窗外公交车经过的频率。感官经验让抽象品牌变成具体地方，也让阅读获得与屏幕不同的节奏。人在空间里需要移动、转身和等待，这些动作会改变注意力的速度。',
    '速度变慢以后，选择不再只是排除。读者可以同时拿起几本互不相关的书，比较开本、纸张和句子，再把其中一本放回去。放回去不是失败，而是理解自己当下需要什么的一部分。书店允许选择保持未完成，也允许读者空手离开。对消费效率来说，这是损失；对长期信任来说，它恰好说明空间没有把每次到访都变成压力。',
    '这种信任也改变了价格讨论。读者当然会比较折扣，但当他理解一本小批量出版物为何更贵、一次作者分享为何需要购票、旧书修复为何不能只按页数计价，价格就不再是孤立数字。解释不能解决所有经营压力，却能让交易重新连接到编辑、印刷、运输、策划与照料这些具体环节。',
  ],
  page3C: [
    '书离开货架以后，还会开始第二段旅程。有人读完后把书送回店里寄售，有人在扉页夹一张写给陌生人的便笺，也有人把旅行带回的地方刊物交给经营者，换走一本旧诗集。封面折痕、日期和偶尔遗落的车票，使下一位读者意识到，自己并非独自进入这段文字。',
    '二次流通重新定义了库存。它不只是一组等待售出的商品，也是一种街区内部的记忆网络。某本绝版地方史可能一年无人问津，却在一次旧建筑拆除的讨论后突然被需要；一本儿童自然手册从一个家庭进入另一个家庭，页角留下不同孩子的标记。书的价值并不总在第一次成交时完成。',
    '本地出版物在这张网络里尤其重要。大型渠道倾向于处理标准化商品，小型书店却能容纳社区地图、独立杂志、展览手册、口述史和个人制作的小册子。它们未必具备完整的发行体系，却记录了城市正在发生的细部。当这些材料被保存、整理并持续展示，书店也承担了一部分非正式档案馆的职责。',
    '档案并不意味着静止。地方材料只有重新被阅读、讨论和引用，才会进入新的公共生活。一次关于旧街区的分享可能促成居民补充照片，一本社区植物志会让读者重新辨认每天经过的树木，一份多年以前的剧场节目单则可能连接两代观众。书店保存的不是封闭的过去，而是过去继续发言的机会。',
    '整理这类材料，需要比收藏更耐心的工作：记录来源与时间，避免把个人回忆误写成确定事实，为照片和手稿确认授权，并给无法核实的信息保留疑问。小型书店未必拥有专业档案机构的条件，却可以建立最基本的秩序。正是这些朴素的标注，让后来者知道一段叙述从何而来，又可以从哪里继续追问。',
  ],
  page4A: [
    '当我们问一间书店保存了什么，最容易想到书本身。更准确的答案或许是阅读的条件：一段不被催促的时间、一张允许独坐的椅子、一个可以向陌生人提问的场合，以及某些暂时不够流行的内容仍然被看见的可能。书是这些条件的中心，却不是全部。',
    '它也保存城市生活里细小的往返。店员为读者订一本暂时缺货的书，读者旅行回来带一份当地刊物；有人把活动中听到的问题带回学校，有人多年以后再次来店，告诉经营者某本书曾经影响自己的决定。关系在不连续的时间里累积，最终构成空间难以替代的厚度。',
    '当然，任何空间都可能关闭。租约终止、经营者离开、街区客流变化，都可能让熟悉的窗口熄灭。把书店写成永远不会消失的文化象征，并不能减轻真实压力。更有意义的问题是：当一个地方结束，它积累的书目、活动记录、读者网络和地方材料，能否以新的形式继续流动。',
    '有些店把库存交给另一间书店，有些把活动档案捐给图书馆，有些经营者转向出版、策展或社区教育。空间消失并不等于关系归零。只要经验被整理和传递，曾经在店里形成的阅读共同体就可能迁移。城市记忆从来不是一座建筑独自保存的，而是在许多人的接力中延续。',
  ],
  page4B: [
    '读者能做的事情也比想象中具体。购买当然重要，但不是唯一支持方式。参加一次活动、订阅店铺通讯、向朋友认真介绍一本小店选择的书、把读完的地方出版物送回社区，都会增加内容继续流动的机会。支持不是情感口号，而是让空间与人的往返变得可持续。',
    '评价书店时，我们也需要比“书多不多”更细致的尺度：选书是否提供差异，店员是否愿意解释，空间是否尊重不同读者，活动是否留下真实讨论，本地内容是否获得位置，经营是否让劳动者保持基本生活。文化价值与经营质量并不矛盾，恰当的评价应该同时看见二者。',
    '夜访结束时，我们常在门外回头。玻璃上叠着街灯、车流和室内书架的影子，读者低头的轮廓被夹在其中。那一刻，书店不像城市之外的避难所，反而像城市本身的一张切片：商业、劳动、孤独、交流与想象在同一个有限空间里并存。',
    '书店不会替城市解决所有问题，也不必承担过度宏大的使命。它只需要继续完成那些具体而缓慢的工作：选一本值得留下的书，给一段讨论安排时间，允许一个人安静坐下，并在夜色里维持一扇可被看见的窗。城市正是通过这些不起眼的持续，保存了理解自身的能力。',
  ],
}

let componentSequence = 0

function componentId(prefix) {
  componentSequence += 1
  return `${prefix}-${String(componentSequence).padStart(3, '0')}`
}

function baseComponent(prefix, component, name, group, propValue, style, bindings) {
  const id = componentId(prefix)
  return {
    id,
    component,
    name,
    code: component,
    group,
    propValue,
    style: { rotate: 0, opacity: 1, ...style },
    groupStyle: {},
    position: { x: style.left, y: style.top },
    ...(bindings ? { bindings } : {}),
  }
}

function text(prefix, name, value, style, bindings) {
  return baseComponent(prefix, 'RoySimpleText', name, 'common', value, style, bindings)
}

function richText(prefix, name, paragraphs, style) {
  const html = paragraphs.map((paragraph) => `<p>　　${paragraph}</p>`).join('')
  return baseComponent(prefix, 'RoyText', name, 'common', html, style)
}

function line(prefix, name, left, top, width, color = LIGHT_GRAY, height = 1) {
  return baseComponent(prefix, 'RoyLine', name, 'shape', null, {
    left,
    top,
    width,
    height,
    background: color,
  })
}

function image(prefix, name, source, alt, style, position = 'center') {
  return baseComponent(
    prefix,
    'RoyImage',
    name,
    'common',
    { src: source, alt, fit: 'cover', position },
    { background: PALE_GRAY, borderType: 'none', ...style },
  )
}

function fieldBinding(id, fieldId) {
  return [
    {
      id,
      target: { kind: 'text' },
      expression: { kind: 'field', fieldId },
    },
  ]
}

function titleStyle(left, top, width, height, overrides = {}) {
  return {
    left,
    top,
    width,
    height,
    color: INK,
    fontFamily: TITLE_FONT,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '0.3',
    ...overrides,
  }
}

function bodyStyle(left, top, width, height, overrides = {}) {
  return {
    left,
    top,
    width,
    height,
    color: DARK_GRAY,
    fontFamily: BODY_FONT,
    fontSize: 14,
    lineHeight: '1.78',
    letterSpacing: '0.2',
    ...overrides,
  }
}

function metaStyle(left, top, width, height, overrides = {}) {
  return {
    left,
    top,
    width,
    height,
    color: MID_GRAY,
    fontFamily: META_FONT,
    fontSize: 6.4,
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '1.1',
    alignItems: 'center',
    ...overrides,
  }
}

function headerFooter(pageNumber, section) {
  return [
    text('header-name', '页眉 · 刊名', 'NOCTURNE', metaStyle(50, 30, 180, 22, { color: INK })),
    text(
      'header-issue',
      '页眉 · 期号',
      'ISSUE 07 / 2026',
      metaStyle(410, 30, 230, 22, { justifyContent: 'center' }),
      fieldBinding(`bind-issue-${pageNumber}`, 'issue-label'),
    ),
    text(
      'header-section',
      '页眉 · 栏目',
      section,
      metaStyle(720, 30, 280, 22, { justifyContent: 'flex-end' }),
    ),
    line('header-rule', '页眉分隔线', 50, 64, 950, LIGHT_GRAY, 1),
    text(
      'footer-title',
      '页脚 · 专题',
      '夜读城市 · 独立书店与城市时间',
      metaStyle(50, 1372, 380, 20, { fontSize: 5.9, letterSpacing: '0.6' }),
    ),
    text(
      'footer-page',
      '页脚 · 页码',
      String(pageNumber).padStart(2, '0'),
      metaStyle(485, 1372, 80, 20, {
        color: INK,
        fontSize: 7.8,
        fontWeight: '700',
        justifyContent: 'center',
      }),
    ),
    text(
      'footer-demo',
      '页脚 · 演示标记',
      'FOLIQ / EDITORIAL DEMO',
      metaStyle(730, 1372, 270, 20, { fontSize: 5.9, justifyContent: 'flex-end' }),
    ),
  ]
}

function imageData(fileName) {
  const file = path.join(ASSET_DIR, fileName)
  const buffer = fs.readFileSync(file)
  if (buffer.length < 64 * 1024) throw new Error(`Incomplete image: ${fileName}`)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

const images = {
  shelves: imageData('bookshelves-bw.jpg'),
  portrait: imageData('reader-portrait-bw.jpg'),
}

function pageOne() {
  const components = [...headerFooter(1, 'OPENING ESSAY / 开篇')]
  components.push(
    text(
      'p1-kicker',
      '开篇 · 类型',
      'LONGFORM / CITY READING / 2026',
      metaStyle(50, 112, 420, 22, { color: DARK_GRAY }),
    ),
    text(
      'p1-title',
      '开篇 · 主标题',
      '夜读城市',
      titleStyle(50, 158, 620, 104, { fontSize: 55, letterSpacing: '1.8' }),
      fieldBinding('bind-feature-title', 'feature-title'),
    ),
    text(
      'p1-subtitle',
      '开篇 · 副标题',
      '独立书店如何保存一座城的时间',
      titleStyle(54, 278, 680, 52, { fontSize: 21, fontWeight: '600', letterSpacing: '0.8' }),
    ),
    text(
      'p1-deck',
      '开篇 · 导语',
      '当城市不断要求更快的抵达、选择和离开，仍有一些空间把缓慢留在日常生活里。我们从夜间书店出发，观察阅读如何连接街区、陌生人与地方记忆。',
      bodyStyle(54, 350, 760, 76, {
        color: INK,
        fontSize: 10.2,
        lineHeight: '1.65',
        letterSpacing: '0.4',
      }),
    ),
    text(
      'p1-date',
      '开篇 · 日期',
      '2026.08 / SHANGHAI',
      metaStyle(820, 356, 180, 24, { justifyContent: 'flex-end' }),
    ),
    text(
      'p1-byline',
      '开篇 · 署名',
      '撰文 / 林屿　编辑 / 周野　视觉 / Foliq Studio',
      metaStyle(54, 444, 560, 24, { color: INK, letterSpacing: '0.5' }),
      fieldBinding('bind-editorial-credit', 'editorial-credit'),
    ),
    text(
      'p1-reading',
      '开篇 · 阅读信息',
      '约 6,000 字 · 阅读 18 分钟',
      metaStyle(760, 444, 240, 24, { justifyContent: 'flex-end' }),
    ),
    line('p1-body-rule', '开篇 · 正文上分隔线', 50, 482, 950, INK, 2),
    text('p1-dropcap', '开篇 · 首字下沉', '夜', titleStyle(50, 516, 72, 104, { fontSize: 62 })),
    richText(
      'p1-column-left',
      '开篇 · 连续正文左栏',
      article.page1Left.map((paragraph, index) => (index === 0 ? paragraph.slice(1) : paragraph)),
      bodyStyle(112, 516, 398, 792, {
        fontSize: 12.2,
        lineHeight: '1.82',
        letterSpacing: '0',
      }),
    ),
    richText(
      'p1-column-right',
      '开篇 · 连续正文右栏',
      article.page1Right,
      bodyStyle(548, 516, 452, 792, {
        fontSize: 12.2,
        lineHeight: '1.82',
        letterSpacing: '0',
      }),
    ),
    line('p1-note-rule', '开篇 · 注释分隔线', 50, 1320, 950, LIGHT_GRAY, 1),
    text(
      'p1-note',
      '开篇 · 编者说明',
      '本文为原创杂志排版演示文章；人物与场景图片使用公开图库素材，不对应具体受访者。',
      bodyStyle(50, 1330, 760, 28, { color: MID_GRAY, fontSize: 6.4, lineHeight: '1.4' }),
    ),
  )
  return { id: 'magazine-opening-page', componentData: components }
}

function pageTwo() {
  const bodyParagraphs = [...article.page2A, ...article.page2B, ...article.page2C]
  const bodyMidpoint = Math.ceil(bodyParagraphs.length / 2)
  const components = [...headerFooter(2, 'THE LIGHT IS STILL ON / 灯还亮着')]
  components.push(
    text(
      'p2-kicker',
      '第二页 · 章节',
      '01 / 灯还亮着的时候',
      titleStyle(50, 106, 600, 48, { fontSize: 19 }),
    ),
    text(
      'p2-running',
      '第二页 · 阅读顺序',
      'READ → LEFT / RIGHT',
      metaStyle(710, 116, 290, 22, { justifyContent: 'flex-end' }),
    ),
    image(
      'p2-image',
      '第二页 · 黑白旧书架',
      images.shelves,
      '黑白旧书架与古典书籍',
      { left: 50, top: 174, width: 950, height: 240 },
      'center',
    ),
    text(
      'p2-caption',
      '第二页 · 图片图注',
      '旧书脊上的磨损不是缺陷，而是阅读与流通留下的时间刻度。',
      bodyStyle(50, 430, 610, 28, { color: MID_GRAY, fontSize: 6.5, lineHeight: '1.4' }),
    ),
    text(
      'p2-credit',
      '第二页 · 图片来源',
      'IMAGE · UNSPLASH / PHOTO-1521587760476-6C12A4B040DA',
      metaStyle(650, 430, 350, 28, { fontSize: 5.5, justifyContent: 'flex-end' }),
    ),
    line('p2-body-rule', '第二页 · 正文上分隔线', 50, 478, 950, INK, 2),
    richText(
      'p2-column-a',
      '第二页 · 连续正文左栏',
      bodyParagraphs.slice(0, bodyMidpoint),
      bodyStyle(50, 510, 452, 818, {
        fontSize: 11.2,
        lineHeight: '1.82',
        letterSpacing: '0',
      }),
    ),
    richText(
      'p2-column-b',
      '第二页 · 连续正文右栏',
      bodyParagraphs.slice(bodyMidpoint),
      bodyStyle(548, 510, 452, 818, {
        fontSize: 11.2,
        lineHeight: '1.82',
        letterSpacing: '0',
      }),
    ),
    line('p2-bottom-rule', '第二页 · 正文下分隔线', 50, 1338, 950, LIGHT_GRAY, 1),
  )
  return { id: 'magazine-bookshop-page', componentData: components }
}

function pageThree() {
  const components = [...headerFooter(3, 'A SLOW PUBLIC LIFE / 缓慢的公共性')]
  components.push(
    text(
      'p3-kicker',
      '第三页 · 章节标识',
      'CHAPTER 02',
      metaStyle(50, 106, 240, 22, { color: DARK_GRAY }),
    ),
    text(
      'p3-title',
      '第三页 · 章节标题',
      '一种缓慢的公共性',
      titleStyle(50, 144, 650, 62, { fontSize: 30 }),
    ),
    text(
      'p3-deck',
      '第三页 · 章节导语',
      '书店的公共价值不只发生在活动现场，也存在于等待、绕路、安静共处和让少数内容继续可见的日常劳动里。',
      bodyStyle(50, 222, 760, 58, { color: MID_GRAY, fontSize: 8.4, lineHeight: '1.7' }),
    ),
    text(
      'p3-order',
      '第三页 · 阅读顺序',
      'CONTINUED FROM PAGE 02',
      metaStyle(790, 232, 210, 22, { justifyContent: 'flex-end' }),
    ),
    line('p3-body-rule', '第三页 · 正文上分隔线', 50, 304, 950, INK, 2),
    richText(
      'p3-column-a',
      '第三页 · 连续正文第一栏',
      article.page3A,
      bodyStyle(50, 336, 300, 812, {
        fontSize: 10,
        lineHeight: '1.84',
        letterSpacing: '0',
      }),
    ),
    richText(
      'p3-column-b',
      '第三页 · 连续正文第二栏',
      article.page3B,
      bodyStyle(375, 336, 300, 812, {
        fontSize: 10,
        lineHeight: '1.84',
        letterSpacing: '0',
      }),
    ),
    richText(
      'p3-column-c',
      '第三页 · 连续正文第三栏',
      article.page3C,
      bodyStyle(700, 336, 300, 812, {
        fontSize: 10,
        lineHeight: '1.84',
        letterSpacing: '0',
      }),
    ),
    line('p3-quote-top', '第三页 · 引文上分隔线', 180, 1184, 690, INK, 1),
    text(
      'p3-quote',
      '第三页 · 楷体引文',
      '“书店保存的不是封闭的过去，\n而是过去继续参与今天的机会。”',
      {
        left: 214,
        top: 1208,
        width: 622,
        height: 88,
        color: INK,
        fontFamily: QUOTE_FONT,
        fontSize: 14,
        lineHeight: '1.75',
        letterSpacing: '1.1',
        justifyContent: 'center',
      },
    ),
    line('p3-quote-bottom', '第三页 · 引文下分隔线', 180, 1310, 690, LIGHT_GRAY, 1),
  )
  return { id: 'magazine-public-life-page', componentData: components }
}

function pageFour() {
  const components = [...headerFooter(4, 'EPILOGUE / 仍亮着的窗')]
  components.push(
    image(
      'p4-portrait',
      '尾页 · 黑白读者肖像',
      images.portrait,
      '手持书册的黑白读者肖像',
      { left: 50, top: 112, width: 292, height: 360 },
      'center',
    ),
    text(
      'p4-image-label',
      '尾页 · 肖像标签',
      'PORTRAIT STUDY / 读者肖像',
      metaStyle(50, 488, 292, 24, { color: DARK_GRAY }),
    ),
    text(
      'p4-image-note',
      '尾页 · 肖像来源',
      'UNSPLASH / PHOTO-1544717305-2782549B5136\n演示素材，不对应文中具体人物',
      bodyStyle(50, 520, 292, 48, { color: MID_GRAY, fontSize: 6, lineHeight: '1.45' }),
    ),
    text(
      'p4-kicker',
      '尾页 · 章节标识',
      'EPILOGUE / 尾声',
      metaStyle(390, 118, 280, 24, { color: DARK_GRAY }),
    ),
    text(
      'p4-title',
      '尾页 · 章节标题',
      '书店保存的，\n不是过去',
      titleStyle(390, 162, 610, 126, { fontSize: 36, lineHeight: '1.3' }),
    ),
    text(
      'p4-lead',
      '尾页 · 导语',
      '它保存的是阅读发生的条件，是人们在城市中愿意停留、相遇、重新看见彼此的可能。空间会改变，关系与记忆仍可以继续流动。',
      bodyStyle(394, 318, 560, 98, { color: INK, fontSize: 10, lineHeight: '1.72' }),
    ),
    text(
      'p4-byline',
      '尾页 · 署名',
      'TEXT / 林屿　EDIT / 周野',
      metaStyle(394, 450, 360, 24, { color: DARK_GRAY }),
    ),
    line('p4-body-rule', '尾页 · 正文上分隔线', 50, 592, 950, INK, 2),
    richText(
      'p4-column-left',
      '尾页 · 连续正文左栏',
      article.page4A,
      bodyStyle(50, 626, 452, 618, {
        fontSize: 12.3,
        lineHeight: '1.86',
        letterSpacing: '0',
      }),
    ),
    richText(
      'p4-column-right',
      '尾页 · 连续正文右栏',
      article.page4B,
      bodyStyle(548, 626, 452, 618, {
        fontSize: 12.3,
        lineHeight: '1.86',
        letterSpacing: '0',
      }),
    ),
    line('p4-closing-rule', '尾页 · 收束分隔线', 50, 1268, 950, LIGHT_GRAY, 1),
    text('p4-closing', '尾页 · 收束引文', '愿每一座城市，都保留几扇为阅读而亮的窗。', {
      left: 50,
      top: 1284,
      width: 700,
      height: 50,
      color: INK,
      fontFamily: QUOTE_FONT,
      fontSize: 12,
      lineHeight: '1.5',
      letterSpacing: '1',
      alignItems: 'center',
    }),
    text(
      'p4-colophon',
      '尾页 · 刊记',
      '专题策划 周野 · 文字编辑 林屿 · 视觉编辑 Foliq Studio · 摄影素材 Unsplash · TEMPLATE 2.0',
      metaStyle(520, 1322, 480, 24, { fontSize: 5.6, justifyContent: 'flex-end' }),
    ),
  )
  return { id: 'magazine-epilogue-page', componentData: components }
}

const template = {
  _version: 1,
  pageConfig: {
    pageSize: 'custom',
    pageDirection: 'p',
    pageLayout: 'fixed',
    pageWidth: 210,
    pageHeight: 285,
    pageCurHeight: 285,
    pageMarginBottom: 8,
    pageMarginTop: 8,
    pageMarginLeft: 8,
    pageMarginRight: 8,
    title: '夜读城市 · 黑白长文杂志排版 Demo',
    scale: 1,
    background: PAPER,
    color: INK,
    fontSize: 14,
    fontFamily: BODY_FONT,
    lineHeight: 1.78,
  },
  pages: [pageOne(), pageTwo(), pageThree(), pageFour()],
  data: {
    version: 1,
    fields: [
      { id: 'issue-label', name: '刊物期号', path: ['issue', 'label'], valueType: 'string' },
      { id: 'feature-title', name: '专题标题', path: ['feature', 'title'], valueType: 'string' },
      {
        id: 'editorial-credit',
        name: '编辑署名',
        path: ['feature', 'credit'],
        valueType: 'string',
      },
    ],
    sampleRecords: [
      {
        issue: { label: 'ISSUE 07 / 2026' },
        feature: {
          title: '夜读城市',
          credit: '撰文 / 林屿　编辑 / 周野　视觉 / Foliq Studio',
        },
      },
    ],
  },
}

const articleText = Object.values(article).flat().join('')
const chineseCharacterCount = articleText.match(/[\u3400-\u9fff]/gu)?.length ?? 0
if (chineseCharacterCount < 5_000) {
  throw new Error(`Article is too short: ${chineseCharacterCount} Chinese characters`)
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(template, null, 2)}\n`, 'utf8')

const components = template.pages.flatMap((page) => page.componentData)
process.stdout.write(
  `${JSON.stringify(
    {
      output: path.relative(ROOT, OUTPUT_FILE),
      paper: `${template.pageConfig.pageWidth} × ${template.pageConfig.pageHeight}mm`,
      pages: template.pages.length,
      components: components.length,
      images: components.filter((component) => component.component === 'RoyImage').length,
      continuousTextColumns: components.filter((component) => component.component === 'RoyText')
        .length,
      chineseCharacters: chineseCharacterCount,
      bytes: fs.statSync(OUTPUT_FILE).size,
    },
    null,
    2,
  )}\n`,
)
