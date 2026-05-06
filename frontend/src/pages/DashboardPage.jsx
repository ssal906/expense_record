import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductList from '../components/Products/ProductList'
import ProductForm from '../components/Products/ProductForm'
import TotalView from '../components/Totals/TotalView'
import { productsAPI, totalsAPI } from '../services/api'
import './DashboardPage.css'

function getMonthStr(offset = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() - offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [totals, setTotals] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(getMonthStr(0))
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')

  const currentMonth = getMonthStr(0)
  const isCurrentMonth = selectedMonth === currentMonth

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productsAPI.getAll(selectedMonth)
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [selectedMonth])

  const fetchTotals = useCallback(async () => {
    try {
      const res = await totalsAPI.getAll()
      setTotals(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchProducts(), fetchTotals()]).finally(() =>
      setLoading(false),
    )
  }, [fetchProducts, fetchTotals])

  const refresh = async () => {
    await Promise.all([fetchProducts(), fetchTotals()])
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleAdd = async (data) => {
    await productsAPI.create(data)
    setShowForm(false)
    await refresh()
  }

  const handleUpdate = async (id, data) => {
    await productsAPI.update(id, data)
    setEditingProduct(null)
    await refresh()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    await productsAPI.remove(id)
    await refresh()
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(false)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => getMonthStr(i))
  const currentMonthTotal = totals.find((t) => t.month === selectedMonth)?.total ?? 0

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>💰 가계부</h1>
        <button className="btn-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <div className="dashboard-content">
        {/* 월 선택 + 총 지출 */}
        <div className="month-bar">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value)
              setShowForm(false)
              setEditingProduct(null)
            }}
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m.replace('-', '년 ')}월
              </option>
            ))}
          </select>
          <div className="month-total">
            총 지출<strong>{currentMonthTotal.toLocaleString()}원</strong>
          </div>
        </div>

        {/* 탭 */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            구매 목록
          </button>
          <button
            className={`tab-btn ${activeTab === 'totals' ? 'active' : ''}`}
            onClick={() => setActiveTab('totals')}
          >
            월별 합계
          </button>
        </div>

        {/* 구매 목록 탭 */}
        {activeTab === 'list' && (
          <div className="tab-content">
            {isCurrentMonth ? (
              !showForm && !editingProduct ? (
                <button className="btn-add" onClick={() => setShowForm(true)}>
                  + 구매 항목 추가
                </button>
              ) : (
                <ProductForm
                  onSubmit={
                    editingProduct
                      ? (data) => handleUpdate(editingProduct.product_id, data)
                      : handleAdd
                  }
                  onCancel={handleCancelForm}
                  initialData={editingProduct}
                />
              )
            ) : (
              <p className="past-notice">지난 달 내역은 조회만 가능합니다.</p>
            )}

            {loading ? (
              <div className="loading">불러오는 중...</div>
            ) : (
              <ProductList
                products={products}
                isCurrentMonth={isCurrentMonth}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* 월별 합계 탭 */}
        {activeTab === 'totals' && (
          <div className="tab-content">
            <TotalView totals={totals} selectedMonth={selectedMonth} />
          </div>
        )}
      </div>
    </div>
  )
}
