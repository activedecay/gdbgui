/**
 * A component to show/hide variable exploration when hovering over a variable
 * in the source code
 */
/* global GeminiScrollbar */

import {store} from "statorgfc";
import React from "react";

import Breakpoints from "./Breakpoints.jsx";
import constants from "./constants.js";
import Expressions from "./Expressions.jsx";
import GdbMiOutput from "./GdbMiOutput.jsx";
import InferiorProgramInfo from "./InferiorProgramInfo.jsx";
import Locals from "./Locals.jsx";
import Memory from "./Memory.jsx";
import Registers from "./Registers.jsx";
import Tree from "./Tree.js";
import Threads from "./Threads.jsx";
import ToolTipTourguide from "./ToolTipTourguide.jsx";
import {step5} from "./TourGuide.jsx";
import Util from "./Util.js";

let onmouseup_in_parent_callbacks = [],
  onmousemove_in_parent_callbacks = [];

let onmouseup_in_parent_callback = function () {
  onmouseup_in_parent_callbacks.map(fn => fn());
};
let onmousemove_in_parent_callback = function (e) {
  onmousemove_in_parent_callbacks.map(fn => {
    fn(e);
  });
};

class RightSidebar extends React.Component {
  constructor() {
    super()
    store.connectComponentState(this,
      [
        "show_filesystem",
        "section_is_visible",
        "root_gdb_tree_var",
      ]
    );
    this.current_tree_var = this.state["root_gdb_tree_var"]
  }

  componentWillUpdate() {
  }

  render() {
    const section_is_visible = this.state.section_is_visible
    if (this.current_tree_var !== this.state["root_gdb_tree_var"]) {
      store.set('section_is_visible', { ...section_is_visible, tree: true });
      store.set('tree_section_visibility_changed', true);
    }
    this.current_tree_var = this.state["root_gdb_tree_var"]
    return (
      <div id='right-sidebar'
           className={`col-${this.state.show_filesystem ? 4 : 6}`}
           onMouseUp={onmouseup_in_parent_callback}
           onMouseMove={onmousemove_in_parent_callback}>
        <GeminiScrollbar>
          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#threads-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['threads'] ? 'right' : 'down'}`}/> Threads
            </button>
          </div>
          <div className={`collapse ${section_is_visible['threads'] ? "show" : ""}`}
               id="threads-panel">
            <div className="card card-body m-1">
              <Threads/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#locals-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['locals'] ? 'right' : 'down'}`}/> Locals
            </button>
          </div>
          <div className={`collapse ${section_is_visible['locals'] ? "show" : ""}`}
               id="locals-panel">
            <div className="card card-body m-1">
              <Locals/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#expressions-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['expressions'] ? 'right' : 'down'}`}/> Expressions
            </button>
          </div>
          <div className={`collapse ${section_is_visible['expressions'] ? "show" : ""}`}
               id="expressions-panel">
            <Expressions/>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#tree-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['tree'] ? 'right' : 'down'}`}/> Tree
            </button>
          </div>
          <div className={`collapse ${section_is_visible['tree'] ? "show" : ""}`}
               id="tree-panel">
            <ul className="nav my-1 px-1">
              <li className="nav-item">
                <div className='input-group input-group-sm'>
                  <input id="tree_width"
                         className="form-control"
                         placeholder="width (px)"/>
                  <input id="tree_height"
                         className="form-control"
                         placeholder="height (px)"/>
                </div>
              </li>
            </ul>
            <div className="card card-body m-1">
              <div className='shadow-lg'
                   id={constants.tree_component_id}/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#memory-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['memory'] ? 'right' : 'down'}`}/> Memory
            </button>
          </div>
          <div className={`collapse ${section_is_visible['memory'] ? "show" : ""}`}
               id="memory-panel">
            <div className="card card-body m-1">
              <Memory/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#breakpoints-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['breakpoints'] ? 'right' : 'down'}`}/> Breakpoints
            </button>
          </div>
          <div className={`collapse ${section_is_visible['breakpoints'] ? "show" : ""}`}
               id="breakpoints-panel">
            <div className="card card-body m-1">
              <Breakpoints/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#signals-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['signals'] ? 'right' : 'down'}`}/> Signals
            </button>
          </div>
          <div className={`collapse ${section_is_visible['signals'] ? "show" : ""}`}
               id="signals-panel">
            <div className="card card-body m-1">
              <InferiorProgramInfo signals={this.props.signals}/>
            </div>
          </div>

          <div>
            <button className="btn btn-primary btn-tiny mx-1"
                    data-toggle="collapse"
                    data-target="#registers-panel">
              <span className={`tiny fa fa-chevron-${!section_is_visible['registers'] ? 'right' : 'down'}`}/> Registers
            </button>
          </div>
          <div className={`collapse ${section_is_visible['registers'] ? "show" : ""}`}
               id="registers-panel">
            <div className="card card-body m-1">
              <Registers/>
            </div>
          </div>

          {this.props.debug ? (
            <React.Fragment>
              <div>
                <button className="btn btn-primary btn-tiny mx-1"
                        data-toggle="collapse"
                        data-target="#debug-panel">
                  <span className={`tiny fa fa-chevron-${!section_is_visible['debug'] ? 'right' : 'down'}`}/> Debug
                </button>
              </div>
              <div className={`collapse ${section_is_visible['debug'] ? "show" : ""}`}
                   id="debug-panel">
                <GdbMiOutput id="gdb_mi_output"/>
              </div>
            </React.Fragment>
          ) /* otherwise */ : null}
        </GeminiScrollbar>
        <ToolTipTourguide
          position={"topleft"}
          content={step5}
          step_num={5}/>
      </div>
    );
  }

  componentDidMount() {
    Tree.init();
    // make an updater function for each show/hide action for every section
    ['threads',
      'locals',
      'expressions',
      'tree',
      'memory',
      'breakpoints',
      'signals',
      'registers',
      'debug',
    ].map(section => {
      const selector = $(`#${section}-panel`)
      selector.on('hide.bs.collapse', () => {
        const update = {
          ...Util.get_local_storage("section_is_visible", {}),
          [`${section}`]: false
        }
        store.set("section_is_visible", update)
        Util.persist_value_for_key("section_is_visible")
      })
      selector.on('show.bs.collapse', () => {
        const update = {
          ...Util.get_local_storage("section_is_visible", {}),
          [`${section}`]: true
        }
        store.set("section_is_visible", update)
        Util.persist_value_for_key("section_is_visible")
      })
    })
  }
}

export default RightSidebar;
