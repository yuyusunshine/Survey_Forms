import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getApiUrl } from '../config'

function CreateSurvey() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([
    { id: Date.now(), type: 'text', label: '', required: false }
  ])

  const questionTypes = [
    { value: 'text', label: '单行文本' },
    { value: 'textarea', label: '多行文本' },
    { value: 'radio', label: '单选' },
    { value: 'checkbox', label: '多选' },
    { value: 'file', label: '文件上传' }
  ]

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), type: 'text', label: '', required: false }
    ])
  }

  const removeQuestion = (id) => {
    if (questions.length === 1) {
      alert('至少需要一个问题')
      return
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const addOption = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const options = q.options || []
        return { ...q, options: [...options, ''] }
      }
      return q
    }))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const options = [...q.options]
        options[optionIndex] = value
        return { ...q, options }
      }
      return q
    }))
  }

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const options = q.options.filter((_, i) => i !== optionIndex)
        return { ...q, options }
      }
      return q
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('请输入问卷标题')
      return
    }

    const invalidQuestions = questions.filter(q => !q.label.trim())
    if (invalidQuestions.length > 0) {
      alert('请填写所有问题的标题')
      return
    }

    const radioCheckboxQuestions = questions.filter(q => 
      (q.type === 'radio' || q.type === 'checkbox') && (!q.options || q.options.length < 2)
    )
    if (radioCheckboxQuestions.length > 0) {
      alert('单选和多选题至少需要两个选项')
      return
    }

    try {
      await axios.post(getApiUrl('/api/surveys'), {
        title,
        description,
        questions: questions.map(({ id, ...rest }) => rest)
      })
      alert('问卷创建成功！')
      navigate('/')
    } catch (error) {
      console.error('Error creating survey:', error)
      alert('创建问卷失败')
    }
  }

  return (
    <div>
      <h1 className="page-title">创建问卷</h1>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-group">
            <label>问卷标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入问卷标题"
              required
            />
          </div>

          <div className="form-group">
            <label>问卷描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入问卷描述（可选）"
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>问题列表</h3>
          
          {questions.map((question, index) => (
            <div key={question.id} className="question-builder">
              <div className="question-header">
                <h4>问题 {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="btn btn-danger btn-small"
                >
                  删除
                </button>
              </div>

              <div className="form-group">
                <label>问题类型</label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>问题标题 *</label>
                <input
                  type="text"
                  value={question.label}
                  onChange={(e) => updateQuestion(question.id, 'label', e.target.value)}
                  placeholder="输入问题标题"
                  required
                />
              </div>

              {(question.type === 'radio' || question.type === 'checkbox') && (
                <div className="form-group">
                  <label>选项</label>
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                        placeholder={`选项 ${optIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(question.id, optIndex)}
                        className="btn btn-danger btn-small"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(question.id)}
                    className="btn btn-secondary btn-small"
                  >
                    添加选项
                  </button>
                </div>
              )}

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                  />
                  {' '}必填
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            添加问题
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-success">
            创建问卷
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateSurvey
