import React from "react";
import { store } from "statorgfc";

class CopyToClipboard extends React.Component {
  componentDidMount() {
    $('[data-toggle="popover"]').popover({
      trigger: 'focus',delay: { "show": 0, "hide": 300 }
    })
  }

  render() {
    if (!this.props.content) {
      return null;
    }

    return (
      <button
        className='btn btn-tiny'
        ref={node => (this.node = node)}
        data-toggle="tooltip"
        data-placement="top"
        title="Copy to clipboard"
        onClick={() => {
          let textarea = store.get("textarea_to_copy_to_clipboard");
          textarea.value = this.props.content;
          textarea.select();
          document.execCommand("copy") || console.error('failed to copy');
        }}>
        <a tabIndex="0"
           role="button"
           data-toggle="popover"
           data-content="Copied!"
           data-trigger="focus">
          <span className='fa fa-copy text-info'/>
        </a>
      </button>
    );
  }
}

export default CopyToClipboard;
