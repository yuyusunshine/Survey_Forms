import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function SurveyForm() {
  const { id } = useParams()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [files, setFiles] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [id])

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`/api/surveys/${id}`)
      setSurvey(response.data)
      
      // 初始化答案对象
      const initialAnswers = {}
      response.data.questions.forEach((q, index) => {
        initialAnswers[index] = q.type === 'checkbox' ? [] : ''
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error('Error fetching survey:', error)
      alert('获取问卷失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: value })
  }

  const handleCheckboxChange = (questionIndex, option) => {
    const currentAnswers = answers[questionIndex] || []
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(item => item !== option)
      : [...currentAnswers, option]
    setAnswers({ ...answers, [questionIndex]: newAnswers })
  }

  const handleFileChange = (questionIndex, fileList) => {
    setFiles({ ...files, [questionIndex]: Array.from(fileList) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 验证必填项
    const requiredQuestions = survey.questions
      .map((q, index) => ({ ...q, index }))
      .filter(q => q.required)

    for (const question of requiredQuestions) {
      const answer = answers[question.index]
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        alert(`请回答问题: ${question.label}`)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('survey_id', id)
      formData.append('answers', JSON.stringify(answers))

      // 添加文件
      Object.keys(files).forEach(questionIndex => {
        files[questionIndex].forEach(file => {
          formData.append('files', file)
        })
      })

      await axios.post('/api/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('提交失败，请重试')
    }
  }

  if (loading) {
    return <div className="card">加载中...</div>
  }

  if (!survey) {
    return <div className="card">问卷不存在</div>
  }

  if (!survey.is_active) {
    return (
      <div className="card">
        <h2>{survey.title}</h2>
        <p style={{ color: '#e74c3c', marginTop: '1rem' }}>此问卷已关闭，无法填写</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>✓ 提交成功</h2>
        <p>感谢您的参与！</p>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h1 className="page-title">{survey.title}</h1>
        {survey.description && (
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {survey.questions.map((question, index) => (
          <div key={index} className="card">
            <div className="form-group">
              <label>
                {question.label}
                {question.required && <span style={{ color: '#e74c3c' }}> *</span>}
              </label>

              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  required={question.required}
                />
              )}

              {question.type === 'textarea' && (
                <textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  required={question.required}
                />
              )}

              {question.type === 'radio' && (
                <div>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} style={{ marginBottom: '0.5rem' }}>
                      <label>
                        <input
                          type="radio"
                          name={`question_${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          required={question.required}
                        />
                        {' '}{option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'checkbox' && (
                <div>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} style={{ marginBottom: '0.5rem' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={(answers[index] || []).includes(option)}
                          onChange={() => handleCheckboxChange(index, option)}
                        />
                        {' '}{option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'file' && (
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(index, e.target.files)}
                    required={question.required}
                  />
                  {files[index] && files[index].length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                      已选择 {files[index].length} 个文件
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
          提交问卷
        </button>
      </form>
    </div>
  )
}

export default SurveyForm
