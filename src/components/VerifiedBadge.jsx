import React from 'react'
import verifiedIcon from '../assets/verified_icon.png'

function VerifiedBadge({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <img
      src={verifiedIcon}
      alt="Verified"
      className={`${sizeClasses[size]} inline-block object-contain ${className}`}
    />
  )
}

export default VerifiedBadge