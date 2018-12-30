/**
 * Setup global DOM events
 */

import constants from "./constants.js";
import GdbApi from "./GdbApi.jsx";
import Actions from './Actions'
import FileOps from "./FileOps.jsx"
import debug from 'debug'

const info = debug('gdbgui:GlobalEvents:info')
debug.enable('gdbgui:GlobalEvents:info')
info.enabled = true

const GlobalEvents = {
  init: function () {
    window.onkeydown = function (e) {
      if (e.keyCode === constants.ENTER_BUTTON_NUM) {
        // when pressing enter in an input, don't redirect entire page!
        e.preventDefault();
      }
    };
    const b = $("body")
    b.on("keydown", GlobalEvents.body_keydown);
    b.on("keyup", GlobalEvents.body_keyup);

    window.onbeforeunload = () =>
      "text here makes dialog appear when exiting. Set function to back to null for normal behavior.";
  },
  body_keyup: e => {
    let modifier = e.altKey || e.ctrlKey || e.metaKey;

    if (e.target.nodeName !== "INPUT" && !modifier) {
      if (e.keyCode === constants.slash_key_code) {
        $('.form-control.main-form-input').focus()
      } else if (e.keyCode === constants.semicolon_key_code) {
        $('.form-control.command-prompt').focus()
      }
    }
  },
  /**
   * keyboard shortcuts to interact with gdb.
   * enabled only when key is depressed on a target that is NOT an input.
   */
  body_keydown: function (e) {
    let modifier = e.altKey || e.ctrlKey || e.metaKey;

    if (e.target.nodeName !== "INPUT" && !modifier) {
      let char = String.fromCharCode(e.keyCode).toLowerCase();
      info('you pressed %d %s', e.keyCode, String.fromCharCode(e.keyCode))
      if (e.keyCode === constants.DOWN_BUTTON_NUM || char === "s") {
        GdbApi.click_step_button();
      } else if (e.keyCode === constants.RIGHT_BUTTON_NUM) {
        GdbApi.click_next_button();
      } else if (char === "n") {
        GdbApi.click_next_button(e.shiftKey);
      } else if (char === "f") {
        FileOps.fetch_assembly_cur_line();
      } else if (char === "c") {
        GdbApi.click_continue_button(e.shiftKey);
      } else if (e.keyCode === constants.UP_BUTTON_NUM || char === "u") {
        GdbApi.click_return_button();
      } else if (char === "l") {
        let past_binaries = _.uniq(JSON.parse(localStorage.getItem("past_binaries")));
        Actions.set_gdb_binary_and_arguments(past_binaries[0])
      } else if (char === "r") {
        GdbApi.click_run_button();
      } else if (char === "m") {
        GdbApi.click_next_instruction_button(e.shiftKey);
      } else if (e.keyCode === constants.COMMA_BUTTON_NUM) {
        GdbApi.click_step_instruction_button(e.shiftKey);
      } else if (initial_data.rr && e.keyCode === constants.LEFT_BUTTON_NUM) {
        // reverse
        GdbApi.click_next_button(true);
      }
    }
  }
};

export default GlobalEvents;
