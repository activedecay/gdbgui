import React from "react";

import Actions from "./Actions.js";
import GdbApi from "./GdbApi.jsx";
import {store} from "statorgfc";

class ControlButtons extends React.Component {
  constructor() {
    super();
    store.connectComponentState(this, ["gdb_pid"]);
  }

  render() {
    return (
      <div className='btn-group btn-group-sm'>
        <button
          id="run_button"
          onClick={() => GdbApi.click_run_button()}
          type="button"
          title='Restart inferior program (shortcut "r")'
          className='btn'>
          <span className="fa fa-dragon"/>
        </button>

        <button
          id="run_button"
          onClick={() => GdbApi.click_record_button()}
          type="button"
          title="Record program execution for playback and reverse actions"
          className='btn'>
          <span className="fa fa-camera-retro"/>
        </button>

        <button
          id="continue_button"
          onClick={() => GdbApi.click_continue_button()}
          type="button"
          title={
            'Continue (shortcut "c")' +
            (initial_data.rr ? ". shift + c for reverse." : "")
          }
          className='btn'>
          <span className="fa fa-fighter-jet"/>
        </button>

        <button
          onClick={() => Actions.send_signal("SIGINT", this.state.gdb_pid)}
          type="button"
          title="Pause gdb"
          className='btn'>
          <span className="fa fa-pause"/>
        </button>

        <button
          id="next_button"
          onClick={() => GdbApi.click_next_button()}
          type="button"
          title={
            'Step over next function call (shortcut "n" or right-arrow)' +
            (initial_data.rr ? '. shift-"n" for previous in reverse.' : "")
          }
          className='btn'>
          <span className="fa fa-step-forward"/>
        </button>

        <button
          id="step_button"
          onClick={() => GdbApi.click_step_button()}
          type="button"
          title={
            'Step into function call (shortcut "s" or down-arrow)' +
            (initial_data.rr ? '. shift-"s" for reverse step.' : "")
          }
          className='btn'>
          <span className="fa fa-sign-in-alt fa-rotate-90"/>
        </button>

        <button
          id="return_button"
          onClick={() => GdbApi.click_return_button()}
          type="button"
          title='Up one function stack frame (shortcut "u" or up-arrow)'
          className='btn'>
          <span className="fa fa-sign-out-alt fa-rotate-270"/>
        </button>

        <button
          id="next_instruction_button"
          onClick={() => GdbApi.click_next_instruction_button()}
          title={
            'Next machine instruction over function calls (shortcut "m")' +
            (initial_data.rr ? '. shift-"m" for previous in reverse.' : "")
          }
          className='btn'>
          <span className='fa fa-robot'/>
        </button>
        <button
          id="step_instruction_button"
          onClick={() => GdbApi.click_step_instruction_button()}
          title={
            'Step one machine instruction; steps into function calls (shortcut ",")' +
            (initial_data.rr ? '. shift-"," for reverse step.' : "")
          }
          className='btn'>
          <span className='fa fa-shoe-prints'/>
        </button>
      </div>
    );
  }
}

export default ControlButtons;
