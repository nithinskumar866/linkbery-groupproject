import { useState } from 'react'
import { findPlatform, initials, hueFor } from './utils.js'

/** Platform logo image, falling back to coloured initials (also if the image fails to load). */
export default function PlatformLogo({ name, size = 36, decorative = false }) {
  const platform = findPlatform(name)
  const [failed, setFailed] = useState(false)
  const label = decorative ? '' : `${name || 'Unknown platform'} logo`
  const style = { width: size, height: size }

  if (platform?.logo && !failed) {
    return (
      <img
        className="platform-logo"
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
      className="platform-logo platform-logo-initials"
      style={{ ...style, fontSize: Math.round(size * 0.38), '--hue': hueFor(name) }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {initials(name)}
    </span>
  )
}
