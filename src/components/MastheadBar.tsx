import { useMemo } from 'react'
import type { StatBox } from '../data/types'
import CountUp from './CountUp/CountUp'

interface MastheadBarProps {
  stats: [StatBox, StatBox]
  issueNo: string
  city: string
}

function MastheadBar({ stats, issueNo, city }: MastheadBarProps) {
  const [leftStat, rightStat] = stats

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    []
  )

  return (
    <div className="masthead-row">
      <div className="stat-box">
        <span className="num">
          {leftStat.num !== null ? (
            <CountUp to={leftStat.num} duration={1.8} separator="," />
          ) : (
            '—'
          )}
        </span>
        <span className="cap">{leftStat.cap}</span>
      </div>
      <div className="masthead-center">
        <div className="est">— Established at DongSam's Github, Anno 2026 —</div>
        <h1 className="wordmark">DongSam's Magazine</h1>
        <div className="subtitle-row">
          <span>{issueNo}</span>
          <span>{today}</span>
          <span>{city}</span>
        </div>
      </div>
      <div className="stat-box">
        <span className="num">
          {rightStat.num !== null ? (
            <CountUp to={rightStat.num} duration={1.8} separator="," />
          ) : (
            '—'
          )}
        </span>
        <span className="cap">{rightStat.cap}</span>
      </div>
    </div>
  )
}

export default MastheadBar
