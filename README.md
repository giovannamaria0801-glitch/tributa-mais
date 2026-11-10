# TRIBUTA+ v2.0
Plataforma pública e gratuita de educação sobre a Reforma Tributária. HTML, CSS e JavaScript puro; sem backend, login ou serviços pagos.

## Novidades da v2
- Painel com progresso de aprendizagem, melhor resultado no quiz e última atualização cadastrada.
- Trilhas de aprendizagem (6 aulas, 3 níveis) com exercício e progresso salvo no localStorage.
- Simulador avançado: tipo de operação, créditos e gráfico comparando sistema atual (hipotético) x IBS + CBS. Todos os parâmetros são editáveis e ilustrativos.
- Comparador de tributos (antigos x novos), FAQ com link para a norma, Central de Atualizações com cadastro local.
- Modo claro/escuro; histórico local do quiz.

## Ainda não incluído
Certificado simbólico, banco ampliado de perguntas do quiz por categoria/nível e módulo de exemplos práticos dedicado.

## Publicar no GitHub Pages
1. Crie um repositório público (ex.: `tributa-mais`) e envie todos os arquivos desta pasta para a raiz.
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Acesse o endereço informado pelo GitHub.
Para rodar localmente, abra `index.html` no navegador.

## Avisos
- Conteúdo educativo; não é consultoria nem apuração fiscal.
- Os itens da Central de Atualizações são marcos normativos demonstrativos, sem integração automática. Confira sempre o texto vigente no Planalto, Ministério da Fazenda, Receita Federal e Comitê Gestor do IBS antes de divulgar.
- Revise datas e regras de transição a cada atualização legislativa.

## Radar Tributário (automação diária)
**Arquivos:** `radar/run.py` (motor, só Python padrão), `radar/test_radar.py`, `data/sources.json` (fontes), `data/normas.json` (publicações + histórico), `data/runs.json` (log das últimas 90 execuções), `data/cache/` (últimas versões dos textos, para comparar alterações), `.github/workflows/radar.yml`, `radar.html` + `radar.js`.

**Configurar (GitHub → Settings → Secrets and variables → Actions):**
- Secret `OPENAI_API_KEY`: sua chave (nunca no código nem no navegador).
- Variable `OPENAI_MODEL`: nome do modelo que sua conta usa. Sem os dois, o Radar roda **sem IA** (itens ficam "identificada automaticamente").
- Em Settings → Actions → General, permita "Read and write permissions" para o workflow gravar em `data/`.

**Execução:** todo dia às 08h (Brasília) e manual em Actions → Radar Tributário → Run workflow. Cada commit de dados republica o site na Vercel. O GitHub pode pausar agendamentos de repositórios públicos sem atividade por muito tempo: se isso acontecer, reative em Actions.

**Fontes:** hoje, as páginas oficiais da EC 132, LC 214 e LC 227 no Planalto (detecção de alteração por hash). Para feeds RSS/Atom oficiais, edite `data/sources.json` (exemplo desativado). DOU/INLABS, Receita, Fazenda, Comitê Gestor do IBS, Confaz e demais fontes ainda **não** têm adaptador: exigem verificar endpoint/termos de uso (o INLABS, por exemplo, exige credenciais). Cada novo tipo de fonte é uma função em `collect()`.

**Fluxo editorial:** a automação só define `identificada`, `aguardando_analise` e `atualizada_posteriormente`. Para `em_revisao`, `revisada`, `publicada` ou `rejeitada`, edite o campo `status` do item em `data/normas.json` (commit). Itens não revisados aparecem com aviso de conteúdo automatizado; `rejeitada` fica oculto no site, mas não é apagada. Normas nunca são removidas automaticamente.

**Manutenção:** rode `python -m unittest discover -s radar -v` antes de mudar o motor. Limitação conhecida: para normas longas (LC 214), a IA recebe só o trecho inicial na primeira leitura e, nas alterações, apenas o diff.


## Radar Tributário — ampliação do monitoramento

O workflow `.github/workflows/radar.yml` executa diariamente às 08h de Brasília (11:00 UTC) e também pode ser iniciado manualmente. Ele roda os testes, coleta as fontes e grava alterações em `data/`.

### Fontes configuradas
- Planalto: EC 132/2023, LC 214/2025 e LC 227/2026 (texto legislativo).
- Ministério da Fazenda e Receita Federal: notícias oficiais filtradas por palavras-chave. **Notícia é sinal de acompanhamento, não prova de publicação de norma.**
- Portal DFe/SVRS: listagem oficial de notas técnicas e documentos fiscais eletrônicos.

O coletor de listagens só segue links HTTPS de domínios oficiais autorizados no cadastro da fonte. Uma indisponibilidade de uma fonte é registrada no log sem interromper as demais. Os resultados automatizados ficam pendentes de revisão humana.

### Segredos e permissões
- `OPENAI_API_KEY`: secret opcional para gerar resumos. Nunca coloque a chave no HTML, JavaScript ou em arquivos do repositório.
- `OPENAI_MODEL`: variável opcional com o modelo habilitado na sua conta.
- Workflow usa permissões mínimas de leitura e escrita em `contents`, somente para atualizar os dados coletados.
- Se não configurar a chave da IA, o radar continua coletando e identificando publicações, mas não gera análise automática.

### Limites importantes
O monitoramento por páginas e listagens detecta alterações e novas referências disponíveis nessas páginas; não substitui uma integração oficial de API/Diário Oficial nem garante cobertura de todos os atos estaduais ou municipais. Datas de publicação, início de vigência, alíquotas e efeitos precisam ser confirmados no ato oficial. Não use resumos automáticos como parecer jurídico.
