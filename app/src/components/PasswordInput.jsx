import { useState } from 'react'
import { Eye, EyeOff } from './icons.js'

/** Password input with a show/hide toggle button. Pass id, name, value, onChange etc. */
export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="password-input">
      <input {...props} type={visible ? 'text' : 'password'} className={`input ${className}`.trim()} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        aria-controls={props.id}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  )
}
