import { useState, useEffect } from 'react'
import './ProductForm.css'

const NECESSITY_LEVELS = ['상', '중', '하']

export default function ProductForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({ name: '', price: '', necessity: '중', date: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        price: initialData.price?.toString() ?? '',
        necessity: initialData.necessity ?? '중',
        date: initialData.date ?? '',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('물품명을 입력해주세요.')
      return
    }
    const price = Number(form.price)
    if (!form.price || isNaN(price) || price <= 0) {
      setError('올바른 가격을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        price,
        necessity: form.necessity,
        date: form.date || null,
      })
    } catch (err) {
      setError(err.response?.data?.detail || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-form-card">
      <h3>{initialData ? '항목 수정' : '항목 추가'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>물품명 *</label>
            <input
              name="name"
              placeholder="물품명을 입력하세요"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>가격 (원) *</label>
            <input
              name="price"
              type="number"
              placeholder="0"
              min="1"
              value={form.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>필요성 *</label>
            <div className="necessity-group">
              {NECESSITY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`necessity-btn nec-${level} ${form.necessity === level ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, necessity: level })}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>날짜 (선택)</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '저장 중...' : initialData ? '수정' : '추가'}
          </button>
        </div>
      </form>
    </div>
  )
}
