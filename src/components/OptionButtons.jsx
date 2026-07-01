import { NAMES_ZH } from '../pokemonNamesZh'

export default function OptionButtons({ options, answer, selected, answered, onAnswer }) {
  function classFor(name) {
    if (!answered) return 'option'
    if (name === answer) return 'option correct'
    if (name === selected) return 'option wrong'
    return 'option'
  }
  return (
    <div className="options">
      {options.map((name) => (
        <button
          key={name}
          className={classFor(name)}
          disabled={answered}
          onClick={() => onAnswer(name)}
        >
          <span className="option-en">{name}</span>
          {NAMES_ZH[name] && <span className="option-zh">{NAMES_ZH[name]}</span>}
        </button>
      ))}
    </div>
  )
}
