import './TotalView.css'

function formatMonth(monthStr) {
  const [year, mon] = monthStr.split('-')
  return `${year}년 ${parseInt(mon)}월`
}

function Diff({ amount }) {
  if (amount === 0) return <span className="diff neutral">전달과 동일</span>
  const sign = amount > 0 ? '+' : ''
  const cls = amount > 0 ? 'more' : 'less'
  return (
    <span className={`diff ${cls}`}>
      {sign}{amount.toLocaleString()}원
    </span>
  )
}

export default function TotalView({ totals, selectedMonth }) {
  if (totals.length === 0) {
    return (
      <div className="totals-empty">
        <p>아직 지출 내역이 없습니다.</p>
      </div>
    )
  }

  const maxTotal = Math.max(...totals.map((t) => t.total), 1)

  // totals는 월 내림차순(최신→과거) 정렬 상태
  // index i의 전달 = index i+1, 없으면 0원 처리
  return (
    <div className="totals-view">
      <h3 className="totals-title">월별 지출 현황</h3>
      <div className="totals-list">
        {totals.map((t, i) => {
          const isSelected = t.month === selectedMonth
          const barPct = (t.total / maxTotal) * 100
          const prevTotal = totals[i + 1]?.total ?? 0
          const diff = t.total - prevTotal

          return (
            <div
              key={t.id ?? t.month}
              className={`total-row ${isSelected ? 'selected' : ''}`}
            >
              <span className="total-month">{formatMonth(t.month)}</span>
              <div className="total-bar-wrap">
                <div className="total-bar" style={{ width: `${barPct}%` }} />
              </div>
              <div className="total-right">
                <span className="total-amount">{t.total.toLocaleString()}원</span>
                <Diff amount={diff} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
