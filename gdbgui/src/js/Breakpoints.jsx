import React from "react";
import {store} from "statorgfc";
import GdbApi from "./GdbApi.jsx";
import Actions from "./Actions.js";
import Util from "./Util.js";
import FileOps from "./FileOps.jsx";
import {FileLink} from "./Links.jsx";
import debug from 'debug'
const error = debug('gdbgui:Breakpoints:error')

const BreakpointSourceLineCache = {
  _cache: {},
  get_line: function (fullname, linenum) {
    if (
      BreakpointSourceLineCache._cache["fullname"] !== undefined &&
      _.isString(BreakpointSourceLineCache._cache["fullname"][linenum])
    ) {
      return BreakpointSourceLineCache._cache["fullname"][linenum];
    }
    return null;
  },
  add_line: function (fullname, linenum, escaped_text) {
    if (!_.isObject(BreakpointSourceLineCache._cache["fullname"])) {
      BreakpointSourceLineCache._cache["fullname"] = {};
    }
    BreakpointSourceLineCache._cache["fullname"][linenum] = escaped_text;
  }
};

class Breakpoint extends React.Component {
  get_source_line(fullname, linenum) {
    // if we have the source file cached, we can display the line of text
    const MAX_CHARS_TO_SHOW_FROM_SOURCE = 40;
    let line = null;
    if (BreakpointSourceLineCache.get_line(fullname, linenum)) {
      line = BreakpointSourceLineCache.get_line(fullname, linenum);
    } else if (FileOps.line_is_cached(fullname, linenum)) {
      let syntax_highlighted_line = FileOps.get_line_from_file(fullname, linenum);
      line = _.trim(Util.get_text_from_html(syntax_highlighted_line));

      if (line.length > MAX_CHARS_TO_SHOW_FROM_SOURCE) {
        line = line.slice(0, MAX_CHARS_TO_SHOW_FROM_SOURCE) + "...";
      }
      BreakpointSourceLineCache.add_line(fullname, linenum, line);
    }

    return line ? <span className="small monospace">{line}</span>
      /* otherwise */ : <span className='small text-danger'>(file not cached)</span>
  }

  get_delete_jsx(bkpt_num_to_delete) {
    return (
      <button className="btn btn-sm"
              onClick={e => {
                e.stopPropagation();
                Breakpoints.delete_breakpoint(bkpt_num_to_delete);
              }}
              title={`Delete breakpoint ${bkpt_num_to_delete}`}>
        <span className="fa fa-trash"/>
      </button>
    );
  }

  render() {
    let b = this.props.bkpt,
      checked = b.enabled === "y" ? "checked" : "",
      source_line = this.get_source_line(b.fullname_to_display, b.line);

    let info_glyph, function_jsx, bkpt_num_to_delete;
    if (b.is_child_breakpoint) {
      bkpt_num_to_delete = b.parent_breakpoint_number;
      info_glyph = (
        <span
          className="fa fa-th-list"
          title="Child breakpoint automatically created from parent. If parent or any child of this tree is deleted, all related breakpoints will be deleted."
        />
      );
    } else if (b.is_parent_breakpoint) {
      info_glyph = (
        <span
          className="fa fa-th-list"
          title="Parent breakpoint with one or more child breakpoints. If parent or any child of this tree is deleted, all related breakpoints will be deleted."
        />
      );
      bkpt_num_to_delete = b.number;
    } else {
      bkpt_num_to_delete = b.number;
      info_glyph = "";
    }

    const delete_jsx = this.get_delete_jsx(bkpt_num_to_delete);
    let location_jsx = (
      <FileLink
        fullname={b.fullname_to_display}
        file={b.fullname_to_display}
        line={b.line}
      />
    );

    if (b.is_parent_breakpoint) {
      function_jsx = (
        <span className="small text-info">
          {info_glyph} parent breakpoint on inline, template, or ambiguous location
        </span>
      );
    } else {
      let func = b.func === undefined ? "(unknown function)" : b.func;

      function_jsx = (
        <div style={{ display: "inline" }}>
          <span className="monospace" style={{ paddingRight: "5px" }}>
            {info_glyph} {func}
          </span>
          <span style={{ color: "#bbbbbb", fontStyle: "italic" }}>
            thread groups: {b["thread-groups"]}
          </span>
        </div>
      );
    }

    return (
      <div className="breakpoint"
           onClick={() => Actions.view_file(b.fullname_to_display, b.line)}>
        <table className="table-condensed">
          <tbody>
          <tr>
            <td>
              <div className="input-group input-group-sm">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <input type="checkbox"
                           checked={checked}
                           onChange={() => Breakpoints.enable_or_disable_bkpt(checked, b.number)}/>
                  </div>
                </div>
                <div className='input-group-append'>
                  <div className="input-group-text cursor-pointer">
                    {function_jsx} {delete_jsx}
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td>{location_jsx}</td>
          </tr>

          <tr>
            <td>{source_line}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  } // render function
}

class Breakpoints extends React.Component {
  constructor() {
    super();
    store.connectComponentState(this, ["breakpoints"]);
  }

  render() {
    let breakpoints_jsx = [];
    for (let b of store.get("breakpoints")) {
      breakpoints_jsx.push(<Breakpoint bkpt={b} key={b.number}/>);
    }

    if (breakpoints_jsx.length) {
      return breakpoints_jsx;
    } else {
      return <span className="small text-info">No breakpoints</span>;
    }
  }

  static enable_or_disable_bkpt(checked, bkpt_num) {
    if (checked) {
      GdbApi.run_gdb_command([`-break-disable ${bkpt_num}`, GdbApi.get_break_list_cmd()]);
    } else {
      GdbApi.run_gdb_command([`-break-enable ${bkpt_num}`, GdbApi.get_break_list_cmd()]);
    }
  }

  static remove_breakpoint_if_present(fullname, line) {
    if (Breakpoints.has_breakpoint(fullname, line)) {
      let number = Breakpoints.get_breakpoint_number(fullname, line);
      let cmd = [GdbApi.get_delete_break_cmd(number), GdbApi.get_break_list_cmd()];
      GdbApi.run_gdb_command(cmd);
    }
  }

  static add_or_remove_breakpoint(fullname, line) {
    if (Breakpoints.has_breakpoint(fullname, line)) {
      Breakpoints.remove_breakpoint_if_present(fullname, line);
    } else {
      Breakpoints.add_breakpoint(fullname, line);
    }
  }

  static add_breakpoint(fullname, line) {
    GdbApi.run_gdb_command(GdbApi.get_insert_break_cmd(fullname, line));
  }

  static has_breakpoint(fullname, line) {
    let bkpts = store.get("breakpoints");
    for (let b of bkpts) {
      if (b.fullname === fullname && b.line == line) {
        return true;
      }
    }
    return false;
  }

  static get_breakpoint_number(fullname, line) {
    let bkpts = store.get("breakpoints");
    for (let b of bkpts) {
      if (b.fullname === fullname && b.line == line) {
        return b.number;
      }
    }
    error(`could not find breakpoint for ${fullname}:${line}`);
  }

  static delete_breakpoint(breakpoint_number) {
    GdbApi.run_gdb_command([
      GdbApi.get_delete_break_cmd(breakpoint_number),
      GdbApi.get_break_list_cmd()
    ]);
  }

  static get_breakpoint_lines_for_file(fullname) {
    return store
      .get("breakpoints")
      .filter(b => b.fullname_to_display === fullname && b.enabled === "y")
      .map(b => parseInt(b.line));
  }

  static get_disabled_breakpoint_lines_for_file(fullname) {
    return store
      .get("breakpoints")
      .filter(b => b.fullname_to_display === fullname && b.enabled !== "y")
      .map(b => parseInt(b.line));
  }

  static save_breakpoints(payload) {
    store.set("breakpoints", []);
    if (payload && payload.BreakpointTable && payload.BreakpointTable.body) {
      for (let breakpoint of payload.BreakpointTable.body) {
        Breakpoints.save_breakpoint(breakpoint);
      }
    }
  }

  static save_breakpoint(breakpoint) {
    let bkpt = Object.assign({}, breakpoint);

    bkpt.is_parent_breakpoint = bkpt.addr === "(MULTIPLE)";

    // parent breakpoints have numbers like "5.6", whereas normal breakpoints and parent breakpoints have numbers like "5"
    bkpt.is_child_breakpoint = parseInt(bkpt.number) !== parseFloat(bkpt.number);
    bkpt.is_normal_breakpoint = !bkpt.is_parent_breakpoint && !bkpt.is_child_breakpoint;

    if (bkpt.is_child_breakpoint) {
      bkpt.parent_breakpoint_number = parseInt(bkpt.number);
    }

    if ("fullname" in breakpoint && breakpoint.fullname) {
      // this is a normal/child breakpoint; gdb gives it the fullname
      bkpt.fullname_to_display = breakpoint.fullname;
    } else if ("original-location" in breakpoint && breakpoint["original-location"]) {
      // this breakpoint is the parent breakpoint of multiple other breakpoints. gdb does not give it
      // the fullname field, but rather the "original-location" field.
      // example breakpoint['original-location']: /home/file.h:19
      // so we need to parse out the line number, and store it
      [bkpt.fullname_to_display, bkpt.line] = Util.parse_fullname_and_line(
        breakpoint["original-location"]
      );
    } else {
      bkpt.fullname_to_display = null;
    }

    // add the breakpoint if it's not stored already
    let bkpts = store.get("breakpoints");
    if (bkpts.indexOf(bkpt) === -1) {
      bkpts.push(bkpt);
      store.set("breakpoints", bkpts);
    }
    return bkpt;
  }
}

export default Breakpoints;
