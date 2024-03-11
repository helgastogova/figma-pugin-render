import React from 'react'
import cx from 'classnames'
import s from './layout.module.css'

interface LayoutProps {
  children?: React.ReactNode
  centered?: boolean
  className?: string
}

const Layout: React.FC<LayoutProps> = ({ children, centered, className }) => {
  if (!children) return null

  return <div className={cx(s.root, centered && s.centered, className)}>{children}</div>
}

export default Layout
