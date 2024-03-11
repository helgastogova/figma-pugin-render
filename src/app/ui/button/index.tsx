import React from 'react'
import cx from 'classnames'

import s from './button.module.css'

interface ComponentProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children?: JSX.Element | string
  type?: 'secondary' | 'primary'
  className?: string
}

const Button = ({ onClick, children, type = 'primary', className }: ComponentProps) => {
  if (!children) return null

  return (
    <button onClick={onClick} className={cx(s.base, s[type], className)}>
      {children}
    </button>
  )
}

export default Button
