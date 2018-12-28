import React from "react";
import Memory from "./Memory.jsx";

class MemoryLink extends React.Component {
  render() {
    // turn 0x00000000000000 into 0x0
    const address_no_leading_zeros = "0x" + parseInt(this.props.addr, 16).toString(16);
    return (
      <span
        className="cursor-pointer text-info"
        onClick={() => Memory.set_inputs_from_address(address_no_leading_zeros)}
        title={`Open in memory pane ${address_no_leading_zeros}`}
        style={this.props.style}>
        {address_no_leading_zeros}
      </span>
    );
  }
  static defaultProps = { style: { fontFamily: "monospace" } };
}

export default MemoryLink;
