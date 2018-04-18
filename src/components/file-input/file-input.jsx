import React from 'react'
import PropTypes from 'prop-types'

import ErrorTip from '../error-tip'
import { requiredPropsLogger } from '../../util/required-props-logger'
import '../../styles/inputs.scss'

class FileInput extends React.Component {
  state = {
    fileText: '',
    focused: false
  }

  static defaultProps = {
    clearable: false
  }

  static propTypes = {
    accept: PropTypes.string /* file type */,
    clearable: PropTypes.bool,
    containerClass: PropTypes.string,
    error: PropTypes.string,
    formId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    multiple: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    suppressErrors: PropTypes.bool
  }

  onFocusIn = e => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      focused: true
    })

    if (this.props.onFocus) {
      this.props.onFocus(this.props.formId, this.props.name)
    }
  }

  onFocusOut = e => {
    if (e) {
      e.preventDefault()
    }
    this.setState({
      focused: false
    })

    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  }

  onKeyDown = evt => {
    const e = evt || window.event
    const keyCode = e.which || e.keyCode

    // 13 is 'enter' key
    if (keyCode === 13) {
      document.getElementById(this.props.id || this.props.name).click()
    }
  }

  triggerInput = e => {
    const input = document.getElementById(this.props.id || this.props.name)
    if (e.target.getAttribute('type') === 'file') {
      return
    }
    e.preventDefault()
    input.click()
  }

  clearInput = e => {
    e.preventDefault()
    document.getElementById(this.props.id || this.props.name).value = ''
    this.setState(
      {
        fileText: ''
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(
            this.props.formId,
            this.props.name,
            '',
            'file',
            this.props.multiple
          )
        }
      }
    )
  }

  updateText = e => {
    e.persist()
    const fileElem = document.getElementById(this.props.id || this.props.name)

    if (!fileElem.files.length) return

    let fileNames = [...fileElem.files].map(file => file.name)

    if (!this.props.multiple && this.state.fileText === fileNames) {
      return
    }

    this.setState(
      {
        fileText: fileNames.join(', ')
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(
            this.props.formId,
            this.props.name,
            [...fileElem.files],
            'file',
            this.props.multiple
          )
        }
      }
    )

    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  }

  componentDidMount() {
    const requiredProps = ['formId', 'label', 'name', 'onChange']
    const recommendedProps = ['accept']

    requiredPropsLogger(this.props, requiredProps, recommendedProps)
  }

  render = () => {
    const {
      accept,
      clearable,
      containerClass,
      error,
      formData,
      formId,
      id,
      label,
      multiple,
      name,
      required,
      suppressErrors,
      ...props
    } = this.props
    let requiredString = ''
    let attr = { ...props }

    if (required) {
      requiredString = (
        <span>
          {'\u00A0'}*<span className='u-sr-only'> required field</span>
        </span>
      )
      attr['required'] = true
      attr['aria-required'] = 'true'
    }

    let err = error
    if (
      Object.keys(this.props).indexOf('files') === -1 &&
      formData &&
      Object.keys(formData).indexOf(name) > -1
    ) {
      attr.files = formData[name].value
      err = formData[name].error
    }

    const allowClear = clearable && !!this.state.fileText

    return (
      <label
        htmlFor={this.props.name}
        className={`Input-label Input--file ${containerClass || ''}`}
        onClick={allowClear ? this.clearInput : this.triggerInput}
        id={`${name}-label`}
        onFocus={this.onFocusIn}
        onKeyDown={this.onKeyDown}
        onBlur={this.onFocusOut}
      >
        <span className='Input--file-label-text'>
          {label}
          {requiredString}
        </span>
        <div className='Input-placeholder Input-placeholder--file' tabIndex={0}>
          <div className='Input--file-text'>{this.state.fileText}</div>
          {clearable && this.state.fileText ? (
            <div className='Btn'>
              Clear <span className='u-sr-only'> all files</span>
            </div>
          ) : (
            <div className='Btn'>
              Browse <span className='u-sr-only'>local file system</span>
            </div>
          )}
        </div>
        {err &&
          !this.state.focused &&
          !suppressErrors && <ErrorTip contents={err} />}
        <input
          name={name}
          id={id || name}
          {...attr}
          type='file'
          data-validate={required ? 'not-empty' : null}
          className='input u-sr-only'
          style={{ display: 'none' }}
          onChange={this.updateText}
          accept={accept}
          data-multiple-caption={
            multiple
              ? `${
                  (this.state.fileText || '').split(', ').length
                } files selected`
              : ''
          }
          multiple={multiple}
          data-validate='file'
          tabIndex={-1}
          aria-hidden
        />
      </label>
    )
  }
}

export default FileInput
