/**
 * A component to show/hide variable exploration when hovering over a variable
 * in the source code
 */

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

class Collapser extends React.Component {
  static defaultProps = { collapsed: false, id: "" };

  constructor(props) {
    super();
    this.state = {
      collapsed: props.collapsed,
      autosize: true,
      height_px: null, // if an integer, force height to this value
      _mouse_y_click_pos_px: null,
      _height_when_clicked: null
    };
    this.onmousedown_resizer = this.onmousedown_resizer.bind(this);
    this.onmouseup_resizer = this.onmouseup_resizer.bind(this);
    this.onmousemove_resizer = this.onmousemove_resizer.bind(this);
    this.onclick_restore_autosize = this.onclick_restore_autosize.bind(this);

    onmouseup_in_parent_callbacks.push(this.onmouseup_resizer.bind(this));
    onmousemove_in_parent_callbacks.push(this.onmousemove_resizer.bind(this));
  }

  toggle_visibility() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  onmousedown_resizer(e) {
    this._resizing = true;
    this._page_y_orig = e.pageY;
    this._height_when_clicked = this.collapser_box_node.clientHeight;
  }

  onmouseup_resizer() {
    this._resizing = false;
  }

  onmousemove_resizer(e) {
    if (this._resizing) {
      let dh = e.pageY - this._page_y_orig;
      this.setState({
        height_px: this._height_when_clicked + dh,
        autosize: false
      });
    }
  }

  onclick_restore_autosize() {
    this.setState({ autosize: true });
  }

  render() {
    let style = {
      height: this.state.autosize ? "auto" : this.state.height_px + "px",
      overflow: this.state.autosize ? "visible" : "auto"
    };

    let reset_size_button = "";
    if (!this.state.autosize) {
      reset_size_button = (
        <button
          onClick={this.onclick_restore_autosize}
          className="placeholder reset-height btn btn-default btn-xs"
          title={
            "Height frozen at " + this.state.height_px + "px"
          }>
          auto
        </button>
      );
    }

    let resizer = "";
    if (!this.state.collapsed) {
      resizer = (
        <React.Fragment>
          <div
            className="rowresizer"
            onMouseDown={this.onmousedown_resizer}
            style={{ textAlign: "right" }}
            title="Click and drag to resize height"
          >
            {" "}
            {reset_size_button}
          </div>
        </React.Fragment>
      );
    }

    return (
      <div className="collapser">
        <div className="pointer titlebar" onClick={this.toggle_visibility.bind(this)}>
          <span
            className={`glyphicon titlebar chevron glyphicon-chevron-${
              this.state.collapsed ? "right" : "down"
              }`}/>
          <span>{this.props.title}</span>
        </div>

        <div
          className={this.state.collapsed ? "hidden" : ""}
          id={this.props.id}
          style={style}
          ref={n => (this.collapser_box_node = n)}
        >
          {this.props.content}
        </div>

        {resizer}
      </div>
    );
  }
}

class RightSidebar extends React.Component {
  render() {
    let input_style = {
      display: "inline",
      width: "100px",
      padding: "6px 6px",
      height: "25px",
      fontSize: "1em"
    };

    return (
      <div
        className='col-sm-6'
        onMouseUp={onmouseup_in_parent_callback}
        onMouseMove={onmousemove_in_parent_callback}>

        <ToolTipTourguide
          position={"topleft"}
          content={step5}
          step_num={5}/>

        <Collapser title="threads" content={<Threads/>}/>

        <Collapser id="locals" title="local variables" content={<Locals/>}/>
        <Collapser id="expressions" title="expressions" content={<Expressions/>}/>
        <Collapser
          title="tree"
          content={
            <div>
              <input
                id="tree_width"
                className="form-control"
                placeholder="width (px)"
                style={input_style}
              />
              <input
                id="tree_height"
                className="form-control"
                placeholder="height (px)"
                style={input_style}
              />
              <div id={constants.tree_component_id}/>
            </div>
          }
        />
        <Collapser id="memory" title="memory" content={<Memory/>}/>
        <Collapser title="breakpoints" content={<Breakpoints/>}/>
        <Collapser
          title="signals"
          content={<InferiorProgramInfo signals={this.props.signals}/>}
        />
        <Collapser title="registers" content={<Registers/>}/>

        {this.props.debug ? <Collapser title="gdb mi output" content={<GdbMiOutput id="gdb_mi_output"/>}/>
          /* otherwise */ : null}
      </div>
    );
  }

  componentDidMount() {
    Tree.init();
  }
}

export default RightSidebar;
