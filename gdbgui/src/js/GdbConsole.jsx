// component to display output from gdb, as well as gdbgui diagnostic messages
//
import React from "react";

import GdbApi from "./GdbApi.jsx";
import constants from "./constants.js";

import debug from 'debug'

const info = debug('gdbgui:GdbConsole:info')

const pre_escape = string => {
  return string
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\t/g, "  ");
};

class GdbConsole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {scrolled_manually_up: false}
  }

  backtrace_button_clicked = event => {
    event.preventDefault();
    GdbApi.backtrace();
  };

  componentDidUpdate() {
    if (!this.state.scrolled_manually_up)
      this.console_el.scrollTop = this.console_el.scrollHeight - this.console_el.clientHeight
  }

  console_scrolled() {
    info("%i is top; currently at %i", this.console_el.scrollTop, this.console_el.scrollHeight - this.console_el.clientHeight)
    this.setState({
      scrolled_manually_up:
        this.console_el.scrollTop !== this.console_el.scrollHeight - this.console_el.clientHeight
    })
  }

  render_entries(console_entries) {
    return console_entries.map((entry, index) => {
      switch (entry.type) {
        case constants.console_entry_type.STD_OUT: {
          let escaped_value = pre_escape(entry.value);
          return (
            <p key={index} className="console-line">
              {escaped_value}
            </p>
          );
        }
        case constants.console_entry_type.STD_ERR: {
          let escaped_value = pre_escape(entry.value);
          return (
            <p key={index} className="console-line stderr">
              {escaped_value}
            </p>
          );
        }
        case constants.console_entry_type.GDBGUI_OUTPUT: {
          let escaped_value = pre_escape(entry.value);
          return (
            <p key={index} className="console-line server-out">
              {escaped_value}
            </p>
          );
        }
        case constants.console_entry_type.GDBGUI_OUTPUT_RAW: {
          return (
            <p key={index} className="console-line server-out">
              {entry.value}
            </p>
          );
        }
        case constants.console_entry_type.SENT_COMMAND: {
          let escaped_value = pre_escape(entry.value);
          return (
            <p key={index}
               className="console-line user-input"
               onClick={() => this.props.on_sent_command_clicked(entry.value)}>
              {escaped_value}
            </p>
          );
        }
        case constants.console_entry_type.AUTOCOMPLETE_OPTION: {
          let escaped_value = pre_escape(entry.value);
          return (
            <p
              key={index}
              className="console-line"
              onClick={() => this.props.on_autocomplete_text_clicked(entry.value)}>
              <span>{escaped_value}</span>
              <span> </span>
              <button
                className="btn btn-outline-success btn-tiny sans-serif"
                onClick={() => GdbApi.run_gdb_command(`help ${entry.value}`)}>
                help
              </button>
            </p>
          );
        }
        case constants.console_entry_type.BACKTRACE_LINK: {
          let escaped_value = pre_escape(entry.value);
          return (
            <div key={index}>
              {escaped_value}
              <button onClick={this.backtrace_button_clicked}
                      className="btn btn-success btn-sm sans-serif">
                Re-enter
              </button>
            </div>
          );
        }
        case constants.console_entry_type.UPGRADE_GDBGUI: {
          return (
            <div
              key={index}
              style={{
                color: "white",
                minHeight: "1em",
                margin: "2px",
                whiteSpace: "pre",
                fontFamily: "arial",
                fontSize: "1.2em"
              }}>
              <span style={{fontWeight: "bold"}}>
                Enter gdbgui ad-free license key to support the project and remove this
                message
              </span>&nbsp;
              <a
                className="btn btn-success btn-sm"
                style={{color: "black"}}
                href={constants.gdbgui_upgrade_url}>
                upgrade
              </a>
              <span> or </span>
              <a
                className="btn btn-success btn-sm"
                style={{color: "black"}}
                href={constants.gdbgui_donate_url}>
                {" "}
                donate
              </a>
            </div>
          );
        }
      }
    });
  }

  render() {
    const {console_entries} = this.props;

    return (
      <div id='console'
           ref={el => this.console_el = el}
           onScroll={this.console_scrolled.bind(this)}>
        {this.render_entries(console_entries)}
      </div>
    );
  }
}

export default GdbConsole;
