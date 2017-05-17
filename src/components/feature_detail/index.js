import React from 'react'

import { connect } from 'react-redux'
import { Card, CardMedia, CardText, CardHeader, CardActions } from 'material-ui/Card'
import RaisedButton from 'material-ui/RaisedButton'
import EditIcon from 'material-ui/svg-icons/editor/mode-edit'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui/svg-icons/navigation/close'
import {FormattedMessage, defineMessages} from 'react-intl'
import assign from 'object-assign'
import {unflatten} from 'flat'

import FormattedValue from '../shared/formatted_value'
import getFeaturesById from '../../selectors/features_by_id'
import getFieldMapping from '../../selectors/field_mapping'
import getColorIndex from '../../selectors/color_index'
import getHiddenFields from '../../selectors/hidden_fields'
import getFieldAnalysis from '../../selectors/field_analysis'
import {createMessage as msg} from '../../util/intl_helpers'
import Image from '../image'
import MarkerIcon from './marker_icon'
import FeatureTable from './feature_table'
import {updateHiddenFields, editFeature} from '../../action_creators'
import {FIELD_TYPE_LOCATION, FIELD_TYPE_SPACE_DELIMITED} from '../../constants'

const styles = {
  card: {
    overflow: 'auto',
    width: '100%'
  },
  cardUnrestricted: {
    width: '100%'
  },
  header: {
    lineHeight: '22px',
    boxSizing: 'content-box',
    borderBottom: '1px solid #cccccc'
  },
  markerIcon: {
    width: 40,
    height: 40,
    margin: 0,
    marginRight: 16
  },
  media: {
    position: 'relative',
    height: '100%',
    padding: '67% 0 0 0'
  },
  img: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    position: 'absolute',
    objectFit: 'cover'
  },
  button: {
    margin: '8px 16px 8px 8px'
  }
}

const messages = defineMessages({
  editButton: {
    id: 'feature.editButton',
    defaultMessage: 'Edit',
    description: 'Edit button label'
  },
  closeButton: {
    id: 'feature.closeButton',
    defaultMessage: 'Close',
    description: 'Close button label'
  },
  cancelButton: {
    id: 'feature.cancelButton',
    defaultMessage: 'Cancel',
    description: 'Cancel button label'
  },
  saveButton: {
    id: 'feature.saveButton',
    defaultMessage: 'Save',
    description: 'Save button label'
  }
})

const Actions = ({style, editMode, onCloseClick, onEditClick, onCancelClick, onSaveClick}) => (
  editMode
  ? <CardActions style={style}>
    <RaisedButton
      label={<FormattedMessage {...messages.cancelButton} />}
      onTouchTap={onCancelClick}
      style={styles.button}
    />
    <RaisedButton
      label={<FormattedMessage {...messages.saveButton} />}
      primary
      onTouchTap={onSaveClick}
      style={styles.button}
    />
  </CardActions>
  : <CardActions style={style}>
    <RaisedButton
      label={<FormattedMessage {...messages.editButton} />}
      icon={<EditIcon />}
      onTouchTap={onEditClick}
      style={styles.button}
    />
    <RaisedButton
      label={<FormattedMessage {...messages.closeButton} />}
      primary
      onTouchTap={onCloseClick}
      style={styles.button}
    />
  </CardActions>
)

class FeatureDetail extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editMode: false
    }
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleCancelClick = this.handleCancelClick.bind(this)
    this.handleSaveClick = this.handleSaveClick.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
  }

  handleEditClick () {
    this.setState({
      editMode: true,
      feature: this.props.feature,
      hiddenFields: this.props.hiddenFields
    })
  }

  handleCancelClick () {
    this.setState({editMode: false})
  }

  handleSaveClick () {
    if (this.state.feature !== this.props.feature) {
      const newFeature = untransformFeature(this.state.feature, this.props.fieldAnalysis)
      this.props.onEditFeature(newFeature)
    }
    if (this.state.hiddenFields !== this.props.hiddenFields) {
      this.props.onEditHiddenFields(this.state.hiddenFields)
    }
    this.setState({editMode: false})
  }

  handleVisibilityChange (key, hidden) {
    const hiddenFields = hidden
      ? this.state.hiddenFields.concat([key])
      : this.state.hiddenFields.filter(fieldname => fieldname !== key)
    this.setState({hiddenFields: hiddenFields})
  }

  handleValueChange (key, value) {
    const feature = this.state.feature
    const newFeature = assign({}, feature, {
      properties: assign({}, feature.properties, {
        [key]: value
      })
    })
    this.setState({feature: newFeature})
  }

  render () {
    const {color, label, media, feature, title, subtitle, onCloseClick,
      print, coordFormat, fieldAnalysis, hiddenFields, titleType, subtitleType} = this.props
    const {editMode, feature: editedFeature, hiddenFields: editedHiddenFields} = this.state
    return <Card
      className='card'
      style={styles.card}
      zDepth={0}>
      <CardHeader
        style={styles.header}
        avatar={<MarkerIcon color={color} style={styles.markerIcon} label={label} />}
        title={<FormattedValue value={title} type={titleType} />}
        subtitle={<FormattedValue value={subtitle} type={subtitleType} />}>
        { onCloseClick &&
          <IconButton style={{float: 'right'}} onTouchTap={onCloseClick}>
            <CloseIcon />
          </IconButton>
        }
      </CardHeader>
      <div>
        {media &&
          <CardMedia style={styles.media}>
            <Image style={styles.img} src={media} />
          </CardMedia>}
        <CardText>
          <FeatureTable
            editMode={editMode}
            feature={editMode ? editedFeature : feature}
            fieldAnalysis={fieldAnalysis}
            hiddenFields={editMode ? editedHiddenFields : hiddenFields}
            print={print}
            coordFormat={coordFormat}
            onVisibilityChange={this.handleVisibilityChange}
            onValueChange={this.handleValueChange}
          />
        </CardText>
        <Actions
          style={{textAlign: 'right'}}
          editMode={editMode}
          onChangeProp={this.handlePropEdit}
          onEditClick={this.handleEditClick}
          onCloseClick={onCloseClick}
          onCancelClick={this.handleCancelClick}
          onSaveClick={this.handleSaveClick}
        />
      </div>
    </Card>
  }
}

// The selectors transform input features, we want to undo this before we save
function untransformFeature (feature, fieldAnalysis) {
  const newProps = {}
  const prevProps = feature.properties
  Object.keys(prevProps).forEach(function (key) {
    if (typeof prevProps[key] === 'string') {
      newProps[key] = prevProps[key].trim()
    }
    switch (fieldAnalysis.properties[key].type) {
      case FIELD_TYPE_SPACE_DELIMITED:
        newProps[key] = Array.isArray(prevProps[key]) ? prevProps[key].join(' ') : prevProps[key]
        break
      default:
        newProps[key] = prevProps[key]
    }
  })
  return unflatten(assign({}, feature, {
    properties: newProps
  }))
}

export default connect(
  (state, ownProps) => {
    const featuresById = getFeaturesById(state)
    const colorIndex = getColorIndex(state)
    const fieldMapping = getFieldMapping(state)
    const hiddenFields = getHiddenFields(state)
    const fieldAnalysis = getFieldAnalysis(state)
    const id = ownProps.id || state.ui.featureId
    const feature = featuresById[id]
    if (!feature) return {}
    const geojsonProps = feature.properties
    const fieldAnalysisProps = fieldAnalysis.properties
    return {
      coordFormat: state.settings.coordFormat,
      feature: feature,
      fieldAnalysis: fieldAnalysis,
      hiddenFields: hiddenFields,
      media: geojsonProps[fieldMapping.media],
      title: geojsonProps[fieldMapping.title],
      subtitle: geojsonProps[fieldMapping.subtitle],
      color: colorIndex[geojsonProps[fieldMapping.color]] || geojsonProps[fieldMapping.color] && colorIndex[geojsonProps[fieldMapping.color][0]],
      titleType: fieldAnalysisProps[fieldMapping.title] && fieldAnalysisProps[fieldMapping.title].type,
      subtitleType: fieldAnalysisProps[fieldMapping.subtitle] && fieldAnalysisProps[fieldMapping.subtitle].type
    }
  },
  (dispatch) => ({
    onEditFeature: (feature) => dispatch(editFeature(feature)),
    onEditHiddenFields: (hiddenFields) => dispatch(updateHiddenFields(hiddenFields))
  })
)(FeatureDetail)
