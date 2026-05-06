import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import './AuthPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [emailStatus, setEmailStatus] = useState(null) // null | 'checking' | 'available' | 'taken'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    if (e.target.name === 'email') setEmailStatus(null)
  }

  const checkEmail = async () => {
    if (!form.email) {
      setError('이메일을 입력해주세요.')
      return
    }
    setEmailStatus('checking')
    try {
      const res = await authAPI.checkEmail(form.email)
      setEmailStatus(res.data.exists ? 'taken' : 'available')
    } catch {
      setEmailStatus(null)
      setError('이메일 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (emailStatus !== 'available') {
      setError('이메일 중복 확인을 완료해주세요.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.signup({ email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 회원가입</h1>
          <p>가계부로 소비를 관리하세요</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>이메일</label>
            <div className="input-with-btn">
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              <button type="button" className="btn-check" onClick={checkEmail}>
                중복 확인
              </button>
            </div>
            {emailStatus === 'checking' && (
              <span className="status-msg">확인 중...</span>
            )}
            {emailStatus === 'available' && (
              <span className="status-msg success">✓ 사용 가능한 이메일입니다.</span>
            )}
            {emailStatus === 'taken' && (
              <span className="status-msg taken">✗ 이미 사용 중인 이메일입니다.</span>
            )}
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              placeholder="6자 이상 입력하세요"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className="auth-footer">
          이미 계정이 있으신가요?{' '}
          <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
