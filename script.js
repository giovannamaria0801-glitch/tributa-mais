const money = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number.isFinite(n)?n:0);
const pct = n => `${n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

// Mobile navigation
const menuToggle=document.getElementById('menuToggle'), mainNav=document.getElementById('mainNav');
menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰'});
mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.textContent='☰'}));

// Concept explainers
const topics={
 ibs:{title:'IBS — Imposto sobre Bens e Serviços',text:'O IBS é um tributo de competência compartilhada entre Estados, Distrito Federal e Municípios. Integra o modelo de IVA dual criado pela Reforma Tributária. Sua disciplina busca uma incidência ampla sobre operações com bens e serviços, observadas as imunidades, hipóteses de não incidência e regimes previstos na Constituição e na legislação complementar.',ref:'Fundamentação principal: Constituição Federal, arts. 156-A e 149-B, com redação da EC nº 132/2023; Lei Complementar nº 214/2025 e alterações.'},
 cbs:{title:'CBS — Contribuição sobre Bens e Serviços',text:'A CBS é uma contribuição federal incidente sobre operações com bens e serviços. Junto com o IBS, compõe o IVA dual brasileiro. Embora compartilhe características estruturais com o IBS, a CBS é tributo distinto, de competência da União, e sua administração cabe à Receita Federal do Brasil.',ref:'Fundamentação principal: Constituição Federal, art. 195, V, com redação da EC nº 132/2023; Lei Complementar nº 214/2025 e alterações.'},
 is:{title:'IS — Imposto Seletivo',text:'O Imposto Seletivo é de competência da União e incide sobre produção, extração, comercialização ou importação de bens e serviços prejudiciais à saúde ou ao meio ambiente, nos termos da lei. É conhecido como imposto seletivo ou extrafiscal, pois também busca desestimular determinados consumos ou atividades.',ref:'Fundamentação principal: Constituição Federal, art. 153, VIII, com redação da EC nº 132/2023; Lei Complementar nº 214/2025 e alterações.'}
};
const dialog=document.getElementById('topicDialog');
document.querySelectorAll('.explain-btn').forEach(btn=>btn.addEventListener('click',()=>{const t=topics[btn.dataset.topic];document.getElementById('dialogTitle').textContent=t.title;document.getElementById('dialogText').textContent=t.text;document.getElementById('dialogRef').textContent=t.ref;dialog.showModal()}));
document.getElementById('closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

// Scenario calculator: purely illustrative arithmetic, no tax determination.
const base=document.getElementById('baseValue'), ibs=document.getElementById('ibsRate'), cbs=document.getElementById('cbsRate');
function updateSim(){
 const b=Math.max(0,Number(base.value)||0), i=Math.max(0,Number(ibs.value)||0), c=Math.max(0,Number(cbs.value)||0);
 const ia=b*i/100, ca=b*c/100, total=ia+ca, sum=i+c;
 document.getElementById('ibsOutput').textContent=pct(i);document.getElementById('cbsOutput').textContent=pct(c);
 document.getElementById('totalTax').textContent=money(total);document.getElementById('ibsAmount').textContent=money(ia);document.getElementById('cbsAmount').textContent=money(ca);
 document.getElementById('combinedRate').textContent=pct(sum);document.getElementById('grossValue').textContent=money(b+total);
 const denom=total||1;document.getElementById('ibsBar').style.width=`${ia/denom*100}%`;document.getElementById('cbsBar').style.width=`${ca/denom*100}%`;
}
[base,ibs,cbs].forEach(el=>el.addEventListener('input',updateSim));
document.getElementById('resetSim').addEventListener('click',()=>{base.value=1000;ibs.value=17;cbs.value=8;updateSim()});updateSim();

// Timeline content. Verify applicable dates and legal changes before republishing updates.
const timeline={
 '2026':{tag:'ANO DE TESTE',title:'Início da fase de teste',text:'Começa a etapa inicial de teste da CBS e do IBS, com alíquotas de referência de 0,9% e 0,1%, respectivamente, observadas as regras legais e as condições de cumprimento das obrigações acessórias.',foot:'Atenção às orientações oficiais sobre documentos fiscais e obrigações acessórias.'},
 '2027':{tag:'INÍCIO DA COBRANÇA DA CBS',title:'PIS e Cofins são extintos; começa a nova etapa',text:'Começa a cobrança da CBS com a alíquota aplicável ao novo sistema, reduzida em 0,1 ponto percentual nos termos da regra de transição. O IBS permanece com alíquota de 0,1% em 2027 e 2028. PIS e Cofins são extintos, o Imposto Seletivo é instituído e as alíquotas do IPI são reduzidas a zero em regra, ressalvadas as hipóteses ligadas à Zona Franca de Manaus.',foot:'Atenção: a CBS não deve ser descrita simplesmente como “alíquota cheia” nesta etapa; confira as regras de transição e regulamentação.'},
 '2028':{tag:'CONTINUIDADE DA TRANSIÇÃO',title:'Segundo ano de IBS a 0,1%',text:'Continua a cobrança da CBS com a redução transitória de 0,1 ponto percentual e do IBS à alíquota de 0,1%. Segue a adaptação dos contribuintes, dos documentos fiscais e dos sistemas ao novo modelo.',foot:'O período prepara o início da transição gradual de ICMS e ISS para o IBS, em 2029.'},
 '2029':{tag:'TRANSIÇÃO SUBNACIONAL',title:'Início da substituição gradual de ICMS e ISS',text:'Começa a redução gradual das alíquotas de ICMS e ISS, simultaneamente ao aumento gradual da participação do IBS, conforme os percentuais e regras constitucionais.',foot:'A substituição é progressiva: não significa extinção integral de ICMS e ISS em 2029.'},
 '2030':{tag:'TRANSIÇÃO SUBNACIONAL',title:'Segundo ano da redução gradual',text:'Prossegue a transição dos tributos estaduais e municipais para o IBS, com avanço gradual dos percentuais previstos no ADCT.',foot:'Acompanhe a legislação e as regras de distribuição e compensação durante a transição.'},
 '2031':{tag:'TRANSIÇÃO SUBNACIONAL',title:'Terceiro ano da redução gradual',text:'Continua a redução gradual de ICMS e ISS e o avanço do IBS, conforme o cronograma constitucional.',foot:'Atenção à convivência entre os sistemas antigo e novo.'},
 '2032':{tag:'ÚLTIMO ANO DA TRANSIÇÃO GRADUAL',title:'Etapa final de convivência',text:'A transição gradual de ICMS e ISS chega à sua última etapa antes da vigência integral do novo modelo em 2033.',foot:'Planejamento de sistemas, contratos e processos segue relevante até a conclusão da transição.'},
 '2033':{tag:'NOVO MODELO INTEGRAL',title:'Vigência integral do novo sistema',text:'O IBS passa a operar integralmente, e ICMS e ISS são extintos, concluindo a transição prevista para a tributação do consumo.',foot:'A implementação concreta continua sujeita à legislação vigente e às regras aplicáveis a cada operação.'}
};
document.querySelectorAll('.year-tab').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.year-tab').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
 btn.classList.add('active');btn.setAttribute('aria-selected','true');
 const d=timeline[btn.dataset.year];document.getElementById('timelineYear').textContent=btn.dataset.year;document.getElementById('timelineTag').textContent=d.tag;document.getElementById('timelineTitle').textContent=d.title;document.getElementById('timelineText').textContent=d.text;document.getElementById('timelineFoot').textContent=d.foot;
}));

// Plain-language glossary
const terms=[
 ['Alíquota','Percentual ou valor específico utilizado para calcular o tributo sobre uma base de cálculo.'],
 ['Base de cálculo','Grandeza econômica sobre a qual a alíquota é aplicada para encontrar o valor do tributo.'],
 ['Crédito tributário (não cumulatividade)','No contexto do IBS e da CBS, mecanismo que permite, observadas as regras legais, apropriar créditos relativos a aquisições para compensação com débitos.'],
 ['IVA dual','Modelo de Imposto sobre Valor Agregado composto por dois tributos: CBS (federal) e IBS (estadual e municipal).'],
 ['Não cumulatividade','Técnica destinada a evitar que o tributo se acumule em cascata ao longo da cadeia, por meio do sistema de débitos e créditos previsto em lei.'],
 ['Princípio do destino','Diretriz pela qual a receita do tributo é atribuída ao local de consumo/destino, conforme as regras constitucionais e legais.'],
 ['Regime específico','Conjunto de regras próprias de incidência, apuração ou recolhimento para determinados setores ou operações, definido em lei.'],
 ['Regime diferenciado','Tratamento tributário específico previsto na Constituição e na legislação, como reduções de alíquotas em hipóteses determinadas.'],
 ['Split payment','Mecanismo de recolhimento em que, no pagamento da operação, a parcela correspondente ao tributo pode ser segregada e recolhida ao Fisco, conforme disciplina legal e operacional.'],
 ['Tributação “por fora”','Forma de cálculo em que o tributo não integra sua própria base de cálculo, observadas as regras aplicáveis.'],
 ['Fato gerador','Situação definida em lei cuja ocorrência faz nascer a obrigação tributária.'],
 ['Imunidade','Limitação constitucional à competência tributária, que impede a instituição de impostos em determinadas situações ou sobre determinados sujeitos/objetos, nos termos da Constituição.']
];
const glossaryGrid=document.getElementById('glossaryGrid');
function renderTerms(filter=''){const matches=terms.filter(([t,d])=>(t+' '+d).toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR')));glossaryGrid.innerHTML=matches.map(([t,d])=>`<article class="glossary-item"><h3>${t}</h3><p>${d}</p></article>`).join('');document.getElementById('glossaryEmpty').hidden=matches.length>0}
document.getElementById('glossarySearch').addEventListener('input',e=>renderTerms(e.target.value.trim()));renderTerms();

// Knowledge quiz
const questions=[
 {q:'O que significa a sigla IBS?',a:['Imposto Brasileiro sobre Serviços','Imposto sobre Bens e Serviços','Imposto Básico sobre Saídas','Índice de Base Setorial'],c:1,e:'IBS significa Imposto sobre Bens e Serviços. É de competência compartilhada entre Estados, Distrito Federal e Municípios.'},
 {q:'Qual tributo é de competência da União?',a:['IBS','ISS','CBS','ICMS'],c:2,e:'A CBS é uma contribuição federal. O IBS é de competência compartilhada entre Estados, Distrito Federal e Municípios.'},
 {q:'Qual é a principal característica do IVA dual brasileiro?',a:['Um único tributo municipal','CBS federal e IBS subnacional','Extinção imediata de todos os tributos','Cobrança apenas na indústria'],c:1,e:'O IVA é dual porque combina a CBS, de competência federal, e o IBS, de competência compartilhada entre Estados, DF e Municípios.'},
 {q:'Em qual ano está previsto o início da transição de ICMS e ISS para o IBS?',a:['2026','2027','2029','2033'],c:2,e:'A transição gradual de ICMS e ISS para o IBS começa em 2029 e avança até 2032. O novo modelo passa a vigorar integralmente em 2033.'},
 {q:'O que expressa, em linhas gerais, a tributação no destino?',a:['A receita é direcionada ao local de consumo, conforme as regras legais','O tributo é sempre devido no endereço do fornecedor','A operação deixa de ser tributada','A alíquota é escolhida livremente pelo consumidor'],c:0,e:'A tributação no destino direciona a receita ao local de consumo/destino, segundo os critérios constitucionais e legais.'},
 {q:'O simulador desta plataforma calcula o tributo devido em uma operação real?',a:['Sim, substitui o cálculo fiscal','Sim, se o valor for informado corretamente','Não. Apenas demonstra cenários matemáticos ilustrativos','Sim, desde que seja uma venda nacional'],c:2,e:'Não. O simulador é educativo e simplificado. Não considera todas as regras legais, regimes, créditos, local da operação ou obrigações acessórias.'}
];
let qIndex=0,score=0,answered=false;
const questionText=document.getElementById('questionText'),answers=document.getElementById('answers'),feedback=document.getElementById('feedback'),next=document.getElementById('nextQuestion');
function loadQuestion(){answered=false;const q=questions[qIndex];document.getElementById('questionCounter').textContent=`PERGUNTA ${String(qIndex+1).padStart(2,'0')} DE ${String(questions.length).padStart(2,'0')}`;document.getElementById('scoreLabel').textContent=`${score} ${score===1?'ponto':'pontos'}`;document.getElementById('quizProgress').style.width=`${(qIndex+1)/questions.length*100}%`;questionText.textContent=q.q;answers.innerHTML='';feedback.hidden=true;next.disabled=true;next.textContent=qIndex===questions.length-1?'Ver resultado →':'Próxima pergunta →';q.a.forEach((answer,i)=>{const b=document.createElement('button');b.className='answer-option';b.textContent=answer;b.addEventListener('click',()=>chooseAnswer(i));answers.appendChild(b)})}
function chooseAnswer(choice){if(answered)return;answered=true;const q=questions[qIndex];const buttons=[...answers.children];buttons.forEach((b,i)=>{b.disabled=true;if(i===q.c)b.classList.add('correct');if(i===choice&&choice!==q.c)b.classList.add('wrong')});if(choice===q.c)score++;document.getElementById('scoreLabel').textContent=`${score} ${score===1?'ponto':'pontos'}`;feedback.hidden=false;feedback.textContent=(choice===q.c?'✓ Resposta correta! ':'✕ Não foi dessa vez. ')+q.e;next.disabled=false}
next.addEventListener('click',()=>{if(!answered)return;if(qIndex<questions.length-1){qIndex++;loadQuestion()}else{showResult()}});
function showResult(){const box=document.getElementById('quizBox');const percent=Math.round(score/questions.length*100);let msg=percent>=80?'Mandou muito bem! Você já tem uma ótima base.':percent>=50?'Bom começo! Continue explorando os módulos.':'Toda jornada começa pelo aprendizado. Que tal revisar os conceitos?';saveQuiz(percent);box.innerHTML=`<div class="quiz-top"><span>SEU RESULTADO</span><span>${score}/${questions.length} PONTOS</span></div><div class="result-total" style="color:#7654d6">${percent}%</div><h3>${msg}</h3><p style="font-size:11px;color:#77758a;line-height:1.8">Você concluiu o Desafio Tributário do TRIBUTA+. Explore os conteúdos e tente novamente para melhorar sua pontuação.</p><button class="button button-primary" id="retryQuiz">Refazer desafio ↻</button>`;document.getElementById('retryQuiz').addEventListener('click',()=>{qIndex=0;score=0;loadQuestion()})}
loadQuestion();

// ===== v2 =====
// Safe localStorage helpers (storage can be blocked).
const store={get(k,d){try{return JSON.parse(localStorage.getItem('tributa:'+k))??d}catch{return d}},set(k,v){try{localStorage.setItem('tributa:'+k,JSON.stringify(v))}catch{}}};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $=id=>document.getElementById(id);
const today=()=>new Date().toLocaleDateString('pt-BR');

// Theme
const applyTheme=t=>document.documentElement.dataset.theme=t;applyTheme(store.get('theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
$('themeBtn').addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(t);store.set('theme',t)});

// Quiz history
function saveQuiz(p){const h=store.get('quiz',[]);h.push({p,d:today()});store.set('quiz',h.slice(-20));renderDash()}

// Lessons (content mirrors the timeline/glossary above; check sources before republishing)
const lessons=[
 {id:'l1',lvl:'Iniciante',t:'O que é o IVA dual?',x:'O novo modelo combina a CBS (federal) e o IBS (Estados, DF e Municípios), com regras estruturais parecidas, mas tributos e administrações distintos.',r:'EC 132/2023; LC 214/2025',q:'Qual tributo do IVA dual é federal?',o:['IBS','CBS'],c:1},
 {id:'l2',lvl:'Iniciante',t:'Quem o novo sistema substitui?',x:'ICMS e ISS serão substituídos gradualmente pelo IBS; PIS e Cofins pela CBS. O IPI é reduzido a zero em regra, com ressalvas ligadas à Zona Franca de Manaus.',r:'EC 132/2023; LC 214/2025',q:'O ISS será substituído por qual tributo?',o:['IBS','Imposto Seletivo'],c:0},
 {id:'l3',lvl:'Intermediário',t:'Não cumulatividade',x:'Técnica para evitar tributo “em cascata”: nas aquisições, o contribuinte pode apropriar créditos para compensar débitos, conforme as regras legais.',r:'LC 214/2025',q:'A não cumulatividade busca evitar…',o:['Tributação em cascata','Qualquer tributação'],c:0},
 {id:'l4',lvl:'Intermediário',t:'Tributação no destino',x:'Em linhas gerais, a receita é direcionada ao local de consumo, segundo critérios constitucionais e legais.',r:'EC 132/2023; LC 214/2025',q:'A receita é direcionada, em regra, ao local de…',o:['Consumo','Produção'],c:0},
 {id:'l5',lvl:'Avançado',t:'Transição 2026–2033',x:'2026 é ano de teste; 2027 inicia a CBS; 2029–2032 reduz gradualmente ICMS e ISS com avanço do IBS; 2033 é a vigência integral. Detalhes: linha do tempo acima.',r:'EC 132/2023 (ADCT); LC 214/2025',q:'Em que ano começa a transição gradual de ICMS e ISS?',o:['2027','2029'],c:1},
 {id:'l6',lvl:'Avançado',t:'Limites de uma simulação',x:'Simulações percentuais ignoram regimes específicos, reduções, créditos reais, local da operação e obrigações acessórias. Servem para aprender, não para apurar.',r:'Nota metodológica',q:'O simulador substitui a apuração fiscal?',o:['Sim','Não'],c:1}
];
function renderLessons(){const done=store.get('done',[]);$('lessons').innerHTML=lessons.map(l=>`<article class="lesson${done.includes(l.id)?' done':''}" data-id="${l.id}"><span class="lvl">${l.lvl.toUpperCase()}${done.includes(l.id)?' · ✓ CONCLUÍDA':''}</span><h3>${esc(l.t)}</h3><p>${esc(l.x)}</p><p class="ref">Base: ${esc(l.r)}</p><strong>${esc(l.q)}</strong>${l.o.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}<small class="msg" aria-live="polite"></small></article>`).join('');
 $('lessons').querySelectorAll('.lesson').forEach(card=>{const l=lessons.find(x=>x.id===card.dataset.id);card.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const ok=+b.dataset.i===l.c;b.classList.add(ok?'ok':'no');card.querySelector('.msg').textContent=ok?'Correto! Aula concluída.':'Tente de novo.';if(ok){const d=store.get('done',[]);if(!d.includes(l.id)){d.push(l.id);store.set('done',d)}renderDash();setTimeout(renderLessons,700)}}))})}

// Dashboard
let updates=[];
function renderDash(){const d=store.get('done',[]);$('dProg').textContent=Math.round(d.length/lessons.length*100)+'%';const q=store.get('quiz',[]);$('dQuiz').textContent=q.length?Math.max(...q.map(x=>x.p))+'%':'–';const last=updates.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];$('dUpd').textContent=last?last.date.split('-').reverse().join('/'):'–';const nx=lessons.find(l=>!d.includes(l.id));$('dNext').textContent=nx?'Próxima: '+nx.t+' →':'Trilha concluída ✓'}

// Advanced simulator
const ops={mercadoria:['Compra de mercadorias','Tributos atuais mais relevantes: ICMS, PIS/Cofins e, conforme o caso, IPI.'],servico:['Prestação de serviços','Tributos atuais mais relevantes: ISS e PIS/Cofins.'],b2b:['Operação entre empresas','Em operações B2B, a não cumulatividade permite créditos sobre aquisições, nos termos da lei; informe-os nos campos de crédito.'],insumo:['Aquisição de insumos','O adquirente pode ter direito a crédito sobre a aquisição, conforme as regras legais.'],consumidor:['Consumidor final','O consumidor final não apropria créditos: deixe os campos de crédito em zero.']};
$('opType').innerHTML=Object.entries(ops).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('');
const nv=id=>Math.max(0,Number($(id).value)||0);
function drawCmp(){$('opNote').textContent='ⓘ '+ops[$('opType').value][1];
 const v=nv('opValue'),oldT=Math.max(0,v*nv('oldRate')/100-nv('oldCred')),ib=v*nv('nIbs')/100,cb=v*nv('nCbs')/100,newT=Math.max(0,ib+cb-nv('nCred'));
 $('rOld').textContent=money(oldT);$('rNew').textContent=money(newT);const df=newT-oldT;$('rDiff').textContent=`Diferença hipotética: ${df>=0?'+':'−'}${money(Math.abs(df))} (${df>=0?'maior':'menor'} no cenário novo, apenas com os parâmetros informados).`;
 const mx=Math.max(oldT,ib+cb,1),H=130,hh=x=>x/mx*H;let s='';
 s+=`<rect x="50" y="${150-hh(oldT)}" width="90" height="${hh(oldT)}" rx="6" fill="#f4a66a"/>`;
 s+=`<rect x="180" y="${150-hh(ib)}" width="90" height="${hh(ib)}" rx="6" fill="#7654d6"/><rect x="180" y="${150-hh(ib)-hh(cb)}" width="90" height="${hh(cb)}" rx="6" fill="#a78bfa"/>`;
 s+=`<text x="95" y="172" text-anchor="middle" font-size="11" fill="currentColor">Atual</text><text x="225" y="172" text-anchor="middle" font-size="11" fill="currentColor">IBS + CBS</text><text x="225" y="${Math.max(12,142-hh(ib)-hh(cb))}" text-anchor="middle" font-size="10" fill="currentColor">bruto s/ créditos</text>`;
 $('cmpChart').innerHTML=s}
['opType','opValue','oldRate','oldCred','nIbs','nCbs','nCred'].forEach(id=>$(id).addEventListener('input',drawCmp));drawCmp();

// Comparator
const cmpRows=[['ICMS','Estados e DF','Substituído gradualmente pelo IBS (2029–2032); extinto em 2033',0],['ISS','Municípios e DF','Substituído gradualmente pelo IBS (2029–2032); extinto em 2033',0],['PIS e Cofins','União','Extintos em 2027; substituídos pela CBS',0],['IPI','União','Alíquotas reduzidas a zero em regra, ressalvada a Zona Franca de Manaus',0],['IBS','Estados, DF e Municípios (compartilhada)','Teste em 2026; transição até 2033',1],['CBS','União','Teste em 2026; cobrança a partir de 2027',1],['Imposto Seletivo','União','Instituído em 2027; incide sobre bens e serviços prejudiciais à saúde ou ao meio ambiente',1]];
$('cmpBody').innerHTML=cmpRows.map(r=>`<tr><td class="${r[3]?'new':''}">${r[0]}${r[3]?' (novo)':''}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');

// FAQ — short answers; each links to the official norm
const NORM='https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm',EC='https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm';
const faq=[['O que muda para as empresas?','Novos tributos (IBS e CBS) com não cumulatividade ampla, tributação no destino e período de transição. Adaptação de sistemas, documentos fiscais e processos é necessária.',NORM],['O que muda para o consumidor?','A mudança é gradual; o consumidor final não apropria créditos. Efeitos nos preços dependem de vários fatores e não são garantidos por este site.',EC],['O que acontece com o ICMS?','É substituído gradualmente pelo IBS entre 2029 e 2032 e extinto em 2033.',EC],['O que acontece com o ISS?','Mesma transição do ICMS: substituição gradual pelo IBS e extinção em 2033.',EC],['IBS e CBS são a mesma coisa?','Não. Têm lógica parecida (IVA dual), mas são tributos distintos: o IBS é de competência compartilhada entre Estados, DF e Municípios; a CBS é federal.',NORM],['Como funcionam os créditos?','Pela não cumulatividade, o contribuinte apropria créditos relativos a aquisições para compensar débitos, conforme as regras e condições da lei.',NORM],['O que é split payment?','Mecanismo em que, no pagamento, a parcela do tributo pode ser separada e direcionada ao Fisco, conforme disciplina legal e operacional.',NORM],['Quando a Reforma vale integralmente?','O modelo está previsto para vigorar integralmente em 2033, após a transição iniciada em 2026.',EC]];
$('faqList').innerHTML=faq.map(f=>`<details><summary>${f[0]}</summary><p>${f[1]}</p><p class="meta">Fundamentação e conferência: <a href="${f[2]}" target="_blank" rel="noopener">texto oficial ↗</a> · Conteúdo revisado em nov/2026</p></details>`).join('');

// Updates center: demonstrative entries (real milestones) + user-added ones
const baseUpd=[{date:'2023-12-20',title:'Emenda Constitucional nº 132',cat:'Ato normativo',sum:'Reforma do Sistema Tributário Nacional sobre o consumo.',link:EC,demo:1},{date:'2025-01-16',title:'Lei Complementar nº 214',cat:'Lei complementar',sum:'Institui IBS, CBS e Imposto Seletivo.',link:NORM,demo:1},{date:'2026-01-13',title:'Lei Complementar nº 227',cat:'Lei complementar',sum:'Disciplina, entre outros pontos, a administração e a governança do IBS.',link:'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp227.htm',demo:1}];
function renderUpd(){updates=[...baseUpd,...store.get('upd',[])];const f=$('updFilter').value.toLowerCase();$('updList').innerHTML=updates.filter(u=>(u.title+u.cat+u.sum).toLowerCase().includes(f)).sort((a,b)=>b.date.localeCompare(a.date)).map(u=>`<details><summary>${u.date.split('-').reverse().join('/')} · ${esc(u.title)} <small>[${esc(u.cat)}]${u.demo?' · demonstrativo':''}</small></summary><p>${esc(u.sum)}</p><p class="meta"><a href="${esc(u.link)}" target="_blank" rel="noopener">Fonte oficial ↗</a></p></details>`).join('')||'<p class="empty-state">Nada encontrado.</p>';renderDash()}
$('updFilter').addEventListener('input',renderUpd);
$('uAdd').addEventListener('click',()=>{const u={date:$('uDate').value,title:$('uTitle').value.trim(),cat:$('uCat').value,sum:$('uSum').value.trim(),link:$('uLink').value.trim()};if(!u.date||!u.title||!u.sum||!/^https:\/\//.test(u.link)){$('uMsg').textContent='Preencha todos os campos; o link deve começar com https://';return}const l=store.get('upd',[]);l.push(u);store.set('upd',l);['uTitle','uSum','uLink'].forEach(i=>$(i).value='');$('uMsg').textContent='Adicionado (salvo neste navegador).';renderUpd()});
renderLessons();renderUpd();
