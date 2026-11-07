
import BANK_DATA from "./data/bank.json";
import V990_DATA from "./data/vocab990.json";

export function startApp({ store, platform }){
/* ---------- storage ---------- */
function load(){return store.get();}
let S=Object.assign({tasks:{},chap:{},rchap:{},known:{},ans:{},start:"",view:"quest",theme:"auto"},load()||{});
S.ans=S.ans||{};S.rchap=S.rchap||{};
const HOOKS=[];
function save(){store.set(S);HOOKS.forEach(f=>{try{f(S)}catch(e){console.error(e)}});}

/* ---------- theme ---------- */
function applyTheme(t){
  const r=document.documentElement;
  if(t==="light"||t==="dark")r.setAttribute("data-theme",t);else r.removeAttribute("data-theme");
  document.querySelectorAll("[data-theme-set]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.themeSet===t?"true":"false"));
}
document.querySelectorAll("[data-theme-set]").forEach(b=>b.addEventListener("click",()=>{S.theme=b.dataset.themeSet;save();applyTheme(S.theme);}));
applyTheme(S.theme||"auto");

/* ---------- injected data ---------- */
const BANK=JSON.parse(JSON.stringify(BANK_DATA));
const V990=V990_DATA;

/* ---------- data: grammar ---------- */
const G=[
{n:1,t:"詞性與句子結構",pts:["冠詞 / 所有格 / 介系詞後面要接名詞","形容詞修飾名詞，或放在 be 動詞、連綴動詞後","副詞修飾動詞、形容詞、整句；可夾在 be + p.p.、have + p.p. 中間","一個子句只能有一個主要動詞，多的動詞要變 to V / V-ing / p.p."],f:"the + (adv) + adj + N\nS + be + adv + p.p.\nS + V + O + adv",trap:"字尾判斷：-tion/-ment/-ness/-ity 名詞；-ive/-ous/-able/-al/-ful 形容詞；-ly 多為副詞，但 friendly、costly、timely、orderly 是形容詞。",q:{s:"The company's ___ growth surprised many industry analysts.",o:["rapid","rapidly","rapidity","rapidness"],a:0,ex:"所有格 company's 與名詞 growth 之間缺形容詞，選 rapid。"}},
{n:2,t:"主詞與動詞一致",pts:["主詞後的介系詞片語、關係子句不影響動詞單複數，先劃掉","each / every / the number of + 單數動詞","a number of / both / several + 複數動詞","either A or B、neither A nor B 動詞跟著 B；A as well as B 跟著 A"],f:"[The list] (of applicants) + has\nThe number of N(複) + is\nA number of N(複) + are",trap:"The list of new applicants：真正主詞是 list（單數），不是 applicants。",q:{s:"The list of new applicants ___ been forwarded to the hiring manager.",o:["have","has","are","were"],a:1,ex:"主詞是 The list（單數），且 been 前需要 have/has，選 has。"}},
{n:3,t:"名詞與冠詞",pts:["多益愛考的不可數名詞：equipment、information、furniture、advice、luggage、merchandise、machinery","a / an 只接單數可數名詞；可數名詞單數前一定要有限定詞","人 vs 事物：applicant/application、attendee/attendance、supervisor/supervision","複合名詞：safety regulations、customer satisfaction、application form"],f:"a/an + 單數可數 N\nmuch / a great deal of + 不可數\nmany / a number of + 複數",trap:"空格前是 All / Many / Several 時要選複數的「人」，不是抽象名詞。",q:{s:"All ___ must register at the front desk before the seminar begins.",o:["attend","attendance","attendees","attended"],a:2,ex:"All 後接複數名詞，且「報到」的是人，選 attendees。"}},
{n:4,t:"代名詞種類與格",pts:["主格當主詞、受格放動詞或介系詞後、所有格 + 名詞","所有代名詞 = 所有格 + 名詞（mine、hers、theirs）","反身代名詞：主受詞同一人時用；by oneself = 獨自","those who + 複數動詞＝那些…的人；another / the other / others 的區分"],f:"by + oneself\non one's own\nthose who + V(複)",trap:"選項同時有 her 和 herself 時，看是否是「自己做」：by herself、for herself。",q:{s:"Ms. Kim completed the quarterly report by ___ over the weekend.",o:["she","her","hers","herself"],a:3,ex:"by oneself＝獨自完成，選 herself。"}},
{n:5,t:"形容詞的用法",pts:["位置：冠詞 + adj + N；be / remain / seem + adj","數量形容詞：many / few + 可數；much / little + 不可數","-ing 形容事物（令人…），-ed 形容人的感受","易混字：considerable 相當多 / considerate 體貼；reliable 可靠 / reliant 依賴"],f:"a/the + adj + N\nfind / keep / make + O + adj",trap:"同字根選項中有兩個形容詞時，比較意思：considerable support 不是 considerate support。",q:{s:"The new remote-work policy received ___ support from employees.",o:["consider","considerable","considerate","considerably"],a:1,ex:"修飾名詞 support 需要形容詞，「相當多的支持」選 considerable。"}},
{n:6,t:"副詞的用法",pts:["修飾動詞、形容詞、其他副詞、整個句子","常考位置：be + ___ + p.p.、have + ___ + p.p.、___ + V","易混字：hard 努力 / hardly 幾乎不；late 晚 / lately 最近；high 高 / highly 非常","頻率副詞放 be 動詞後、一般動詞前"],f:"be + adv + p.p.\nhave + adv + p.p.\nadv + adj",trap:"空格在完整句子裡（主詞、動詞、受詞都齊全），通常就選副詞。",q:{s:"The renovation project was ___ completed two weeks ahead of schedule.",o:["success","successful","successfully","succeed"],a:2,ex:"be 與 p.p. 之間修飾動詞，選副詞 successfully。"}},
{n:7,t:"介系詞的用法",pts:["時間：at 時刻 / on 日期星期 / in 月年季","by 最晚期限（一次性完成）vs until 持續到","during + 名詞 vs while + 子句；within + 期間","片語介系詞：due to、because of、in addition to、prior to、regardless of、despite、instead of"],f:"介系詞 + N / V-ing\nby + 期限：submit / finish\nuntil + 時間點：stay / remain / wait",trap:"介系詞後面不能接子句，despite the rain ✓ / despite it rained ✗。",q:{s:"Please submit your expense reports ___ Friday at 5 P.M.",o:["until","by","since","during"],a:1,ex:"submit 是一次性動作，期限用 by。"}},
{n:8,t:"連接詞的用法",pts:["對等連接詞：and / but / or / so / yet","相關連接詞：both A and B、either A or B、neither A nor B、not only A but also B","從屬連接詞 + 子句：although、because、unless、once、as soon as、provided that","連接詞 vs 介系詞 vs 連接副詞（however、therefore 不能連接兩個子句）"],f:"Although + S + V, S + V\nDespite + N, S + V\nS + V; however, S + V",trap:"四個選項意思相近時，先看空格後是「子句」還是「名詞」，再決定連接詞或介系詞。",q:{s:"___ the weather was poor, the outdoor concert was held as planned.",o:["Despite","Although","However","Because of"],a:1,ex:"空格後是子句（the weather was poor），語意為讓步，選連接詞 Although。"}},
{n:9,t:"現在式與現在進行式",pts:["現在簡單式：習慣、事實、時刻表（The train leaves at 9.）","時間 / 條件子句用現在式代替未來式（when、if、before、after、as soon as、once）","現在進行式：now、currently、at the moment、this week","狀態動詞不用進行式：know、belong、consist、contain、own"],f:"every day / usually + 現在式\ncurrently / now + am/is/are V-ing",trap:"every weekday、each morning 是習慣，不能用進行式。",q:{s:"Our customer service center ___ at 9 A.M. every weekday.",o:["open","opens","is opening","opened"],a:1,ex:"every weekday 表習慣，主詞單數，選 opens。"}},
{n:10,t:"過去式與現在完成式",pts:["過去式時間標記：yesterday、last、ago、in 2020、when 過去事件","現在完成：since、for、so far、recently、already、yet、over the past + 時間","現在完成的三種用法：經驗、完成、持續到現在","has gone to 去了未回 / has been to 去過"],f:"over the past / since + 過去時間 → have/has + p.p.\n明確過去時間 → V-ed",trap:"over the past three years 一出現，就是現在完成式；last year 就是過去式。",q:{s:"Online sales ___ steadily over the past three years.",o:["increase","increased","have increased","will increase"],a:2,ex:"over the past 表從過去持續到現在，選 have increased。"}},
{n:11,t:"過去進行式與過去完成式",pts:["過去進行：過去某時正在做，常與 when + 過去式搭配（被打斷的動作）","過去完成：過去的過去，比另一個過去動作更早","By the time + 過去式，主句用 had + p.p.","before / after 已表先後時，口語可用過去式代替"],f:"By the time S + V-ed, S + had p.p.\nS + was/were V-ing when S + V-ed",trap:"看到 By the time 先看後面子句的時態，過去式配過去完成，現在式配未來完成。",q:{s:"By the time the director arrived, the meeting ___ .",o:["already ends","has already ended","had already ended","will end"],a:2,ex:"By the time + 過去式 arrived，更早發生的動作用過去完成 had ended。"}},
{n:12,t:"易混淆時態總複習",pts:["yesterday / ago / last → 過去式","since / for / so far / over the past → 現在完成","By the time + 過去 → 過去完成；By + 未來時間 → 未來完成","next / tomorrow / upcoming / soon → 未來式；currently / now → 進行式"],f:"By next March → will have p.p.\nBy the time S + V(現在) → will have p.p.",trap:"By next year、by the end of this month 都指未來的截止點，答案是 will have p.p.。",q:{s:"By next March, Mr. Ortiz ___ with the firm for ten years.",o:["works","worked","has worked","will have worked"],a:3,ex:"By + 未來時間點，到那時已持續 10 年，選未來完成 will have worked。"}},
{n:13,t:"未來表達式與常考陷阱",pts:["will / be going to / be about to（即將）","多益常見：be scheduled to、be set to、be expected to、be due to、be slated to","現在進行式表已安排好的未來（We are meeting the client tomorrow.）","陷阱：時間、條件子句（once、when、if、as soon as）不用 will"],f:"Once / When / If + S + V(現在), S + will V\nbe scheduled to + V",trap:"once、as soon as 後面看到 will 一律刪掉，主句才用 will。",q:{s:"Once the contract ___ signed, construction will begin immediately.",o:["will be","is","was","being"],a:1,ex:"Once 引導時間子句，用現在式代替未來，選 is。"}},
{n:14,t:"助動詞的用法",pts:["can / could / may / might / must / should + 原形動詞","must have p.p. 一定是（推測過去）；should have p.p. 早該（後悔）","建議、要求動詞 + that + S + (should) 原形：suggest、recommend、require、request、insist、ask","It is essential / imperative / necessary that + S + 原形"],f:"S + request(s) that + S + 原形V\nIt is essential that + S + 原形V",trap:"that 子句主詞是第三人稱單數，仍然用原形，不加 s：that every employee attend。",q:{s:"The director requested that every employee ___ the safety training.",o:["attends","attend","attended","attending"],a:1,ex:"request that 後省略 should，用原形動詞 attend。"}},
{n:15,t:"主詞與被動語態",pts:["主詞是動作的接受者 → be + p.p.","空格後面沒有受詞，而動詞是及物動詞 → 多半選被動","不及物動詞沒有被動：occur、happen、arise、rise、remain、take place","被動固定搭配：be required to、be based on、be located in、be involved in、be entitled to"],f:"S + 助動詞 + be + p.p.\nS + has/have been + p.p.\nS + is being + p.p.",trap:"report 是被「提交」的，主詞是物、後面沒受詞，答案就是 be submitted。",q:{s:"The annual budget report must ___ by the end of the month.",o:["submit","be submitted","submitting","have submitted"],a:1,ex:"報告是被提交的，助動詞後用 be + p.p.。"}},
{n:16,t:"使役動詞與感官動詞",pts:["make / have / let + O + 原形動詞","get + O + to V；help + O + (to) V","have / get + 物 + p.p.（請別人處理）：have the printer repaired","感官 see / hear / watch / notice + O + 原形（全程）/ V-ing（正在）/ p.p.（被動）"],f:"have + 人 + 原形V\nhave + 物 + p.p.\nget + 人 + to V",trap:"先判斷受詞是人還是物：人主動做→原形；物被處理→p.p.。",q:{s:"The office manager had the technician ___ the broken printer.",o:["repair","repaired","to repair","repairs"],a:0,ex:"have + 人 + 原形動詞，技師主動修理，選 repair。"}},
{n:17,t:"授予動詞",pts:["give / send / offer / show / grant / award / lend + 人 + 物","改寫：give / send / offer + 物 + to 人；buy / make / find + 物 + for 人","被動兩種：人 + be offered + 物；物 + be offered + to 人","不能接雙受詞：explain、describe、suggest、announce + 物 + to 人"],f:"S + be + offered / given / awarded + N",trap:"被動後面還留著一個名詞（a promotion）是正常的，因為授予動詞有兩個受詞。",q:{s:"Ms. Lee was ___ a promotion after the successful product launch.",o:["offer","offering","offered","offers"],a:2,ex:"was + p.p. 的被動，後面保留直接受詞 a promotion，選 offered。"}},
{n:18,t:"連綴動詞",pts:["連綴動詞後接形容詞，不接副詞：be、become、remain、stay、seem、appear、look、sound、prove、turn","多益常見：remain competitive、stay open、prove effective、become available","seem / appear + to V 也很常見","look 可以是連綴（看起來）也可以是一般動詞（look carefully）"],f:"S + remain / stay / prove + adj",trap:"remained 後面看起來像要修飾動詞，但它是連綴動詞，要選形容詞。",q:{s:"Despite the economic slowdown, the company's profits remained ___ .",o:["stable","stably","stability","stabilize"],a:0,ex:"remain 是連綴動詞，後接形容詞 stable。"}},
{n:19,t:"不定詞與動名詞",pts:["只接 to V：plan、decide、agree、hope、expect、afford、intend、aim、strive、fail、refuse","只接 V-ing：consider、avoid、suggest、finish、enjoy、recommend、postpone、mind、delay","to 是介系詞，後接 V-ing：look forward to、be committed to、be dedicated to、object to、be used to、contribute to","in order to + V；so as to + V 表目的"],f:"look forward to + V-ing\nbe committed to + V-ing\nconsider + V-ing",trap:"look forward to 的 to 是介系詞，後面不能接原形動詞。",q:{s:"We look forward to ___ with your team next quarter.",o:["work","working","worked","be working"],a:1,ex:"look forward to + V-ing，選 working。"}},
{n:20,t:"比較級與最高級",pts:["as + 原級 + as；the same N as","比較級 + than；最高級 the + -est / most + of / in / ever","修飾比較級：much、even、far、still、a lot、significantly（不用 very）","the + 比較級, the + 比較級（越…越…）"],f:"much / far / even + 比較級 + than\none of the + 最高級 + 複數N",trap:"very 不能修飾比較級，看到 more efficient 前面有空格，選 much / far / even。",q:{s:"The new model is ___ more fuel-efficient than the previous one.",o:["very","much","many","most"],a:1,ex:"修飾比較級 more efficient 用 much。"}},
{n:21,t:"倒裝句與強調句構",pts:["否定副詞開頭倒裝：Never、Rarely、Seldom、Hardly、Not only + 助動詞 + S","Only + 時間/條件 開頭倒裝：Only after...did we...","商業書信必考：Enclosed is / are...、Attached is / are...（動詞跟後面的主詞）","強調句：It is / was + 強調部分 + that..."],f:"Enclosed are + 複數N\nNot only + 助V + S + V, but also...\nIt is ... that ...",trap:"Enclosed / Attached 開頭時，真正主詞在動詞後面，兩樣東西用 are。",q:{s:"Enclosed ___ the revised schedule and the updated invoice.",o:["is","are","has","be"],a:1,ex:"倒裝句，主詞是 the schedule and the invoice（兩項，複數），選 are。"}},
{n:22,t:"假設語氣",pts:["與現在事實相反：If + 過去式（be 用 were），S + would + V","與過去事實相反：If + had p.p.，S + would have p.p.","省略 if 倒裝：Had I known...、Were I...、Should you...","多益書信最愛：Should you have any questions, please contact us."],f:"Should + S + V, please...\nHad + S + p.p., S + would have p.p.",trap:"句首空格後接「主詞 + p.p.」選 Had；接「主詞 + 原形」選 Should；接「主詞 + 名詞/形容詞」選 Were。主句 would have p.p. 就是在提示 Had。",q:{s:"___ we received the parts earlier, we would have met the production deadline.",o:["If","Should","Had","Were"],a:2,ex:"主句 would have met 表與過去事實相反，if 子句應為 If we had received；省略 if 後倒裝成 Had we received，選 Had。If 後面的 received 時態不對。"}},
{n:23,t:"名詞子句",pts:["that / whether / if / 疑問詞引導，可當主詞、受詞、補語","whether（or not）：是否；介系詞後、句首主詞只能用 whether，不能用 if","what = the thing(s) which，後接不完整子句","that 後接完整子句；名詞子句用直述句語序"],f:"S + V + whether + S + V\nWhat + 不完整子句 + V\n介系詞 + whether / 疑問詞 + S + V",trap:"「是否」的意思且後接完整句，選 whether；what 後面一定缺主詞或受詞。",q:{s:"The committee has not decided ___ the conference will be held online.",o:["that","whether","what","which"],a:1,ex:"「是否」舉辦線上會議，後接完整子句，選 whether。"}},
{n:24,t:"形容詞子句：關係代名詞",pts:["人 who / whom；物 which；人或物 that","whose + 名詞（所有格），後接完整子句","關代後的動詞要跟先行詞一致","非限定（有逗號）不能用 that；介系詞後只能用 which / whom"],f:"N(人) + who + V\nN + whose + N + V\nN + 介系詞 + which + S + V",trap:"空格後面是名詞 + 動詞（résumés are），中間少了「的」，選 whose。",q:{s:"Applicants ___ résumés are incomplete will not be considered.",o:["who","whom","whose","which"],a:2,ex:"「履歷不完整的應徵者」，空格後接名詞 résumés，選所有格 whose。"}},
{n:25,t:"形容詞子句：關係副詞",pts:["where 地點、when 時間、why 原因、how 方法（the way 與 how 不能並用）","關係副詞後接完整子句；關係代名詞後接不完整子句","where = in / at which；when = on / in which","先行詞是地點，但後面缺受詞時要用 which（the hotel which we booked）"],f:"N(地點) + where + 完整子句\nN(時間) + when + 完整子句",trap:"看到地點名詞不要直接選 where，先確認後面子句是完整的。",q:{s:"This is the hotel ___ the international trade conference will take place.",o:["which","where","when","whose"],a:1,ex:"take place 不及物，後面子句完整，先行詞是地點，選 where。"}},
{n:26,t:"副詞子句的省略：分詞構句",pts:["前後主詞相同時，可省略連接詞與主詞，動詞改 V-ing（主動）或 p.p.（被動）","保留連接詞的形式最常考：When / While / Before / After / Once / If + V-ing / p.p.","多益熟面孔：When completed、Once approved、Unless otherwise noted、As requested","判斷主動被動：看主句主詞會不會自己做這個動作"],f:"When + V-ing (主動), S + V\nOnce + p.p. (被動), S + V",trap:"主句主詞是「你」（祈使句），你主動提交 → When submitting；若主詞是表格本身才用 When submitted。",q:{s:"When ___ the application, please attach a copy of your photo ID.",o:["submit","submitting","submitted","to submit"],a:1,ex:"祈使句主詞是 you，主動提交申請，連接詞後用 V-ing，選 submitting。"}}
];

/* ---------- data: vocab ---------- */
const VT=["辦公室與行政","人事招募","會議與簡報","行銷與廣告","銷售與客服","財務與會計","合約與法規","製造與品管","物流與採購","出差與旅遊","餐飲與活動","住宅與房地產","健康與醫療","科技與 IT","企業經營與策略","Part 5 高頻形容詞","高頻副詞與轉折詞","高頻動詞搭配","Part 1 照片場景字","Part 2–4 口語片語"];
const VRAW=[
`supervisor|n.|主管|report to a supervisor
colleague|n.|同事|work closely with colleagues
assign|v.|指派|be assigned to a project
deadline|n.|截止期限|meet the deadline
memo|n.|備忘錄|send a memo to all staff
submit|v.|提交|submit a report
approve|v.|批准|approve a budget request
authorize|v.|授權|authorized personnel only
oversee|v.|監督|oversee daily operations
delegate|v.|委派|delegate tasks to the team
attach|v.|附上|the attached file
forward|v.|轉寄|forward the email to me
file|v./n.|歸檔；提出|file a complaint
stationery|n.|文具|order office stationery
photocopier|n.|影印機|the photocopier is out of order
cubicle|n.|辦公隔間|share a cubicle
reception|n.|接待處；歡迎會|check in at reception
in charge of|phr.|負責|be in charge of payroll
on behalf of|phr.|代表|speak on behalf of the director
workload|n.|工作量|a heavy workload
procedure|n.|程序|follow the standard procedure
reminder|n.|提醒|send a reminder
temporary|adj.|臨時的|a temporary position
remotely|adv.|遠端地|work remotely
headquarters|n.|總部|relocate the headquarters`,
`applicant|n.|應徵者|qualified applicants
candidate|n.|候選人|a strong candidate
résumé|n.|履歷|submit a résumé
qualification|n.|資格|meet the qualifications
requirement|n.|必要條件|job requirements
recruit|v.|招募|recruit new staff
hire|v.|雇用|hire a consultant
conduct|v.|進行|conduct an interview
reference|n.|推薦人；參考|a letter of reference
experienced|adj.|有經驗的|highly experienced
eligible|adj.|有資格的|be eligible for a bonus
promote|v.|升遷；促銷|be promoted to manager
promotion|n.|升遷；促銷|receive a promotion
transfer|v./n.|調職；轉帳|transfer to the Tokyo branch
resign|v.|辭職|resign from the position
retire|v.|退休|retire next year
payroll|n.|薪資名冊|the payroll department
compensation|n.|薪酬；補償|a competitive compensation package
benefits|n.|福利|health benefits
incentive|n.|激勵；獎勵|offer incentives
probation|n.|試用期|a three-month probation period
orientation|n.|新人說明會|attend the orientation
evaluation|n.|評估|performance evaluation
vacancy|n.|職缺|fill the vacancy
personnel|n.|人員；人事部|personnel department`,
`agenda|n.|議程|the next item on the agenda
attend|v.|出席|attend a conference
attendee|n.|出席者|conference attendees
participant|n.|參與者|workshop participants
postpone|v.|延期|postpone the meeting
reschedule|v.|改期|reschedule the appointment
cancel|v.|取消|cancel the reservation
convene|v.|召開|convene a meeting
preside|v.|主持|preside over the meeting
minutes|n.|會議記錄|take the minutes
handout|n.|講義|distribute handouts
presentation|n.|簡報|give a presentation
projector|n.|投影機|set up the projector
consensus|n.|共識|reach a consensus
propose|v.|提議|propose a new plan
proposal|n.|提案|submit a proposal
brief|v./adj.|簡報；簡短的|brief the team
summarize|v.|總結|summarize the findings
input|n.|意見|we appreciate your input
feedback|n.|回饋|collect customer feedback
keynote|n.|主題演講|keynote speaker
venue|n.|場地|the venue for the event
session|n.|場次；會議|a training session
adjourn|v.|休會|the meeting is adjourned
address|v.|處理；發表演說|address the issue`,
`advertise|v.|刊登廣告|advertise in local newspapers
advertisement|n.|廣告|place an advertisement
campaign|n.|宣傳活動|an advertising campaign
launch|v./n.|推出|launch a new product
brochure|n.|小冊子|a product brochure
survey|n./v.|調查|conduct a survey
target|v./n.|鎖定；目標|target young consumers
demographic|n.|人口族群|a younger demographic
competitor|n.|競爭對手|outperform competitors
competitive|adj.|有競爭力的|competitive prices
brand|n.|品牌|brand awareness
promotional|adj.|促銷的|promotional materials
endorse|v.|代言；背書|endorse a product
publicity|n.|宣傳；曝光|gain publicity
market share|n.|市占率|increase market share
trend|n.|趨勢|follow market trends
innovative|adj.|創新的|an innovative design
feature|v./n.|以…為特色；特色|feature the latest technology
exclusive|adj.|獨家的|an exclusive offer
coupon|n.|折價券|redeem a coupon
discount|n.|折扣|offer a 20 percent discount
complimentary|adj.|免費贈送的|complimentary breakfast
sponsor|v./n.|贊助|sponsor the event
appeal|v./n.|吸引|appeal to customers
outlet|n.|商店；暢貨中心|retail outlets`,
`client|n.|客戶|meet with a client
purchase|v./n.|購買|make a purchase
place an order|phr.|下訂單|place an order online
inquiry|n.|詢問|respond to inquiries
inquire|v.|詢問|inquire about the price
complaint|n.|抱怨|handle complaints
refund|n./v.|退款|request a full refund
exchange|v./n.|交換|exchange an item
receipt|n.|收據|keep the receipt
warranty|n.|保固|under warranty
guarantee|v./n.|保證|satisfaction guaranteed
defective|adj.|有瑕疵的|a defective product
replacement|n.|替換品|send a replacement
in stock|phr.|有庫存|the item is in stock
out of stock|phr.|缺貨|currently out of stock
merchandise|n.|商品（不可數）|return merchandise
retail|n./adj.|零售|retail price
wholesale|n./adj.|批發|wholesale prices
quote|n./v.|報價|request a quote
estimate|n./v.|估價；估計|a cost estimate
satisfaction|n.|滿意度|customer satisfaction
loyalty|n.|忠誠度|a loyalty program
representative|n.|代表；專員|customer service representative
courteous|adj.|有禮貌的|courteous staff
patronage|n.|惠顧|thank you for your patronage`,
`budget|n.|預算|stay within budget
expense|n.|費用|travel expenses
reimburse|v.|報銷；補償|be reimbursed for expenses
invoice|n.|發票；請款單|issue an invoice
revenue|n.|營收|annual revenue
profit|n.|利潤|net profit
deficit|n.|赤字|a budget deficit
audit|n./v.|審計|an annual audit
accountant|n.|會計師|consult an accountant
fiscal|adj.|財政的|fiscal year
quarter|n.|季度|the third quarter
balance|n.|餘額|account balance
deposit|n./v.|存款；押金|make a deposit
withdraw|v.|提款；撤回|withdraw cash
loan|n.|貸款|apply for a loan
interest rate|n.|利率|low interest rates
investment|n.|投資|a sound investment
investor|n.|投資人|attract investors
asset|n.|資產|company assets
financial statement|n.|財務報表|review the financial statements
outstanding|adj.|未付的；傑出的|an outstanding balance
overdue|adj.|逾期的|an overdue payment
transaction|n.|交易|online transactions
cost-effective|adj.|划算的|a cost-effective solution
forecast|n./v.|預測|sales forecast`,
`contract|n.|合約|sign a contract
agreement|n.|協議|reach an agreement
terms|n.|條款|terms and conditions
clause|n.|條款|a confidentiality clause
negotiate|v.|談判|negotiate a deal
renew|v.|續約|renew the contract
expire|v.|到期|the lease expires next month
expiration|n.|到期|expiration date
valid|adj.|有效的|a valid passport
binding|adj.|有約束力的|legally binding
comply|v.|遵守|comply with regulations
compliance|n.|遵守|in compliance with
regulation|n.|規定|safety regulations
policy|n.|政策|company policy
violate|v.|違反|violate the rules
obligation|n.|義務|a contractual obligation
liable|adj.|負法律責任的|be liable for damages
confidential|adj.|機密的|confidential information
signature|n.|簽名|require a signature
amend|v.|修訂|amend the agreement
draft|n./v.|草稿；起草|draft a contract
party|n.|（合約）當事人|both parties
legal|adj.|法律的|legal advice
permit|n./v.|許可證；允許|a parking permit
license|n.|執照|a business license`,
`manufacture|v.|製造|manufacture components
manufacturer|n.|製造商|a leading manufacturer
assembly line|n.|生產線|work on the assembly line
facility|n.|設施|a production facility
plant|n.|工廠|a manufacturing plant
equipment|n.|設備（不可數）|install new equipment
machinery|n.|機械（不可數）|heavy machinery
operate|v.|操作；營運|operate the machine
output|n.|產量|increase output
capacity|n.|產能；容量|at full capacity
efficiency|n.|效率|improve efficiency
productivity|n.|生產力|boost productivity
inspect|v.|檢查|inspect the products
inspection|n.|檢查|a safety inspection
quality control|n.|品管|quality control standards
standard|n.|標準|meet industry standards
specification|n.|規格|technical specifications
malfunction|n./v.|故障|the machine malfunctioned
maintenance|n.|維修保養|routine maintenance
upgrade|v./n.|升級|upgrade the system
component|n.|零件|electronic components
raw material|n.|原料|the cost of raw materials
prototype|n.|原型|develop a prototype
durable|adj.|耐用的|durable materials
precaution|n.|預防措施|safety precautions`,
`supplier|n.|供應商|a reliable supplier
vendor|n.|供應商；攤販|approved vendors
shipment|n.|貨物；運送|track the shipment
ship|v.|運送|ship the order overnight
delivery|n.|遞送|express delivery
warehouse|n.|倉庫|store goods in a warehouse
inventory|n.|庫存|take inventory
stock|n./v.|存貨；進貨|stock the shelves
procure|v.|採購|procure supplies
supplies|n.|用品|office supplies
in bulk|phr.|大量地|buy in bulk
freight|n.|貨運|freight charges
dispatch|v.|發送|dispatch the goods
courier|n.|快遞|send by courier
track|v.|追蹤|track your order
estimated|adj.|預估的|estimated arrival time
delay|n./v.|延誤|due to a delay
fragile|adj.|易碎的|fragile items
package|n./v.|包裹；包裝|a package arrived
packaging|n.|包裝材料|eco-friendly packaging
distribution|n.|配送；分配|distribution center
logistics|n.|物流|a logistics company
customs|n.|海關|clear customs
handling|n.|處理|shipping and handling
backorder|n./v.|延期交貨|the item is on backorder`,
`itinerary|n.|行程表|a detailed itinerary
reservation|n.|預訂|make a reservation
book|v.|預訂|book a flight
accommodation|n.|住宿|arrange accommodations
departure|n.|出發|departure time
arrival|n.|抵達|arrival gate
board|v.|登機；上車|board the plane
boarding pass|n.|登機證|show your boarding pass
destination|n.|目的地|a popular destination
aisle|n.|走道|an aisle seat
luggage|n.|行李（不可數）|carry-on luggage
baggage claim|n.|行李提領處|meet at baggage claim
layover|n.|轉機停留|a two-hour layover
connecting flight|n.|轉機航班|miss a connecting flight
fare|n.|票價|bus fare
round-trip|adj.|來回的|a round-trip ticket
passenger|n.|乘客|passengers are reminded to...
commute|v./n.|通勤|a long commute
transportation|n.|交通運輸|public transportation
shuttle|n.|接駁車|airport shuttle
check in|phr.|報到；入住|check in at the counter
excursion|n.|短途旅行|a day excursion
tourist attraction|n.|觀光景點|a famous tourist attraction
currency|n.|貨幣|exchange currency
per diem|n.|每日津貼|a daily per diem`,
`cater|v.|承辦餐飲|cater the event
catering|n.|外燴|catering service
banquet|n.|宴會|an awards banquet
refreshments|n.|茶點|refreshments will be served
cuisine|n.|料理|local cuisine
dietary|adj.|飲食的|dietary restrictions
beverage|n.|飲料|food and beverages
appetizer|n.|開胃菜|order an appetizer
chef|n.|主廚|head chef
patron|n.|顧客；贊助人|restaurant patrons
gathering|n.|聚會|a social gathering
host|v./n.|主辦；主人|host a dinner
organize|v.|籌劃|organize a fundraiser
fundraiser|n.|募款活動|a charity fundraiser
anniversary|n.|週年|the 50th anniversary
celebrate|v.|慶祝|celebrate the opening
ceremony|n.|典禮|an awards ceremony
exhibition|n.|展覽|an art exhibition
admission|n.|入場（費）|free admission
registration|n.|報名|online registration
register|v.|報名|register for the workshop
seating|n.|座位安排|seating is limited
sold out|phr.|售完|tickets are sold out
performance|n.|表演；績效|a live performance
RSVP|v.|回覆是否出席|RSVP by Friday`,
`property|n.|房產|a commercial property
tenant|n.|房客|tenants must pay rent on time
landlord|n.|房東|contact the landlord
lease|n./v.|租約；租賃|sign a one-year lease
rent|n./v.|租金；租|monthly rent
real estate|n.|房地產|a real estate agent
residential|adj.|住宅的|a residential area
commercial|adj.|商業的|commercial district
renovate|v.|翻修|renovate the lobby
renovation|n.|翻修|under renovation
construction|n.|建設|a construction site
contractor|n.|承包商|hire a contractor
utilities|n.|水電瓦斯|utilities are included
spacious|adj.|寬敞的|a spacious office
vacant|adj.|空著的|a vacant lot
occupy|v.|佔用|the room is occupied
relocate|v.|搬遷|relocate to a new office
premises|n.|營業場所|on the premises
furnished|adj.|附傢俱的|a fully furnished apartment
furniture|n.|傢俱（不可數）|office furniture
neighborhood|n.|社區|a quiet neighborhood
amenities|n.|便利設施|modern amenities
plumber|n.|水管工|call a plumber
blueprint|n.|藍圖|review the blueprint
floor plan|n.|平面圖|an open floor plan`,
`appointment|n.|預約|make an appointment
clinic|n.|診所|a dental clinic
physician|n.|醫師|consult a physician
prescription|n.|處方|fill a prescription
pharmacy|n.|藥局|pick it up at the pharmacy
medication|n.|藥物|take medication
symptom|n.|症狀|common symptoms
checkup|n.|健康檢查|an annual checkup
insurance|n.|保險|health insurance
coverage|n.|保險範圍；報導|insurance coverage
patient|n./adj.|病患；有耐心的|treat patients
treatment|n.|治療|receive treatment
recover|v.|康復|recover from an illness
wellness|n.|健康|a wellness program
nutrition|n.|營養|good nutrition
fitness|n.|健身|fitness center
hygiene|n.|衛生|personal hygiene
emergency|n.|緊急情況|in case of emergency
ambulance|n.|救護車|call an ambulance
sick leave|n.|病假|take sick leave
allergy|n.|過敏|food allergies
vaccine|n.|疫苗|get a flu vaccine
dosage|n.|劑量|the recommended dosage
ward|n.|病房|a hospital ward
practitioner|n.|執業醫師|a general practitioner`,
`software|n.|軟體|install software
device|n.|裝置|mobile devices
database|n.|資料庫|update the database
network|n.|網路|network security
access|n./v.|存取；使用|gain access to
password|n.|密碼|reset your password
log in|phr.|登入|log in to the system
download|v.|下載|download the file
upload|v.|上傳|upload the document
install|v.|安裝|install the update
compatible|adj.|相容的|compatible with the system
technical|adj.|技術的|technical support
troubleshoot|v.|排除故障|troubleshoot the problem
glitch|n.|小故障|a software glitch
backup|n.|備份|create a backup
server|n.|伺服器|the server is down
user-friendly|adj.|易用的|a user-friendly interface
interface|n.|介面|user interface
automate|v.|自動化|automate the process
digital|adj.|數位的|digital marketing
subscribe|v.|訂閱|subscribe to the newsletter
subscription|n.|訂閱|renew your subscription
encrypt|v.|加密|encrypt data
outage|n.|停電；中斷|a power outage
cutting-edge|adj.|最先進的|cutting-edge technology`,
`expand|v.|擴展|expand into overseas markets
expansion|n.|擴張|business expansion
merger|n.|合併|a merger between two firms
acquire|v.|收購；獲得|acquire a competitor
acquisition|n.|收購|a recent acquisition
subsidiary|n.|子公司|a wholly owned subsidiary
branch|n.|分公司|open a new branch
executive|n.|主管；高層|senior executives
board of directors|n.|董事會|the board of directors approved
shareholder|n.|股東|a shareholders' meeting
strategy|n.|策略|a marketing strategy
objective|n.|目標|achieve objectives
initiative|n.|新計畫；主動性|a new initiative
implement|v.|實施|implement a policy
restructure|v.|重組|restructure the company
streamline|v.|精簡|streamline operations
outsource|v.|外包|outsource customer service
partnership|n.|合作關係|form a partnership
collaborate|v.|合作|collaborate on a project
joint venture|n.|合資企業|form a joint venture
growth|n.|成長|steady growth
decline|n./v.|下降；婉拒|a decline in sales
announce|v.|宣布|announce the results
press release|n.|新聞稿|issue a press release
sustainable|adj.|永續的|sustainable development`,
`available|adj.|可取得的；有空的|available upon request
responsible|adj.|負責的|be responsible for
accessible|adj.|容易到達的|easily accessible by train
affordable|adj.|負擔得起的|affordable prices
appropriate|adj.|適當的|appropriate attire
reliable|adj.|可靠的|a reliable source
efficient|adj.|有效率的|an efficient system
effective|adj.|有效的；生效的|effective immediately
extensive|adj.|廣泛的|extensive experience
comprehensive|adj.|全面的|a comprehensive guide
considerable|adj.|相當大的|considerable effort
considerate|adj.|體貼的|considerate of others
significant|adj.|顯著的|a significant increase
substantial|adj.|大量的|substantial savings
preliminary|adj.|初步的|preliminary results
mandatory|adj.|強制的|mandatory training
optional|adj.|選擇性的|attendance is optional
previous|adj.|先前的|previous experience
subsequent|adj.|隨後的|subsequent meetings
prospective|adj.|潛在的；未來的|prospective clients
tentative|adj.|暫定的|a tentative schedule
punctual|adj.|準時的|be punctual for meetings
versatile|adj.|多用途的|a versatile tool
renowned|adj.|有名的|a renowned architect
vital|adj.|極重要的|vital to our success`,
`approximately|adv.|大約|approximately 200 people
immediately|adv.|立即|effective immediately
promptly|adv.|迅速地；準時|start promptly at 9
temporarily|adv.|暫時地|temporarily closed
currently|adv.|目前|currently unavailable
recently|adv.|最近|recently hired
previously|adv.|先前|as previously mentioned
shortly|adv.|很快|shortly after the meeting
regularly|adv.|定期地|regularly updated
frequently|adv.|經常|frequently asked questions
consistently|adv.|一貫地|consistently high quality
significantly|adv.|顯著地|significantly reduced
considerably|adv.|相當地|considerably higher
relatively|adv.|相對地|relatively low cost
nearly|adv.|幾乎|nearly finished
hardly|adv.|幾乎不|hardly ever
highly|adv.|非常|highly recommended
however|adv.|然而|However, the price rose.
therefore|adv.|因此|Therefore, we postponed it.
moreover|adv.|此外|Moreover, it is affordable.
otherwise|adv.|否則；以其他方式|unless otherwise noted
nevertheless|adv.|儘管如此|Nevertheless, sales grew.
accordingly|adv.|相應地|adjust the budget accordingly
in addition|phr.|此外|In addition, lunch is provided.
as a result|phr.|因此|As a result, profits fell.`,
`accommodate|v.|容納；配合|accommodate 300 guests
acknowledge|v.|確認收到；承認|acknowledge receipt of
allocate|v.|分配|allocate resources
anticipate|v.|預期|anticipate demand
attribute|v.|歸因於|be attributed to
commence|v.|開始|construction will commence
confirm|v.|確認|confirm your reservation
consult|v.|諮詢；查閱|consult the manual
contribute|v.|貢獻|contribute to the success
coordinate|v.|協調|coordinate the schedule
dedicate|v.|致力於|be dedicated to
designate|v.|指定|a designated parking area
ensure|v.|確保|ensure safety
exceed|v.|超過|exceed expectations
facilitate|v.|促進|facilitate communication
finalize|v.|定案|finalize the details
fulfill|v.|履行；完成|fulfill an order
indicate|v.|表示|as indicated below
notify|v.|通知|notify sb of sth
obtain|v.|取得|obtain permission
proceed|v.|前往；繼續進行|proceed to Gate 5
pursue|v.|追求|pursue a career
retain|v.|保留|retain customers
undergo|v.|經歷|undergo renovation
verify|v.|核實|verify your identity`,
`lean against|phr.|倚靠|leaning against the wall
stack|v./n.|堆疊|boxes are stacked
pile|n./v.|一堆；堆|a pile of papers
arrange|v.|排列|chairs are arranged in rows
on display|phr.|陳列中|items are on display
hang|v.|懸掛|a picture is hanging on the wall
mount|v.|固定；安裝|mounted on the wall
reach for|phr.|伸手拿|reaching for a file
examine|v.|檢查|examining a document
point at|phr.|指著|pointing at the screen
sweep|v.|掃|sweeping the floor
wipe|v.|擦|wiping the counter
water|v.|澆水|watering the plants
fold|v.|摺疊|folding a towel
load|v.|裝載|loading a truck
unload|v.|卸貨|unloading boxes
pedestrian|n.|行人|pedestrians are crossing the street
railing|n.|欄杆|holding on to a railing
dock|v./n.|停泊；碼頭|a boat is docked
ladder|n.|梯子|climbing a ladder
shelf|n.|架子|stocking shelves
cart|n.|推車|pushing a cart
wheelbarrow|n.|手推車|pushing a wheelbarrow
podium|n.|講台|standing at a podium
scatter|v.|散落|papers are scattered on the desk`,
`Would you mind...?|phr.|你介意…嗎|Would you mind closing the door?
Why don't we...?|phr.|我們何不…（提議）|Why don't we take a break?
I'd be happy to.|phr.|我很樂意|回應請求的正解
I'm afraid...|phr.|恐怕…（委婉拒絕）|I'm afraid I can't make it.
take care of|phr.|處理|I'll take care of it.
run out of|phr.|用完|We've run out of paper.
fill in for|phr.|代班|fill in for a colleague
look into|phr.|調查|I'll look into it.
set up|phr.|設置；安排|set up a meeting
drop off|phr.|放下；送達|drop off the documents
pick up|phr.|領取；接人|pick up a package
sign up for|phr.|報名|sign up for the course
go over|phr.|檢查；複習|go over the report
figure out|phr.|弄清楚|figure out the problem
turn in|phr.|繳交|turn in the forms
call off|phr.|取消|the event was called off
put off|phr.|延期|put off the decision
come up with|phr.|想出|come up with an idea
fall behind|phr.|落後|fall behind schedule
get back to|phr.|回覆|I'll get back to you.
in advance|phr.|事先|book in advance
at the latest|phr.|最晚|by Friday at the latest
as of|phr.|自…起|as of next Monday
on short notice|phr.|臨時通知|on such short notice
That's a good point.|phr.|說得有道理（間接同意）|Part 2 常見正解`
];
const VOCAB=[];
VRAW.forEach((blk,ti)=>blk.trim().split("\n").forEach((ln,i)=>{const a=ln.split("|").map(s=>s.trim());VOCAB.push({id:ti+"-"+i,w:a[0],p:a[1],z:a[2],c:a[3]||"",t:ti});}));

/* ---------- data: strategy ---------- */
const PARTS=[
{p:"PART 1",t:"照片描述",q:"6 題 · 聽力",tips:["音檔播放前先看圖：主詞是誰、在做什麼、物品在哪裡","聽到圖片裡沒出現的名詞或動作，直接刪除","人物題看動作動詞；無人照片多考物品狀態"],trap:"is being + p.p. 表示「正在被處理」，畫面必須有人在動手；沒人的照片要選 has been / is + p.p.（狀態）。發音相近字也是陷阱，例如 copy / coffee、walk / work。"},
{p:"PART 2",t:"應答問題",q:"25 題 · 聽力",tips:["決勝在前三個字：Who、When、Where、Why、How、What time","Wh- 問句不能用 Yes / No 回答，直接刪","間接回答常是正解：I'll check the schedule.、Let me ask Ms. Park.、It hasn't been decided yet.","選擇疑問句（A or B）可以回 Either is fine. 或第三選項"],trap:"選項重複問句裡的字或發音相近的字，十之八九是錯的。"},
{p:"PART 3",t:"簡短對話",q:"39 題（13 組）· 聽力",tips:["Directions 播放時預讀題目，圈出關鍵字（who、what、why、next）","三題的順序和對話內容順序一致","第一題常問主旨、地點、職業：專心聽開頭兩句","圖表題先看圖，找出各列的差異欄位"],trap:"「What does the man mean when he says...」意圖題不能只看字面，要看前後文；答案很少是原句重複，而是換句話說。"},
{p:"PART 4",t:"簡短獨白",q:"30 題（10 組）· 聽力",tips:["類型固定：電話留言、廣播、會議開場、導覽、廣告、新聞","結構固定：開頭說目的 → 中段細節 → 結尾要聽眾做什麼","Listeners are asked to... / What will the listeners do next? 答案在最後"],trap:"答案大多是同義替換：說 reduce costs，選項寫 save money。只找一模一樣的字反而會選錯。"},
{p:"PART 5",t:"句子填空",q:"30 題 · 閱讀",tips:["先看選項再看題目，30 秒內判斷題型","詞性題（字根相同）只看空格前後兩個字","動詞題找主詞單複數與時間標記","字彙題靠搭配：meet the deadline、place an order"],trap:"目標 10 分鐘做完。卡住超過 30 秒就先猜一個、做記號，最後有時間再回來。"},
{p:"PART 6",t:"段落填空",q:"16 題（4 篇）· 閱讀",tips:["每篇有一題句子插入題：看空格前後句的代名詞與連接詞","時態題要看整篇時間軸，不能只看那一句","連接副詞題判斷前後關係：轉折 however、因果 therefore、補充 in addition"],trap:"單看一句兩個答案都通時，答案取決於上下文，一定要往前後各讀一句。"},
{p:"PART 7",t:"閱讀理解",q:"54 題（單篇 29 ＋ 多篇 25）· 閱讀",tips:["先看題目，再回文章找定位句","NOT / true 題用刪去法，逐一回文對照","雙篇、三篇必有題目要整合兩篇資訊（例如價格表＋郵件）","同義替換是核心：文章 postpone，選項 delay"],trap:"時間不夠時先做短篇和細節題，長篇推論題留最後。考試結束前 2 分鐘，所有空白全部塗同一個字母，不要留空。"}
];



/* ---------- data: grammar 990 notes ---------- */
const G990=["-ly 結尾的形容詞（timely、costly、orderly）不能當副詞用；名詞修飾名詞的複合名詞（safety inspection、expansion plans）。",
"動名詞、不定詞、名詞子句當主詞用單數；the majority / percentage of + N 依 N 決定單複數。",
"access、equipment、merchandise、feedback 不可數；a range / variety of + 複數；人物名詞單複數（a representative vs. representatives）。",
"that of / those of 代替前面提過的名詞（Our prices are lower than those of our competitors）。",
"形容詞 + to V（eager / reluctant / liable to）；a- 開頭形容詞（alike、aware、alive）只放在敘述位置。",
"shortly / soon + after；副詞修飾整句（Unfortunately、Ideally）；hardly、seldom 已含否定，不再加 not。",
"in light of、on account of、in accordance with、with regard to、notwithstanding、throughout；among（三者以上）vs. between。",
"whereas、provided that、in case、so that、now that、given that；相關連接詞的平行結構（both A and B）。",
"現在進行式可表已安排的近未來（We are launching next week）；狀態動詞誤用進行式是常見陷阱。",
"It has been + 期間 + since + 過去式；for the past + 期間、over the last + 期間 一律用完成式。",
"過去完成進行式 had been V-ing；有 before / prior to 時判斷過去完成是否必要。",
"一句兩個時間線索時，以主要子句動作的時間點為準；by + 未來時間點 → 未來完成式。",
"be due to + V（預定）vs. due to + N（因為）；be about to 不接明確時間點。",
"need not have p.p.（原本不必）；may well（很可能）；should 置於 that 子句可省略。",
"get + p.p. 被動；be said / expected to have p.p.；片語動詞的被動（be dealt with、be referred to）。",
"使役與感官動詞的被動要加 to：be made to V、be seen to V。",
"被動後仍接受詞（be awarded a contract、be charged a fee），空格常要選 p.p.。",
"become / remain + 名詞或形容詞；prove (to be) + adj；go / run / fall + adj（run short、fall due）。",
"remember / forget / stop / try + to V 與 + V-ing 意思不同；be subject to + N。",
"倍數 + as … as（twice as large as）；比較對象要一致（than that of）；superior / inferior / prior to 用 to 不用 than。",
"So + adj + be + S + that 倒裝；Not until … did S V；Included in the package is / are …。",
"Without / But for = If it were not for；It's (high) time + 過去式；Were it not for …。",
"同位語 the fact / news that + 完整句；whoever vs. whomever 看子句內的角色。",
"數量詞 + of whom / of which（most of whom）；that 前不能有逗號或介系詞。",
"the reason why 可省略 why；wherever、whenever、however + adj 的複合關係副詞。",
"獨立分詞構句（Weather permitting、All things considered）；Having p.p.；with + O + V-ing / p.p.。"];

/* ---------- data: beginner plain-language layer ---------- */
/* [這章在講什麼, 拆解例句(用 [S:..] [V:..] [O:..] [C:..] [M:..] 標記), 新手提示] */
const PLAIN=[
["英文的每個字都有「身分」，叫作詞性：名詞、動詞、形容詞、副詞……。句子就像組裝家具，一定要有「主角」（主詞）和「動作」（動詞），其他零件照位置放上去。","[S:The new manager] [V:hired] [O:three assistants] [M:last week].","考 Part 5 時，看空格的「位置」就知道要放哪種身分的字：the 後面放名詞，名詞前面放形容詞。"],
["主角是「一個」人或東西，動詞就用單數（現在式要加 s）；主角是「很多個」，動詞用複數。難的是主角後面常跟一長串說明，讓你看錯主角。","[S:The box] [M:of old files] [V:is] [C:heavy].","把 of…、in…、with… 這種說明用手指遮住，剩下的才是真正的主角。上面例句的主角是 box（一個），所以用 is。"],
["名詞就是人、事、物的名字。有些東西可以一個一個數（a chair、two chairs），有些不能數（furniture 傢俱、information 資訊）。不能數的不加 a，也不加 s。","[S:We] [V:bought] [O:new furniture] [M:for the office].","a / an 的意思是「一個」，所以後面只能接一個可以數的東西。"],
["代名詞是名字的「替身」，避免一直重複人名。同一個人在不同位置要換形狀：I（當主角）、me（被做動作）、my（我的）、myself（我自己）。","[S:Ms. Kim] [V:finished] [O:the report] [M:by herself].","空格在動詞或介系詞後面 → me、him、her；名詞前面 → my、his、her；「自己完成」→ myself、herself。"],
["形容詞是描述人事物「怎麼樣」的字：新的、可靠的、詳細的。它放在名詞前面，或放在 is、are 這類 be 動詞後面。","[S:The report] [V:is] [C:detailed].","常見形容詞字尾：-ful、-ous、-able、-ive、-al。看到這些字尾，多半就是形容詞。"],
["副詞是描述動作「怎麼做」的字，中文常帶「地」：快速地、仔細地。大多是形容詞加 -ly：careful → carefully。","[S:She] [V:checked] [O:the data] [M:carefully].","句子已經完整（主角、動作、對象都有了），空格又在旁邊 → 多半填副詞。"],
["介系詞是小小的「關係詞」，說明在哪裡（in、at）、什麼時候（on、by）、因為什麼（due to）。後面一定接名詞，不能接一整句話。","[S:The meeting] [V:starts] [M:at 9 A.M.] [M:on Monday].","時間口訣：at 幾點、on 星期幾或日期、in 月份或年份。"],
["連接詞是「膠水」，把兩句話黏起來：and（而且）、but（但是）、because（因為）、although（雖然）。","[M:Although it rained,] [S:the event] [V:continued].","後面是一整句（有主角＋動作）就用連接詞 although；只有名詞就用介系詞 despite（despite the rain）。"],
["現在式表示習慣、每天都這樣；現在進行式（is + V-ing）表示此時此刻正在做。","[S:The store] [V:opens] [M:at 10 every day].","看到 every day、usually → 現在式；看到 now、currently → am / is / are + V-ing。"],
["過去式表示事情發生在過去、已經結束；現在完成式（have + p.p.）表示從過去一直延續到現在。","[S:Sales] [V:have increased] [M:since 2020].","yesterday、last year、ago → 過去式；since、for、so far → have / has + p.p.。"],
["過去進行式表示過去某一刻「正在做」；過去完成式（had + p.p.）用在兩件過去的事，比較早發生的那一件。","[M:When I arrived,] [S:the meeting] [V:had already started].","兩件過去的事要排先後：先發生的用 had + p.p.。"],
["時態就是動詞的「時間標籤」。先在句子裡找時間線索（yesterday、since、by next year），再決定動詞要長什麼樣子。","[M:By next March,] [S:he] [V:will have worked] [M:here for ten years].","把第 12 章的「時間線索對照」背熟，時態題就變成對照題。"],
["講未來除了 will，還有 be going to、be scheduled to（預定）等說法。最大陷阱：if、when、once 帶頭的那半句，就算講未來也要用現在式。","[M:Once the contract is signed,] [S:work] [V:will begin].","if / when / once 那半句不用 will，另外半句才用 will。"],
["助動詞是幫動詞「加語氣」的小幫手：can 能、must 必須、should 應該、may 可能。它後面的動詞一定用原形（不加 s、不加 ed）。","[S:Employees] [V:must wear] [O:ID badges].","suggest、request、require that… 後面的動詞也用原形，這是多益最愛考的。"],
["主動：主角自己做動作（Tom 寄了信）。被動：主角是「被」做的那一方（信被寄出），寫成 be + p.p.。","[S:The report] [V:was submitted] [M:by Mr. Lee].","報告、產品、會議不會自己做事：主角是東西時，多半要用被動。"],
["使役動詞是「叫別人去做」：make、have、let；感官動詞是「看到、聽到別人做」：see、hear、watch。後面接「人＋原形動詞」。","[S:The manager] [V:had] [O:Tom] [C:fix the printer].","叫人去做 → 原形動詞；東西被處理 → p.p.（had the printer fixed）。"],
["授予動詞是「把某物給某人」的動詞：give、send、offer。所以後面有兩個對象：一個人、一樣東西。","[S:The company] [V:offered] [O:Ms. Lee] [O:a promotion].","改成被動時，人變成主角，後面仍留著那樣東西：Ms. Lee was offered a promotion。"],
["連綴動詞像數學的等號（＝）：be、become、remain、seem、look。後面接形容詞，描述主角的狀態，不接副詞。","[S:Profits] [V:remained] [C:stable].","把動詞換成 is 意思還說得通，它就是連綴動詞，後面填形容詞。"],
["動詞要拿來當名詞用時，要變形：to + 原形（to work，叫不定詞），或加 -ing（working，叫動名詞）。哪個動詞後面接哪一種，需要背。","[S:We] [V:decided] [O:to expand].","look forward to 的 to 後面要接 V-ing（looking forward to meeting you），這題最常考。"],
["比較兩樣東西用比較級（cheaper、more useful + than）；三樣以上選「最」用最高級（the cheapest、the most useful）。","[S:This model] [V:is] [C:much cheaper] [M:than the old one].","強調「更…」用 much、far、even，不能用 very。"],
["倒裝就是為了強調，把動詞搬到主角前面，像問句的順序。商業信件常見 Attached is…（附上的是…）。","[M:Enclosed] [V:are] [S:the invoice and the contract].","倒裝句的主角在動詞後面：後面有兩樣東西，就用 are。"],
["假設語氣用來說「不是事實」的情況（如果我當時知道就好了）。做法是把時態往過去推一格，表示這是假想。","[M:If I had known,] [S:I] [V:would have called] [O:you].","信件結尾常見 Should you have any questions…，意思等於 If you have any questions…。"],
["名詞子句是把「一整句話」當成一個名詞來用，放在主角或對象的位置。用 that（那件事）、whether（是否）、what（…的東西）帶頭。","[S:We] [V:don't know] [O:whether the client will agree].","中文意思有「是否」→ 選 whether。"],
["關係代名詞把一句話接在名詞後面當說明，就像中文的「…的」。人用 who，物用 which，人或物都能用 that，「誰的」用 whose。","[S:The employee] [M:who won the award] [V:is] [C:Ms. Chen].","被說明的名詞叫先行詞（例句中的 The employee）：先看它是人還是物，再選 who 或 which。"],
["關係副詞也是把一句話接在名詞後面當說明，但說明的是地點（where）、時間（when）、原因（why）。","[S:This] [V:is] [C:the hotel] [M:where the conference will be held].","後面的句子缺主角或對象 → 用 which；後面句子完整 → 用 where 或 when。"],
["分詞構句是把句子縮短的寫法：兩句主角一樣時，刪掉連接詞和主角，動詞改成 V-ing（主動）或 p.p.（被動）。","[M:Founded in 1990,] [S:the company] [V:has] [O:500 employees].","主角自己做 → V-ing；主角被做 → p.p.。公司是「被創立」的，所以用 Founded。"]
];
const ROLE_NAME={S:"主詞",V:"動詞",O:"受詞",C:"補語",M:"修飾"};
function rolesHTML(s){return String(s).replace(/\[(S|V|O|C|M):([^\]]+)\]/g,(m,r,t)=>`<span class="r r${r}"><span class="rt">${esc(t)}</span><span class="rl">${ROLE_NAME[r]}</span></span>`).replace(/\]\s*([.,!?])/g,"]$1");}
/* formula symbols */
const SYM=[["S",/(^|[^A-Za-z])S(?![A-Za-z])/,"主詞"],["V",/(^|[^A-Za-z\-])V(?![A-Za-z\-])/,"動詞"],["O",/(^|[^A-Za-z])O(?![A-Za-z])/,"受詞（動作的對象）"],["N",/(^|[^A-Za-z])N(?![A-Za-z])/,"名詞"],["adj",/\badj\b/,"形容詞"],["adv",/\badv\b/,"副詞"],["p.p.",/p\.p\./,"過去分詞，例如 done、written、submitted"],["V-ing",/V-ing/,"動詞加 ing"],["V-ed",/V-ed/,"動詞過去式"],["to V",/to V/,"to + 原形動詞"],["原形V",/原形V/,"原形動詞，例如 go、submit"],["助V",/助V/,"助動詞，例如 can、will、must"],["be",/\bbe\b/,"be 動詞：am / is / are / was / were / be"],["(複)",/\(複\)/,"複數"]];
function symLegend(f){const hit=SYM.filter(x=>x[1].test(f));return hit.length?`<div class="legend-sym">${hit.map(x=>`<span><b>${esc(x[0])}</b>${x[2]}</span>`).join("")}</div>`:"";}
/* glossary: [分類, 術語, English, [別名], 白話解釋, 例子（[[ ]] 標重點）, 怎麼認] */
const GLOSS=[
["句子零件","主詞","Subject (S)",[],"句子的「主角」：做這個動作的人或東西，通常在句子最前面。","[[Ms. Lee]] signed the contract.","問「誰在做這件事？」答案就是主詞。"],
["句子零件","動詞","Verb (V)",[],"表示動作或狀態的字，是句子的心臟，每個句子一定要有。","Ms. Lee [[signed]] the contract.","會因為時間改變形狀：sign / signed / signing。"],
["句子零件","受詞","Object (O)",["雙受詞"],"動作的「對象」：被做的那個人或東西，放在動詞後面。","Ms. Lee signed [[the contract]].","問「做了什麼？」答案就是受詞。"],
["句子零件","補語","Complement (C)",[],"補充說明主詞「是什麼、怎麼樣」，常放在 is、become 後面。","The plan is [[simple]].","把 is 想成等號：The plan ＝ simple。"],
["句子零件","修飾","Modifier",["修飾語"],"在旁邊補充說明，讓意思更清楚。形容詞修飾名詞，副詞修飾動詞。","a [[new]] office / work [[quickly]]","拿掉之後句子仍然完整，它就是修飾的部分。"],
["句子零件","子句","Clause",[],"有「主詞＋動詞」的一組字，像一個小句子，可以放在大句子裡。","I left because [[the store closed]].","找得到自己的主詞和動詞，就是子句。"],
["句子零件","片語","Phrase",["介系詞片語"],"一組字，但沒有自己的主詞＋動詞。","[[in the morning]], [[due to the rain]]","找不到動詞的一組字就是片語。"],
["句子零件","主要動詞","Main verb",[],"一個子句只能有一個真正的動詞；多出來的動作要變成 to V、V-ing 或 p.p.。","She [[decided]] to leave.（decided 是主要動詞）","兩個動詞之間沒有 and 或連接詞，其中一個一定要變形。"],
["句子零件","先行詞","Antecedent",[],"被關係代名詞說明的那個名詞，就在 who、which 的前面。","[[the man]] who called you","中文「…的人」裡的「人」就是先行詞。"],
["詞性","詞性","Part of speech",[],"每個英文字的「身分」：名詞、動詞、形容詞、副詞……。同一個字根換字尾就換身分。","success（名）/ succeed（動）/ successful（形）/ successfully（副）","看字尾判斷，見「字尾」。"],
["詞性","名詞","Noun (N)",[],"人、事、物、地點的名字。","[[manager]], [[report]], [[Tokyo]]","前面常有 a、the、my。字尾常是 -tion、-ment、-ness、-er。"],
["詞性","形容詞","Adjective (adj)",[],"描述名詞「怎麼樣」的字。","a [[new]] office / The report is [[detailed]].","放在名詞前，或 be 動詞後。字尾常是 -ful、-ous、-able、-ive。"],
["詞性","副詞","Adverb (adv)",[],"描述動作「怎麼做」或程度「多麼」，中文常有「地」。","work [[quickly]], [[very]] important","多半是 -ly 結尾。"],
["詞性","介系詞","Preposition",[],"說明位置、時間、關係的小字，後面接名詞。","[[at]] the office, [[by]] Friday, [[due to]] the rain","後面不能接一整句話。"],
["詞性","連接詞","Conjunction",[],"把兩句話連起來的「膠水」。","I stayed [[because]] it rained.","後面接的是有主詞＋動詞的子句。"],
["詞性","代名詞","Pronoun",[],"名詞的替身，避免重複：he、she、it、they、him、them。","Tom called. [[He]] was late.","指回前面提過的人或東西。"],
["詞性","冠詞","Article",[],"a / an（一個，不特定）和 the（那個，雙方都知道的）。","[[a]] meeting / [[the]] meeting we discussed","a / an 後面只能接一個可數名詞。"],
["詞性","所有格","Possessive",[],"表示「…的」。","[[my]] desk, [[the company's]] profit","後面一定接名詞。"],
["詞性","反身代名詞","Reflexive pronoun",[],"「…自己」。","She did it by [[herself]].","-self / -selves 結尾。"],
["詞性","單複數","Singular / Plural",["單數","複數"],"單數＝一個；複數＝兩個以上（多半加 s）。主詞是單數時，現在式動詞要加 s。","He [[works]] here. / They [[work]] here.","看真正的主詞是一個還是很多個。"],
["詞性","可數名詞","Countable noun",["不可數名詞","不可數","可數"],"可以一個一個數的叫可數（a chair、two chairs）；不能數的叫不可數（furniture、information、equipment），不加 a 也不加 s。","some [[equipment]]（不能說 equipments）","多益常考的不可數：equipment、furniture、information、advice、luggage、merchandise。"],
["詞性","字尾","Suffix",["字根"],"單字的結尾，用來判斷詞性。","-tion / -ment 名詞；-ful / -ive 形容詞；-ly 副詞","詞性題四個選項長得很像時，看字尾。"],
["動詞的形狀","原形動詞","Base form",["原形"],"動詞最原始、沒變過的樣子：不加 s、ed、ing。","must [[submit]], let him [[go]]","助動詞、使役動詞後面都接原形。"],
["動詞的形狀","過去分詞","Past participle (p.p.)",["p.p."],"動詞的第三種形狀，多半加 -ed，也有不規則的。用在被動（be + p.p.）和完成式（have + p.p.）。","submit → submitted → [[submitted]] / write → wrote → [[written]]","前面有 be 或 have，後面常接 p.p.。"],
["動詞的形狀","現在分詞","Present participle (V-ing)",["V-ing"],"動詞加 -ing，表示「正在」或「主動」。","She is [[working]]. / a [[growing]] company","前面有 be 表進行；放名詞前表「正在…的」。"],
["動詞的形狀","動名詞","Gerund",[],"動詞加 -ing 但當名詞用，意思是「做…這件事」。","[[Reading]] is fun. / I enjoy [[reading]].","放在主詞或受詞的位置。"],
["動詞的形狀","不定詞","Infinitive (to V)",[],"to + 原形動詞，把動作當名詞用，或表示「為了…」。","I want [[to travel]]. / We met [[to discuss]] the plan.","to 後面接原形動詞。"],
["動詞的形狀","助動詞","Auxiliary verb",[],"放在動詞前幫忙加語氣的字：can、will、must、should、may、do。","You [[must]] wear a badge.","後面一定接原形動詞。"],
["動詞的形狀","及物動詞","Transitive verb",[],"後面必須接對象（受詞）的動詞。","send [[a letter]], approve [[the plan]]","問得出「…什麼？」就是及物：寄什麼？批准什麼？"],
["動詞的形狀","不及物動詞","Intransitive verb",[],"後面不需要對象的動詞，所以沒有被動。","The train [[arrived]]. / A problem [[occurred]].","arrive、occur、happen、rise 都是不及物。"],
["動詞的形狀","連綴動詞","Linking verb",[],"像等號（＝）的動詞，後面接形容詞描述主詞。","Profits [[remained]] stable.","be、become、remain、seem、look、stay。"],
["動詞的形狀","使役動詞","Causative verb",[],"「叫／讓別人做」的動詞。","The boss [[had]] me call the client.","make、have、let + 人 + 原形動詞。"],
["動詞的形狀","感官動詞","Perception verb",[],"看、聽、感覺的動詞。","I [[saw]] him leave.","see、hear、watch、notice + 人 + 原形或 V-ing。"],
["動詞的形狀","授予動詞","Ditransitive verb",[],"「給某人某物」的動詞，後面有兩個對象。","They [[gave]] her a prize.","give、send、offer、award、grant。"],
["動詞的形狀","狀態動詞","Stative verb",[],"表示狀態、不是動作的動詞，不用進行式。","This box [[contains]] files.（不說 is containing）","know、belong、contain、own、consist。"],
["時態與語態","時態","Tense",[],"動詞用來表示「時間」的形狀：現在、過去、未來、進行、完成。","I [[work]] / [[worked]] / [[will work]] / [[have worked]]","先找句中的時間標記再決定。"],
["時態與語態","時間標記","Time marker",["時間線索"],"句子裡告訴你時間的字，用來決定時態。","[[yesterday]], [[since 2020]], [[now]], [[by next week]]","每題時態題都先圈出它。"],
["時態與語態","進行式","Progressive",["現在進行式","過去進行式"],"be + V-ing，表示「正在做」。","She [[is working]] now. / I [[was eating]] when he called.","看到 now、currently、at the moment。"],
["時態與語態","完成式","Perfect",["現在完成式","現在完成","過去完成式","過去完成","未來完成"],"have / has / had + p.p.，表示「到某個時間點為止已經…」或「從過去持續到現在」。","Sales [[have increased]] since 2020.","看到 since、for、so far、by the time。"],
["時態與語態","被動語態","Passive voice",["被動"],"主詞是「被做」的一方，寫成 be + p.p.。","The letter [[was sent]] yesterday.","主詞是東西、後面又沒有受詞，多半要用被動。"],
["時態與語態","主動","Active voice",[],"主詞自己做動作。","Tom [[sent]] the letter.","主詞是做動作的人。"],
["進階句型","比較級","Comparative",[],"兩者比較，「比較…」。","[[cheaper]] than / [[more useful]] than","後面常有 than。"],
["進階句型","最高級","Superlative",[],"三者以上，「最…」。","[[the cheapest]] / [[the most useful]]","前面通常有 the。"],
["進階句型","倒裝","Inversion",["倒裝句"],"把動詞或助動詞放到主詞前面，用來強調。","[[Attached is]] the invoice.","句首是 Never、Only、Attached、Enclosed 時注意。"],
["進階句型","假設語氣","Subjunctive",[],"說「不是事實」的假想，把時態往過去推一格。","If I [[were]] you, I would accept.","有 if 而且意思是「要是…就好了」。"],
["進階句型","名詞子句","Noun clause",[],"整個子句當名詞用。","I know [[that he is busy]].","由 that、whether、what、how 帶頭。"],
["進階句型","關係代名詞","Relative pronoun",["關代"],"who、which、that、whose：把一個子句接在名詞後當說明，像中文「…的」。","the man [[who called you]]","前面一定有一個被說明的名詞（先行詞）。"],
["進階句型","關係副詞","Relative adverb",[],"where、when、why：說明地點、時間、原因的「…的」。","the hotel [[where we stayed]]","後面接完整的句子。"],
["進階句型","分詞構句","Participle clause",[],"省略連接詞和主詞的縮短句。","[[Founded in 1990]], the company has 500 employees.","句首是 V-ing 或 p.p. 開頭、後面接逗號。"],
["進階句型","同位語","Appositive",[],"緊跟在名詞後面、說明它是誰或什麼的名詞。","Mr. Lee, [[our new manager]], will speak.","通常夾在兩個逗號中間。"],
["進階句型","平行結構","Parallel structure",[],"用 and、or 連起來的東西要用同一種形狀。","to [[read]] and to [[write]] / [[reading]] and [[writing]]","and 前後的形狀要對稱。"],
["進階句型","祈使句","Imperative",[],"命令或請求的句子，省略主詞 you。","[[Please call]] me tomorrow.","用原形動詞開頭。"],
["進階句型","搭配","Collocation",[],"固定一起出現的字組，就像中文說「打電話」不說「做電話」。","[[meet]] a deadline / [[place]] an order","只能整組背，看到就一起記。"],
["進階句型","一致","Agreement",["主詞與動詞一致"],"動詞的單複數要跟著真正的主詞走。","The list of names [[is]] long.","先找到真正的主詞。"],
["閱讀術語","同義替換","Paraphrase",[],"用不同的字表達同樣的意思。多益的正確選項幾乎都會這樣改寫。","文章寫 postpone，選項寫 [[delay]]","選項跟原文一字不差時要小心，可能是陷阱。"],
["閱讀術語","定位句","Key sentence",[],"文章裡藏著答案的那一句。用題目的關鍵字（人名、日期、數字）去找。","題目問 June 5 → 回文找 [[June 5]] 那一句","讀定位句和它前後各一句。"],
["閱讀術語","推論","Inference",["推論題"],"文中沒有直接說，但根據證據可以合理推出的結論。","文中說 patients are waiting → 推論這裡是 [[診所]]","一定要找得到證據，不能憑常識。"],
["閱讀術語","掃讀","Skimming",["查讀"],"掃讀：快速看過，只抓大意與結構。查讀（scanning）：只找特定的字或數字。","先掃讀抓主題，再查讀找 [[3:00 P.M.]]","兩種速度交替用。"],
["閱讀術語","句子插入","Sentence insertion",[],"題目給一句話，要你放回文章 [1]–[4] 四個位置中最合適的一個。","插入句有 [[These]] → 前一句必須提到複數的東西","找插入句裡的代名詞與連接詞線索。"],
["閱讀術語","間接回答","Indirect response",[],"Part 2 聽力常見：不直接回答 yes / no，而是給相關的回應。","Q: Is the report ready? A: [[I'll check with Tom.]]","聽起來沒直接回答，卻是最自然的回應。"]
];
const GMAP={};let TERM_RE=null;
(function(){GLOSS.forEach((g,i)=>{[g[1]].concat(g[3]).forEach(a=>{if(a&&!(a in GMAP))GMAP[a]=i;});});
  const keys=Object.keys(GMAP).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  TERM_RE=new RegExp(keys.join("|"),"g");})();
function exMark(s){return esc(s).replace(/\[\[(.+?)\]\]/g,"<b>$1</b>");}
function wrapTerms(root){
  if(!root)return;const seen=new Set();
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest("button,.formula,.stems,.roles,.p5s,.legend-sym,.para-table,.term")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{const t=n.nodeValue;TERM_RE.lastIndex=0;let m,last=0,frag=null;
    while((m=TERM_RE.exec(t))){const idx=GMAP[m[0]];if(seen.has(idx))continue;seen.add(idx);
      frag=frag||document.createDocumentFragment();frag.appendChild(document.createTextNode(t.slice(last,m.index)));
      const b=document.createElement("button");b.type="button";b.className="term";b.dataset.term=idx;b.textContent=m[0];b.setAttribute("aria-label",m[0]+"：查看白話解釋");frag.appendChild(b);last=m.index+m[0].length;}
    if(frag){frag.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(frag,n);}});
}
function showTerm(i,anchor){const g=GLOSS[i];const p=document.getElementById("termPop");
  p.innerHTML=`<div class="tp-h"><h4>${esc(g[1])}<span class="en">${esc(g[2])}</span></h4><button class="btn" id="tpClose" aria-label="關閉">關閉</button></div><p>${esc(g[4])}</p><div class="ex">${exMark(g[5])}</div><p class="how">怎麼認：${esc(g[6])}</p><div><button class="btn" id="tpAll">看全部術語</button></div>`;
  p.hidden=false;p._anchor=anchor||null;}
function hideTerm(){const p=document.getElementById("termPop");if(!p.hidden){p.hidden=true;if(p._anchor)try{p._anchor.focus()}catch(e){}}}
document.addEventListener("click",e=>{
  const t=e.target.closest(".term");if(t){e.preventDefault();e.stopPropagation();showTerm(+t.dataset.term,t);return;}
  if(e.target.id==="tpClose"){hideTerm();return;}
  if(e.target.id==="tpAll"){hideTerm();document.getElementById("termPop")._anchor=null;show("grammar");const g=document.getElementById("gloss");g.open=true;setTimeout(()=>g.scrollIntoView({behavior:"smooth",block:"start"}),30);return;}
  if(!e.target.closest("#termPop"))hideTerm();
},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTerm();});

/* ---------- data: reading chapters ---------- */
const RC=[
{n:1,t:"Part 7 全貌與作答順序",part:"p7",ty:"all",stems:["Questions 147–148 refer to the following text message chain.","Questions 176–180 refer to the following web page, e-mail, and form."],how:["先看「Questions x–y refer to…」：知道文件類型與題數，判斷篇幅與用時","先讀題目、圈出關鍵字（人名、數字、日期），再讀文章","題目順序大致等於文章順序；同義詞題、句子插入題例外","單篇 29 題、雙篇 10 題、三篇 15 題；單篇平均每題 1 分鐘，多篇一組 5 題約 5 分鐘"],trap:"從頭精讀到尾再看題目最浪費時間。多益閱讀是「找答案」，不是「讀懂每一句」。",adv:"990：每篇讀完前先預測題目會問什麼（文件目的、要求的動作、日期變更），讀到就在腦中標記位置。"},
{n:2,t:"主旨與目的題",part:"p7",ty:"主旨",stems:["What is the purpose of the e-mail?","Why was the notice written?","What is the article mainly about?","What is being advertised?"],how:["看第一段前兩句：I am writing to…、This is to inform…、We are pleased to announce…","若第一段是寒暄，看第二段開頭或最後一段的請求","選項要涵蓋全文，不能只講一個細節"],trap:"選項只描述文章裡的一個小細節，雖然文中有提到，但不是主旨。",adv:"990：真正目的常在後段（例如前面在道謝，最後才提出合作邀約），要分辨「開場話題」和「寫信目的」。"},
{n:3,t:"細節題與定位",part:"p7",ty:"細節",stems:["According to the memo, when will the renovation begin?","What is included with the purchase?","How can customers receive the discount?"],how:["抓題目裡的定位字：專有名詞、數字、日期最好找","回文掃描（scanning）找到定位句，讀它和前後各一句","選擇與定位句同義替換的選項"],trap:"選項原字照抄文章，但主詞、時間或數字被換掉了。",adv:"990：答案常需要把兩句合起來看（第一句講原定日期，第二句講延期），只讀定位句會選到舊資訊。"},
{n:4,t:"NOT / TRUE 題",part:"p7",ty:"NOT",stems:["What is NOT mentioned as a benefit of membership?","What is indicated about the Riverside branch?","What is true about the new policy?"],how:["NOT 題：三個選項回文逐一打勾，剩下的就是答案","資訊多半散在全文或列點裡，所以放在同篇最後做","indicated / true 題：每個選項都要找到原文證據才選"],trap:"找不到某選項就急著選它；其實可能是用同義替換寫在別段。",adv:"990：小心「部分正確」選項，例如文中說 most branches，選項寫 all branches。"},
{n:5,t:"推論題",part:"p7",ty:"推論",stems:["What is suggested about Mr. Halvorsen?","Who most likely is Ms. Danvers?","Where would the notice most likely be found?","What is implied about the company?"],how:["答案必須有文中證據，只差一步推理","職業／地點題看專業用字：patients → 診所、tenants → 房東、boarding → 機場","從時態與語氣推論：has worked here since 2019 → 已在職多年"],trap:"選項聽起來合理、符合常識，但文中沒有任何證據。",adv:"990：正解常是低調、保守的說法；斷定、誇大的選項（always、only、all）多半是錯的。"},
{n:6,t:"同義詞題",part:"p7",ty:"同義詞",stems:["The word \"secure\" in paragraph 2, line 3, is closest in meaning to","In the e-mail, the word \"cover\" in paragraph 1, line 4, is closest in meaning to"],how:["回到原句，把四個選項代入，選語意最貼合這個語境的","990 常考的多義字：address（處理）、cover（支付／報導）、honor（兌現）、observe（遵守）、term（期間）、figure（數字）、carry（販售）、issue（期數／發放）、run（經營）、fill（填補職缺）","本站題目的段落、行數依原版排版，畫面上的行數可能略有不同"],trap:"選最常見的字義。例如 secure funding 是「取得」，不是「安全的」。",adv:"990：四個選項都是 secure 的某個意思時，只有一個能代回原句且文法正確。"},
{n:7,t:"說話者意圖題",part:"p7",ty:"意圖",stems:["At 10:42 A.M., what does Ms. Ruiz most likely mean when she writes, \"That should do it\"?","At 3:15 P.M., why does Mr. Cole write, \"I'm on it\"?"],how:["讀引號那句「前一則」：它是在回應什麼","再讀「後一則」：對方的反應會證實意思","常見句：I'm on it（我馬上處理）、That works for me（同意）、Not that I know of（據我所知沒有）、You read my mind（正合我意）、Count me in（算我一份）"],trap:"照字面翻譯引號句。同一句話在不同上下文意思不同。",adv:"990：多人聊天時，先確認引號句是回覆哪一個人，三人以上的對話常有交錯回覆。"},
{n:8,t:"句子插入題",part:"p7",ty:"句子插入",stems:["In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong?"],how:["先讀插入句，找出線索：代名詞（this、these、they、such）、連接副詞（However、In addition、As a result）、定冠詞 the + 前面提過的名詞","到四個位置看前一句：線索指涉的東西必須剛好在前句出現","這題放在同篇最後做，讀完全文再判斷"],trap:"只看主題相關就選；要看邏輯順序與指代，主題相關的位置通常不只一個。",adv:"990：插入句帶 also、too、another 時，前面一定已提過同類事物；帶 Instead 時，前句一定是否定或被取代的方案。"},
{n:9,t:"雙篇、三篇整合題",part:"p7m",ty:"整合",stems:["What discount did Ms. Ogawa most likely receive?","On which date will Mr. Park attend the workshop?","What is suggested about the item Mr. Varga ordered?"],how:["先看 5 題題目，判斷哪幾題要跨文件","典型組合：價格表 × 訂單日期、行程表 × 變更通知、職缺條件 × 應徵信、評論 × 店家回覆","題目問 A 文件的人，答案常藏在 B 文件的表格裡：先在一篇找條件，再到另一篇對照","每組固定 1–2 題整合題，其餘是單篇題，照做單篇的方法"],trap:"只在一篇裡找答案；看到合理選項就選，沒有跨文件驗證。",adv:"990：三篇題常有「條件句」（若超過 50 人可享 10% 折扣、週五前報名免運費），要把數字套進另一篇算出來。"},
{n:10,t:"Part 6 段落填空",part:"p6",ty:"all",stems:["(131) 空格四選一：文法、字彙、連接詞","Choose the sentence that best fits the blank（句子選擇題）"],how:["四類題：文法（時態、詞性）、字彙、連接副詞、句子插入","時態看整篇時間軸：公告未來活動 → will；回顧已完成的事 → 過去式","連接副詞看與前句關係：轉折 However、因果 Therefore / As a result、補充 In addition / Moreover","句子選擇題：看前後句的主題與代名詞，必須承上啟下"],trap:"只看空格那一句；Part 6 有一半的題目要靠前後句才能決定。",adv:"990：句子選擇題的錯誤選項常主題正確，但時態或指代錯（提到 the new schedule，但前文還沒出現 schedule）。"},
{n:11,t:"同義替換（990 核心）",part:"p7",ty:"all",para:[["postpone","delay / push back / reschedule"],["complimentary","free of charge / at no cost"],["reimburse","pay back / cover the cost"],["relocate","move to a new location"],["renovate","remodel / upgrade / refurbish"],["attire","clothing / dress code"],["commute","travel to work"],["inexpensive","affordable / reasonably priced"],["prior to","before / in advance of"],["in person","face to face"],["reach","contact / get in touch with"],["expire","is no longer valid"],["fill a position","hire someone"],["a surge in demand","orders increased sharply"],["understaffed","short of employees"],["sold out","no longer available"]],stems:["Article: The launch was pushed back to June. → 正解: It was delayed."],how:["正解多半是同義替換：文章 postpone，選項寫 delay","把文章和選項都換成中文核心意思來比對","建立自己的同義替換筆記，第二階段每天加 10 組"],trap:"原字照抄的選項要提高警覺，常是故意放的陷阱。",adv:"990：同義替換會跨詞性：文章 The office will be closed for renovations → 選項 The office is being upgraded。"},
{n:12,t:"990 速度與時間管理",part:"p7",ty:"all",stems:["Part 5：每題 15 秒內","Part 6：每篇 1.5 分鐘內","Part 7：至少保留 56 分鐘"],how:["每週兩次整回閱讀計時，記錄每個 Part 的用時","掃讀（skimming）抓結構，查讀（scanning）找定位字，兩種速度交替用","卡題超過 1 分鐘就先猜並標記，回頭檢查時再處理","正式考試不能在題本上寫字，練習時也別寫"],trap:"為了一題反覆讀全文，結果最後一組三篇來不及做。",adv:"990：目標是 75 分鐘內做完，還剩 5 分鐘回頭檢查標記的題目。"}
];

/* ---------- data: strategy 990 notes ---------- */
const P990=["990：is being + p.p. 必須有人正在動作；地點介系詞（next to / across from / along）要和圖完全吻合。","990：問句是陳述句或建議時，正解常是反問或間接回答；完全沒聽懂也要刪掉重複字選項。","990：圖表題答案在「另一欄」，聽到的是 A 欄資訊，要對照到 B 欄；意圖題要靠語氣判斷。","990：每組三題都要在音檔結束前選好，下一組題目要趁上一組最後一題作答後預讀。","990：每題 15 秒；有把握的題目不回頭，留時間給 Part 7。","990：句子選擇題的錯誤選項常主題正確但指代錯，看前句名詞是否已出現過。","990：多篇題先找條件（折扣、期限、資格），再到另一篇代入；NOT 題與句子插入題放最後。"];

/* ---------- data: phases & days ---------- */
const WORLDS=["文法森林","動詞峽谷","子句迷宮","八百試煉塔","精準神殿","同義之海","模考競技場","滿分王座"];
function isBoss(d){return /模考|診斷|總驗收/.test(d.t);}
const PHASES=[
 {r:[1,7],s:1,t:"第 1 週｜打地基",d:"詞性、句子結構、時態。聽力 Part 1→2，閱讀專攻 Part 5，開始做 Part 6 基礎題。"},
 {r:[8,14],s:1,t:"第 2 週｜動詞系統＋閱讀課",d:"助動詞、被動、特殊動詞。閱讀 12 章開課，Part 7 單篇基礎題天天練。"},
 {r:[15,20],s:1,t:"第 3 週｜子句與長句",d:"假設、名詞子句、關係詞、分詞構句。開始雙篇閱讀，Day 20 文法總驗收。"},
 {r:[21,30],s:1,t:"第 4 週｜800 實戰",d:"5 回完整模考，考一天、檢討一天，空檔做 800 級題庫。"},
 {r:[31,37],s:2,t:"第 5 週｜990 精準文法",d:"26 章進階陷阱逐章過，Part 5 速度壓到每題 15 秒。聽力加速到 1.25 倍。"},
 {r:[38,44],s:2,t:"第 6 週｜多篇整合＋同義替換",d:"雙篇、三篇 990 題天天練，建立同義替換筆記。聽力練英、澳口音。"},
 {r:[45,51],s:2,t:"第 7 週｜模考循環",d:"考一天、檢討一天，990 錯題本只記「會但錯」的題。"},
 {r:[52,60],s:2,t:"第 8 週｜滿分收尾",d:"錯題總回收、正式作息模考、考前調整。"}
];
const DAYS=[
{d:1,t:"診斷測驗 + 句子骨架",g:[1],pr:["ch:1"],L:"診斷模考：聽力 100 題（45 分鐘，不查字典）",R:"診斷模考：閱讀 100 題（75 分鐘）",x:"對答案，記下各 Part 答對數；建立錯題本"},
{d:2,t:"主詞動詞一致、名詞冠詞",g:[2,3],pr:["ch:2","ch:3","voc:1-2"],L:"Part 1：人物動作照片 20 題，每題聽寫正解句",R:"Part 5 題庫＋書內詞性題"},
{d:3,t:"代名詞、形容詞",g:[4,5],pr:["ch:4","ch:5","voc:3-4"],L:"Part 1：物品狀態照片 20 題（is being / has been）",R:"Part 5 題庫＋書內練習"},
{d:4,t:"副詞、介系詞",g:[6,7],pr:["ch:6","ch:7","voc:5-6"],L:"Part 2：Wh- 問句 25 題，只抓前三個字",R:"Part 5 題庫＋介系詞 30 題"},
{d:5,t:"連接詞",g:[8],pr:["ch:8","voc:7-8"],L:"Part 2：Yes/No 與間接回答 25 題",R:"Part 5 題庫＋連接詞 vs 介系詞"},
{d:6,t:"時態（一）",g:[9,10],pr:["ch:9","ch:10","p6-01","voc:9-10"],L:"Part 2：請求、提議句 25 題",R:"今日練習：Part 5 ＋ 第一篇 Part 6"},
{d:7,t:"時態（二）＋ 週複習",g:[11,12],pr:["ch:11","ch:12","p6-02","voc:11-12"],L:"Part 2：陳述句與附加問句 25 題",R:"今日練習",x:"重做第 1 週錯題；單字主題 1–7 快篩"},
{d:8,t:"未來式、助動詞｜閱讀 R1",g:[13,14],rc:[1],pr:["ch:13","ch:14","p6-03","voc:13-14"],L:"Part 3：預讀題目技巧，3 組對話精聽",R:"今日練習（計時）"},
{d:9,t:"被動語態｜閱讀 R2",g:[15],rc:[2],pr:["ch:15","p6-04","p6-05","voc:15-16"],L:"Part 3：6 組，每組聽寫關鍵句",R:"今日練習"},
{d:10,t:"使役、授予、連綴｜閱讀 R10",g:[16,17,18],rc:[10],pr:["ch:16","ch:17","ch:18","p6-06","voc:17-18"],L:"Part 3：圖表題 6 組",R:"今日練習"},
{d:11,t:"不定詞與動名詞｜閱讀 R3",g:[19],rc:[3],pr:["ch:19","p7s-01","p7s-02","p7s-03","voc:19-20"],L:"Part 3：說話者意圖題 6 組",R:"今日練習：第一次 Part 7"},
{d:12,t:"比較級｜閱讀 R4",g:[20],rc:[4],pr:["ch:20","p6-07","p7s-04","p7s-05","voc:21-22"],L:"Part 4：電話留言與廣播 5 組",R:"今日練習"},
{d:13,t:"半回模考｜閱讀 R5",g:[],rc:[5],pr:["p7s-06","p7s-07"],L:"半回模考：聽力 50 題",R:"半回模考：閱讀 50 題＋今日練習",x:"和 Day 1 比較進步；重看第 1–20 章錯題"},
{d:14,t:"倒裝與強調｜閱讀 R6",g:[21],rc:[6],pr:["ch:21","p6-08","p7s-08","p7s-09","voc:23-24"],L:"Part 4：演講、導覽 6 組",R:"今日練習",x:"重做第 2 週錯題；單字主題 8–14 快篩"},
{d:15,t:"假設語氣｜閱讀 R7",g:[22],rc:[7],pr:["ch:22","p6-09","p7s-10","p7s-11","voc:25-26"],L:"Part 3 ＋ Part 4 各 4 組",R:"今日練習"},
{d:16,t:"名詞子句｜閱讀 R9",g:[23],rc:[9],pr:["ch:23","p6-10","p7s-12","p7d-01","voc:27-28"],L:"Part 3 長對話 2 組：逐句跟讀",R:"今日練習：第一組雙篇"},
{d:17,t:"關係代名詞｜閱讀 R8",g:[24],rc:[8],pr:["ch:24","p6-11","p6-12","p7s-13","p7s-14","voc:29-30"],L:"Part 4：8 組，計時",R:"今日練習"},
{d:18,t:"關係副詞｜閱讀 R11",g:[25],rc:[11],pr:["ch:25","p6-13","p7s-15","p7d-02","voc:31-32"],L:"Part 2：30 題回鍋（目標錯 4 題以內）",R:"今日練習"},
{d:19,t:"分詞構句｜閱讀 R12",g:[26],rc:[12],pr:["ch:26","p6-14","p7s-16","p7s-17","voc:33-35"],L:"Part 1 ＋ Part 2 全套 31 題",R:"今日練習"},
{d:20,t:"文法總驗收",g:[],pr:["lv:12p5","p6-15","p7s-18","p7d-03"],L:"Part 3–4：計時一回 69 題",R:"Part 5 題庫全部基礎＋800 題計時",x:"26 章陷阱重讀；錯題按錯因分類"},
{d:21,t:"模考 1",g:[],vr:[1,2,3,4,5],pr:[],L:"完整模考 1：聽力",R:"完整模考 1：閱讀",x:"今天只對答案、算分，明天詳細檢討"},
{d:22,t:"模考 1 檢討",g:[],vr:[6,7,8,9,10],pr:["p7s-19","p7s-20"],L:"模考 1 聽力錯題精聽＋聽寫",R:"模考 1 閱讀錯題：找出定位句與同義替換"},
{d:23,t:"模考 2",g:[],vr:[11,12,13,14,15],pr:[],L:"完整模考 2：聽力",R:"完整模考 2：閱讀",x:"記錄 Part 7 每篇用時"},
{d:24,t:"模考 2 檢討 ＋ 弱項",g:[],vr:[16,17,18,19,20],pr:["p7s-21","p7s-22","p7d-04"],L:"錯題精聽；錯最多的 Part 加練 1 組",R:"今日練習"},
{d:25,t:"模考 3",g:[],vk:1,pr:[],L:"完整模考 3：聽力",R:"完整模考 3：閱讀"},
{d:26,t:"模考 3 檢討",g:[],vk:1,pr:["p7s-23","p7s-24","p7d-05"],L:"模考 3 錯題精聽＋跟讀",R:"今日練習"},
{d:27,t:"模考 4",g:[],vk:1,pr:[],L:"完整模考 4：聽力",R:"完整模考 4：閱讀"},
{d:28,t:"弱點總攻",g:[],vk:1,pr:["wrong","p7s-25","p7s-26","p7s-27"],L:"錯最多的聽力 Part 加練 2 回",R:"題庫「做錯」全部重做＋今日練習",x:"錯題本從頭到尾重做"},
{d:29,t:"模考 5（正式作息）",g:[],vk:1,pr:[],L:"依正式考試時間開考，模擬作息",R:"完整模考 5：閱讀",x:"準備證件、准考證、2B 鉛筆、橡皮擦"},
{d:30,t:"第一階段收尾",g:[],vk:1,pr:["wrong"],L:"輕量：Part 2、3 熟悉音檔 30 分鐘",R:"錯題本瀏覽；若要考試，不做新題",x:"第 21–29 天模考平均 ≥ 750 才進第二階段"},
{d:31,t:"990 診斷模考",g:[],pr:[],L:"完整模考 6：聽力（標記沒把握的題）",R:"完整模考 6：閱讀（記錄每個 Part 用時）",x:"錯題分類：陷阱／單字／時間／粗心"},
{d:32,t:"990 文法：詞性、一致、名詞、代名詞",g9:[1,2,3,4],pr:["ch3:1","ch3:2","ch3:3","ch3:4","p6-16","p7s-28"],L:"Part 2：50 題，只聽前三字與語氣，目標全對",R:"今日練習（990）"},
{d:33,t:"990 文法：形容詞、副詞、介系詞、連接詞",g9:[5,6,7,8],pr:["ch3:5","ch3:6","ch3:7","ch3:8","p6-17","p7s-29","p7s-31"],L:"Part 3：1.25 倍速 6 組",R:"今日練習（990）"},
{d:34,t:"990 文法：時態全系列",g9:[9,10,11,12,13],pr:["ch3:9","ch3:10","ch3:11","ch3:12","ch3:13","p6-18","p7s-30","p7s-32"],L:"Part 3：英國、澳洲腔 6 組",R:"今日練習（990）"},
{d:35,t:"990 文法：助動詞與特殊動詞",g9:[14,15,16,17,18],pr:["ch3:14","ch3:15","ch3:16","ch3:17","ch3:18","p6-19","p7s-33","p7s-34"],L:"Part 4：先讀題預測答案 6 組",R:"今日練習（990）"},
{d:36,t:"990 文法：不定詞、比較、倒裝、假設",g9:[19,20,21,22],pr:["ch3:19","ch3:20","ch3:21","ch3:22","p6-20","p7s-35","p7s-36"],L:"Part 4：圖表題 6 組",R:"今日練習（990）"},
{d:37,t:"990 文法：子句與分詞 ＋ 週複習",g9:[23,24,25,26],pr:["ch3:23","ch3:24","ch3:25","ch3:26","p7s-37","p7s-38"],L:"Part 1–2 全套 31 題，零失誤",R:"今日練習（990）",x:"990 錯題本全部重做"},
{d:38,t:"同義替換",g:[],rc:[11],pr:["voc:36-43","p7s-39","p7s-40"],L:"Part 3：整理題目與原文的同義替換 3 組",R:"今日練習＋同義替換筆記 20 組"},
{d:39,t:"雙篇整合 I",g:[],rc:[9],pr:["voc:44-50","p7d-06","p7d-07"],L:"Part 4：1.25 倍速 8 組",R:"今日練習：每組限時 5 分鐘"},
{d:40,t:"雙篇整合 II",g:[],pr:["p7d-08","p7d-09","p7d-10"],L:"聽力 Part 3 一回 39 題",R:"今日練習"},
{d:41,t:"三篇整合 I",g:[],pr:["p7t-01","p7t-02"],L:"Part 4 一回 30 題，錯題跟讀",R:"今日練習：三篇一組限時 6 分鐘"},
{d:42,t:"三篇整合 II",g:[],pr:["p7t-03","p7t-04"],L:"Part 2 間接回答 30 題",R:"今日練習"},
{d:43,t:"三篇整合 III",g:[],pr:["p7t-05","p7t-06"],L:"Part 3 圖表＋意圖題 8 組",R:"今日練習"},
{d:44,t:"三篇整合 IV ＋ 週複習",g:[],pr:["p7t-07","p7t-08","wrong"],L:"聽力全真一回",R:"今日練習＋做錯重做",x:"第 5–6 週錯題重做"},
{d:45,t:"模考 7",g:[],pr:[],L:"完整模考 7：聽力",R:"完整模考 7：閱讀"},
{d:46,t:"模考 7 檢討",g:[],pr:["p7t-09","p7t-10"],L:"錯題逐句跟讀",R:"閱讀錯題寫出同義替換對照＋今日練習"},
{d:47,t:"模考 8",g:[],pr:[],L:"完整模考 8：聽力",R:"完整模考 8：閱讀"},
{d:48,t:"模考 8 檢討 ＋ 弱點",g:[],pr:["wrong"],L:"錯最多的 Part 加練 2 組",R:"題庫「做錯」重做"},
{d:49,t:"Part 7 速度訓練",g:[],rc:[12],pr:["lv:3"],L:"Part 3–4 1.25 倍速一回",R:"Part 5＋6 共 46 題限時 14 分鐘；990 題庫計時"},
{d:50,t:"模考 9",g:[],pr:[],L:"完整模考 9：聽力",R:"完整模考 9：閱讀"},
{d:51,t:"模考 9 檢討",g:[],pr:["wrong"],L:"錯題精聽",R:"錯題同義替換整理"},
{d:52,t:"錯題總回收",g:[],pr:["wrong"],L:"所有聽力錯題重聽",R:"題庫「做錯」全部重做"},
{d:53,t:"模考 10",g:[],pr:[],L:"完整模考 10：聽力",R:"完整模考 10：閱讀"},
{d:54,t:"模考 10 檢討 ＋ 全真跟讀",g:[],pr:["lv:3"],L:"一回 Part 3 全文跟讀",R:"990 題庫再做一輪"},
{d:55,t:"模考 11（正式作息）",g:[],pr:[],L:"依正式時間起床、早餐、開考",R:"完整模考 11：閱讀"},
{d:56,t:"模考 11 檢討",g:[],pr:["wrong"],L:"錯題精聽",R:"錯題回對應章節"},
{d:57,t:"模考 12",g:[],pr:[],L:"完整模考 12：聽力",R:"完整模考 12：閱讀"},
{d:58,t:"最後弱點總攻",g:[],pr:["wrong"],L:"最弱 Part 加練",R:"題庫「做錯」最後一輪"},
{d:59,t:"陷阱總表與單字最後一輪",g:[],pr:[],L:"輕量：Part 2 30 題",R:"文法 26 章 990 進階點重讀"},
{d:60,t:"考前一天",g:[],pr:[],L:"熟悉音檔 20 分鐘",R:"錯題本瀏覽，不做新題",x:"準備證件、准考證、鉛筆、橡皮擦；早睡"}
];
DAYS.forEach(d=>{d.g=d.g||[];d.s=d.d>30?2:1;});

/* ---------- vocab (core + 990) ---------- */
VOCAB.forEach(v=>{v.syn=v.syn||"";});
const NCORE=VT.length;
V990.forEach((tp,k)=>{VT.push(tp.t);tp.w.forEach((ln,i)=>{const a=ln.split("|").map(s=>s.trim());VOCAB.push({id:"x"+k+"-"+i,w:a[0],p:a[1],z:a[2],c:a[3]||"",syn:a[4]||"",t:NCORE+k});});});

/* ---------- bank index ---------- */
const P5=BANK.p5, P6=BANK.p6, P7=BANK.p7;
const SETS=[].concat(P6.map(s=>Object.assign(s,{part:"p6"})),P7.map(s=>Object.assign(s,{part:s.id.slice(0,3)})));
const SETMAP={};SETS.forEach(s=>SETMAP[s.id]=s);
P5.forEach(q=>q.part="p5");
const P5MAP={};P5.forEach(q=>P5MAP[q.id]=q);
const PARTNAME={p5:"Part 5",p6:"Part 6",p7s:"Part 7 單篇",p7d:"Part 7 雙篇",p7t:"Part 7 三篇"};
const LVNAME={1:"基礎",2:"800",3:"990"};
const totalQ=P5.length+SETS.reduce((a,s)=>a+s.qs.length,0);
const nPassages=SETS.reduce((a,s)=>a+(s.docs?s.docs.length:1),0);
document.getElementById("bankCountHead").textContent=SETS.length+" 組（"+nPassages+" 篇文章）";
function qkey(s,i){return s.id+"#"+i;}
function setStat(s){let done=0,ok=0;s.qs.forEach((q,i)=>{const a=S.ans[qkey(s,i)];if(a!==undefined){done++;if(a===q.a)ok++;}});return{done,ok,n:s.qs.length};}
function p5Stat(q){const a=S.ans[q.id];return a===undefined?null:a===q.a;}

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,"0");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const chapDay={};DAYS.forEach(d=>d.g.forEach(n=>chapDay[n]=d.d));
const rcDay={};DAYS.forEach(d=>(d.rc||[]).forEach(n=>{if(!rcDay[n])rcDay[n]=d.d;}));
const TASKS=[["v","單","單字"],["g","文","文法／閱讀課"],["l","聽","聽力"],["r","讀","閱讀"],["e","複","複盤"]];
const WK=["日","一","二","三","四","五","六"];
const L4=["A","B","C","D"];
const SPK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const CHK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7"/></svg>';
const canSpeak=("speechSynthesis" in window);
function speak(t){try{const u=new SpeechSynthesisUtterance(t.replace(/\.\.\./g,""));u.lang="en-US";u.rate=0.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function topScroll(){const t=$(".tabs");const y=t&&t.offsetParent?t.offsetTop-2:Math.max(0,$("main").getBoundingClientRect().top+window.scrollY-8);window.scrollTo({top:y});}
function todayIndex(){if(!S.start)return 0;const s=new Date(S.start+"T00:00:00");if(isNaN(s))return 0;const n=new Date();n.setHours(0,0,0,0);const i=Math.floor((n-s)/86400000)+1;return(i>=1&&i<=60)?i:0;}
function dateOf(d){if(!S.start)return"";const s=new Date(S.start+"T00:00:00");if(isNaN(s))return"";s.setDate(s.getDate()+d-1);return(s.getMonth()+1)+"/"+s.getDate()+"（"+WK[s.getDay()]+"）";}
function dayDone(d){return TASKS.filter(t=>S.tasks[d+t[0]]).length;}

/* ---------- views ---------- */
const VIEWS=["quest","overview","plan","grammar","reading","bank","vocab","strategy"];
const SHOW_HOOKS=[];
function show(v){
  if(!VIEWS.includes(v))v="quest";
  VIEWS.forEach(x=>{$("#v-"+x).hidden=(x!==v);});
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",(b.dataset.view===v||(b.dataset.also||"").split(",").includes(v))?"true":"false"));
  S.view=v;save();
  if(v==="bank")renderBank();
  SHOW_HOOKS.forEach(f=>{try{f(v)}catch(e){console.error(e)}});
  try{history.replaceState(null,"","#"+v)}catch(e){}
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{show(b.dataset.view);topScroll();}));

/* ---------- overview ---------- */
$("#phaseCards").innerHTML=PHASES.map(p=>`<div class="phase ${p.s===2?"s2":""}"><div class="eyebrow">DAY ${pad(p.r[0])}–${pad(p.r[1])}</div><h4>${p.t}</h4><p>${p.d}</p></div>`).join("");

/* ---------- strip ---------- */
function renderStrip(){
  const ti=todayIndex();let full=0;
  $("#strip").innerHTML=DAYS.map(d=>{const n=dayDone(d.d);if(n===5)full++;
    return `<button class="b30 ${d.s===2?"s2":""} ${n===5?"full":n>0?"bpart":""} ${ti===d.d?"today":""}" data-jump="${d.d}" title="Day ${d.d}：${esc(d.t)}（${n}/5）" aria-label="Day ${d.d}，完成 ${n} / 5">${d.d}</button>`}).join("");
  $("#stripStat").textContent=full+" / 60 天完成";
  const tot=Object.keys(S.tasks).filter(k=>S.tasks[k]).length;const pct=Math.round(tot/300*100);
  $("#progBar").style.width=pct+"%";$("#progTxt").textContent=pct+"%（"+tot+" / 300 項）";
}
$("#strip").addEventListener("click",e=>{const b=e.target.closest("[data-jump]");if(!b)return;show("plan");const el=$("#day-"+b.dataset.jump);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});});

/* ---------- practice tokens ---------- */
function tokenItems(tok){
  if(tok.startsWith("ch:")){const n=+tok.slice(3);return P5.filter(q=>q.ch===n&&q.lv<=2).map(q=>q.id);}
  if(tok.startsWith("ch3:")){const n=+tok.slice(4);return P5.filter(q=>q.ch===n&&q.lv===3).map(q=>q.id);}
  if(tok.startsWith("voc:")){const [a,b]=tok.slice(4).split("-").map(Number);const out=[];for(let i=a;i<=b;i++)out.push("p5v-"+pad(i));return out.filter(id=>P5MAP[id]);}
  if(SETMAP[tok])return[tok];
  return null;
}
function tokenChip(tok){
  let label,done=false;
  if(tok==="wrong")return `<button class="chip pr" data-tok="wrong"><span class="num">重做</span>題庫做錯題</button>`;
  if(tok==="lv:3")return `<button class="chip pr" data-tok="lv:3"><span class="num">990</span>全部 990 題</button>`;
  if(tok==="lv:12p5")return `<button class="chip pr" data-tok="lv:12p5"><span class="num">P5</span>基礎＋800 全部</button>`;
  const ids=tokenItems(tok);if(!ids||!ids.length)return "";
  if(tok.startsWith("ch:")||tok.startsWith("ch3:")){const n=+tok.split(":")[1];label=`<span class="num">P5</span>Ch.${n}${tok.startsWith("ch3")?" 990":""}・${ids.length} 題`;done=ids.every(id=>S.ans[id]!==undefined);}
  else if(tok.startsWith("voc:")){label=`<span class="num">P5</span>字彙 ${ids.length} 題`;done=ids.every(id=>S.ans[id]!==undefined);}
  else{const s=SETMAP[tok];const st=setStat(s);done=st.done===st.n;label=`<span class="num">${PARTNAME[s.part].replace("Part ","P")}</span>#${s.id.split("-")[1]} ${esc(shortTitle(s.title))}`;}
  return `<button class="chip pr ${done?"ok":""}" data-tok="${tok}">${label}${done?" ✓":""}</button>`;
}
function shortTitle(t){t=String(t||"");return t.length>18?t.slice(0,17)+"…":t;}
function openToken(tok){
  if(tok==="wrong"){setBank({part:"all",lv:"all",type:"all",ch:"all",st:"wrong",ids:null,label:null});return;}
  if(tok==="lv:3"){setBank({part:"all",lv:"3",type:"all",ch:"all",st:"all",ids:null,label:null});return;}
  if(tok==="lv:12p5"){setBank({part:"p5",lv:"all",type:"all",ch:"all",st:"all",ids:P5.filter(q=>q.lv<=2).map(q=>q.id),label:"Part 5 基礎＋800 全部"});return;}
  const ids=tokenItems(tok);if(!ids)return;
  if(SETMAP[tok]){const s=SETMAP[tok];setBank({part:s.part,lv:"all",type:"all",ch:"all",st:"all",ids:[tok],label:PARTNAME[s.part]+" #"+s.id.split("-")[1]},tok);return;}
  setBank({part:"p5",lv:"all",type:"all",ch:"all",st:"all",ids,label:tok.startsWith("voc")?"Part 5 字彙題組":"Part 5 Ch."+tok.split(":")[1]+(tok.startsWith("ch3")?"（990）":"")});
}

/* ---------- plan ---------- */
function vocabLine(d){
  if(d.d<=20){const rv=[d.d-1,d.d-3,d.d-6].filter(x=>x>=1);
    return `<span class="chips"><button class="chip" data-vtopic="${d.d-1}"><span class="num">新</span>${VT[d.d-1]}</button>${rv.map(x=>`<button class="chip" data-vtopic="${x-1}"><span class="num">複</span>${VT[x-1]}</button>`).join("")}</span>`;}
  if(d.vr)return `總複習：<span class="chips">${d.vr.map(x=>`<button class="chip" data-vtopic="${x-1}">${VT[x-1]}</button>`).join("")}</span>`;
  if(d.d>=31&&d.d<=40&&V990.length){const k=d.d-31;const rv=[k-1,k-3].filter(x=>x>=0);
    return `<span class="chips"><button class="chip" data-vtopic="${NCORE+k}"><span class="num">新</span>${VT[NCORE+k]}</button>${rv.map(x=>`<button class="chip" data-vtopic="${NCORE+x}"><span class="num">複</span>${VT[NCORE+x]}</button>`).join("")}</span>`;}
  if(d.d>40)return `<span class="chips"><button class="chip" data-vgroup="adv" data-vfilter="todo">990 進階「不熟」</button><button class="chip" data-vgroup="core" data-vfilter="todo">核心「不熟」</button></span> 字卡過一遍`;
  return `<span class="chips"><button class="chip" data-vgroup="all" data-vfilter="todo">所有「不熟」單字</button></span> 字卡過一遍`;
}
function gramLine(d){
  const parts=[];
  if(d.g.length)parts.push(`<span class="chips">${d.g.map(n=>`<a class="chip" href="#g-${n}" data-gchap="${n}"><span class="num">Ch.${n}</span>${G[n-1].t}</a>`).join("")}</span>`);
  if(d.g9)parts.push(`<span class="chips">${d.g9.map(n=>`<a class="chip" href="#g-${n}" data-gchap="${n}"><span class="num">990</span>Ch.${n}</a>`).join("")}</span>`);
  if(d.rc)parts.push(`<span class="chips">${d.rc.map(n=>`<a class="chip" href="#r-${n}" data-rchap="${n}"><span class="num">R${n}</span>${RC[n-1].t}</a>`).join("")}</span>`);
  if(parts.length)return parts.join(" ");
  if(d.d===13)return "第 1–20 章錯題回看，重做每章題庫";
  if(d.d===20)return "26 章例題與題庫全部重做，陷阱逐條重讀";
  if(d.d>30)return "模考錯題對應回文法與閱讀章節重讀";
  return "模考錯題對應回文法章節重讀";
}
function dayRows(d){const prc=(d.pr||[]).map(tokenChip).join("");return {v:vocabLine(d),g:gramLine(d),l:esc(d.L),r:esc(d.R)+(prc?`<div class="prline chips">${prc}</div>`:""),e:esc(d.x||"錯題本：重做今天錯題，寫下錯因與同類規則")};}
function renderPlan(){
  const ti=todayIndex();
  let html="";
  [1,2].forEach(st=>{
    html+=`<div class="stage-head"><span class="stage-tag ${st===2?"s2":""}">STAGE ${st}</span><h3>${st===1?"0 → 800｜第 1–30 天":"800 → 990｜第 31–60 天"}</h3><p>${st===1?"建立文法、閱讀題型與聽力基本功":"零失誤、同義替換、多篇整合與模考循環"}</p></div>`;
    PHASES.filter(p=>p.s===st).forEach(p=>{
      const ds=DAYS.filter(d=>d.d>=p.r[0]&&d.d<=p.r[1]);
      const wi=PHASES.indexOf(p);
      html+=`<div class="world-banner ${p.s===2?"s2":""}"><div class="wb-head"><span class="world-no">WORLD ${wi+1}</span><h3>${WORLDS[wi]}</h3><span class="wb-sub">${p.t.split("｜")[1]||""}</span></div><p>${p.d}</p><div class="nodes">${ds.map(d=>{const n=dayDone(d.d);return `<button class="node ${isBoss(d)?"boss":""} ${n===5?"done":n>0?"npart":""} ${ti===d.d?"today":""}" data-jump="${d.d}" aria-label="Day ${d.d}${isBoss(d)?" 首領戰":""}，完成 ${n}/5">${d.d}</button>`}).join('<i class="link"></i>')}</div></div><div class="days">${ds.map(d=>{
        const n=dayDone(d.d);
        const prc=(d.pr||[]).map(tokenChip).join("");
        const rows={v:vocabLine(d),g:gramLine(d),l:esc(d.L),r:esc(d.R)+(prc?`<div class="prline chips">${prc}</div>`:""),e:esc(d.x||"錯題本：重做今天錯題，寫下錯因與同類規則")};
        return `<article class="day ${d.s===2?"s2":""} ${isBoss(d)?"boss":""} ${n===5?"done":""} ${ti===d.d?"is-today":""}" id="day-${d.d}">
          <div class="day-h"><span class="dno">DAY ${pad(d.d)}</span>${isBoss(d)?'<span class="boss-tag">BOSS</span>':""}<span class="ddate">${dateOf(d.d)}</span>${ti===d.d?'<span class="badge">今天</span>':""}<span class="ddate dcount" style="margin-left:auto">${n}/5</span></div>
          <h4>${esc(d.t)}</h4>
          <ul class="tasks">${TASKS.map(t=>`<li><button class="bub" data-task="${d.d}${t[0]}" aria-pressed="${S.tasks[d.d+t[0]]?"true":"false"}" aria-label="Day ${d.d} ${t[2]}完成">${t[1]}</button><div><b>${t[2]}</b><span class="xpc">+20</span>${rows[t[0]]}</div></li>`).join("")}</ul>
        </article>`}).join("")}</div>`;
    });
  });
  $("#planBody").innerHTML=html;
}
function handleDayClick(e){
  const b=e.target.closest("[data-task]");
  if(b){const k=b.dataset.task;S.tasks[k]=!S.tasks[k];if(!S.tasks[k])delete S.tasks[k];
    document.querySelectorAll('[data-task="'+k+'"]').forEach(x=>x.setAttribute("aria-pressed",S.tasks[k]?"true":"false"));
    const d=parseInt(k,10);const card=$("#day-"+d);const n=dayDone(d);
    if(card){card.classList.toggle("done",n===5);card.querySelector(".dcount").textContent=n+"/5";}
    const node=document.querySelector('.node[data-jump="'+d+'"]');if(node){node.classList.toggle("done",n===5);node.classList.toggle("npart",n>0&&n<5);}
    renderStrip();save();return;}
  const j=e.target.closest(".node[data-jump]");if(j){const el=$("#day-"+j.dataset.jump);if(el)el.scrollIntoView({behavior:"smooth",block:"center"});return;}
  const g=e.target.closest("[data-gchap]");if(g){e.preventDefault();openChap(+g.dataset.gchap);return;}
  const r=e.target.closest("[data-rchap]");if(r){e.preventDefault();openRC(+r.dataset.rchap);return;}
  const tk=e.target.closest("[data-tok]");if(tk){openToken(tk.dataset.tok);return;}
  const v=e.target.closest("[data-vtopic]");if(v){setVocab({topic:String(v.dataset.vtopic),filter:"all",q:""});show("vocab");topScroll();return;}
  const f=e.target.closest("[data-vfilter]");if(f){setVocab({topic:f.dataset.vgroup||"all",filter:f.dataset.vfilter,q:""});show("vocab");topScroll();}
}
$("#planBody").addEventListener("click",handleDayClick);
$("#startDate").value=S.start||"";
$("#startDate").addEventListener("change",e=>{S.start=e.target.value;renderPlan();renderStrip();save();});
$("#jumpToday").addEventListener("click",()=>{const t=todayIndex();const b=$("#jumpToday");if(!t){b.textContent=S.start?"今天不在 60 天內":"請先設定開始日期";setTimeout(()=>b.textContent="跳到今天",1800);return;}$("#day-"+t).scrollIntoView({behavior:"smooth",block:"center"});});
let resetArm=false;
$("#resetBtn").addEventListener("click",()=>{const b=$("#resetBtn");if(!resetArm){resetArm=true;b.textContent="再按一次確認清除";setTimeout(()=>{resetArm=false;b.textContent="重設課表進度"},3000);return;}
  S.tasks={};S.chap={};S.rchap={};save();resetArm=false;b.textContent="已清除（題庫作答保留）";setTimeout(()=>b.textContent="重設課表進度",1800);renderPlan();renderStrip();renderGrammar();renderRC();});

/* ---------- grammar ---------- */
function renderGrammar(){
  $("#glist").innerHTML=G.map(c=>{const nq=P5.filter(q=>q.ch===c.n).length;const st=P5.filter(q=>q.ch===c.n&&S.ans[q.id]!==undefined);
    return `<details class="g" id="g-${c.n}">
    <summary><span class="gno">${pad(c.n)}</span><span><span class="gt">${c.t}</span><br><span class="gmeta">DAY ${pad(chapDay[c.n])} ・ 990 複習 DAY ${pad(31+[4,8,13,18,22,26].findIndex(x=>c.n<=x)+1)} ・ 題庫 ${st.length}/${nq}</span></span><span class="gstat">${S.chap[c.n]?"已讀完":""}</span></summary>
    <div class="gbody">
      <div class="plain"><div class="plain-h">白話版：這章在講什麼</div><p class="one">${esc(PLAIN[c.n-1][0])}</p><div class="roles">${rolesHTML(PLAIN[c.n-1][1])}</div><p class="tip"><b>新手提示　</b>${esc(PLAIN[c.n-1][2])}</p></div>
      <div><h5>多益必考點</h5><ul class="pts">${c.pts.map(p=>`<li>${p}</li>`).join("")}</ul>
        <div class="trap"><b>陷阱　</b>${c.trap}</div>
        <div class="adv"><b>990 進階　</b>${G990[c.n-1].replace(/^990：/,"")}</div></div>
      <div><h5>公式</h5><div class="formula">${c.f}</div>${symLegend(c.f)}
        <h5 style="margin-top:16px">例題</h5>
        <div class="quiz" data-q="${c.n}"><p class="qs">${c.q.s}</p>
          <div class="opts">${c.q.o.map((o,i)=>`<button class="opt" data-i="${i}"><span class="bub">${L4[i]}</span><span>${o}</span></button>`).join("")}</div>
          <p class="qex" hidden></p></div></div>
      <div class="gfoot"><button class="btn primary" data-tok="ch:${c.n}">本章題庫：基礎＋800</button><button class="btn" data-tok="ch3:${c.n}">本章 990 題</button><button class="btn" data-chapdone="${c.n}" aria-pressed="${S.chap[c.n]?"true":"false"}">${S.chap[c.n]?"已讀完 ✓":"標記為已讀完"}</button></div>
    </div></details>`}).join("");
  document.querySelectorAll("#glist .gbody").forEach(wrapTerms);
}
$("#glist").addEventListener("click",e=>{
  const o=e.target.closest(".opt");
  if(o){const qz=o.closest(".quiz");const c=G[qz.dataset.q-1];const i=+o.dataset.i;
    qz.querySelectorAll(".opt").forEach(x=>x.classList.remove("right","wrong"));
    o.classList.add(i===c.q.a?"right":"wrong");qz.querySelectorAll(".opt")[c.q.a].classList.add("right");
    const ex=qz.querySelector(".qex");ex.hidden=false;ex.classList.toggle("bad",i!==c.q.a);
    ex.textContent=(i===c.q.a?"答對！":"再想想。")+"正解 ("+L4[c.q.a]+")："+c.q.ex;wrapTerms(ex);return;}
  const t=e.target.closest("[data-tok]");if(t){openToken(t.dataset.tok);return;}
  const d=e.target.closest("[data-chapdone]");
  if(d){const n=+d.dataset.chapdone;S.chap[n]=!S.chap[n];if(!S.chap[n])delete S.chap[n];save();
    d.setAttribute("aria-pressed",S.chap[n]?"true":"false");d.textContent=S.chap[n]?"已讀完 ✓":"標記為已讀完";
    $("#g-"+n+" .gstat").textContent=S.chap[n]?"已讀完":"";}
});
function openChap(n){show("grammar");const el=$("#g-"+n);if(el){el.open=true;setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30);}}
$("#gOpenAll").addEventListener("click",()=>document.querySelectorAll("#glist details").forEach(d=>d.open=true));
$("#gCloseAll").addEventListener("click",()=>document.querySelectorAll("#glist details").forEach(d=>d.open=false));

/* ---------- reading chapters ---------- */
function rcCount(r){
  if(r.ty!=="all"){let n=0;SETS.forEach(s=>s.qs.forEach(q=>{if(q.type===r.ty)n++;}));return n+" 題";}
  if(r.part==="p6")return P6.length+" 篇";
  if(r.part==="p7m")return P7.filter(s=>s.id.startsWith("p7d")||s.id.startsWith("p7t")).length+" 組";
  return P7.length+" 組";
}
function renderRC(){
  $("#rlist").innerHTML=RC.map(r=>`<details class="g rc" id="r-${r.n}">
    <summary><span class="gno">R${pad(r.n)}</span><span><span class="gt">${r.t}</span><br><span class="gmeta">DAY ${pad(rcDay[r.n]||0)} ・ 題庫 ${rcCount(r)}</span></span><span class="gstat">${S.rchap[r.n]?"已讀完":""}</span></summary>
    <div class="gbody">
      <div><h5>解題步驟</h5><ol class="pts">${r.how.map(p=>`<li>${p}</li>`).join("")}</ol>
        <div class="trap"><b>陷阱　</b>${r.trap}</div>
        <div class="adv"><b>990 進階　</b>${r.adv.replace(/^990：/,"")}</div></div>
      <div><h5>${r.para?"常考同義替換":"考題問法"}</h5>
        ${r.para?`<div class="scroll-x"><table class="para-table"><tr><th>文章用字</th><th>選項常改寫成</th></tr>${r.para.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td></tr>`).join("")}</table></div>`:`<ul class="stems">${r.stems.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>`}
      </div>
      <div class="gfoot"><button class="btn primary" data-rpr="${r.n}">練習這個題型</button>${r.n===11?`<button class="btn" data-vjump="${NCORE+7}">990 同義替換單字</button>`:""}<button class="btn" data-rdone="${r.n}" aria-pressed="${S.rchap[r.n]?"true":"false"}">${S.rchap[r.n]?"已讀完 ✓":"標記為已讀完"}</button></div>
    </div></details>`).join("");
  document.querySelectorAll("#rlist .gbody").forEach(wrapTerms);
}
$("#rlist").addEventListener("click",e=>{
  const p=e.target.closest("[data-rpr]");
  if(p){const r=RC[p.dataset.rpr-1];
    if(r.ty!=="all")setBank({part:r.ty==="整合"?"p7d":"all",lv:"all",type:r.ty,ch:"all",st:"all",ids:null,label:null});
    else if(r.part==="p6")setBank({part:"p6",lv:"all",type:"all",ch:"all",st:"all",ids:null,label:null});
    else if(r.n===12)setBank({part:"all",lv:"3",type:"all",ch:"all",st:"all",ids:null,label:null});
    else setBank({part:"p7s",lv:"all",type:"all",ch:"all",st:"all",ids:null,label:null});
    return;}
  const v=e.target.closest("[data-vjump]");if(v){setVocab({topic:v.dataset.vjump,filter:"all",q:""});show("vocab");topScroll();return;}
  const d=e.target.closest("[data-rdone]");
  if(d){const n=+d.dataset.rdone;S.rchap[n]=!S.rchap[n];if(!S.rchap[n])delete S.rchap[n];save();
    d.setAttribute("aria-pressed",S.rchap[n]?"true":"false");d.textContent=S.rchap[n]?"已讀完 ✓":"標記為已讀完";$("#r-"+n+" .gstat").textContent=S.rchap[n]?"已讀完":"";}
});
function openRC(n){show("reading");const el=$("#r-"+n);if(el){el.open=true;setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),30);}}
$("#rOpenAll").addEventListener("click",()=>document.querySelectorAll("#rlist details").forEach(d=>d.open=true));
$("#rCloseAll").addEventListener("click",()=>document.querySelectorAll("#rlist details").forEach(d=>d.open=false));

/* ---------- bank ---------- */
const B={part:"p5",lv:"all",type:"all",ch:"all",st:"all",ids:null,label:null,limit:40};
let bankOpen=null;
const TYPES_P5=["詞性","動詞形式","時態","主被動","代名詞","介系詞","連接詞","關係詞","比較","假設","字彙","搭配"];
const TYPES_R=["主旨","細節","NOT","推論","同義詞","意圖","句子插入","整合"];
function fillTypeSelect(){
  const list=B.part==="p5"?TYPES_P5:B.part==="all"?TYPES_P5.concat(TYPES_R):(B.part==="p6"?["句子插入"].concat(TYPES_P5):TYPES_R);
  const sel=$("#bType");sel.innerHTML=`<option value="all">全部題型</option>`+[...new Set(list)].map(t=>`<option value="${t}">${t}</option>`).join("");
  sel.value=list.includes(B.type)?B.type:"all";if(sel.value==="all")B.type=B.type==="all"||!list.includes(B.type)?"all":B.type;
  const ch=$("#bCh");ch.hidden=(B.part!=="p5"&&B.part!=="all");
  ch.innerHTML=`<option value="all">全部章節</option><option value="0">字彙題</option>`+G.map(c=>`<option value="${c.n}">Ch.${c.n} ${c.t}</option>`).join("");ch.value=String(B.ch);
  $("#bLv").value=String(B.lv);
  document.querySelectorAll("[data-bs]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.bs===B.st?"true":"false"));
}
function setBank(o,openId){Object.assign(B,{limit:40},o);bankOpen=openId||null;show("bank");topScroll();}
function renderTiles(){
  const groups=[["p5","Part 5",P5.length,P5.filter(q=>S.ans[q.id]!==undefined).length,P5.filter(q=>S.ans[q.id]===q.a).length,"題"]];
  ["p6","p7s","p7d","p7t"].forEach(p=>{const ss=SETS.filter(s=>s.part===p);let n=0,d=0,o=0;ss.forEach(s=>{const st=setStat(s);n+=st.n;d+=st.done;o+=st.ok;});groups.push([p,PARTNAME[p],n,d,o,"題・"+ss.length+" 組"]);});
  const all=groups.reduce((a,g)=>[a[0]+g[2],a[1]+g[3],a[2]+g[4]],[0,0,0]);
  $("#tiles").innerHTML=`<button class="tile" data-part="all" aria-pressed="${B.part==="all"}"><div class="k">全部</div><div class="v">${all[1]}<small> / ${all[0]}</small></div><div class="acc">正確率 ${all[1]?Math.round(all[2]/all[1]*100):0}%</div><div class="minibar"><i style="width:${all[0]?all[1]/all[0]*100:0}%"></i></div></button>`+
    groups.map(g=>`<button class="tile" data-part="${g[0]}" aria-pressed="${B.part===g[0]}"><div class="k">${g[1].toUpperCase()}</div><div class="v">${g[3]}<small> / ${g[2]} ${g[5]}</small></div><div class="acc">正確率 ${g[3]?Math.round(g[4]/g[3]*100):0}%</div><div class="minibar"><i style="width:${g[2]?g[3]/g[2]*100:0}%"></i></div></button>`).join("");
}
function bankItems(){
  const lvOk=x=>B.lv==="all"||x.lv===+B.lv;
  let p5=[],sets=[];
  if(B.part==="p5"||B.part==="all"){
    p5=P5.filter(q=>lvOk(q)&&(B.type==="all"||q.type===B.type)&&(B.ch==="all"||q.ch===+B.ch)&&(B.ids?B.ids.includes(q.id):true)&&(B.st==="all"||(B.st==="todo"?S.ans[q.id]===undefined:(S.ans[q.id]!==undefined&&S.ans[q.id]!==q.a))));
  }
  if(B.part!=="p5"&&(B.ch==="all"||B.part!=="all")){
    sets=SETS.filter(s=>(B.part==="all"||s.part===B.part)&&lvOk(s)&&(B.ids?B.ids.includes(s.id):true)&&(B.type==="all"||s.qs.some(q=>q.type===B.type))&&(()=>{if(B.st==="all")return true;const st=setStat(s);if(B.st==="todo")return st.done<st.n;return s.qs.some((q,i)=>{const a=S.ans[qkey(s,i)];return a!==undefined&&a!==q.a;});})());
  }
  return{p5,sets};
}
function lvTag(lv){return `<span class="lv lv${lv}">${LVNAME[lv]}</span>`;}
function optsHTML(o,key,a){const ch=S.ans[key];return o.map((t,i)=>{let cls="";if(ch!==undefined){if(i===a)cls="right";else if(i===ch)cls="wrong";}return `<button class="ropt ${cls}" data-key="${esc(key)}" data-i="${i}"><span class="bub">${L4[i]}</span><span>${esc(t)}</span></button>`}).join("");}
function exHTML(key,a,ex){const ch=S.ans[key];if(ch===undefined)return `<p class="qex" hidden></p>`;return `<p class="qex ${ch===a?"":"bad"}">${ch===a?"答對！":"答錯。"}正解 (${L4[a]})：${esc(ex)}</p>`;}
function p5HTML(q){
  const g=q.ch?G[q.ch-1]:null;
  return `<div class="p5card" id="it-${q.id}"><div class="p5meta">${lvTag(q.lv)}<span>${q.id.toUpperCase()}</span><span>${g?"Ch."+q.ch+" "+g.t:"字彙／搭配"}</span><span class="qtype">${q.type}</span></div>
  <p class="p5s">${esc(q.s).replace("___",'<span class="gap">&nbsp;</span>')}</p><div class="opts">${optsHTML(q.o,q.id,q.a)}</div>${exHTML(q.id,q.a,q.ex)}</div>`;
}
function bodyHTML(text,kind,part){
  let t=esc(text||"");
  t=t.replace(/\[(1|2|3|4)\]/g,'<span class="mk">[$1]</span>');
  if(part==="p6")t=t.replace(/\{\{(\d)\}\}/g,(m,n)=>`<span class="blank">${n}</span>`);
  if(/text message|chat/i.test(kind)){
    return `<div class="chat">${t.split("\n").filter(l=>l.trim()).map(l=>{const m=l.match(/^(.+?)\s*\[([^\]]+)\]\s*:\s*(.*)$/);return m?`<div class="msg"><div class="who">${m[1]}<span>${m[2]}</span></div><div class="txt">${m[3]}</div></div>`:`<p>${l}</p>`}).join("")}</div>`;
  }
  const out=[];
  t.split(/\n\s*\n/).forEach(block=>{
    const lines=block.split("\n");let tbl=[],buf=[];
    const flushT=()=>{if(tbl.length){out.push(`<div class="scroll-x"><table>${tbl.map((r,ri)=>`<tr>${r.split(" | ").map(c=>ri===0?`<th>${c}</th>`:`<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`);tbl=[];}};
    const flushB=()=>{if(buf.length){out.push(`<p>${buf.join("<br>")}</p>`);buf=[];}};
    lines.forEach(l=>{if(l.includes(" | ")){flushB();tbl.push(l);}else{flushT();if(l.trim())buf.push(l);}});
    flushT();flushB();
  });
  return out.join("");
}
function setBodyHTML(s){
  const docs=s.part==="p6"?[{kind:s.kind,head:s.head,body:s.text}]:s.docs;
  const book=docs.map((d,i)=>`<div class="doc"><div class="doc-k"><span>${esc(d.kind)}</span>${docs.length>1?`<span>${i+1} / ${docs.length}</span>`:""}</div>${d.head?`<div class="doc-head">${esc(d.head)}</div>`:""}${bodyHTML(d.body,d.kind,s.part)}</div>`).join("");
  const qs=s.qs.map((q,i)=>{const key=qkey(s,i);const stem=s.part==="p6"?`空格 ${q.n||i+1}`:esc(q.q);
    return `<div class="qitem"><p class="qq"><span class="num">${i+1}.</span>${stem}<span class="qtype">${q.type}</span></p><div class="opts">${optsHTML(q.o,key,q.a)}</div>${exHTML(key,q.a,q.ex)}</div>`;}).join("");
  const sug=s.part==="p6"?"建議 2 分鐘":s.part==="p7s"?`建議 ${s.qs.length} 分鐘`:s.part==="p7d"?"建議 5 分鐘":"建議 6 分鐘";
  return `<div class="set-body"><div class="booklet">${book}</div><div class="qcol">${qs}<div class="set-foot"><span>${sug}</span><button class="btn" data-reset="${s.id}">清除本組作答</button></div></div></div>`;
}
function setSumHTML(s){
  const st=setStat(s);const kinds=s.part==="p6"?s.kind:s.docs.map(d=>d.kind).join(" ＋ ");
  return `<summary><div><div class="set-t">${esc(s.title||"")}</div><div class="set-m">${lvTag(s.lv)}<span>${PARTNAME[s.part]} #${s.id.split("-")[1]}</span><span>${esc(kinds)}</span></div></div>
   <div class="set-s">${st.done?`<span class="okc">✓${st.ok}</span> <span class="bad">✗${st.done-st.ok}</span> / ${st.n}`:`${st.n} 題`}</div></summary>`;
}
function renderBank(){
  renderTiles();fillTypeSelect();
  const act=$("#bActive");
  if(B.ids&&B.label){act.hidden=false;act.innerHTML=`<span>目前顯示：<b>${esc(B.label)}</b></span><button class="btn" id="bClearIds">顯示全部題目</button>`;}else act.hidden=true;
  const {p5,sets}=bankItems();
  let html="";
  if(!p5.length&&!sets.length)html=`<div class="empty">沒有符合條件的題目。${B.st==="wrong"?"目前沒有做錯的題目，做得好！":"試著放寬難度或題型篩選。"}</div>`;
  if(p5.length){const shown=p5.slice(0,B.limit);html+=`<div class="vcount num">Part 5 · ${p5.length} 題</div><div class="p5list">${shown.map(p5HTML).join("")}</div>${p5.length>B.limit?`<div class="more"><button class="btn" id="bMore">再顯示 40 題（剩 ${p5.length-B.limit}）</button></div>`:""}`;}
  if(sets.length){html+=`<div class="vcount num" style="margin-top:${p5.length?"24px":"0"}">閱讀題組 · ${sets.length} 組・${sets.reduce((a,s)=>a+s.qs.length,0)} 題</div><div class="setlist">${sets.map(s=>`<details class="set" id="it-${s.id}" data-set="${s.id}">${setSumHTML(s)}<div class="set-holder"></div></details>`).join("")}</div>`;}
  $("#bankBody").innerHTML=html;
  document.querySelectorAll("#bankBody .p5card .qex:not([hidden])").forEach(wrapTerms);
  if(bankOpen){const el=document.getElementById("it-"+bankOpen);if(el){el.open=true;fillSet(el);setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),40);}bankOpen=null;}
}
function fillSet(el){const h=el.querySelector(".set-holder");if(h&&!h.dataset.f){h.innerHTML=setBodyHTML(SETMAP[el.dataset.set]);h.dataset.f="1";h.querySelectorAll(".qex:not([hidden])").forEach(wrapTerms);}}
$("#bankBody").addEventListener("toggle",e=>{if(e.target.matches&&e.target.matches("details.set")&&e.target.open)fillSet(e.target);},true);
$("#bankBody").addEventListener("click",e=>{
  const o=e.target.closest(".ropt");
  if(o){const key=o.dataset.key;const i=+o.dataset.i;S.ans[key]=i;save();
    let q,a,ex;if(P5MAP[key]){q=P5MAP[key];a=q.a;ex=q.ex;}else{const [sid,qi]=key.split("#");q=SETMAP[sid].qs[+qi];a=q.a;ex=q.ex;}
    const box=o.closest(".opts");box.querySelectorAll(".ropt").forEach((b,j)=>{b.classList.remove("right","wrong");if(j===a)b.classList.add("right");else if(j===i)b.classList.add("wrong");});
    const exEl=box.nextElementSibling;exEl.hidden=false;exEl.classList.toggle("bad",i!==a);exEl.textContent=(i===a?"答對！":"答錯。")+"正解 ("+L4[a]+")："+ex;wrapTerms(exEl);
    const det=o.closest("details.set");if(det){const s=SETMAP[det.dataset.set];const st=setStat(s);det.querySelector(".set-s").innerHTML=`<span class="okc">✓${st.ok}</span> <span class="bad">✗${st.done-st.ok}</span> / ${st.n}`;}
    renderTiles();return;}
  const r=e.target.closest("[data-reset]");
  if(r){const s=SETMAP[r.dataset.reset];s.qs.forEach((q,i)=>delete S.ans[qkey(s,i)]);save();const det=r.closest("details.set");det.querySelector(".set-holder").innerHTML=setBodyHTML(s);det.querySelector("summary").outerHTML=setSumHTML(s);renderTiles();return;}
  if(e.target.id==="bMore"){B.limit+=40;renderBank();}
});
$("#bActive").addEventListener("click",e=>{if(e.target.id==="bClearIds"){B.ids=null;B.label=null;renderBank();}});
$("#tiles").addEventListener("click",e=>{const t=e.target.closest("[data-part]");if(!t)return;Object.assign(B,{part:t.dataset.part,ids:null,label:null,limit:40,ch:"all"});if(!(B.part==="p5"?TYPES_P5:TYPES_R).includes(B.type))B.type="all";renderBank();});
$("#bLv").addEventListener("change",e=>{B.lv=e.target.value;B.limit=40;renderBank();});
$("#bType").addEventListener("change",e=>{B.type=e.target.value;B.limit=40;renderBank();});
$("#bCh").addEventListener("change",e=>{B.ch=e.target.value;if(B.ch!=="all")B.part="p5";B.limit=40;renderBank();});
document.querySelectorAll("[data-bs]").forEach(b=>b.addEventListener("click",()=>{B.st=b.dataset.bs;B.limit=40;renderBank();}));

/* ---------- vocab ---------- */
const VS={topic:"all",filter:"all",q:"",hide:"",fc:false,fi:0,flip:false};
$("#vt").innerHTML=`<option value="all">全部（${VOCAB.length}）</option><option value="core">核心 500</option><option value="adv">990 進階 ${VOCAB.length-VOCAB.filter(v=>v.t<NCORE).length}</option>`+
  `<optgroup label="核心 500（Day 1–20）">`+VT.slice(0,NCORE).map((t,i)=>`<option value="${i}">${pad(i+1)} ${t}</option>`).join("")+`</optgroup>`+
  (V990.length?`<optgroup label="990 進階（Day 31–40）">`+VT.slice(NCORE).map((t,k)=>`<option value="${NCORE+k}">A${pad(k+1)} ${t}</option>`).join("")+`</optgroup>`:"");
function topicOk(v){if(VS.topic==="all")return true;if(VS.topic==="core")return v.t<NCORE;if(VS.topic==="adv")return v.t>=NCORE;return v.t===+VS.topic;}
function vfiltered(){const q=VS.q.toLowerCase();
  return VOCAB.filter(v=>topicOk(v)&&(VS.filter==="all"||(VS.filter==="known"?S.known[v.id]:!S.known[v.id]))&&(!q||v.w.toLowerCase().includes(q)||v.z.includes(VS.q)||v.c.toLowerCase().includes(q)||v.syn.toLowerCase().includes(q)));}
function setVocab(o){Object.assign(VS,o);VS.fi=0;VS.flip=false;$("#vt").value=VS.topic;$("#vq").value=VS.q;
  document.querySelectorAll("[data-vf]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.vf===VS.filter?"true":"false"));renderVocab();}
function vcountText(n){return `顯示 ${n} 字 · 已會 ${VOCAB.filter(v=>S.known[v.id]).length} / ${VOCAB.length}`;}
function renderVocab(){
  const list=vfiltered();$("#vcount").textContent=vcountText(list.length);
  const box=$("#vlist");box.className="vlist"+(VS.hide?" hide"+VS.hide:"");
  if(!list.length){box.innerHTML='<p style="padding:18px 0" class="muted">沒有符合的單字。換個關鍵字，或把篩選改回「全部」。</p>';}
  else{let html="",last=-1;
    list.forEach(v=>{if(v.t!==last){const adv=v.t>=NCORE;html+=`<div class="vtopic-h ${adv?"adv":""}">${adv?"A"+pad(v.t-NCORE+1):pad(v.t+1)} · ${VT[v.t]} · DAY ${pad(adv?31+v.t-NCORE:v.t+1)}</div>`;last=v.t;}
      html+=`<div class="vrow" data-id="${v.id}"><span class="vw">${esc(v.w)}</span><span class="vp">${esc(v.p)}</span><span class="vz">${esc(v.z)}</span><span class="vc">${esc(v.c)}${v.syn?`<span class="syn">≈ ${esc(v.syn)}</span>`:""}</span><span class="vact">${canSpeak?`<button class="icon-btn" data-say="${esc(v.w)}" aria-label="播放 ${esc(v.w)} 發音">${SPK}</button>`:""}<button class="icon-btn" data-known="${v.id}" aria-pressed="${S.known[v.id]?"true":"false"}" aria-label="標記已會">${CHK}</button></span></div>`;});
    box.innerHTML=html;}
  renderFC(list);
}
function renderFC(list){
  const fc=$("#fc");fc.hidden=!VS.fc;if(!VS.fc)return;
  if(!list.length){fc.innerHTML='<p class="muted">這個篩選沒有單字。</p>';return;}
  if(VS.fi>=list.length)VS.fi=0;const v=list[VS.fi];
  fc.innerHTML=`<div class="num muted" style="font-size:12.5px">${VS.fi+1} / ${list.length} · ${VT[v.t]}</div>
   <div class="fc-card" id="fcCard" role="button" tabindex="0" aria-label="翻面"><div class="fc-w">${esc(v.w)}</div><div class="vp">${esc(v.p)}</div>
     ${VS.flip?`<div class="fc-z">${esc(v.z)}</div><div class="fc-c">${esc(v.c)}</div>${v.syn?`<div class="fc-c" style="color:var(--blue);font-style:normal">≈ ${esc(v.syn)}</div>`:""}`:'<div class="muted" style="font-size:13px">點卡片翻面</div>'}</div>
   <div class="fc-nav"><button class="btn" data-fc="prev">上一張</button>${canSpeak?`<button class="btn" data-fc="say">發音</button>`:""}<button class="btn" data-fc="todo">不熟，下一張</button><button class="btn" data-fc="know" style="border-color:var(--ok);color:var(--ok)">認得 ✓</button><button class="btn" data-fc="next">下一張</button></div>`;
}
$("#fc").addEventListener("click",e=>{const list=vfiltered();if(!list.length)return;const v=list[VS.fi];
  if(e.target.closest("#fcCard")){VS.flip=!VS.flip;renderFC(list);return;}
  const b=e.target.closest("[data-fc]");if(!b)return;const a=b.dataset.fc;
  if(a==="say"){speak(v.w);return;}
  if(a==="prev")VS.fi=(VS.fi-1+list.length)%list.length;
  if(a==="next"||a==="todo"){if(a==="todo"){delete S.known[v.id];save();}VS.fi=(VS.fi+1)%list.length;}
  if(a==="know"){S.known[v.id]=true;save();if(VS.filter!=="todo")VS.fi=(VS.fi+1)%list.length;}
  VS.flip=false;renderVocab();});
$("#fc").addEventListener("keydown",e=>{if(e.target.id==="fcCard"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();VS.flip=!VS.flip;renderFC(vfiltered());}});
$("#vlist").addEventListener("click",e=>{
  const s=e.target.closest("[data-say]");if(s){speak(s.dataset.say);return;}
  const k=e.target.closest("[data-known]");if(k){const id=k.dataset.known;S.known[id]=!S.known[id];if(!S.known[id])delete S.known[id];save();
    if(VS.filter==="all"){k.setAttribute("aria-pressed",S.known[id]?"true":"false");$("#vcount").textContent=vcountText(vfiltered().length);}else renderVocab();return;}
  const p=e.target.closest(".vz,.vc,.vw");if(p&&VS.hide)p.classList.toggle("peek");});
$("#vq").addEventListener("input",e=>{VS.q=e.target.value.trim();VS.fi=0;renderVocab();});
$("#vt").addEventListener("change",e=>{VS.topic=e.target.value;VS.fi=0;renderVocab();});
document.querySelectorAll("[data-vf]").forEach(b=>b.addEventListener("click",()=>setVocab({filter:b.dataset.vf})));
document.querySelectorAll("[data-hide]").forEach(b=>b.addEventListener("click",()=>{VS.hide=VS.hide===b.dataset.hide?"":b.dataset.hide;
  document.querySelectorAll("[data-hide]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.hide===VS.hide?"true":"false"));renderVocab();}));
$("#fcToggle").addEventListener("click",()=>{VS.fc=!VS.fc;VS.flip=false;$("#fcToggle").setAttribute("aria-pressed",VS.fc?"true":"false");renderVocab();});

/* ---------- strategy ---------- */
$("#parts").innerHTML=PARTS.map((p,i)=>`<div class="part"><div class="part-h"><span class="p">${p.p}</span><h4>${p.t}</h4><span class="q">${p.q}</span></div><ul>${p.tips.map(t=>`<li>${t}</li>`).join("")}</ul><div class="trap"><b>陷阱　</b>${p.trap}</div><div class="adv"><b>990　</b>${P990[i].replace(/^990：/,"")}</div></div>`).join("");

/* ---------- beginner panel ---------- */
$("#nbDemo").innerHTML=rolesHTML("[S:The manager] [V:approved] [O:the budget] [M:yesterday].")+'<span class="rX muted" style="font:400 14px var(--f-body)">＝ 經理（主詞）／批准了（動詞）／預算（受詞）／昨天（修飾）</span>';
function applyNB(){const on=S.nb!==false;document.body.classList.toggle("nb-off",!on);const b=$("#nbToggle");b.setAttribute("aria-pressed",on?"true":"false");b.textContent="新手模式："+(on?"開":"關");}
$("#nbToggle").addEventListener("click",()=>{S.nb=(S.nb===false);save();applyNB();});
function renderGloss(){const q=($("#glossQ").value||"").trim().toLowerCase();let last="",html="";
  GLOSS.forEach((g,i)=>{const hay=(g[1]+g[2]+g[3].join("")+g[4]+g[5]).toLowerCase();if(q&&!hay.includes(q))return;
    if(g[0]!==last){html+=`<div class="gl-cat">${g[0]}</div>`;last=g[0];}
    html+=`<div class="gl-item"><h4>${esc(g[1])}<span class="en">${esc(g[2])}</span></h4><p>${esc(g[4])}</p><div class="ex">${exMark(g[5])}</div><p class="how">怎麼認：${esc(g[6])}</p></div>`;});
  $("#glossGrid").innerHTML=html||'<p class="muted">找不到這個術語，換個關鍵字試試。</p>';}
$("#glossQ").addEventListener("input",renderGloss);
$("#glossN").textContent=GLOSS.length;
renderGloss();applyNB();

/* ---------- boot ---------- */
renderStrip();renderPlan();renderGrammar();renderRC();renderVocab();
const h=(location.hash||"").slice(1);
if(/^g-\d+$/.test(h))openChap(+h.slice(2));
else if(/^r-\d+$/.test(h))openRC(+h.slice(2));
else show(VIEWS.includes(h)?h:(S.view||"quest"));
const first=$("#g-1");if(first)first.open=true;
const rfirst=$("#r-1");if(rfirst)rfirst.open=true;
return { show, topScroll, state: () => S, save, onSave: f => HOOKS.push(f), onShow: f => SHOW_HOOKS.push(f),
  DAYS, PHASES, WORLDS, TASKS, isBoss, dayDone, todayIndex, dateOf, dayRows, handleDayClick, renderPlan, renderStrip,
  P5, SETS, G, RC, VOCAB, pad, esc };
}
