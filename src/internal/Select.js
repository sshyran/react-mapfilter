// @flow
import React from 'react'
import Downshift from 'downshift'
import TextField from '@material-ui/core/TextField'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import matchSorter from 'match-sorter'

import { makeStyles } from '../utils/styles'

import type { SelectableFieldValue } from '../types'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    height: 250
  },
  container: {
    flexGrow: 1,
    position: 'relative'
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
  divider: {
    height: theme.spacing(2)
  }
}))

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput
        },
        ...InputProps
      }}
      {...other}
    />
  )
}

type Suggestion = {|
  label: string,
  value: SelectableFieldValue
|}

type RenderSuggestionProps = {|
  highlightedIndex: number | null,
  index: number,
  itemProps: any,
  selectedItem: string,
  suggestion: Suggestion
|}

function renderSuggestion(suggestionProps: RenderSuggestionProps) {
  const {
    suggestion,
    index,
    itemProps,
    highlightedIndex,
    selectedItem
  } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
        textOverflow: 'ellipsis'
      }}>
      {suggestion.label}
    </MenuItem>
  )
}

function getSuggestions(
  value: string,
  suggestions: Array<Suggestion>
): Array<Suggestion> {
  return value.length === 0
    ? suggestions
    : matchSorter(suggestions, value, {
        keys: [
          item => item.label,
          item => (typeof item.value === 'string' ? item.value : undefined)
        ]
      })
}

type Props = {|
  value: SelectableFieldValue,
  placeholder?: string,
  onChange: (value: SelectableFieldValue) => any,
  suggestions: Array<Suggestion>
|}

/**
 * A multi-select field that allows the user to enter a value that is not on the
 * list. Allows the selection of non-string values from a list, but the labels
 * for each item must be unique for this to work reliably
 */
export const SelectOne = ({
  value,
  placeholder,
  onChange,
  suggestions
}: Props) => {
  let popperNode
  const classes = useStyles()

  const matchingSuggestion = suggestions.find(item =>
    lowerCaseEqual(item.value, value)
  )
  const displayValue = matchingSuggestion ? matchingSuggestion.label : value

  function onStateChange(changes) {
    let newValue
    if (Object.prototype.hasOwnProperty.call(changes, 'selectedItem')) {
      newValue = changes.selectedItem
    } else if (Object.prototype.hasOwnProperty.call(changes, 'inputValue')) {
      newValue = changes.inputValue
    } else {
      return
    }
    const matchingSuggestion = suggestions.find(item =>
      lowerCaseEqual(item.label === newValue)
    )
    newValue = newValue === undefined ? null : newValue
    onChange(matchingSuggestion ? matchingSuggestion.value : newValue)
  }

  return (
    <Downshift
      id="downshift-popper"
      selectedItem={typeof displayValue === 'string' ? displayValue : ''}
      onStateChange={onStateChange}>
      {({
        clearSelection,
        // $FlowFixMe
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        // $FlowFixMe
        highlightedIndex,
        // $FlowFixMe
        inputValue,
        isOpen,
        openMenu,
        // $FlowFixMe
        selectedItem
      }) => {
        const { onBlur, onFocus, ...inputProps } = getInputProps({
          onChange: event => {
            if (event.target.value === '') {
              clearSelection()
            }
          },
          onFocus: openMenu,
          placeholder: placeholder
        })

        return (
          <div className={classes.container}>
            {renderInput({
              fullWidth: true,
              classes,
              InputProps: { onBlur, onFocus },
              InputLabelProps: getLabelProps({ shrink: true }),
              inputProps,
              ref: node => {
                popperNode = node
              }
            })}

            <Popper open={isOpen} anchorEl={popperNode}>
              <div
                {...(isOpen
                  ? getMenuProps({}, { suppressRefError: true })
                  : {})}>
                <Paper
                  square
                  style={{
                    marginTop: 8,
                    width: popperNode ? popperNode.clientWidth : undefined,
                    maxHeight: 400,
                    overflow: 'scroll'
                  }}>
                  {getSuggestions(inputValue, suggestions).map(
                    (suggestion, index) =>
                      renderSuggestion({
                        suggestion,
                        index,
                        itemProps: getItemProps({ item: suggestion.label }),
                        highlightedIndex,
                        selectedItem
                      })
                  )}
                </Paper>
              </div>
            </Popper>
          </div>
        )
      }}
    </Downshift>
  )
}

// for two values, if strings, compare lower case, otherwise strict equal
function lowerCaseEqual(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLowerCase() === b.toLowerCase()
  } else {
    return a === b
  }
}