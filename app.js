const STORE_KEY = "falinqijing-prototype-v1";
const initialState = () => ({
  scene: { step: 0, choices: [], completed: false, runs: 0 },
  chat: { messages: [], turns: 0, completed: false, runs: 0, categories: [] },
  transfer: null,
  savedCards: []
});
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved?.scene && saved?.chat && Array.isArray(saved.savedCards)) return saved;
  } catch (_) {}
  return initialState();
}
function persist() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function routeName() {
  const name = location.hash.replace(/^#/, "");
  return ["home", "theatre", "lab", "knowledge", "assessment", "growth"].includes(name) ? name : "home";
}
function renderRoute() {
  const current = routeName();
  document.querySelectorAll("[data-page]").forEach(page => { page.hidden = page.dataset.page !== current; });
  document.querySelectorAll("[data-route]").forEach(link => {
    if (link.dataset.route === current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.getElementById("main-nav").classList.remove("open");
  document.getElementById("menu-button").setAttribute("aria-expanded", "false");
  if (current === "theatre") renderScene();
  if (current === "lab") renderChat();
  if (current === "knowledge") renderKnowledge();
  if (current === "assessment") renderAssessment();
  if (current === "growth") renderGrowth();
  window.scrollTo({top: 0, behavior: "instant"});
}

const scenes = [
  {
    kicker: "第一幕 · 观察事实",
    title: "同一台摄像头，两种担忧",
    body: "邻居说最近常有快递丢失，因此在自家门旁装了摄像头。另一户发现镜头可能拍到自家门口，开始担心日常出入被记录。",
    fact: "小临提示：还不知道镜头的实际范围、录像用途和管理方式。",
    caption: "先别急着给人贴标签。你会先核实哪件事？",
    choices: [
      ["range", "查看摄像头朝向与实际拍摄范围"],
      ["purpose", "询问录像主要用于什么、由谁查看"],
      ["ignore", "不用核实，直接判断对方一定有问题"]
    ]
  },
  {
    kicker: "第二幕 · 理解分歧",
    title: "安全需求与隐私顾虑怎样一起看？",
    body: "邻居希望保留安全防护，另一户不希望家门口持续入镜。物业表示愿意一起查看位置和提示方式。",
    fact: "小临提示：普法判断要区分事实、诉求和规则，不能仅凭一个理由替所有人下结论。",
    caption: "你认为下一步最值得讨论什么？",
    choices: [
      ["balance", "讨论必要范围、提示方式和由谁管理录像"],
      ["privacy-only", "只谈自己的隐私，不了解对方安全诉求"],
      ["safety-only", "只要为了安全，其他问题都不用讨论"]
    ]
  },
  {
    kicker: "第三幕 · 采取行动",
    title: "把担忧变成可讨论的方案",
    body: "物业邀请双方在楼栋群说明意见。现在轮到你提出下一步。",
    fact: "小临提示：表达顾虑时，具体事实和可执行的下一步通常比指责更有帮助。",
    caption: "你会怎么推进？",
    choices: [
      ["negotiate", "请物业一起查看范围，并讨论调整角度与提示"],
      ["demand", "在群里要求邻居立刻拆掉，否则公开指责"],
      ["silent", "不表达担忧，也不再了解情况"]
    ]
  }
];

function renderScene() {
  const panel = document.getElementById("scene-content");
  const step = Math.min(state.scene.step, 3);
  document.getElementById("scene-step-label").textContent = step < 3 ? `情境判断 · ${step + 1} / 3` : "情境复盘 · 已完成";
  document.getElementById("scene-progress-fill").style.width = `${step < 3 ? (step + 1) * 33.33 : 100}%`;
  if (step === 3) {
    const constructive = state.scene.choices.includes("negotiate");
    document.getElementById("stage-caption").textContent = constructive ? "你把分歧带到了可核实、可协商的方向。接下来试着在群聊里表达。" : "一次不理想的选择也是练习。看过复盘后，你可以试试另一条路。";
    panel.innerHTML = `<span class="scene-kicker">你的情境结局</span><h2>${constructive ? "对话有了继续的空间" : "分歧暂时没有被解开"}</h2><div class="scene-result"><h3>这一轮看到了什么</h3><p>${constructive ? "物业准备和双方核对镜头范围、提示与录像管理方式；这不等于已对安装行为作出法律结论。" : "各方仍需要核实拍摄范围与使用方式。直接争论或回避，都不能替代事实核查。"}</p></div><p>数字人剧场训练的是观察与判断。下一步，在模拟群聊中练习把想法说出来。</p><div class="hero-actions"><a class="button primary" href="#lab">进入对话实验室</a><a class="button outline" href="#knowledge">查看相关知识</a></div>`;
    return;
  }
  const scene = scenes[step];
  document.getElementById("stage-caption").textContent = scene.caption;
  panel.innerHTML = `<span class="scene-kicker">${scene.kicker}</span><h2>${scene.title}</h2><p>${scene.body}</p><div class="scene-fact">${scene.fact}</div><p><strong>${scene.caption}</strong></p><div class="scene-choices">${scene.choices.map(([id, label], index) => `<button class="scene-choice" type="button" data-choice="${id}"><span class="choice-num">${String.fromCharCode(65 + index)}</span><span>${label}</span></button>`).join("")}</div>`;
  panel.querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => chooseScene(button.dataset.choice)));
}
function chooseScene(choice) {
  if (state.scene.step >= 3) return;
  state.scene.choices.push(choice);
  state.scene.step += 1;
  if (state.scene.step === 3 && !state.scene.completed) {
    state.scene.completed = true;
    state.scene.runs += 1;
  }
  persist();
  renderScene();
}
function restartScene() {
  state.scene.step = 0;
  state.scene.choices = [];
  state.scene.completed = false;
  persist();
  renderScene();
}

const startingMessages = [
  { who: "neighbor", name: "邻居 · AI 模拟", text: "最近楼道里快递有点丢，我在自家门旁装了摄像头，主要是想安心些。" },
  { who: "property", name: "物业 · AI 模拟", text: "大家先说说具体担忧，我们可以一起看安装位置和拍摄范围。" }
];
const suggestions = ["能一起看看镜头实际拍到哪里吗？", "我理解安全需求，也担心家门口被持续拍到。", "能否请物业一起讨论调整角度和提示方式？"];
function ensureChat() {
  if (!state.chat.messages.length) { state.chat.messages = startingMessages.map(x => ({...x})); persist(); }
}
function renderChat() {
  ensureChat();
  const log = document.getElementById("chat-messages");
  log.replaceChildren();
  state.chat.messages.forEach(message => {
    const row = document.createElement("div");
    row.className = `message ${message.who === "me" ? "mine" : ""}`;
    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.textContent = message.who === "me" ? "我" : message.who === "property" ? "物" : "邻";
    const body = document.createElement("div");
    body.className = "message-body";
    const name = document.createElement("small");
    name.textContent = message.name;
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;
    body.append(name, bubble);
    row.append(avatar, body);
    log.append(row);
  });
  log.scrollTop = log.scrollHeight;
  const quick = document.getElementById("chat-suggestions");
  quick.replaceChildren();
  if (!state.chat.completed) suggestions.forEach(s => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = s;
    button.addEventListener("click", () => sendChat(s));
    quick.append(button);
  });
  document.getElementById("chat-input").disabled = state.chat.completed;
  document.querySelector("#chat-form button").disabled = state.chat.completed;
  document.getElementById("chat-hint").textContent = state.chat.completed ? "本轮已结束，可重开练习或查看能力反馈。" : state.chat.turns >= 3 ? "已经有足够消息可以复盘，也可以继续练习。" : "可以自由输入，也可以选择上方建议表达";
  document.getElementById("chat-finish").textContent = state.chat.completed ? "查看能力评估" : "结束并复盘";
}
function classify(text) {
  if (/物业|调整|方案|协商|提示/.test(text)) return "proposal";
  if (/拍到|拍摄|范围|角度|镜头|哪里/.test(text)) return "fact";
  if (/隐私|担心|顾虑|出入|安全/.test(text)) return "concern";
  if (/拆|曝光|举报|违法|必须/.test(text)) return "confront";
  return "general";
}
function replyFor(category, turns) {
  if (category === "fact") return {who:"property",name:"物业 · AI 模拟",text:"可以。我们先现场看镜头范围，也核对有没有覆盖其他住户门口。"};
  if (category === "proposal") return {who:"neighbor",name:"邻居 · AI 模拟",text:"如果能保留门前基本防护，又不拍到别家门口，我愿意一起看看怎样调整。"};
  if (category === "concern") return {who:"neighbor",name:"邻居 · AI 模拟",text:"我理解你的担心。我装它是因为快递丢失，具体拍到哪里可以一起确认。"};
  if (category === "confront") return {who:"property",name:"物业 · AI 模拟",text:"先别急着下结论。我们可以核实安装位置、拍摄范围和实际用途，再讨论怎么处理。"};
  return turns % 2 ? {who:"property",name:"物业 · AI 模拟",text:"你能再说具体一些吗？比如担心的拍摄范围，或希望我们一起做的下一步。"} : {who:"neighbor",name:"邻居 · AI 模拟",text:"我想解决安全问题，也愿意听听你具体的顾虑。"};
}
function sendChat(text) {
  const value = text.trim().slice(0, 140);
  if (!value || state.chat.completed) return;
  const category = classify(value);
  state.chat.messages.push({who:"me",name:"我",text:value});
  state.chat.categories.push(category);
  state.chat.turns += 1;
  state.chat.messages.push(replyFor(category, state.chat.turns));
  document.getElementById("chat-input").value = "";
  persist();
  renderChat();
}
function finishChat() {
  if (state.chat.completed) { location.hash = "#assessment"; return; }
  if (state.chat.turns === 0) { document.getElementById("chat-input").focus(); document.getElementById("chat-hint").textContent = "至少发送一条消息，才能获得沟通复盘。"; return; }
  state.chat.completed = true;
  state.chat.runs += 1;
  persist();
  renderChat();
  location.hash = "#assessment";
}
function restartChat() {
  state.chat.messages = startingMessages.map(x => ({...x}));
  state.chat.turns = 0;
  state.chat.completed = false;
  state.chat.categories = [];
  persist();
  renderChat();
}

const knowledge = [
  { id:"privacy", tag:"隐私权", title:"先确认拍摄是否触及他人的私密生活", body:"公共通道中的摄像头也可能影响邻居。讨论前应了解镜头覆盖范围、记录内容和实际使用方式，不能只凭安装动机或位置作出最终结论。", question:"可以先问：镜头会拍到哪些门口或日常出入？", source:"《中华人民共和国民法典》第一千零三十二条、第一千零三十三条", url:"https://www.court.gov.cn/zixun/xiangqing/233181.html" },
  { id:"camera", tag:"图像采集", title:"必要性、提示与用途都值得核实", body:"公共场所的图像采集有必要性、提示及用途方面的规则。楼道的具体情形和安装主体需要结合事实进一步判断，本卡不直接判定某台设备是否合法。", question:"可以先问：为什么需要拍摄、谁可以查看、有没有显著提示？", source:"《中华人民共和国个人信息保护法》第二十六条", url:"https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_f374e8245320413181742e6d1baf4366.html" },
  { id:"dialogue", tag:"协商行动", title:"把立场改写成可讨论的问题", body:"先陈述观察到的情况，再表达个人顾虑，最后提出核实或调整方案。这样的沟通练习并不保证现实中得到特定结果，却能帮助各方更清楚地讨论事实。", question:"试着说：我理解安全需要；我们能否一起核对拍摄范围？", source:"本项目教学设计建议 · 待法学成员审核", url:"" }
];
function renderKnowledge() {
  const root = document.getElementById("knowledge-cards");
  root.innerHTML = knowledge.map(card => `<article class="knowledge-card"><div class="card-top"><span class="badge">${card.tag}</span><button class="save-button" type="button" data-save="${card.id}" aria-pressed="${state.savedCards.includes(card.id)}">${state.savedCards.includes(card.id) ? "已收藏" : "收藏卡片"}</button></div><h2>${card.title}</h2><p>${card.body}</p><div class="ask">${card.question}</div><div class="source-line"><span>${card.source}</span>${card.url ? `<a href="${card.url}" target="_blank" rel="noopener noreferrer">查看原文</a>` : "<span>审核前不作法律依据</span>"}</div></article>`).join("");
  root.querySelectorAll("[data-save]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.save;
    state.savedCards = state.savedCards.includes(id) ? state.savedCards.filter(x => x !== id) : [...state.savedCards, id];
    persist(); renderKnowledge();
  }));
}

function evidence() {
  const scene = state.scene;
  const chat = state.chat;
  const cats = chat.categories;
  return [
    {title:"发现问题", status:!scene.completed?"证据不足":scene.choices[0]!=="ignore"?"已表现":"仍需练习", note:!scene.completed?"完成剧场第一幕后，才有观察行为可供分析。":scene.choices[0]!=="ignore"?"你先核实了拍摄范围或用途，而不是直接下结论。":"你跳过了事实核实。下次先查看镜头范围或录像用途。"},
    {title:"理解规则", status:!scene.completed?"证据不足":scene.choices[1]==="balance"?"已表现":"仍需练习", note:!scene.completed?"完成剧场第二幕以获得依据。":scene.choices[1]==="balance"?"你同时考虑了安全与隐私，并提出核实管理方式。":"你的选择只考虑了一方诉求。可以回看隐私与图像采集知识卡。"},
    {title:"选择行动", status:!scene.completed?"证据不足":scene.choices[2]==="negotiate"?"已表现":"仍需练习", note:!scene.completed?"完成剧场第三幕以获得依据。":scene.choices[2]==="negotiate"?"你选择让物业参与事实核查和方案讨论。":"这一轮没有形成可核实、可协商的下一步。"},
    {title:"沟通协商", status:!chat.completed?"证据不足":cats.includes("fact")&&cats.includes("proposal")?"已表现":"仍需练习", note:!chat.completed?"结束一次对话练习后，才分析消息行为。":cats.includes("fact")&&cats.includes("proposal")?"你既询问了具体事实，也提出了协商方案。":"这轮消息尚未同时包含事实询问与下一步方案；可以重开聊天试试。"},
    {title:"迁移应用", status:state.transfer===null?"证据不足":state.transfer==="check"?"已表现":"仍需练习", note:state.transfer===null?"完成下方的一道新情境题，看看能否迁移判断方法。":state.transfer==="check"?"面对新场景，你仍然选择先确认拍摄范围、用途和提示。":"新情境里也需要先弄清事实和使用方式，再讨论行动。"}
  ];
}
function renderAssessment() {
  const hasAny = state.scene.completed || state.chat.completed || state.transfer !== null;
  const items = evidence();
  document.getElementById("assessment-summary").innerHTML = `<div class="assess-summary"><div><h2>${hasAny?"你的阶段性反馈":"先体验，再获得反馈"}</h2><p>${hasAny?"以下每项都说明依据；未完成的任务不会被当作能力不足。":"可以先从数字人剧场开始，也可以直接进行消息对话练习。"}</p></div><span class="assess-pill">${items.filter(x=>x.status==="已表现").length} 项已表现</span></div>`;
  document.getElementById("assessment-dimensions").innerHTML = items.map(item => `<div class="dimension"><h3>${item.title}</h3><div><span class="dimension-status ${item.status==="已表现"?"":"pending"}">${item.status}</span><p>${item.note}</p></div></div>`).join("") + `<div class="transfer-task"><h3>迁移练习 · 换一个场景</h3><p>某店铺摄像头可能拍到试衣间门口。你会先做什么？</p><div class="scene-choices"><button class="scene-choice" type="button" data-transfer="check">先确认镜头范围、用途和提示，再讨论调整</button><button class="scene-choice" type="button" data-transfer="assume">只要商家说为了安全，就无需再问</button></div></div>`;
  document.querySelectorAll("[data-transfer]").forEach(button => button.addEventListener("click", () => { state.transfer = button.dataset.transfer; persist(); renderAssessment(); }));
  const missing = items.filter(x => x.status !== "已表现");
  document.getElementById("assessment-recommendation").textContent = !hasAny ? "先完成一个互动任务，系统才有足够依据形成反馈。" : missing.length ? `建议下一步练习“${missing[0].title}”：${missing[0].note}` : "你已完成本期五个维度的练习。可以重新开始同一案例，比较不同选择。";
}
function renderGrowth() {
  document.getElementById("growth-theatre").textContent = state.scene.runs;
  document.getElementById("growth-chat").textContent = state.chat.runs;
  document.getElementById("growth-saved").textContent = state.savedCards.length;
  document.getElementById("growth-next-copy").textContent = state.scene.runs === 0 ? "先从数字人剧场进入案例，了解安全与隐私之间的具体分歧。" : state.chat.runs === 0 ? "你已完成情境判断。现在进入对话实验室，把想法练习说出来。" : "已经走完一次学习闭环。可以重试另一种表达，再对照能力反馈。";
}

document.getElementById("menu-button").addEventListener("click", () => {
  const nav = document.getElementById("main-nav");
  const open = nav.classList.toggle("open");
  document.getElementById("menu-button").setAttribute("aria-expanded", String(open));
});
document.getElementById("scene-restart").addEventListener("click", restartScene);
document.getElementById("chat-restart").addEventListener("click", restartChat);
document.getElementById("chat-form").addEventListener("submit", event => { event.preventDefault(); sendChat(document.getElementById("chat-input").value); });
document.getElementById("chat-finish").addEventListener("click", finishChat);
document.getElementById("clear-progress").addEventListener("click", () => {
  if (!confirm("确定清除当前浏览器中的全部学习记录吗？此操作无法撤销。")) return;
  state = initialState(); persist(); renderGrowth();
});
window.addEventListener("hashchange", renderRoute);
renderRoute();

