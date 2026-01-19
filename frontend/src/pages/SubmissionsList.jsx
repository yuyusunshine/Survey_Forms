import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { getApiUrl } from '../config'

function SubmissionsList() {
  const { surveyId } = useParams()
  const [survey, setSurvey] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [surveyId])

  const fetchData = async () => {
    try {
      const [surveyRes, submissionsRes] = await Promise.all([
        axios.get(getApiUrl(`/api/surveys/${surveyId}`)),
        axios.get(getApiUrl(`/api/submissions/survey/${surveyId}`))
      ])
      setSurvey(surveyRes.data)
      setSubmissions(submissionsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (submissionId) => {
    if (!confirm('确定要删除这条提交记录吗？')) return

    try {
      await axios.delete(getApiUrl(`/api/submissions/${submissionId}`))
      fetchData()
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

    const headers = ['提交时间', ...survey.questions.map(q => q.label)]
    const rows = submissions.map(sub => {
      const answers = sub.answers
      return [
        new Date(sub.submitted_at).toLocaleString('zh-CN'),
        ...survey.questions.map((q, index) => {
          const answer = answers[index]
          if (Array.isArray(answer)) {
            return answer.join(', ')
          }
          return answer || ''
        })
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${survey.title}_提交记录.csv`
    link.click()
  }

  if (loading) {
    return <div className="card">加载中...</div>
  }

  if (!survey) {
    return <div className="card">问卷不存在</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" className="btn btn-secondary btn-small">← 返回</Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>{survey.title}</h1>
            <p style={{ color: '#7f8c8d' }}>共收到 {submissions.length} 份提交</p>
          </div>
          {submissions.length > 0 && (
            <button onClick={exportToCSV} className="btn btn-success">
              导出为 CSV
            </button>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card">
          <p>还没有收到提交</p>
        </div>
      ) : (
        <div className="card">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                borderBottom: '1px solid #ddd',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
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

              {survey.questions.map((question, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <strong>{question.label}:</strong>
                  <div style={{ marginTop: '0.25rem', color: '#2c3e50' }}>
                    {question.type === 'checkbox' ? (
                      Array.isArray(submission.answers[index]) ? (
                        submission.answers[index].join(', ') || '未回答'
                      ) : '未回答'
                    ) : (
                      submission.answers[index] || '未回答'
                    )}
                  </div>
                </div>
              ))}

              {submission.files && submission.files.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>附件:</strong>
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
    </div>
  )
}

export default SubmissionsList
