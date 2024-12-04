import React from 'react'
import cx from 'classnames'

import s from './loader.module.css'

type LoaderProps = {
  className?: string
  type?: 'circle' | 'dots'
}

const Loader = ({ className, type = 'dots' }: LoaderProps) => {
  if (type === 'circle') {
    return (
      <div className={cx(s.loader, className)}>
        <div className={s.spinner}></div>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={cx(s.loader, className)}>
        <div className={s.dots}>
          <div className={s.dot}></div>
          <div className={s.dot}></div>
          <div className={s.dot}></div>
        </div>
      </div>
    )
  }

  return null
}

export default Loader
