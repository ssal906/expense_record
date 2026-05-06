import './ProductItem.css'

const NEC_CONFIG = {
  상: { label: '상', bg: '#fee2e2', color: '#dc2626' },
  중: { label: '중', bg: '#fef3c7', color: '#d97706' },
  하: { label: '하', bg: '#dcfce7', color: '#16a34a' },
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const [, month, day] = dateStr.split('-')
  return `${parseInt(month)}월 ${parseInt(day)}일`
}

export default function ProductItem({ product, isCurrentMonth, onEdit, onDelete }) {
  const nec = NEC_CONFIG[product.necessity] ?? NEC_CONFIG['중']

  return (
    <div className="product-item">
      <div className="product-info">
        <span className="product-name">{product.name}</span>
        <div className="product-meta">
          <span className="product-date">{formatDate(product.date)}</span>
          <span
            className="nec-badge"
            style={{ background: nec.bg, color: nec.color }}
          >
            필요성 {nec.label}
          </span>
        </div>
      </div>

      <div className="product-right">
        <span className="product-price">{product.price.toLocaleString()}원</span>
        {isCurrentMonth && (
          <div className="product-actions">
            <button className="btn-edit" onClick={() => onEdit(product)}>
              수정
            </button>
            <button className="btn-delete" onClick={() => onDelete(product.product_id)}>
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
