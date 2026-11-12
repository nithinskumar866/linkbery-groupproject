import { useState } from 'react'
import { findPlatform, initials } from './utils.js'

/** Platform logo image, falling back to initials (also if the image fails to load). */
export default function PlatformLogo({ name, size = 20, decorative = false }) {
  const platform = findPlatform(name)
  const [failed, setFailed] = useState(false)
  const label = decorative ? '' : `${name || 'Unknown platform'} logo`
  const style = { width: size, height: size }
  const radius = size >= 40 ? 'platform-logo-lg' : ''

  if (platform?.logo && !failed) {
    return (
      <img
        className={`platform-logo ${radius}`}
        src={platform.logo}
        alt={label}
        width={size}
        height={size}
        style={style}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <span
      className={`platform-logo platform-logo-initials ${radius}`}
      style={{ ...style, fontSize: Math.max(9, Math.round(size * 0.4)) }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {initials(name)}
    </span>
  )
}
