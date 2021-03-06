/**
 * A component to render "local" variables, as well as a few static methods to
 * assist in their creation and deletion.
 */

import React from "react";
import {store} from "statorgfc";
import GdbVariable from "./GdbVariable.jsx";

class Locals extends React.Component {
  constructor() {
    super();
    store.connectComponentState(this, ["expressions", "locals"]);
  }

  get_autocreated_obj_from_expr(expr) {
    for (let obj of store.get("expressions")) {
      if (obj.expression === expr && obj.expr_type === "local") {
        return obj;
      }
    }
    return null;
  }

  static clear_autocreated_exprs() {
    let exprs_objs_to_remove = store
      .get("expressions")
      .filter(obj => obj.expr_type === "local");
    exprs_objs_to_remove.map(obj => GdbVariable.delete_gdb_variable(obj.name));
  }

  static clear() {
    store.set("locals", []);
    Locals.clear_autocreated_exprs();
  }

  static save_locals(locals) {
    let locals_with_meta = locals.map(local => {
      // add field to local
      local.can_be_expanded = Locals.can_local_be_expanded(local);
      return local;
    });
    store.set("locals", locals_with_meta);
  }

  static can_local_be_expanded(local) {
    // gdb returns list of locals. We may want to turn that local into a GdbVariable
    // to explore its children ...
    // local has a value associated with it, so it's either a native type or a pointer.
    // It's not a complex type like a struct. therefore return index of * not -1
    // if it's a struct or object that can be evaluated further by gdb : true
    return ("value" in local) ? local.type.indexOf("*") !== -1 : true;
  }

  render() {
    let content = [];
    let sorted_local_objs = _.sortBy(
      store.get("locals"),
      unsorted_obj => unsorted_obj.name
    );

    for (let local of sorted_local_objs) {
      let obj = this.get_autocreated_obj_from_expr(local.name);
      if (obj) {
        content.push(
          <GdbVariable
            obj={obj}
            key={obj.expression}
            expression={obj.expression}
            expr_type="expr"/>
        );
      } else {
        content.push(
          <GdbVariable
            obj={local}
            key={local.name}
            expression={local.name}
            expr_type="local"/>
        );
      }
    }

    if (content.length === 0) {
      return (
        <span key="empty" className="small text-info">
          No locals in this context
        </span>
      );
    } else {
      return content;
    }
  }
}

export default Locals;
