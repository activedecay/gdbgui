import React from "react";

import {store} from "statorgfc";
import BinaryLoader from "./BinaryLoader.jsx";
import ControlButtons from "./ControlButtons.jsx";
import SourceCodeHeading from "./SourceCodeHeading.jsx";
import ToolTipTourguide from "./ToolTipTourguide.jsx";
import FileOps from "./FileOps.jsx";
import GdbApi from "./GdbApi.jsx";
import Actions from "./Actions.js";
import constants from "./constants.js";
import {step0, step3} from "./TourGuide.jsx";
import Settings from "./Settings.jsx";
import debug from 'debug'

const info = debug('gdbgui:TopBar:info')
// debug.enable('gdbgui:TopBar:*') // note, these statements enable logging in localStorage

let onkeyup_jump_to_line = e => {
  if (e.keyCode === constants.ENTER_BUTTON_NUM) {
    Actions.set_line_state(e.currentTarget.value);
  }
};

let click_shutdown_button = function () {
  // no need to show confirmation before leaving, because we're about to prompt the user
  window.onbeforeunload = () => null;
  // prompt user
  if (
    window.confirm(
      "This will terminate the gdbgui for all browser tabs running gdbgui (and their gdb processes). Continue?"
    ) === true
  ) {
    // user wants to shutdown, redirect them to the shutdown page
    window.location = "/shutdown";
  } else {
    // re-add confirmation before leaving page (when user actually leaves at a later time)
    window.onbeforeunload = () => "some text";
  }
};

let About = {
  show_about: function () {
    Actions.show_modal(
      "About gdbgui",
      <React.Fragment>
        <p>
          Original project gdb frontend by Copyright ©
          Chad Smith. <a href="https://github.com/activedecay/gdbgui/blob/master/LICENSE">
            This code's used under a license.
          </a>
        </p>
        <p> Made beautiful by Professor Unbearable,
          the <a href="https://www.unbear.pw/">Unbearable Professional</a>
        </p>
        <table>
          <tbody>
          <tr>
            <td>gdb version: {store.get("gdb_version")}</td>
          </tr>
          <tr>
            <td>gdb pid for this tab: {store.get("gdb_pid")}</td>
          </tr>
          </tbody>
        </table>
      </React.Fragment>
    );
  }
};

const menu = (
  <div className="dropdown">
    <button
      className="btn btn-sm btn-secondary dropdown-toggle shadow"
      type="button"
      data-toggle="dropdown">
      <span className='fa fa-tools'/>
    </button>
    <div className="dropdown-menu">
      <li><a
        className="dropdown-item"
        title="settings"
        onClick={() => Actions.show_modal("Settings", <Settings/>)}>
        Settings
      </a></li>
      <li><a
        className="dropdown-item"
        title="dashboard"
        href="/dashboard">
        Dashboard
      </a></li>
      <li><a
        className="dropdown-item"
        title="show guide"
        onClick={ToolTipTourguide.start_guide}>
        Show guide
      </a></li>

      <div className="dropdown-divider"/>
      <li><a
        className="dropdown-item"
        onClick={About.show_about}>
        About gdbgui
      </a></li>
      <li><a
        className="dropdown-item menu-item-has-icon"
        title="shutdown" onClick={click_shutdown_button}>
        <span className='fa fa-skull menu-item-icon'/> Shutdown `gdbgui` server
      </a></li>
    </div>
    <ToolTipTourguide
      position={"bottomleft"}
      step_num={0}
      content={step0}/>
  </div>
);

class TopBar extends React.Component {
  constructor() {
    super();
    // state local to the component
    this.state = {
      assembly_flavor: "intel", // default to intel (choices are 'att' or 'intel')
      show_spinner: false
    };
    // global state attached to this component
    store.connectComponentState(
      this,
      [
        "debug_in_reverse",
        "source_code_state",
        "waiting_for_response",
        "latest_gdbgui_version",
        "gdbgui_version"
      ],
      this.store_update_callback.bind(this)
    );

    this.spinner_timeout = null;
    this.spinner_timeout_msec = 5000;
  }

  store_update_callback(keys) {
    if (keys.indexOf("waiting_for_response") !== -1) {
      this._clear_spinner_timeout();
      this.setState({show_spinner: false});
      if (this.state.waiting_for_response === true) {
        info('spinner false to true')
        this._set_spinner_timeout();
      }
    }
  }

  _set_spinner_timeout() {
    this.spinner_timeout = setTimeout(() => {
      if (this.state.waiting_for_response) {
        this.setState({show_spinner: true});
      }
    }, this.spinner_timeout_msec);
  }

  _clear_spinner_timeout() {
    clearTimeout(this.spinner_timeout);
  }

  toggle_assembly_flavor() {
    const flavor = this.state.assembly_flavor === "att" ? "intel" : "att";
    this.setState({assembly_flavor: flavor});
    GdbApi.set_assembly_flavor(flavor);
    Actions.clear_cached_assembly();
    FileOps.fetch_assembly_cur_line();
  }

  get_controls() {
    return (
      <div>
        <ControlButtons/>
        <ToolTipTourguide
          step_num={3}
          position={"bottomleft"}
          onClick={e => e.stopPropagation()}
          content={step3}/>
      </div>
    );
  }

  render() {
    let toggle_assm_button = "";
    if (
      this.state.source_code_state ===
      constants.source_code_states.ASSM_AND_SOURCE_CACHED ||
      this.state.source_code_state === constants.source_code_states.ASSM_CACHED
    ) {
      toggle_assm_button = (
        <button
          onClick={this.toggle_assembly_flavor.bind(this)}
          type="button"
          title={"Toggle between assembly flavors"}
          className='btn btn-primary'>
          <span title={`Currently displaying ${this.state.assembly_flavor}. Click to toggle.`}>
            {this.state.assembly_flavor === "att" ? "AT&T" : "Intel"}
          </span>
        </button>
      );
    }

    let reload_button_disabled = "disabled";
    if (
      this.state.source_code_state ===
      constants.source_code_states.ASSM_AND_SOURCE_CACHED ||
      this.state.source_code_state === constants.source_code_states.SOURCE_CACHED
    ) {
      reload_button_disabled = "";
    }
    let reload_button = (
      <button
        onClick={FileOps.refresh_cached_source_files}
        type="button"
        title="Erase file from local cache and re-fetch it"
        className={"btn btn-primary " + reload_button_disabled}>
        <span>Reload file</span>
      </button>
    );

    let reverse_checkbox = (
      <div className="input-group input-group-sm"
           title={"when checked, always attempt to send --reverse to gdb commands (shift)"}>
        <div className="input-group-prepend">
          <span className="input-group-text">Reverse</span>
        </div>
        <div className="input-group-append">
          <div className="input-group-text">
            <input type="checkbox"
                   checked={store.get("debug_in_reverse")}
                   onChange={e => {
                     store.set("debug_in_reverse", e.target.checked);
                   }}/>
          </div>
        </div>
      </div>
    );

    return (
      <div className="sticky-top navbar-light bg-light py-1">

        <div className="container-fluid my-1">
          <div className="row">
            <div className="col-sm-auto">
              {menu}
            </div>
            <div className="col-sm">
              <BinaryLoader initial_user_input={this.props.initial_user_input}/>
            </div>
            <div className="col-sm-auto">
              {this.state.show_spinner ? <span className="fa fa-sync-alt fa-spin"/> : null}
            </div>
            <div className="col-sm-auto">
              {initial_data.rr ? reverse_checkbox : null}
            </div>
            <div className="col-sm-auto">
              {this.get_controls()}
            </div>
          </div>
        </div>

        <div className="container-fluid my-1">
          <div className="row">
            <div className="col-auto">
              <div className="btn-group btn-group-sm">
                <button
                  onClick={() => FileOps.fetch_assembly_cur_line()}
                  title='Fetch disassembly with shortcut "f"'
                  className="btn btn-primary">
                  <span>Fetch disassembly</span>
                </button>

                {reload_button}
                {toggle_assm_button}
              </div>
            </div>

            <div className="col-auto">
              <div className="input-group input-group-sm">
                <div className="input-group-prepend">
                  <span className="input-group-text">Go to line</span>
                </div>
                <input
                  onKeyUp={onkeyup_jump_to_line}
                  autoComplete="on"
                  title='Enter line number and press enter (shortcut "g")'
                  className="form-control md-grow go-to-line"/>
              </div>
            </div>

            <div className="col-auto">
              <SourceCodeHeading/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TopBar;
