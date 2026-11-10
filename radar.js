// Radar Tributário: lê data/normas.json (gerado pela automação). Todo texto é escapado.
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
try{if(JSON.parse(localStorage.getItem('tributa:theme'))==='dark')document.documentElement.dataset.theme='dark'}catch{}
const ST={identificada:'Identificada automaticamente',aguardando_analise:'Aguardando análise',em_revisao:'Em revisão',revisada:'Revisada',publicada:'Publicada',rejeitada:'Rejeitada',atualizada_posteriormente:'Atualizada posteriormente'};
const fmt=d=>d?new Date(d).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'–';
let all=[];
function fill(id,vals,lab){const s=$(id);[...new Set(vals)].sort().forEach(v=>s.insertAdjacentHTML('beforeend',`<option value="${esc(v)}">${esc(lab?lab[v]||v:v)}</option>`))}
function li(a){return Array.isArray(a)&&a.length?'<ul>'+a.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':'<p>não identificado</p>'}
function render(){const q=$('q').value.toLowerCase(),t=$('fTipo').value,o=$('fOrgao').value,s=$('fStatus').value;
 const rows=all.filter(n=>n.status!=='rejeitada'&&(!t||n.tipo===t)&&(!o||n.orgao===o)&&(!s||n.status===s)&&JSON.stringify(n).toLowerCase().includes(q)).sort((a,b)=>b.atualizado_em.localeCompare(a.atualizado_em));
 $('list').innerHTML=rows.map(n=>{const r=n.resumo_ia,ok=['revisada','publicada'].includes(n.status),recent=Date.now()-new Date(n.atualizado_em)<7*864e5;
 return `<details id="${esc(n.id)}"><summary>${recent?`<span class="badge ${n.status==='atualizada_posteriormente'?'chg':'new'}">${n.status==='atualizada_posteriormente'?'ALTERADA':'NOVA'}</span>`:''}<span class="badge">${esc(ST[n.status]||n.status)}</span>${esc(n.titulo)}</summary>
 <p class="meta">${esc(n.tipo)} · ${esc(n.orgao)} · publicação: ${esc(n.publicado_em||'não informada')} · verificada em ${fmt(n.verificado_em)}</p>
 ${ok?'':'<p class="warn">Conteúdo automatizado e pendente de revisão humana.</p>'}
 ${r?`<h4>Resumo simples</h4><p>${esc(r.resumo_simples)}</p><h4>O que mudou</h4><p>${esc(r.o_que_mudou)}</p><h4>Dispositivos citados</h4>${li(r.dispositivos_citados)}<h4>Quem pode ser afetado</h4><p>${esc(r.afetados)}</p><h4>Prazos e vigência</h4><p>${esc(r.prazos_vigencia)}</p><h4>Conferir manualmente</h4>${li(r.pontos_para_conferencia)}`:'<p>Resumo ainda não gerado.</p>'}
 <h4>Histórico</h4><ul class="hist">${n.historico.map(h=>`<li>${fmt(h.em)} · ${esc(h.evento)}</li>`).join('')}</ul>
 ${/^https:\/\//.test(n.url)?`<p><a href="${esc(n.url)}" target="_blank" rel="noopener">Documento oficial ↗</a></p>`:''}</details>`}).join('')||'<p class="empty-state">Nenhuma publicação encontrada. Se a automação ainda não rodou, o Radar estará vazio.</p>'}
fetch('data/normas.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{all=d.itens;
 $('last').textContent=d.ultima_verificacao?`Última verificação: ${fmt(d.ultima_verificacao)} · ${all.length} norma(s) monitorada(s)`:'A automação ainda não foi executada.';
 fill('fTipo',all.map(n=>n.tipo));fill('fOrgao',all.map(n=>n.orgao));fill('fStatus',all.map(n=>n.status),ST);render();
 if(location.hash){const e=$(location.hash.slice(1));if(e){e.open=true;e.scrollIntoView()}}}).catch(()=>{$('last').textContent='Não foi possível carregar os dados do Radar.'});
['q','fTipo','fOrgao','fStatus'].forEach(i=>$(i).addEventListener('input',render));
