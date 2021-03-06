/**
 * A component to show/hide variable exploration when hovering over a variable
 * in the source code
 */
import React from "react";
import {store} from "statorgfc";
import constants from "./constants.js";
import GdbVariable from "./GdbVariable.jsx";

class HoverVar extends React.Component {
  static enter_timeout = undefined; // debounce fetching the expression
  static exit_timeout = undefined; // debounce removing the box
  static left = 0;
  static top = 0;

  constructor(props) {
    super(props);
    let b = $("body")
    // when hovering over a potential variable
    b.on("mouseover", "#code_table span.n", HoverVar.mouseover_variable);
    b.on("mouseleave", "#code_table span.n", HoverVar.mouseout_variable);

    b.on("mouseover", "#code_table span.nx", HoverVar.mouseover_variable);
    b.on("mouseleave", "#code_table span.nx", HoverVar.mouseout_variable);

    // when hovering over the hover var "tooltip"-like window
    b.on("mouseenter", "#hovervar", HoverVar.mouseover_hover_window);
    b.on("mouseleave", "#hovervar", HoverVar.mouseout_hover_window);

    store.connectComponentState(this, ["expressions"]);
  }

  render() {
    let hover_objs = store.get("expressions").filter(o => o.expr_type === "hover"),
      obj;
    if (Array.isArray(hover_objs) && hover_objs.length === 1) {
      obj = hover_objs[0];
    }
    this.obj = obj;

    let position = {
      left: HoverVar.left + "px",
      top: HoverVar.top + "px",
    }

    return obj ?
      <div id="hovervar"
           className='small bg-secondary position-absolute rounded p-1 shadow-lg'
           style={position}>
        <GdbVariable
          obj={obj}
          key={obj.expression}
          expression={obj.expression}
          expr_type="hover"/>
      </div>
      /*otherwise */ : null;

  }

  static mouseover_variable(e) {
    HoverVar.clear_hover_state();

    let rect = e.target.getBoundingClientRect(),
      var_name = e.target.textContent;

    // store coordinates of where the box should be displayed
    HoverVar.left = rect.left;
    HoverVar.top = rect.bottom;

    const WAIT_TIME_SEC = 0.5;
    HoverVar.enter_timeout = setTimeout(() => {
      if (store.get("inferior_program") === constants.inferior_states.paused) {
        let ignore_errors = true;
        GdbVariable.create_variable(var_name, "hover", ignore_errors);
      }
    }, WAIT_TIME_SEC * 1000);
  }

  static mouseout_variable(e) {
    void e;
    const WAIT_TIME_SEC = 0.1;
    HoverVar.exit_timeout = setTimeout(() => {
      HoverVar.clear_hover_state();
    }, WAIT_TIME_SEC * 1000);
  }

  static mouseover_hover_window(e) {
    void e;
    // Mouse went from hovering over variable name in source code to
    // hovering over the window showing the contents of the variable.
    // Don't remove the window in this case.
    clearTimeout(HoverVar.exit_timeout);
  }

  static mouseout_hover_window(e) {
    void e;
    HoverVar.clear_hover_state();
  }

  static clear_hover_state() {
    clearTimeout(HoverVar.enter_timeout);
    clearTimeout(HoverVar.exit_timeout);
    let exprs_objs_to_remove = store
      .get("expressions")
      .filter(obj => obj.expr_type === "hover");
    exprs_objs_to_remove.map(obj => GdbVariable.delete_gdb_variable(obj.name));
  }
}

export default HoverVar;
