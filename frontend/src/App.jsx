import { useState } from 'react'

const MEMBERS = [
  'Almir', 'Arthur', 'Estácio Cruz', 'Gabriel Nascimento',
  'Gabriel Covatz', 'Josias', 'Lethicia', 'Lucas',
  'Luis', 'Mariana', 'Nicolas', 'Nicole',
]

const RATING_LABELS = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Muito bom']

// Steps: 0=welcome, 1=geral, 2=sobre-voce, 3=conte-mais, 4..15=peers, 16=done
const LAST_STEP = 3 + MEMBERS.length  // 15

function initials(name) {
  const parts = name.split(' ')
  return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]
}

function RatingGroup({ label, desc, labels, value, onChange }) {
  const l = labels || RATING_LABELS
  return (
    <div className="rating-group">
      <span className="rating-label">{label}</span>
      {desc && <span className="rating-desc">{desc}</span>}
      <div className="stars">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`star-btn${value === n ? ' active' : ''}`}
            onClick={() => onChange(n)}
          >
            <div className="star-circle">{n}</div>
            <span className="star-text">{l[n - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepWelcome({ onStart }) {
  return (
    <>
      <div className="welcome-hero">
        <p className="eyebrow">Ciclo 2026 · 1º Semestre</p>
        <h1>Pesquisa Semestral<br />do Setor</h1>
        <p>Suas respostas são anônimas e ajudam a equipe a crescer.<br />Vamos guiar você por todo o processo.</p>
      </div>
      <div className="welcome-body">
        <div className="notice">
          <strong>🔒 100% Anônimo.</strong> Nenhuma informação de identificação é coletada ou armazenada. Avaliações de pares são agregadas por média antes de qualquer divulgação.
        </div>
        <div className="welcome-steps">
          <div className="ws-item"><span className="ws-num">1</span><span>Avaliações gerais da empresa e equipe</span></div>
          <div className="ws-item"><span className="ws-num">2</span><span>Como você se sente neste semestre</span></div>
          <div className="ws-item"><span className="ws-num">3</span><span>Pontos positivos e de melhoria</span></div>
          <div className="ws-item"><span className="ws-num">4</span><span>Avaliação individual de cada colega ({MEMBERS.length} pessoas)</span></div>
        </div>
        <button className="btn btn-primary" onClick={onStart}>Começar →</button>
      </div>
    </>
  )
}

function StepFeedbackGeral({ fb, set }) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Parte geral — 1 de 3</p>
        <h1>Como está a empresa e a equipe?</h1>
        <p>Avalie de 1 (muito ruim) a 5 (muito bom)</p>
      </div>
      <div className="card">
        <RatingGroup label="1. Como você avalia a empresa?" value={fb.score_empresa} onChange={v => set('score_empresa', v)} />
        <RatingGroup label="2. Como você avalia a equipe de sistemas?" value={fb.score_equipe} onChange={v => set('score_equipe', v)} />
        <RatingGroup label="3. Como você avalia a interação com a equipe de infraestrutura?" value={fb.score_infra} onChange={v => set('score_infra', v)} />
      </div>
    </>
  )
}

function StepSobreVoce({ fb, set }) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Parte geral — 2 de 3</p>
        <h1>Como você está neste semestre?</h1>
        <p>Avalie de 1 a 5</p>
      </div>
      <div className="card">
        <RatingGroup label="4. Como você avalia seu crescimento profissional nos últimos 6 meses?" value={fb.score_crescimento} onChange={v => set('score_crescimento', v)} />
        <RatingGroup label="5. Como você avalia a comunicação interna da equipe?" value={fb.score_comunicacao} onChange={v => set('score_comunicacao', v)} />
        <RatingGroup
          label="6. Você tem clareza sobre seus objetivos e o que é esperado de você?"
          labels={['Nenhuma', 'Pouca', 'Razoável', 'Boa', 'Total']}
          value={fb.score_clareza}
          onChange={v => set('score_clareza', v)}
        />
        <RatingGroup label="7. Como você avalia seu equilíbrio entre vida profissional e pessoal?" value={fb.score_equilibrio} onChange={v => set('score_equilibrio', v)} />
      </div>
    </>
  )
}

function StepConteMais({ fb, set }) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Parte geral — 3 de 3</p>
        <h1>Compartilhe sua visão</h1>
        <p>Todos os campos são opcionais</p>
      </div>
      <div className="card">
        <div className="field">
          <label>✅ Pontos positivos da equipe <span>(o que está funcionando bem?)</span></label>
          <textarea value={fb.pontos_positivos} onChange={e => set('pontos_positivos', e.target.value)} placeholder="Ex.: colaboração, entregas no prazo, suporte rápido..." />
        </div>
        <div className="field">
          <label>🔧 Pontos de melhoria <span>(o que poderia ser feito melhor?)</span></label>
          <textarea value={fb.pontos_melhoria} onChange={e => set('pontos_melhoria', e.target.value)} placeholder="Ex.: documentação de processos, alinhamento de prioridades..." />
        </div>
        <div className="field">
          <label>💬 Tem algo a mais para falar? <span>(sugestões, recados, qualquer coisa)</span></label>
          <textarea value={fb.campo_livre} onChange={e => set('campo_livre', e.target.value)} placeholder="Escreva livremente..." />
        </div>
      </div>
    </>
  )
}

function StepPeer({ peer, index, total, set }) {
  return (
    <>
      <div className="peer-header">
        <div className="peer-avatar">{initials(peer.avaliado)}</div>
        <div>
          <p className="eyebrow">Avaliação de pares — {index + 1} de {total}</p>
          <h1>{peer.avaliado}</h1>
        </div>
      </div>
      <div className="card">
        <div className="card-subtitle">Avalie de 1 (muito ruim) a 5 (muito bom)</div>
        <RatingGroup label="Trabalho em equipe" desc="Colabora, compartilha conhecimento, apoia os colegas" value={peer.score_trabalho} onChange={v => set('score_trabalho', v)} />
        <RatingGroup label="Comprometimento" desc="Responsabilidade com prazos, qualidade e metas" value={peer.score_comprometimento} onChange={v => set('score_comprometimento', v)} />
        <RatingGroup label="Tratamento" desc="Respeito, empatia e relação interpessoal" value={peer.score_tratamento} onChange={v => set('score_tratamento', v)} />
        <div className="field">
          <label>Comentário <span>(opcional)</span></label>
          <textarea value={peer.comentario} onChange={e => set('comentario', e.target.value)} placeholder="Algum ponto específico para destacar sobre este colega..." />
        </div>
      </div>
    </>
  )
}

function StepDone() {
  return (
    <div className="done-screen">
      <div className="done-icon">✅</div>
      <h1>Obrigado pela participação!</h1>
      <p>Suas respostas foram enviadas com sucesso e contribuirão para o crescimento da equipe.</p>
      <div className="notice" style={{ marginTop: 24, textAlign: 'left' }}>
        <strong>🔒 Anonimato garantido.</strong> Nenhuma resposta é vinculada à sua identidade. As avaliações de pares são agregadas por média antes de serem compartilhadas.
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [feedback, setFeedback] = useState({
    score_empresa: null, score_equipe: null, score_infra: null,
    score_crescimento: null, score_comunicacao: null,
    score_clareza: null, score_equilibrio: null,
    pontos_positivos: '', pontos_melhoria: '', campo_livre: '',
  })

  const [peers, setPeers] = useState(
    MEMBERS.map(name => ({
      avaliado: name, score_trabalho: null,
      score_comprometimento: null, score_tratamento: null, comentario: '',
    }))
  )

  const setFB = (key, val) => setFeedback(p => ({ ...p, [key]: val }))
  const setPeer = (idx, key, val) => setPeers(p => p.map((peer, i) => i === idx ? { ...peer, [key]: val } : peer))

  const peerIndex = step >= 4 ? step - 4 : 0

  const canProceed = () => {
    if (step === 1) return feedback.score_empresa && feedback.score_equipe && feedback.score_infra
    if (step === 2) return feedback.score_crescimento && feedback.score_comunicacao && feedback.score_clareza && feedback.score_equilibrio
    if (step === 3) return true
    if (step >= 4) {
      const p = peers[step - 4]
      return p.score_trabalho && p.score_comprometimento && p.score_tratamento
    }
    return true
  }

  const handleNext = async () => {
    if (step === LAST_STEP) {
      setSubmitting(true)
      setError(null)
      try {
        const res = await fetch('/api/submit-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback, peers }),
        })
        if (!res.ok) throw new Error()
        setStep(LAST_STEP + 1)
      } catch {
        setError('Não foi possível enviar. Verifique sua conexão e tente novamente.')
      } finally {
        setSubmitting(false)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(s => s - 1)
  }

  const progress = step >= 1 && step <= LAST_STEP ? (step / LAST_STEP) * 100 : 0

  const isContentStep = step >= 1 && step <= LAST_STEP

  return (
    <>
      <header className="gc-header">
        <span className="gc-header-title">Equipe de Sistemas</span>
        <span className="gc-header-badge">Feedback Semestral</span>
      </header>

      {isContentStep && (
        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">
            {step <= 3
              ? `Parte geral — passo ${step} de 3`
              : `Avaliação de pares — ${peerIndex + 1} de ${MEMBERS.length}`}
          </span>
        </div>
      )}

      <main className="container">
        {step === 0 && <StepWelcome onStart={() => setStep(1)} />}
        {step === 1 && <StepFeedbackGeral fb={feedback} set={setFB} />}
        {step === 2 && <StepSobreVoce fb={feedback} set={setFB} />}
        {step === 3 && <StepConteMais fb={feedback} set={setFB} />}
        {step >= 4 && step <= LAST_STEP && (
          <StepPeer
            peer={peers[peerIndex]}
            index={peerIndex}
            total={MEMBERS.length}
            set={(key, val) => setPeer(peerIndex, key, val)}
          />
        )}
        {step === LAST_STEP + 1 && <StepDone />}

        {isContentStep && (
          <div className="wizard-nav">
            {error && <p className="error-msg">{error}</p>}
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
            >
              {submitting ? 'Enviando...' : step === LAST_STEP ? 'Finalizar e enviar' : 'Próximo →'}
            </button>
            <button className="btn btn-secondary" onClick={handleBack}>
              ← Voltar
            </button>
          </div>
        )}
      </main>

      <footer className="gc-footer">
        © 2026 Gran Coffee · Equipe de Sistemas · Respostas anônimas e confidenciais
      </footer>
    </>
  )
}
