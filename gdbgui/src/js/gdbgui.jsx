/**
 * This is the entrypoint to the frontend application.
 *
 * store (global state) is managed in a single location, and each time the store
 * changes, components are notified and update accordingly.
 *
 */

/* global initial_data */
/* global debug_enabled */

import 'bootstrap';
import 'jquery.flot'
import '../../static/scss/main.scss'

import ReactDOM from "react-dom";
import React from "react";
import {middleware, store} from "statorgfc";
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
import ToolTip from "./ToolTip.jsx";
import TopBar from "./TopBar.jsx";
import ToolTipTourguide from "./ToolTipTourguide.jsx";
import {step4} from "./TourGuide.jsx";
import PanelGroup from "./PanelGroup";

import debug from 'debug'
const l = debug('gdbgui:gdbgui')
l.enabled = debug_enabled

const store_options = {
  immutable: false,
  debounce_ms: 10
};
store.initialize(initial_store_data, store_options);
if (l.enabled) {
  // log call store changes in console except if changed key was in
  // constants.keys_to_not_log_changes_in_console
  store.use(function (key, oldval, newval) {
    if (constants.keys_to_not_log_changes_in_console.indexOf(key) === -1) {
      middleware.logChanges(key, oldval, newval);
    }
    return true;
  });
}
// make this visible in the console
window.store = store;

class Gdbgui extends React.PureComponent {

  componentWillMount() {
    GdbApi.init();
    GlobalEvents.init();
    FileOps.init(); // this should be initialized before components that use store key 'source_code_state'
  }

  componentDidMount() {
    if (debug) {
      console.warn(store.getUnwatchedKeys());
    }
  }


  render() {
    return (debug_enabled ?
      <div className='application-container'>
        <TopBar initial_user_input={initial_data.initial_binary_and_args}/>
        <PanelGroup borderClassName='divider-border'
                    direction='column'
                    spacing={4}>

          <PanelGroup borderClassName='divider-border'
                      panelWidths={[{
                        size: 100,
                        resize: 'dynamic'
                      }, {resize: 'stretch'}, {resize: 'dynamic'},]}
                      spacing={4}>
            <div className='panel-group bg-light'>wow</div>
            <div className='panel-group bg-info'>cool</div>
            <div className='panel-group bg-dark'>story</div>
          </PanelGroup>
          <div>footer</div>
        </PanelGroup>
      </div> :
      <div>

        <div className="row no-gutters">
          <FoldersView/>
          <MiddleLeft/>
          <RightSidebar signals={initial_data.signals} debug={debug}/>
        </div>

        <nav className="fixed-bottom bg-light">
          <ToolTipTourguide
            step_num={4}
            position={"topleft"}
            content={step4}/>
          <GdbConsoleContainer/>
        </nav>

        {/* below are elements that are only displayed under certain conditions */}
        <Modal/>
        <HoverVar/>
        <ToolTip/>
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
    );
  }
}

ReactDOM.render(<Gdbgui/>, document.getElementById("gdbgui-application"));
