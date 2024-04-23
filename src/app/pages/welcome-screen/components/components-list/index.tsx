import React, { useState } from 'react'
import { Text, Checkbox } from '@ui'

import s from './list.module.css'

export const ComponentsList = ({
  hasSelectedComponents,
  componentsArray = [],
  currentRender,
  onCheckboxChange,
  selectedToRenderComponents,
}) => {
  const [selected, setSelected] = useState(selectedToRenderComponents)

  if (currentRender === 'loading') {
    return (
      <div>
        <Text as="div" variant="heading/small" color="black">
          Loading...
        </Text>
        <div>{currentRender}</div>
      </div>
    )
  }
  const label = hasSelectedComponents ? 'selection' : 'file'

  const handleCheckboxChange = (item, removeFromSelection) => {
    const updatedSelected = removeFromSelection
      ? selected.filter((i) => i !== item)
      : selected.includes(item)
        ? selected.filter((id) => id !== item.id)
        : [...selected, item]

    setSelected(updatedSelected)
    onCheckboxChange(updatedSelected)
  }

  return (
    <div>
      <Text as="div" variant="heading/medium" color="black" className={s.title}>
        {componentsArray.length > 0
          ? `We found the following components in your ${label}:`
          : `No components were found in your ${label}.`}
      </Text>

      <div>
        <Checkbox
          label="Select all"
          checked={selected.length === componentsArray.length}
          onChange={() => {
            setSelected(selected.length === componentsArray.length ? [] : componentsArray)
            onCheckboxChange(selected.length === componentsArray.length ? [] : componentsArray)
          }}
        />
        {componentsArray.map((item, i) => (
          <div key={`${item.id}_${i}`}>
            <Checkbox
              label={
                <>
                  {item.name}
                  <Text variant="body/base" color="grey" className={s.numberOfComponents}>
                    {' '}
                    {item.numberOfComponents}
                  </Text>
                  {/* {item.id} - {item.name} ({item.numberOfComponents}) */}
                </>
              }
              checked={selected.includes(item)}
              onChange={() => {
                handleCheckboxChange(item, selected.includes(item))
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
