// @flow
import * as React from 'react'
import isEqual from 'lodash/isEqual'
import createFilter from 'mapeo-entity-filter'

import ObservationDialog from './ObservationDialog'
import getStats from './stats'
import { defaultGetPreset } from './utils/helpers'

import type { Observation } from 'mapeo-schema'
import type {
  PresetWithFields,
  PresetWithAdditionalFields,
  GetMedia,
  Filter
} from './types'

export type CommonViewProps = {
  /** Array of observations to render */
  observations: Array<Observation>,
  /** Called when an observation is editing/updated */
  onUpdateObservation: (observation: Observation) => void,
  /** A function called with an observation that should return a matching preset
   * with field definitions */
  getPreset?: Observation => PresetWithFields | void,
  /** Base URL for mapeo-core */
  apiUrl: string,
  /** Filter to apply to observations */
  filter?: Filter
}

type Props = {
  ...$Exact<CommonViewProps>,
  children: ({
    filteredObservations: Array<Observation>,
    onClickObservation: (observationId: string, imageIndex?: number) => void,
    getPreset: Observation => PresetWithAdditionalFields,
    getMedia: GetMedia
  }) => React.Node
}

const noop = obs => {}

const WrappedMapView = ({
  observations,
  onUpdateObservation,
  getPreset = noop,
  apiUrl,
  filter,
  children,
  ...otherProps
}: Props) => {
  const stats = React.useMemo(() => getStats(observations), [observations])
  const [editingObservation, setEditingObservation] = React.useState(null)
  const [
    editingInitialImageIndex,
    setEditingInitialImageIndex
  ] = React.useState()

  const getPresetWithFallback = React.useCallback(
    (observation: Observation): PresetWithAdditionalFields => {
      const preset = getPreset(observation)
      const defaultPreset = defaultGetPreset(observation, stats)
      if (!preset) return defaultPreset
      return {
        ...preset,
        additionalFields: defaultPreset.additionalFields.filter(
          // Any fields that are not defined in the preset we show as 'additionalFields'
          additionalField => {
            return !preset.fields.find(field =>
              isEqual(field.key, additionalField.key)
            )
          }
        )
      }
    },
    [getPreset, stats]
  )

  const handleObservationClick = React.useCallback(
    (observationId, imageIndex) => {
      setEditingInitialImageIndex(imageIndex)
      setEditingObservation(observations.find(obs => obs.id === observationId))
    },
    [observations]
  )

  const getMedia = React.useCallback(
    (attachment, { width = 800 } = {}) => {
      const dpr = window.devicePixelRatio
      const size =
        width < 300 * dpr
          ? 'thumbnail'
          : width < 1200 * dpr
          ? 'preview'
          : 'original'
      return {
        src: `${(apiUrl || '').replace(/\/$/, '')}/media/${size}/${
          attachment.id
        }`,
        type: 'image'
      }
    },
    [apiUrl]
  )

  const filterFunction = React.useMemo(() => createFilter(filter), [filter])
  const filteredObservations = React.useMemo(
    () => (filter ? observations.filter(filterFunction) : observations),
    [observations, filterFunction, filter]
  )

  return (
    <>
      {children({
        onClickObservation: handleObservationClick,
        filteredObservations,
        getPreset: getPresetWithFallback,
        getMedia
      })}
      <ObservationDialog
        open={!!editingObservation}
        observation={editingObservation}
        initialImageIndex={editingInitialImageIndex}
        getPreset={getPresetWithFallback}
        getMedia={getMedia}
        onRequestClose={() => setEditingObservation(false)}
        onSave={onUpdateObservation}
      />
    </>
  )
}

export default WrappedMapView
