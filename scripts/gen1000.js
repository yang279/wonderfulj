const fs = require('fs');
const path = require('path');

const categories = {
  arrows: {
    names: ['arrow-up','arrow-down','arrow-left','arrow-right','arrow-up-left','arrow-up-right','arrow-down-left','arrow-down-right','chevron-up','chevron-down','chevron-left','chevron-right','double-arrow-left','double-arrow-right','expand','collapse','turn-up','turn-down','turn-left','turn-right','curved-arrow-left','curved-arrow-right','refresh-right','refresh-left','loop-right','loop-left','scroll-up','scroll-down','swap','transfer','redirect','back','forward','skip-forward','skip-back','jump-up','jump-down','eject','enter','exit'],
    desc: ['方向指示箭头','导航箭头图标','移动方向指示','转向箭头符号','进度方向指示','流程方向箭头','折叠展开箭头','循环刷新箭头','滚动方向箭头','交换转移箭头','跳转方向箭头','进出箭头符号']
  },
  communication: {
    names: ['phone','phone-off','email','chat','chat-bubble','message','comment','reply','forward-msg','send','receive','inbox','outbox','voicemail','video-call','audio-call','fax','broadcast','announcement','megaphone','speaker','microphone','headphones','radio','signal','wifi','bluetooth','satellite','modem','router','antenna','call-in','call-out','call-missed','call-transfer','call-merge','call-split','call-end','call-start','ringtone'],
    desc: ['通讯联系图标','电话邮件图标','聊天消息图标','语音通话图标','广播信号图标','网络连接图标','收发信息图标','通话记录图标']
  },
  media: {
    names: ['play','pause','stop','record','fast-forward','rewind','skip-next','skip-prev','shuffle','repeat','volume-up','volume-down','volume-mute','volume-off','music','song','album','playlist','lyrics','concert','instrument','piano','guitar','drum','violin','flute','trumpet','note','sound','wave','tone','beep','ring','chime','bell','whistle','echo','acoustic','bass','treble'],
    desc: ['媒体播放控制图标','音乐音频图标','音量调节图标','乐器音乐符号','录音播放图标','声音波形图标']
  },
  weather: {
    names: ['sun','moon','cloud','rain','snow','wind','storm','thunder','lightning','fog','haze','tornado','hurricane','rainbow','temperature','thermometer','cold','hot','freeze','melt','dry','wet','dew','frost','ice','umbrella','sunrise','sunset','dawn','dusk','sky','climate','weather-map','forecast','barometer','humidity','pressure','breeze','gale','calm'],
    desc: ['天气气象图标','温度气候图标','风雨雷电图标','日出日落图标','季节天气符号','冰霜雾雪图标']
  },
  nature: {
    names: ['tree','flower','leaf','grass','mountain','hill','valley','river','lake','ocean','sea','island','forest','desert','field','meadow','garden','plant','seed','root','branch','trunk','petal','bud','fruit','berry','nut','mushroom','cactus','vine','weed','crop','harvest','fertilize','watering','pruning','bonsai','palm','pine'],
    desc: ['自然植物图标','山水风景图标','花草树木符号','果蔬农作物图标','园林景观图标','生态自然符号']
  },
  animals: {
    names: ['dog','cat','bird','fish','horse','cow','pig','sheep','chicken','duck','rabbit','mouse','rat','snake','lizard','turtle','frog','bee','ant','butterfly','spider','worm','eagle','owl','parrot','crow','swan','dove','peacock','lion','tiger','bear','wolf','fox','deer','elephant','monkey','whale','dolphin','shark'],
    desc: ['动物图标','宠物家畜图标','鸟类昆虫图标','野生动物图标','海洋生物图标','爬行动物图标']
  },
  transport: {
    names: ['car','bus','train','plane','boat','ship','bicycle','motorcycle','scooter','truck','van','taxi','helicopter','subway','tram','ferry','yacht','canoe','kayak','rocket','spaceship','satellite-vehicle','caravan','trailer','forklift','crane','bulldozer','tractor','ambulance','fire-engine','police-car','tank','segway','skateboard','hoverboard','jet-ski','parachute','balloon','cable-car','elevator'],
    desc: ['交通工具图标','汽车飞机图标','船舶水上图标','工程机械图标','公共交通图标','特殊车辆图标']
  },
  buildings: {
    names: ['house','building','office','school','hospital','bank','store','shop','mall','market','church','temple','mosque','castle','tower','bridge','gate','fence','wall','door','window','roof','ceiling','floor','basement','attic','garage','warehouse','factory','station','airport','port','dock','lighthouse','windmill','dam','barn','tent','cabin'],
    desc: ['建筑房屋图标','公共设施图标','商业建筑图标','宗教建筑图标','工业建筑图标','桥梁道路图标']
  },
  food: {
    names: ['apple','banana','orange','grape','watermelon','strawberry','cherry','peach','pear','mango','pineapple','coconut','lemon','kiwi','avocado','tomato','potato','carrot','corn','pepper','onion','garlic','cucumber','lettuce','cabbage','broccoli','spinach','pea','bean','rice','wheat','bread','cake','cookie','pie','donut','chocolate','candy','ice-cream','pizza'],
    desc: ['食物水果图标','蔬菜农作物图标','甜点烘焙图标','饮品调料图标','主食粮食图标','零食糖果图标']
  },
  clothing: {
    names: ['shirt','pants','dress','skirt','coat','jacket','sweater','hoodie','vest','suit','tie','bow','scarf','hat','cap','beanie','helmet','glasses','sunglasses','watch','ring','bracelet','necklace','earring','belt','socks','shoes','boots','sandals','heels','gloves','backpack','purse','wallet','umbrella-cloth','apron','uniform','costume','swimwear','pajamas'],
    desc: ['服装衣饰图标','鞋帽配饰图标','首饰珠宝图标','包袋钱包图标','制服职业装图标','休闲运动装图标']
  },
  sports: {
    names: ['soccer','basketball','tennis','baseball','volleyball','golf','swimming','running','cycling','boxing','fencing','gymnastics','skiing','skating','surfing','diving','climbing','hiking','fishing','hunting','archery','shooting','bowling','billiards','darts','chess','cards','puzzle','yoga','pilates','martial-arts','karate','judo','weightlifting','rowing','sailing','kayak-sport','triathlon','marathon','olympics'],
    desc: ['体育运动图标','球类运动图标','水上运动图标','户外运动图标','棋类游戏图标','健身瑜伽图标']
  },
  medical: {
    names: ['heart-health','pulse','blood-pressure','stethoscope','syringe','pill','medicine','capsule','bandage','first-aid','ambulance-icon','hospital-sign','doctor','nurse','patient','wheelchair','crutch','eye-test','dental','surgery','x-ray','ct-scan','ultrasound','thermometer-med','blood-drop','dna','cell','virus','bacteria','mask','glove-med','scalpel','forceps','prescription','pharmacy','clinic','rehab','vaccine','defibrillator','oxygen'],
    desc: ['医疗健康图标','药品治疗图标','医疗器械图标','医院诊所图标','急救护理图标','诊断检查图标']
  },
  finance: {
    names: ['dollar','euro','pound','yen','bitcoin','wallet-finance','credit-card','debit-card','bank-note','coin','cash','receipt','invoice','tax','budget','savings','investment','stock','bond','portfolio','exchange','rate','profit','loss','balance','ledger','audit','insurance','loan','mortgage','interest','dividend','capital','asset','equity','fund','trade','market','price','fee'],
    desc: ['金融货币图标','银行理财图标','股票投资图标','账单发票图标','保险贷款图标','交易支付图标']
  },
  education: {
    names: ['book','pen','pencil','ruler','eraser','notebook','paper','clipboard','folder','file','archive','library','graduation','degree','certificate','diploma','exam','quiz','test','homework','class','course','lesson','lecture','tutorial','lab','research','thesis','paper-academic','reference','citation','bibliography','glossary','dictionary','encyclopedia','journal','calendar-edu','schedule','blackboard','whiteboard'],
    desc: ['教育学习图标','文具书写图标','书籍文献图标','考试证书图标','课程教学图标','研究学术图标']
  },
  emotions: {
    names: ['smile','frown','laugh','cry','angry','surprise','fear','love','hate','happy','sad','excited','bored','tired','sleepy','confused','proud','shy','embarrassed','guilty','hopeful','worried','anxious','calm','peaceful','stressed','relaxed','grateful','jealous','envious','nostalgic','lonely','friendly','hostile','neutral','content','delighted','disappointed','frustrated','satisfied'],
    desc: ['表情情绪图标','快乐悲伤图标','愤怒恐惧图标','惊喜感动图标','平静焦虑图标','爱恨嫉妒图标']
  },
  tools: {
    names: ['hammer','wrench','screwdriver','pliers','saw','drill','chisel','level','tape-measure','ruler-tool','compass-tool','caliper','pliers-needle','cutter','scissors','knife','axe','shovel','rake','hoe','trowel','welder','solder','clamp','vise','bench','anvil','lathe','mill','sandpaper','glue','paint-brush','roller','spray','bucket','ladder','scaffold','toolbox','power-drill','angle-grinder'],
    desc: ['工具器械图标','手动工具图标','电动工具图标','测量工具图标','园林工具图标','切割工具图标']
  },
  security: {
    names: ['lock','unlock','key','shield','guard','alarm','surveillance','camera-security','fingerprint','password','eye-scan','face-id','pin','token','badge','permit','license','certificate-security','firewall','antivirus','encrypt','decrypt','sign','verify','auth','login','logout','register','captcha','otp','block','allow','deny','grant','revoke','audit-log','threat','vulnerability','patch','incident'],
    desc: ['安全防护图标','锁钥密码图标','监控报警图标','认证授权图标','加密签名图标','权限许可图标']
  },
  office: {
    names: ['printer','scanner','copier','fax-machine','stapler','paperclip',' binder','envelope','stamp','seal','calendar','clock','timer','alarm-clock','hourglass','desk','chair-office','lamp','fan','air-conditioner','heater','calculator','abacus','chart','graph','pie-chart','bar-chart','line-chart','table','spreadsheet','presentation','slide','projector','screen','monitor','keyboard','mouse','touchpad','webcam','speaker-office'],
    desc: ['办公设备图标','文具用品图标','图表数据图标','时间日期图标','会议演示图标','计算统计图标']
  },
  travel: {
    names: ['map','compass-travel','globe','passport','ticket','boarding-pass','luggage','suitcase','backpack-travel','camera-travel','photo','video','binoculars','tent-travel','campfire','bbq','camping','road','path','trail','sign','direction','landmark','monument','museum','gallery','zoo','park','beach','mountain-travel','waterfall','cave','volcano','geyser','spring','resort','hotel','hostel','motel','inn','spa'],
    desc: ['旅行地图图标','票证行李图标','景点地标图标','露营户外图标','摄影拍照图标','住宿度假图标']
  },
  technology: {
    names: ['cpu','gpu','ram','ssd','hdd','motherboard','chip','circuit','wire','cable','port','usb','ethernet','bluetooth-tech','wifi-tech','router-tech','switch','server','database','cloud-tech','api','sdk','code','terminal','console','debug','compile','deploy','container','kubernetes','docker','vm','os','kernel','driver','firmware','bios','algorithm','data-structure','network'],
    desc: ['技术硬件图标','芯片电路图标','网络通信图标','软件代码图标','服务器云图标','数据结构图标']
  }
};

const svgTemplates = {
  circle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
  square: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16"/></svg>',
  triangle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3L22 21H2z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  diamond: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 10-10 10L2 12z"/></svg>',
  cross: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  hexagon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8.5 5v10L12 22l-8.5-5V7z"/></svg>',
  pentagon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9.5 7-3.5 10.5H6L2.5 9z"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
};

const templates = Object.values(svgTemplates);
const allDescTemplates = [];

for (const cat of Object.values(categories)) {
  for (const d of cat.desc) {
    allDescTemplates.push(d);
  }
}

const icons = [];
const usedIds = new Set();

for (const [catName, cat] of Object.entries(categories)) {
  for (const name of cat.names) {
    if (usedIds.has(name)) continue;
    usedIds.add(name);
    const descTemplate = cat.desc[Math.floor(Math.random() * cat.desc.length)];
    const variations = [
      `${descTemplate}，${name}符号`,
      `${descTemplate}，用于${name}相关界面`,
      `${name}形状的${descTemplate}`,
      `${descTemplate}中${name}的表示`,
      `${name}类型${descTemplate}，常见于UI设计`,
    ];
    const description = variations[Math.floor(Math.random() * variations.length)];
    const svg = templates[Math.floor(Math.random() * templates.length)];
    icons.push({ id: name, name, description, svg });
  }
}

let counter = 0;
while (icons.length < 1000) {
  const catKeys = Object.keys(categories);
  const catName = catKeys[Math.floor(Math.random() * catKeys.length)];
  const cat = categories[catName];
  const baseName = cat.names[Math.floor(Math.random() * cat.names.length)];
  const variantId = `${baseName}-${catName}-${counter}`;
  if (usedIds.has(variantId)) { counter++; continue; }
  usedIds.add(variantId);
  const descTemplate = cat.desc[Math.floor(Math.random() * cat.desc.length)];
  const suffixes = ['变体','延伸','补充','增强','改良','简约','实心','轮廓','线性','填充','双色调','渐变','立体','扁平','复古','现代','暗色','亮色','反转','描边'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const description = `${descTemplate}，${baseName}${suffix}版本`;
  const svg = templates[Math.floor(Math.random() * templates.length)];
  icons.push({ id: variantId, name: `${baseName}-${suffix}`, description, svg });
  counter++;
}

const outputPath = path.resolve(__dirname, '../iconJson/icons.json');
fs.writeFileSync(outputPath, JSON.stringify(icons, null, 2));
console.log(`生成了 ${icons.length} 个图标，保存至 ${outputPath}`);