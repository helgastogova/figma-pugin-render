import React from 'react'
import cx from 'classnames'

import Text from '../text'
import s from './checkbox.module.css'

const Checkbox = ({ label, checked, onChange }) => {
  return (
    <div className={s.checkboxContainer}>
      <label className={s.label}>
        <input hidden type="checkbox" checked={checked} onChange={onChange} className={s.checkbox} />
        <div className={cx(s.container, checked && s.checkedContainer)}>
          <svg className={s.svg} xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
            <path
              fill="#fff"
              fillOpacity="1"
              fillRule="evenodd"
              stroke="none"
              d="M1.176 2.824 3.06 4.706 6.824.941 8 2.118 3.059 7.059 0 4l1.176-1.176z"
            ></path>
          </svg>
        </div>
        <Text variant="body/base" color="black">
          {label}
        </Text>
      </label>
    </div>
  )
}

export default Checkbox
