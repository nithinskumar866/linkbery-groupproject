import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import PageBand from '../components/PageBand.jsx'
import { EMAIL_RE, usePageTitle } from '../components/utils.js'
import { Wrap } from './parts.jsx'
import { ICON } from './iconProps.js'

const EMPTY = { name: '', email: '', topic: 'general', message: '' }

function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.'
  if (v.message.trim().length < 10) e.message = 'Please write at least 10 characters.'
  else if (v.message.length > 2000) e.message = 'Please keep your message under 2000 characters.'
  return e
}

export default function Contact() {
  usePageTitle('Contact')
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sentTo, setSentTo] = useState(null)

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`contact-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setSentTo(values.name.trim())
    setValues(EMPTY)
  }

  const describe = (name) => (errors[name] ? `contact-${name}-err` : undefined)

  return (
    <div className="pg-contact">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        title="Contact us"
        desc="Suggest a course, report a broken link or wrong details, or send feedback about the site."
      />

      <Wrap className="pg-page-body pg-text-layout">
        <div className="pg-contact-main">
          {sentTo ? (
            <div className="card pg-thanks" role="status">
              <CircleCheck {...ICON} size={24} className="pg-thanks-icon" />
              <div>
                <h2 className="pg-h3">Thanks, {sentTo}.</h2>
                <p>Your message was checked but not sent anywhere, and nothing was stored.</p>
                <button type="button" className="btn btn-secondary" onClick={() => setSentTo(null)}>
                  Write another message
                </button>
              </div>
            </div>
          ) : (
            <form className="card pg-form-card" onSubmit={onSubmit} noValidate aria-labelledby="contact-form-h">
              <h2 id="contact-form-h" className="pg-h3">
                Send a message
              </h2>
              <div className="pg-form-row">
                <div className="field">
                  <label className="field-label" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    className="input"
                    value={values.name}
                    onChange={onChange}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={describe('name')}
                    required
                  />
                  {errors.name && (
                    <span id="contact-name-err" className="field-error">
                      {errors.name}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className="input"
                    value={values.email}
                    onChange={onChange}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describe('email')}
                    required
                  />
                  {errors.email && (
                    <span id="contact-email-err" className="field-error">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="contact-topic">
                  Topic
                </label>
                <select id="contact-topic" name="topic" className="select" value={values.topic} onChange={onChange}>
                  <option value="general">General question</option>
                  <option value="suggest">Suggest a course</option>
                  <option value="broken">Broken link or wrong details</option>
                  <option value="feedback">Feedback about the site</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="textarea"
                  rows={6}
                  value={values.message}
                  onChange={onChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describe('message')}
                  maxLength={2000}
                  required
                />
                {errors.message && (
                  <span id="contact-message-err" className="field-error">
                    {errors.message}
                  </span>
                )}
              </div>
              <div className="pg-form-actions">
                <button type="submit" className="btn btn-primary">
                  Send message
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="pg-text-side" aria-labelledby="contact-before">
          <div className="card pg-side-facts">
            <h2 id="contact-before" className="pg-h3">
              Before you write
            </h2>
            <ul className="pg-bullets">
              <li>Questions about enrolment, certificates or payment for a course go to the platform that runs it.</li>
              <li>To suggest a course, include its link and the platform it is on.</li>
              <li>This is a demo build: the form checks your input but sends nothing.</li>
            </ul>
          </div>
        </aside>
      </Wrap>
    </div>
  )
}
