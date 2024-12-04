import React from 'react'
import cx from 'classnames'
import Loader from '../loader'

import s from './button.module.css'

interface ComponentProps {
  onClick?: () => void
  type?: 'primary' | 'secondary'
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
}

const Button = ({ onClick, children, type = 'primary', disabled, loading, className }: ComponentProps) => {
  if (!children) return null

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cx(s.base, s[type], disabled && s.disabled, loading && s.loading, className)}
    >
      {loading ? <Loader type="dots" /> : children}
    </button>
  )
}

export default Button
