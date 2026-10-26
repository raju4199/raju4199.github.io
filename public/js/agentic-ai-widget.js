(function(){
var NS='http://www.w3.org/2000/svg';
var ICONS={
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
 hood:'<path d="M12 3c-5 0-8 4-8 9v9h16v-9c0-5-3-9-8-9z"/><path d="M9 13h.01M15 13h.01M9 17h6"/>',
 app:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 logs:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
 chip:'<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
 loop:'<path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5"/>',
 doc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>',
 db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
 plug:'<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 robot:'<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/><circle cx="12" cy="3" r="1"/>'
};
var zones=[
 {x:20,y:120,w:170,h:560,t:'User side'},
 {x:210,y:120,w:200,h:560,t:'App layer'},
 {x:430,y:120,w:360,h:560,t:'Agent core'},
 {x:810,y:120,w:200,h:560,t:'Tools (MCP)'},
 {x:1030,y:120,w:195,h:560,t:'Data & external'}
];
var nodes=[
 {id:'user',x:35,y:200,w:140,h:90,i:'user',t:'User',s:'types a prompt',k:'actor'},
 {id:'atk',x:35,y:540,w:140,h:90,i:'hood',t:'Attacker',s:'bad input',k:'threat'},
 {id:'app',x:230,y:200,w:160,h:90,i:'app',t:'AI app / chat UI',s:'web, Slack, copilot',k:'app'},
 {id:'gw',x:230,y:360,w:160,h:90,i:'shield',t:'AI gateway',s:'input + output scan',k:'sec'},
 {id:'logs',x:230,y:540,w:160,h:90,i:'logs',t:'Logs & monitoring',s:'audit every step',k:'sec'},
 {id:'llm',x:520,y:20,w:180,h:80,i:'chip',t:'LLM',s:'Claude, GPT, Gemini',k:'model'},
 {id:'orch',x:530,y:200,w:160,h:90,i:'loop',t:'Agent orchestrator',s:'runs the tool loop',k:'agent'},
 {id:'sys',x:450,y:360,w:150,h:90,i:'doc',t:'System prompt',s:'rules + tool list',k:'agent'},
 {id:'rag',x:620,y:360,w:150,h:90,i:'db',t:'Memory / RAG',s:'vector DB, history',k:'agent'},
 {id:'idn',x:530,y:540,w:160,h:90,i:'key',t:'Agent identity',s:'tokens, permissions',k:'sec'},
 {id:'t1',x:820,y:170,w:170,h:70,i:'plug',t:'Mail tool',s:'read_inbox()',k:'tool'},
 {id:'t2',x:820,y:270,w:170,h:70,i:'plug',t:'SQL tool',s:'run_query()',k:'tool'},
 {id:'t3',x:820,y:370,w:170,h:70,i:'plug',t:'Web fetch tool',s:'fetch_url()',k:'tool'},
 {id:'t4',x:820,y:470,w:170,h:70,i:'plug',t:'A2A client',s:'call_agent()',k:'tool'},
 {id:'d1',x:1040,y:170,w:170,h:70,i:'mail',t:'SaaS apps',s:'Slack, Drive, Gmail',k:'data'},
 {id:'d2',x:1040,y:270,w:170,h:70,i:'db',t:'Company DB',s:'customers, orders',k:'data'},
 {id:'d3',x:1040,y:370,w:170,h:70,i:'globe',t:'Internet',s:'any web page',k:'data'},
 {id:'d4',x:1040,y:470,w:170,h:70,i:'robot',t:'Partner agents',s:'other companies',k:'data'}
];
var edges=[
 {d:'M175 235 L228 235',c:'flow',st:[1]},
 {d:'M290 290 L290 358',c:'flow',st:[2]},
 {d:'M390 380 L415 380 L415 250 L528 250',c:'flow',st:[2]},
 {d:'M560 292 L560 358',c:'flow',st:[3],both:1},
 {d:'M650 292 L650 358',c:'flow',st:[3],both:1},
 {d:'M590 198 L590 102',c:'flow',st:[4,8]},
 {d:'M630 102 L630 198',c:'ret',st:[5]},
 {d:'M690 245 L800 245',c:'flow',st:[6]},
 {d:'M800 205 L800 505',c:'flow',st:[6],noarrow:1},
 {d:'M800 205 L818 205',c:'flow',st:[6]},
 {d:'M800 305 L818 305',c:'flow',st:[6]},
 {d:'M800 405 L818 405',c:'flow',st:[6]},
 {d:'M800 505 L818 505',c:'flow',st:[6]},
 {d:'M990 205 L1038 205',c:'flow',st:[7],both:1},
 {d:'M990 305 L1038 305',c:'flow',st:[7],both:1},
 {d:'M990 405 L1038 405',c:'flow',st:[7],both:1},
 {d:'M990 505 L1038 505',c:'flow',st:[7],both:1},
 {d:'M800 275 L692 275',c:'ret',st:[8]},
 {d:'M530 280 L425 280 L425 420 L392 420',c:'ret',st:[9]},
 {d:'M330 360 L330 292',c:'ret',st:[9]},
 {d:'M230 265 L177 265',c:'ret',st:[9]},
 {d:'M310 450 L310 538',c:'aux',st:[9]},
 {d:'M610 538 L610 292',c:'aux',st:[6]},
 {d:'M175 585 L200 585 L200 430 L228 430',c:'threat',st:[1,2]},
 {d:'M105 630 L105 730 L1125 730 L1125 542',c:'threat',st:[7,8]}
];
var badges=[[1,202,235],[2,290,325],[9,330,325],[3,560,325],[4,590,150],[5,630,150],[6,725,245],[7,1014,205],[8,745,275]];
var rb=[['R1',200,505,[1,2]],['R2',450,360,[3]],['R3',770,360,[3]],['R4',700,20,[4]],['R10',520,20,[4,8]],['R5',770,245,[6]],['R11',690,540,[6]],['R6',990,170,[6]],['R8',1210,470,[7]],['R7',620,730,[7,8]],['R9',475,280,[9]]];
var stepNodes={1:['user','app','atk'],2:['app','gw','orch','atk'],3:['orch','sys','rag'],4:['orch','llm'],5:['llm','orch'],6:['orch','t1','t2','t3','t4','idn'],7:['t1','t2','t3','t4','d1','d2','d3','d4','atk'],8:['orch','llm','atk'],9:['orch','gw','app','user','logs']};

var steps=[
 {n:1,t:'User sends a prompt',p:'The user types a request in the app. The app attaches the user\'s identity (login session) so the agent knows whose behalf to act on.'},
 {n:2,t:'Gateway scans the input',p:'The AI gateway checks the prompt for jailbreaks, prompt injection, PII, or blocked topics. If clean, the request reaches the agent orchestrator. Otherwise it is blocked or flagged.'},
 {n:3,t:'Context is assembled',p:'The orchestrator builds a full prompt: system instructions (rules + allowed tools), past chat memory, and relevant documents from RAG (vector DB search). This is what the LLM will actually see.'},
 {n:4,t:'LLM is called',p:'The complete context and tool definitions (name, description, input schema) are sent to the LLM API. This can be a hosted model or a self-hosted one.'},
 {n:5,t:'LLM requests a tool call',p:'Instead of answering directly, the LLM returns a tool_use block - for example read_inbox(query="complaint", limit=5). The LLM never executes anything itself; it only asks.'},
 {n:6,t:'Agent executes the tool',p:'The orchestrator checks that the tool is allowed, attaches the agent identity token, and calls the MCP server. Risky actions (sending email, deleting data) should require human approval here.'},
 {n:7,t:'Data comes back from external sources',p:'The MCP server fetches data from Gmail, a database, a web page, or a partner agent. This is outside-world data - and this is where an attacker plants hidden instructions.'},
 {n:8,t:'tool_result returns, loop continues',p:'Data goes back to the LLM as a tool_result. The LLM either requests the next tool (e.g. run_query for order status) or produces the final answer. Steps 4-8 repeat until the job is done.'},
 {n:9,t:'Final answer reaches the user',p:'The response passes through an output scan: PII leaks, secrets, toxic content, malicious links. Then the app shows it to the user. Every step is logged for audit.'}
];

function el(tag,attrs,html){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(html)e.innerHTML=html;return e;}
var svg=document.getElementById('aw-svg'),layer=document.getElementById('aw-layer'),defs=document.getElementById('aw-defs');
if(!svg||!layer||!defs)return;

var sym='';for(var k in ICONS)sym+='<symbol id="awi-'+k+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICONS[k]+'</symbol>';
['flow','ret','threat','aux'].forEach(function(c){
 sym+='<marker id="awm-'+c+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--aw-'+c+')"/></marker>';});
defs.innerHTML=sym;
zones.forEach(function(z){var g=el('g',{'class':'aw-zone'});g.appendChild(el('rect',{x:z.x,y:z.y,width:z.w,height:z.h,rx:8}));var t=el('text',{x:z.x+12,y:z.y+20});t.textContent=z.t;g.appendChild(t);layer.appendChild(g);});
var llmz=el('g',{'class':'aw-zone'});var lt=el('text',{x:712,y:44});lt.textContent='AI model (API)';llmz.appendChild(lt);layer.appendChild(llmz);
edges.forEach(function(e){var a={d:e.d,'class':'aw-edge e-'+e.c,'data-steps':e.st.join(' ')};if(!e.noarrow)a['marker-end']='url(#awm-'+e.c+')';if(e.both)a['marker-start']='url(#awm-'+e.c+')';layer.appendChild(el('path',a));});
var n1=el('text',{x:620,y:752,'class':'aw-note','text-anchor':'middle'});n1.textContent='Indirect injection: hidden instructions in emails, web pages, docs, agent replies';layer.appendChild(n1);
nodes.forEach(function(n){
 var g=el('g',{'class':'aw-node k-'+n.k,'data-id':n.id});
 g.appendChild(el('rect',{x:n.x,y:n.y,width:n.w,height:n.h,rx:6}));
 var t,s;
 if(n.h>=80){
  g.appendChild(el('use',{href:'#awi-'+n.i,x:n.x+n.w/2-12,y:n.y+12,width:24,height:24}));
  t=el('text',{x:n.x+n.w/2,y:n.y+(n.h>=90?57:56),'class':'nt','text-anchor':'middle'});
  s=el('text',{x:n.x+n.w/2,y:n.y+(n.h>=90?75:72),'class':'ns','text-anchor':'middle'});
 }else{
  g.appendChild(el('use',{href:'#awi-'+n.i,x:n.x+12,y:n.y+n.h/2-12,width:24,height:24}));
  t=el('text',{x:n.x+46,y:n.y+n.h/2-3,'class':'nt'});
  s=el('text',{x:n.x+46,y:n.y+n.h/2+15,'class':'ns'});
 }
 t.textContent=n.t;s.textContent=n.s;g.appendChild(t);g.appendChild(s);layer.appendChild(g);
});
badges.forEach(function(b){var g=el('g',{'class':'aw-badge','data-steps':String(b[0])});g.appendChild(el('circle',{cx:b[1],cy:b[2],r:11}));var t=el('text',{x:b[1],y:b[2]+4,'text-anchor':'middle'});t.textContent=b[0];g.appendChild(t);layer.appendChild(g);});
rb.forEach(function(r){var w=r[0].length>2?30:24;var g=el('g',{'class':'aw-rbadge','data-steps':r[3].join(' '),tabindex:0,role:'link','aria-label':'Risk '+r[0]});
 g.appendChild(el('rect',{x:r[1]-w/2,y:r[2]-10,width:w,height:20,rx:10}));var t=el('text',{x:r[1],y:r[2]+4,'text-anchor':'middle'});t.textContent=r[0];g.appendChild(t);
 function go(){jump(r[0]);}g.addEventListener('click',go);g.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go();}});layer.appendChild(g);});

function jump(id){var row=document.getElementById('row-'+id);if(!row)return;document.querySelectorAll('tr.aw-hit').forEach(function(r){r.classList.remove('aw-hit');});row.classList.add('aw-hit');row.scrollIntoView({behavior:'smooth',block:'center'});}

var info=document.getElementById('aw-info'),defInfo=info.innerHTML,bar=document.getElementById('aw-bar'),btns=[];
function show(n){
 btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.n===String(n)));});
 if(!n){svg.classList.remove('focus');info.innerHTML=defInfo;return;}
 svg.classList.add('focus');
 svg.querySelectorAll('[data-steps]').forEach(function(e){e.classList.toggle('on',e.getAttribute('data-steps').split(' ').indexOf(String(n))>-1);});
 svg.querySelectorAll('.aw-node').forEach(function(g){g.classList.toggle('on',stepNodes[n].indexOf(g.getAttribute('data-id'))>-1);});
 var s=steps[n-1];info.innerHTML='<b>Step '+n+': '+s.t+'.</b> '+s.p;
}
var all=document.createElement('button');all.type='button';all.textContent='All';all.dataset.n='0';all.setAttribute('aria-pressed','true');all.addEventListener('click',function(){show(0);});bar.appendChild(all);btns.push(all);
steps.forEach(function(s){var b=document.createElement('button');b.type='button';b.textContent=s.n;b.dataset.n=String(s.n);b.title=s.t;b.setAttribute('aria-pressed','false');b.addEventListener('click',function(){show(s.n);});bar.appendChild(b);btns.push(b);});

var scroll=document.querySelector('.aw-scroll');
if(scroll){
 var zd=document.createElement('div');zd.className='aw-zoom';
 var zl=document.createElement('label');zl.textContent='Zoom';
 var zr=document.createElement('input');zr.type='range';zr.min='50';zr.max='150';zr.value='100';zr.step='5';
 zr.setAttribute('aria-label','Diagram zoom');
 var zv=document.createElement('span');zv.textContent='100%';
 zd.appendChild(zl);zd.appendChild(zr);zd.appendChild(zv);bar.appendChild(zd);
 function applyZoom(v){
  var pct=parseInt(v,10);zv.textContent=pct+'%';
  if(pct<=100){svg.style.minWidth='';svg.style.width=pct+'%';}
  else{svg.style.width='100%';svg.style.minWidth=(980*(pct/100))+'px';}
 }
 zr.addEventListener('input',function(){applyZoom(zr.value);});
}
})();
