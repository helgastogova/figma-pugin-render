import React from 'react'

import s from './loader.module.css'

export const Loader = () => {
  return (
    <div>
      <h1 className={s.loader} />
      <div className={s.box}>
        <div className={s.cat}>
          <div className={s.body}></div>
          <div className={s.body}></div>
          <div className={s.tail}></div>
          <div className={s.head}></div>
        </div>
      </div>
    </div>
  )
}
