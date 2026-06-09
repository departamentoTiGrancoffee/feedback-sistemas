# Sistema de Feedback — Equipe de Sistemas Gran Coffee

Aplicação web para coleta semestral de feedbacks anônimos e avaliações de pares.

## Funcionalidades

- **Formulário de feedback geral** (anônimo): notas para empresa, equipe de sistemas, infraestrutura, crescimento, comunicação, clareza de objetivos e equilíbrio vida/trabalho + 3 campos abertos.
- **Avaliação de pares**: nota de trabalho em equipe, comprometimento e tratamento por colega, com campo de comentário.
- **Dashboard de gestão**: gráfico radar, barras por pessoa, tabela de médias, respostas abertas agrupadas, exportação JSON.

## Estrutura

```
feedback-sistema/
├── app.py              # Servidor Flask
├── requirements.txt    # Dependências (flask, gunicorn)
├── Procfile            # Para Railway/Render
├── templates/          # Templates Jinja2
│   ├── base.html
│   ├── index.html
│   ├── form.html
│   ├── peer.html
│   ├── success.html
│   ├── dashboard_login.html
│   └── dashboard.html
└── data/               # Criada automaticamente — banco SQLite
```

## Rodando localmente

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Iniciar servidor
python app.py

# 3. Acessar em: http://localhost:5000
```

## Variáveis de ambiente

| Variável           | Padrão               | Descrição                                         |
|--------------------|----------------------|---------------------------------------------------|
| `DASHBOARD_TOKEN`  | `gc2026ti`           | **Altere antes de usar em produção!**             |
| `PORT`             | `5000`               | Porta do servidor                                 |
| `DATA_DIR`         | `<projeto>/data/`    | Diretório do banco SQLite                         |

## Acessando o dashboard

```
http://seu-servidor/dashboard
```

Token padrão: **`gc2026ti`** — altere via variável de ambiente `DASHBOARD_TOKEN`.

## Hospedagem na internet (Railway)

1. Crie uma conta em [railway.app](https://railway.app)
2. Crie um novo projeto → Deploy from GitHub (ou arraste a pasta)
3. Em **Variables**, adicione:
   - `DASHBOARD_TOKEN` = sua senha segura
   - `DATA_DIR` = `/data`  
4. Em **Volumes**, monte um volume persistente em `/data` (para o banco não ser apagado nos deploys)
5. O Railway detecta o `Procfile` e sobe automaticamente

> **Render.com**: Processo igual. Em "Disks", monte um disco persistente em `/data`.

## Hospedagem na internet (Render)

1. Crie conta em [render.com](https://render.com)
2. New → Web Service → conecte o repositório
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`
5. Environment variables: `DASHBOARD_TOKEN`, `DATA_DIR=/data`
6. Add Disk: mount path `/data`

## Exportar dados

O dashboard tem botão de exportação JSON:
```
GET /api/export?token=SEU_TOKEN
```

## Integrantes configurados

Almir, Arthur, Estácio Cruz, Gabriel Nascimento, Gabriel Covatz, Josias, Lethicia, Lucas, Luis, Mariana, Nicolas, Nicole.

Para alterar, edite a lista `MEMBERS` em `app.py`.
