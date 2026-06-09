"""
Sistema de Feedback — Equipe de Sistemas Gran Coffee
Semestral | Anônimo + Avaliação de Pares
"""

import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, 'frontend', 'dist')

app = Flask(__name__)

DASHBOARD_TOKEN = os.environ.get("DASHBOARD_TOKEN", "gc2026ti")

_default_data_dir = os.path.join(BASE_DIR, "data")
DATA_DIR = os.environ.get("DATA_DIR", _default_data_dir)
DB_PATH = os.path.join(DATA_DIR, "feedback.db")

MEMBERS = [
    "Almir", "Arthur", "Estácio Cruz", "Gabriel Nascimento",
    "Gabriel Covatz", "Josias", "Lethicia", "Lucas",
    "Luis", "Mariana", "Nicolas", "Nicole",
]


# ── Banco de dados ──────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS feedback (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp           TEXT    NOT NULL,
                score_empresa       INTEGER,
                score_equipe        INTEGER,
                score_infra         INTEGER,
                score_crescimento   INTEGER,
                score_comunicacao   INTEGER,
                score_clareza       INTEGER,
                score_equilibrio    INTEGER,
                pontos_positivos    TEXT,
                pontos_melhoria     TEXT,
                campo_livre         TEXT
            );

            CREATE TABLE IF NOT EXISTS peer_review (
                id                      INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp               TEXT    NOT NULL,
                avaliado                TEXT    NOT NULL,
                score_trabalho          INTEGER,
                score_comprometimento   INTEGER,
                score_tratamento        INTEGER,
                comentario              TEXT
            );
        """)


# ── API ─────────────────────────────────────────────────────────────────────

@app.route('/api/submit-all', methods=['POST'])
def submit_all():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data'}), 400

    fb = data.get('feedback', {})
    peers_data = data.get('peers', [])
    now = datetime.now().isoformat(sep=' ', timespec='seconds')

    with get_db() as conn:
        conn.execute(
            """INSERT INTO feedback
               (timestamp, score_empresa, score_equipe, score_infra,
                score_crescimento, score_comunicacao, score_clareza,
                score_equilibrio, pontos_positivos, pontos_melhoria, campo_livre)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                now,
                fb.get('score_empresa'), fb.get('score_equipe'), fb.get('score_infra'),
                fb.get('score_crescimento'), fb.get('score_comunicacao'),
                fb.get('score_clareza'), fb.get('score_equilibrio'),
                (fb.get('pontos_positivos') or '').strip(),
                (fb.get('pontos_melhoria') or '').strip(),
                (fb.get('campo_livre') or '').strip(),
            ),
        )
        for peer in peers_data:
            if peer.get('score_trabalho') is not None:
                conn.execute(
                    """INSERT INTO peer_review
                       (timestamp, avaliado, score_trabalho,
                        score_comprometimento, score_tratamento, comentario)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        now,
                        peer.get('avaliado'),
                        peer.get('score_trabalho'),
                        peer.get('score_comprometimento'),
                        peer.get('score_tratamento'),
                        (peer.get('comentario') or '').strip(),
                    ),
                )

    return jsonify({'ok': True})


@app.route('/api/reset', methods=['POST'])
def reset_data():
    token = request.args.get('token', '')
    if token != DASHBOARD_TOKEN:
        return jsonify({'error': 'Unauthorized'}), 401

    with get_db() as conn:
        conn.execute('DELETE FROM feedback')
        conn.execute('DELETE FROM peer_review')
        try:
            conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('feedback', 'peer_review')")
        except Exception:
            pass

    return jsonify({'ok': True})


@app.route('/api/export')
def export():
    token = request.args.get('token', '')
    if token != DASHBOARD_TOKEN:
        return jsonify({'error': 'Unauthorized'}), 401

    with get_db() as conn:
        feedbacks = [dict(r) for r in conn.execute('SELECT * FROM feedback').fetchall()]
        peers = [dict(r) for r in conn.execute('SELECT * FROM peer_review').fetchall()]

    return jsonify({'feedbacks': feedbacks, 'peer_reviews': peers})


# ── Dashboard (server-rendered) ─────────────────────────────────────────────

@app.route('/dashboard')
def dashboard():
    token = request.args.get('token', '')
    if token != DASHBOARD_TOKEN:
        return render_template('dashboard_login.html')

    with get_db() as conn:
        feedbacks = [dict(r) for r in conn.execute(
            'SELECT * FROM feedback ORDER BY timestamp DESC'
        ).fetchall()]
        peers = [dict(r) for r in conn.execute(
            'SELECT * FROM peer_review ORDER BY timestamp DESC'
        ).fetchall()]

    score_keys = [
        'score_empresa', 'score_equipe', 'score_infra',
        'score_crescimento', 'score_comunicacao', 'score_clareza', 'score_equilibrio',
    ]
    averages = {}
    for key in score_keys:
        vals = [f[key] for f in feedbacks if f[key] is not None]
        averages[key] = round(sum(vals) / len(vals), 2) if vals else None

    peer_stats = {}
    for member in MEMBERS:
        reviews = [p for p in peers if p['avaliado'] == member]
        if not reviews:
            peer_stats[member] = None
            continue

        def avg(key):
            vals = [r[key] for r in reviews if r[key] is not None]
            return round(sum(vals) / len(vals), 2) if vals else None

        peer_stats[member] = {
            'count': len(reviews),
            'trabalho': avg('score_trabalho'),
            'comprometimento': avg('score_comprometimento'),
            'tratamento': avg('score_tratamento'),
            'geral': avg('score_trabalho') and avg('score_comprometimento') and avg('score_tratamento') and
                     round((avg('score_trabalho') + avg('score_comprometimento') + avg('score_tratamento')) / 3, 2),
            'comentarios': [r['comentario'] for r in reviews if r.get('comentario')],
        }

    def safe(v):
        return round(v, 2) if v else 0

    peer_chart = {
        'labels': MEMBERS,
        'trabalho':        [safe(peer_stats[m]['trabalho']        if peer_stats[m] else 0) for m in MEMBERS],
        'comprometimento': [safe(peer_stats[m]['comprometimento'] if peer_stats[m] else 0) for m in MEMBERS],
        'tratamento':      [safe(peer_stats[m]['tratamento']      if peer_stats[m] else 0) for m in MEMBERS],
    }

    import json as _json
    return render_template(
        'dashboard.html',
        token=token,
        feedbacks=feedbacks,
        peers=peers,
        averages=averages,
        peer_stats=peer_stats,
        peer_chart_json=_json.dumps(peer_chart),
        members=MEMBERS,
        total_feedback=len(feedbacks),
        total_peer=len(peers),
    )


# ── SPA catch-all ────────────────────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa(path):
    if not os.path.isdir(DIST_DIR):
        return (
            "<pre>Frontend não compilado.\nExecute:\n  cd frontend\n  npm install\n  npm run build</pre>",
            503,
        )
    file_path = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, 'index.html')


# ── Entry point ─────────────────────────────────────────────────────────────

init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
