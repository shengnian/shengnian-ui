import { Component, createElement } from 'react'
import classnames from 'classnames'
import PropTypes from './utils/proptypes'


export default class Button extends Component {
    constructor (props) {
        super(props)
        this.handleClick = this.handleClick.bind(this)
        this.locked = false
    }

    handleClick () {
        if (this.locked) return

        const { throttle, onClick } = this.props

        onClick && onClick()

        if (throttle) {
            this.locked = true
            setTimeout(() => {
                this.locked = false
            }, throttle)
        }
    }

    render () {
        let { children, status, size, grid, tag, className, ...others } = this.props

        className = classnames(
            className
        )

        if (others.href) tag = 'a'
        others.onClick = this.handleClick

        delete others.throttle

        return createElement(tag, { className, ...others }, children)
    }
};

Button.propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    once: PropTypes.bool,
    size: PropTypes.size,
    status: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'error', 'info', 'link']),
    style: PropTypes.object,
    tag: PropTypes.string,
    throttle: PropTypes.number,
    type: PropTypes.oneOf(['submit', 'button', 'reset'])
}

Button.defaultProps = {
    size: 'middle',
    status: 'secondary',
    tag: 'button',
    type: 'button'
}