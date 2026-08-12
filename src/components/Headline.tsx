import { Fragment } from 'react'

interface HeadlineProps {
  id: string
  kicker: string
  lines: string[]
}

function Headline({ id, kicker, lines }: HeadlineProps) {
  return (
    <section className="headline" id={id}>
      <h1>
        {lines.map((line, i) => (
          <Fragment key={line}>
            {i > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </h1>
      <div className="rule-orn">{kicker}</div>
    </section>
  )
}

export default Headline
