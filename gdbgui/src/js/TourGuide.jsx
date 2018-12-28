// eslint-disable-next-line
import React from "react";

export const step0 =
  <div>
    <h5>Welcome to gdbgui</h5>
    <p>
      Show this guide again by clicking "Show guide" from the menu <span className="fa fa-tools mx-2"/>
    </p>
  </div>


export const step1 =
  <div>
    <h5>Do this first</h5>
    <p>Initialize gdb with an executable you want to debug. There are three ways to accomplish this task:</p>
    <p>Choose "Load binary" from the drop-down menu, and enter the absolute or relative path here</p>
    <p>Choose "Connect gdbserver" and enter the server address here, e.g. 127.0.0.1:9999 or device path, e.g. /dev/ttya</p>
    <p>Choose "Attach process" and enter the pid, gid or file path here</p>
    <p>In the next step, you'll initialize gdbgui to setup breakpoints</p>
  </div>

export const step2 =
  <div>
    <h5>Initialize gdbgui</h5>
    <p>After specifying a binary, gdb server, or process in the previous step, click this button to initialize gdbgui</p>
    <p>Debugging won't start, but you will be able to set breakpoints
      . <a href="https://en.wikipedia.org/wiki/Debug_symbol">Debugging symbols</a> in
      the binary are also loaded.</p>
    <p>If you don't want to debug a binary, click the dropdown to choose a different target type</p>
  </div>

export const step3 =
  <div>
    <h5>Debugging control buttons</h5>
    <p>These buttons allow you to control execution of the target you are debugging</p>
    <p>
      Hover over these buttons to see a description of their action. For
      example, the <span className="glyphicon glyphicon-repeat"/> button starts
      (or restarts) a program from the beginning
    </p>
    <p>Each button has a keyboard shortcut. For example, you can press "r" to start running</p>
  </div>

export const step4 =
  <div>
    <h5>Console</h5>
    <p>You may find yourself needing to input commands directly to gdb. The command console allows
      you to send commands to the gdb process</p>
    <p>Tab completion works and displays a
      <button className='btn btn-outline-success btn-tiny mx-1'>help</button> button to view help on gdb
      commands</p>
    <p>History can be accessed using the up and down arrows</p>
  </div>

export const step5 =
  <div>
    <h5>Sidebar</h5>
    <p>This sidebar contains an interactive representation of the state of your program</p>
    <p>You can see which function the process is stopped in, explore variables, create graphs, etc.</p>
    <p>
      Something missing? Found a bug?{" "}
      <a href="https://github.com/cs01/gdbgui/issues/">Create an issue</a> on
      github
    </p>
    <p>There is more to discover, but this should be enough to get you started.
      Thank you and most of all...</p>
    <p className='text-success text-center'>happy debugging!</p>
  </div>
