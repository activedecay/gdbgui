/**
 * This is the entrypoint to the frontend application.
 * store (global state) is managed in a single location, and each time the store
 * changes, components are notified and update accordingly.
 */

/* global initial_data */
/* global debug_enabled */

import 'bootstrap';
import 'jquery.flot'
import '../../static/scss/main.scss'

import ReactDOM from "react-dom";
import React from "react";
import {store} from "statorgfc";
import constants from "./constants.js";
import GdbApi from "./GdbApi.jsx";
import FileOps from "./FileOps.jsx";
import FoldersView from "./FoldersView.jsx";
import GdbConsoleContainer from "./GdbConsoleContainer.jsx";
import GlobalEvents from "./GlobalEvents.js";
import HoverVar from "./HoverVar.jsx";
import initial_store_data from "./InitialStoreData.js";
import MiddleLeft from "./MiddleLeft.jsx";
import Modal from "./GdbguiModal.jsx";
import RightSidebar from "./RightSidebar.jsx";
import TopBar from "./TopBar.jsx";
import PanelGroup from "./PanelGroup";
import Util from './Util'

import debug from 'debug'

const info = debug('gdbgui:gdbgui.jsx:info')
const logStore = debug('gdbgui:store:info')
// info.enabled = true

const store_options = {
  immutable: false,
  debounce_ms: 10
};
store.initialize(initial_store_data, store_options);
if (info.enabled) {
  // log call store changes in console except if changed key was in
  // constants.keys_to_not_log_changes_in_console
  store.use(function (key, oldval, newval) {
    if (constants.keys_to_not_log_changes_in_console.indexOf(key) === -1) {
      logStore('%s %j -> %j', key, oldval, newval);
    }
    return true;
  });
}

class Gdbgui extends React.Component {
  constructor(props) {
    super(props)
    let top_3_panels = [{ // filesystem panel
      size: 300,
      minSize: 0,
      resize: 'dynamic',
      snap: [0],
    }, { // code panel
      resize: 'stretch'
    }, { // rightSide panel
      size: 300,
      minSize: 0,
      resize: 'dynamic',
      snap: [0],
    }];
    let outer_panels = [{}, {minSize: 30, snap: [30]}];
    outer_panels = Util.get_local_storage("outer_panel_layout", outer_panels);
    top_3_panels = Util.get_local_storage("top_3_panel_layout", top_3_panels);
    this.state = {top_3_panels,outer_panels}
  }

  componentWillMount() {
    GdbApi.init();
    GlobalEvents.init();
    FileOps.init(); // this should be initialized before components that use store key 'source_code_state'
  }

  componentDidMount() {
    if (debug) {
      logStore('unwatched keys %j', store.getUnwatchedKeys());
    }
  }

  outer_panels_update(panels) {
    this.setState({outer_panels: panels})
    store.set("outer_panel_layout", panels)
    Util.persist_value_for_key("outer_panel_layout")
  }

  top_3_panels_update(panels) {
    this.setState({top_3_panels: panels})
    store.set("top_3_panel_layout", panels)
    Util.persist_value_for_key("top_3_panel_layout")
  }

  render() {
    return (
      <div className='application-container'>
        <TopBar initial_user_input={initial_data.initial_binary_and_args}/>

        {/* the whole gui except for the top nav panel */}
        <div className='application-main-panel'>
          <PanelGroup borderClassName='divider-border'
                      direction='column'
                      panelWidths={this.state.outer_panels}
                      onUpdate={this.outer_panels_update.bind(this)}
                      spacing={4}>
            <PanelGroup borderClassName='divider-border'
                        panelWidths={this.state.top_3_panels}
                        onUpdate={this.top_3_panels_update.bind(this)}
                        panelSnap={60}
                        spacing={4}>
              <FoldersView/>
              <MiddleLeft/>
              <RightSidebar signals={initial_data.signals} debug={debug_enabled}/>
            </PanelGroup>
            <GdbConsoleContainer/>
          </PanelGroup>
        </div>

        {/* hidden things */}
        <Modal/>
        <HoverVar/>
        <textarea
          style={{
            width: "0px",
            height: "0px",
            position: "absolute",
            top: "0",
            left: "-1000px"
          }}
          ref={node => {
            store.set("textarea_to_copy_to_clipboard", node);
          }}/>
      </div>
    )
  }
}

ReactDOM.render(<Gdbgui/>, document.getElementById("gdbgui-application"));
