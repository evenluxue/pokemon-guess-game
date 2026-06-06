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
          {name}
        </button>
      ))}
    </div>
  )
}
