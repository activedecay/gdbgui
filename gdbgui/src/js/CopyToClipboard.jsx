import React from "react";
import {store} from "statorgfc";
import debug from 'debug'

const error = debug('gdbgui:CopyToClipboard:error')


class CopyToClipboard extends React.Component {
  componentDidMount() {
    const template =
      '<div class="popover bg-success small" role="tooltip">' +
      ' <div class="arrow arrow-bottom"/>' +
      ' <div class="popover-body small"/>' +
      '</div>'

    $('a.copy-to-clipboard[data-toggle="popover"]').popover({
      trigger: 'focus', delay: {"show": 0, "hide": 400},
      placement: 'bottom',
      template,
    })
  }

  render() {
    if (!this.props.content) {
      return null;
    }

    return (
      <a tabIndex="0"
         className='btn btn-tiny copy-to-clipboard'
         ref={node => (this.node = node)}
         title="Copy to clipboard"
         onClick={() => {
           let textarea = store.get("textarea_to_copy_to_clipboard");
           textarea.value = this.props.content;
           textarea.select();
           document.execCommand("copy") || error('failed to copy');
         }}
         data-toggle="popover"
         data-content="Copied!"
         data-trigger="focus">
          <span title="Copy to clipboard"
                className='fa fa-copy text-info'/>
      </a>
    );
  }
}

export default CopyToClipboard;
