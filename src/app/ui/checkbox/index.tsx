// простой компонент checkbox

import React from 'react'
import { Text } from '@ui'
import s from './checkbox.module.css'

const Checkbox = ({ label, checked, onChange }) => {
  return (
    <div className={s.checkboxContainer}>
      <label className={s.label}>
        <input type="checkbox" checked={checked} onChange={onChange} className={s.checkbox} />

        <Text variant="body/base" color="black">
          {label}
        </Text>
      </label>
    </div>
  )
}

export default Checkbox
