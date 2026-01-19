import { useState, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '../config'

function AdminDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/submissions'))
      setSubmissions(response.data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      alert('获取提交记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/qrcode'))
      setQrCode(response.data)
      setShowQrModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('生成二维码失败')
    }
  }

  const handleDelete = async (submissionId) => {
    if (!confirm('确定要删除这条提交记录吗？')) return

    try {
      await axios.delete(getApiUrl(`/api/submissions/${submissionId}`))
      fetchSubmissions()
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('删除失败')
    }
  }

  const exportToCSV = () => {
    if (submissions.length === 0) {
      alert('没有数据可导出')
      return
    }

    const headers = [
      '提交时间',
      '公司名称',
      '联系人',
      '职位',
      '电话',
      '邮箱',
      '公司规模',
      '行业',
      '合作意向',
      '项目描述',
      '附件数量'
    ]

    const rows = submissions.map(sub => [
      new Date(sub.submitted_at).toLocaleString('zh-CN'),
      sub.company_name,
      sub.contact_name,
      sub.position || '',
      sub.phone,
      sub.email,
      sub.company_size || '',
      sub.industry || '',
      sub.cooperation_intent || '',
      sub.project_description || '',
      sub.files?.length || 0
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `合作伙伴信息_${new Date().toLocaleDateString('zh-CN')}.csv`
    link.click()
  }

  if (loading) {
    return <div className="card">加载中...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">管理后台</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleGenerateQR} className="btn btn-primary">
            生成表单二维码
          </button>
          {submissions.length > 0 && (
            <button onClick={exportToCSV} className="btn btn-success">
              导出为 CSV
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>统计信息</h3>
        <p style={{ fontSize: '1.5rem', color: '#2c3e50', marginTop: '1rem' }}>
          共收到 <strong>{submissions.length}</strong> 份提交
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="card">
          <p>还没有收到提交</p>
        </div>
      ) : (
        <div>
          {submissions.map((submission) => (
            <div key={submission.id} className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                  提交时间: {new Date(submission.submitted_at).toLocaleString('zh-CN')}
                </span>
                <button
                  onClick={() => handleDelete(submission.id)}
                  className="btn btn-danger btn-small"
                >
                  删除
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>公司名称:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.company_name}
                  </div>
                </div>

                <div>
                  <strong>公司规模:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.company_size || '未填写'}
                  </div>
                </div>

                <div>
                  <strong>所属行业:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.industry || '未填写'}
                  </div>
                </div>

                <div>
                  <strong>联系人:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.contact_name} {submission.position && `(${submission.position})`}
                  </div>
                </div>

                <div>
                  <strong>电话:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.phone}
                  </div>
                </div>

                <div>
                  <strong>邮箱:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {submission.email}
                  </div>
                </div>
              </div>

              {submission.cooperation_intent && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>合作意向:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50', whiteSpace: 'pre-wrap' }}>
                    {submission.cooperation_intent}
                  </div>
                </div>
              )}

              {submission.project_description && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>项目描述:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50', whiteSpace: 'pre-wrap' }}>
                    {submission.project_description}
                  </div>
                </div>
              )}

              {submission.files && submission.files.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <strong>附件 ({submission.files.length}):</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {submission.files.map((file) => (
                      <div key={file.id} style={{ marginBottom: '0.5rem' }}>
                        <a
                          href={`/uploads/${file.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3498db', textDecoration: 'none' }}
                        >
                          📎 {file.original_name}
                        </a>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showQrModal && qrCode && (
        <div className="qr-modal" onClick={() => setShowQrModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>表单二维码</h3>
            <p style={{ color: '#7f8c8d', margin: '1rem 0' }}>
              扫描二维码填写合作伙伴信息
            </p>
            <img src={qrCode.qrCode} alt="QR Code" />
            <p style={{ wordBreak: 'break-all', fontSize: '0.875rem', color: '#7f8c8d' }}>
              {qrCode.url}
            </p>
            <button onClick={() => setShowQrModal(false)} className="btn btn-primary">
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
