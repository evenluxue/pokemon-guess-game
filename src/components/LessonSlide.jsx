import { useState } from 'react'
import { spriteUrl } from '../pokeapi'

function Sprite({ mon }) {
  return (
    <div className="lesson-sprite">
      <img className="lesson-sprite-img" src={spriteUrl(mon.id)} alt={mon.nameEn} loading="lazy" />
      <span className="lesson-sprite-en">{mon.nameEn}</span>
      <span className="lesson-sprite-zh">{mon.nameZh}</span>
    </div>
  )
}

function StepIcon({ icon }) {
  if (icon === 'pokeball') return <span className="pokeball-icon" aria-hidden="true" />
  return <span className="lesson-step-emoji" aria-hidden="true">{icon}</span>
}

function QuizSlide({ slide }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="lesson-slide lesson-quiz">
      <h2 className="lesson-title-zh">{slide.qZh}</h2>
      <p className="lesson-title-en">{slide.qEn}</p>
      <ul className="quiz-options">
        {slide.options.map((opt) => (
          <li
            key={opt.key}
            className={revealed && opt.key === slide.answerKey ? 'quiz-option correct' : 'quiz-option'}
          >
            <span className="quiz-key">{opt.key}</span>
            <span className="quiz-text-zh">{opt.textZh}</span>
            <span className="quiz-text-en">{opt.textEn}</span>
          </li>
        ))}
      </ul>
      {revealed ? (
        <div className="quiz-reveal">
          <p className="quiz-reveal-zh">{slide.revealZh}</p>
          <p className="quiz-reveal-en">{slide.revealEn}</p>
        </div>
      ) : (
        <button className="quiz-reveal-btn" onClick={() => setRevealed(true)}>
          揭晓答案 / Reveal
        </button>
      )}
    </div>
  )
}

function VideoSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-video">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.descZh && <p className="lesson-body-zh">{slide.descZh}</p>}
      {slide.descEn && <p className="lesson-body-en">{slide.descEn}</p>}
      <div className="lesson-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}`}
          title={slide.titleEn}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a
        className="lesson-video-link"
        href={`https://www.youtube.com/watch?v=${slide.youtubeId}`}
        target="_blank"
        rel="noreferrer"
      >
        ▶ 在 YouTube 打开 / Open on YouTube
      </a>
    </div>
  )
}

function InfoSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-info">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <p className="lesson-body-zh">{slide.bodyZh}</p>
      <p className="lesson-body-en">{slide.bodyEn}</p>
    </div>
  )
}

function DiscussSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-discuss">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.img && <img className="discuss-img" src={slide.img} alt={slide.titleEn} />}
      <p className="lesson-body-zh">{slide.promptZh}</p>
      <p className="lesson-body-en">{slide.promptEn}</p>
      <ul className="discuss-questions">
        {slide.questions.map((q, i) => (
          <li className="discuss-question" key={i}>
            <span className="discuss-q-icon" aria-hidden="true">💬</span>
            <span className="discuss-q-zh">{q.zh}</span>
            <span className="discuss-q-en">{q.en}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function JourneySlide({ slide }) {
  return (
    <div className="lesson-slide lesson-journey">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <ol className="journey-steps">
        {slide.steps.map((step, i) => (
          <li className="journey-step" key={i}>
            <span className="journey-num">{i + 1}</span>
            <StepIcon icon={step.icon} />
            <span className="journey-step-zh">{step.zh}</span>
            <span className="journey-step-en">{step.en}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TeamsSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-teams">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.teams.map((team) => (
        <div className={team.championship ? 'lesson-team champ' : 'lesson-team'} key={team.key}>
          <div className="lesson-team-head">
            <span className="lesson-team-region-zh">{team.regionZh}</span>
            <span className="lesson-team-region-en">{team.regionEn}</span>
            <span className="lesson-team-result">{team.resultZh}</span>
          </div>
          <div className="lesson-team-row">
            {team.members.map((mon) => (
              <Sprite mon={mon} key={mon.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EvoChains({ chains }) {
  return (
    <div className="lesson-evo-chains">
      {chains.map((chain, ci) => (
        <div className="lesson-evo-row chain" key={ci}>
          {chain.map((mon, i) => (
            <div className="lesson-evo-item" key={mon.id}>
              {i > 0 && <span className="lesson-evo-arrow">→</span>}
              <Sprite mon={mon} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function EeveeHub({ center, members }) {
  return (
    <div className="eevee-hub">
      {members.map((mon, i) => (
        <div
          className="eevee-line"
          key={`line-${mon.id}`}
          style={{ transform: `rotate(${i * 45}deg)` }}
        />
      ))}
      <div className="eevee-center">
        <Sprite mon={center} />
      </div>
      {members.map((mon, i) => (
        <div className="eevee-spoke" key={mon.id} style={{ '--a': `${i * 45}deg` }}>
          <Sprite mon={mon} />
        </div>
      ))}
    </div>
  )
}

function EvolutionSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-evolution">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      {slide.groups.map((group, gi) => (
        <div className="lesson-evo-group" key={gi}>
          <p className="lesson-evo-label-zh">{group.titleZh}</p>
          <p className="lesson-evo-label-en">{group.titleEn}</p>
          {group.layout === 'hub' ? (
            <EeveeHub center={group.center} members={group.members} />
          ) : (
            <EvoChains chains={group.chains} />
          )}
        </div>
      ))}
    </div>
  )
}

function ImageSlide({ slide }) {
  return (
    <div className="lesson-slide lesson-image">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <img className="lesson-image-img" src={slide.src} alt={slide.titleEn} />
      <p className="lesson-body-zh">{slide.captionZh}</p>
      <p className="lesson-body-en">{slide.captionEn}</p>
    </div>
  )
}

function TransitionSlide({ slide, onStartGame }) {
  return (
    <div className="lesson-slide lesson-transition">
      <h2 className="lesson-title-zh">{slide.titleZh}</h2>
      <p className="lesson-title-en">{slide.titleEn}</p>
      <p className="lesson-body-zh">{slide.bodyZh}</p>
      <p className="lesson-body-en">{slide.bodyEn}</p>
      <button className="lesson-play-btn" onClick={onStartGame}>
        {slide.buttonZh} · {slide.buttonEn} →
      </button>
    </div>
  )
}

export default function LessonSlide({ slide, onStartGame }) {
  switch (slide.type) {
    case 'quiz':
      return <QuizSlide slide={slide} />
    case 'video':
      return <VideoSlide slide={slide} />
    case 'discuss':
      return <DiscussSlide slide={slide} />
    case 'info':
      return <InfoSlide slide={slide} />
    case 'journey':
      return <JourneySlide slide={slide} />
    case 'teams':
      return <TeamsSlide slide={slide} />
    case 'evolution':
      return <EvolutionSlide slide={slide} />
    case 'image':
      return <ImageSlide slide={slide} />
    case 'transition':
      return <TransitionSlide slide={slide} onStartGame={onStartGame} />
    default:
      return null
  }
}
