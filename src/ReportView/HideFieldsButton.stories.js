// @flow
import React, { useState } from 'react'

import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import HideFieldsButton from './HideFieldsButton'

const initialFieldState = [
  { fieldkey: 'foo', hidden: false, label: 'Foo' },
  { fieldkey: 'bar', hidden: true, label: 'Bar' },
  { fieldkey: 'qux', hidden: false, label: 'Qux' }
]

export default {
  title: 'ReportView/components/HideFieldsButton'
}

export const defaultStory = () => (
  <HideFieldsButton
    fieldState={initialFieldState}
    onFieldStateUpdate={action('field-state-update')}
  />
)

defaultStory.story = {
  name: 'default'
}

export const withState = () => {
  const WithState = () => {
    const [fieldState, setFieldState] = useState(initialFieldState)
    return (
      <HideFieldsButton
        fieldState={fieldState}
        onFieldStateUpdate={setFieldState}
      />
    )
  }
  return <WithState />
}

withState.story = {
  name: 'with state'
}
