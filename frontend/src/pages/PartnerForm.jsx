import { useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../config'

function PartnerForm() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    position: '',
    phone: '',
    email: '',
    company_size: '',
    industry: '',
    cooperation_intent: '',
    project_description: ''
  })
  const [files, setFiles] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const companySizes = ['1-50人', '51-200人', '201-500人', '501-1000人', '1000人以上']
  const industries = [
    '互联网/电商',
    '人工智能',
    '大数据',
    '云计算',
    '物联网',
    '生物医药',
    '新能源',
    '智能制造',
    '金融科技',
    '教育科技',
    '其他'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      // 添加表单数据
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })

      // 添加文件
      files.forEach(file => {
        submitData.append('files', file)
      })

      await axios.post(getApiUrl('/api/submissions'), submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>✓ 提交成功</h2>
        <p style={{ marginBottom: '2rem' }}>感谢您的参与！我们会尽快与您联系。</p>
        <button 
          onClick={() => {
            setSubmitted(false)
            setFormData({
              company_name: '',
              contact_name: '',
              position: '',
              phone: '',
              email: '',
              company_size: '',
              industry: '',
              cooperation_intent: '',
              project_description: ''
            })
            setFiles([])
          }}
          className="btn btn-primary"
        >
          再次提交
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">创新活动合作伙伴信息收集</h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          欢迎参加我们的创新活动！请填写以下信息，我们会尽快与您联系。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>公司信息</h3>
          
          <div className="form-group">
            <label>
              公司名称 <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="请输入公司名称"
              required
            />
          </div>

          <div className="form-group">
            <label>公司规模</label>
            <select
              name="company_size"
              value={formData.company_size}
              onChange={handleInputChange}
            >
              <option value="">请选择</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>所属行业</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
            >
              <option value="">请选择</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>联系人信息</h3>
          
          <div className="form-group">
            <label>
              联系人姓名 <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
              placeholder="请输入联系人姓名"
              required
            />
          </div>

          <div className="form-group">
            <label>职位</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="请输入职位"
            />
          </div>

          <div className="form-group">
            <label>
              联系电话 <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="请输入联系电话"
              required
            />
          </div>

          <div className="form-group">
            <label>
              电子邮箱 <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入电子邮箱"
              required
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>合作意向</h3>
          
          <div className="form-group">
            <label>合作意向</label>
            <textarea
              name="cooperation_intent"
              value={formData.cooperation_intent}
              onChange={handleInputChange}
              placeholder="请简要描述您的合作意向"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>创新项目描述</label>
            <textarea
              name="project_description"
              value={formData.project_description}
              onChange={handleInputChange}
              placeholder="请详细描述您的创新项目或产品"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>附件上传</label>
            <p style={{ fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              可上传公司介绍、产品手册、项目方案等资料（支持PDF、Word、Excel、PPT、图片等格式，单个文件最大10MB）
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            />
            {files.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                已选择 {files.length} 个文件：
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {files.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-success" 
          style={{ width: '100%', fontSize: '1.1rem' }}
          disabled={loading}
        >
          {loading ? '提交中...' : '提交信息'}
        </button>

        <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '0.875rem', marginTop: '1rem' }}>
          * 为必填项
        </p>
      </form>
    </div>
  )
}

export default PartnerForm
