import PropTypes from 'prop-types'
import React from 'react'
import Grid from 'react-virtualized/dist/commonjs/Grid/Grid'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import getScrollBarWidth from 'get-scrollbar-width'
import assign from 'object-assign'
import {connect} from 'react-redux'

require('react-virtualized/styles.css')

const pixelRatio = window.devicePixelRatio || 1

const styles = {
  image: {
    border: '1px solid white',
    boxSizing: 'border-box',
    display: 'block',
    height: '100%',
    objectFit: 'cover',
    width: '100%',
    cursor: 'pointer',
    backgroundColor: 'rgb(240, 240, 240)'
  }
}
let grid = null

class ImageGrid extends React.Component {
  static propTypes = {
    images: PropTypes.array.isRequired,
    thumbSize: PropTypes.number.isRequired,
    onImageClick: PropTypes.func
  }

  static defaultProps = {
    thumbSize: 200
  }

  componentWillMount () {
    this.scrollbarWidth = getScrollBarWidth()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.images !== nextProps.images) {
      grid && grid.recomputeGridSize()
    }
  }

  handleImageClick (featureId) {
    this.props.onImageClick(featureId)
  }

  render () {
    const {
      images,
      thumbSize
    } = this.props

    return (
      <div style={{width: '100%', height: '100%', position: 'absolute'}}>
        <AutoSizer>
          {({height, width}) => {
            const columnsCount = Math.floor(width / thumbSize)
            const rowsCount = Math.ceil(images.length / columnsCount)
            let cellSize = width / columnsCount
            const overflow = cellSize * rowsCount > height
            if (overflow && this.scrollbarWidth) {
              cellSize = (width - this.scrollbarWidth) / columnsCount
            }
            return <Grid
              ref={inst => { grid = inst }}
              columnCount={columnsCount}
              columnWidth={cellSize}
              height={height}
              cellRenderer={(d) => this._renderCell(width, d)}
              rowCount={rowsCount}
              rowHeight={cellSize}
              width={width}
            />
          }}
        </AutoSizer>
      </div>
    )
  }

  _renderCell = (width, {columnIndex, rowIndex, key, style}) => {
    const {
      images,
      thumbSize,
      resizer
    } = this.props
    const columnsCount = Math.floor(width / thumbSize)
    const image = images[(rowIndex * columnsCount) + columnIndex]
    if (!image) return
    const imgSize = thumbSize * pixelRatio
    const imageUrl = resizer(image.url, imgSize)
    return <img
      src={imageUrl}
      key={key}
      style={assign({}, styles.image, style)}
      onClick={() => this.handleImageClick(image.featureId)}
    />
  }
}

export default connect(
  state => ({resizer: state.resizer})
)(ImageGrid)
