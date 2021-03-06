// Dependencies
var Pty = require("pty.js")
  , Ul = require("ul")
  , Deffy = require("deffy")
  ;

/**
 * WebTerm
 * Creates a new `WebTerm` instance.
 *
 * @name WebTerm
 * @function
 * @return {WebTerm} The `WebTerm` instance.
 */
function WebTerm (options) {
    this.terminal = null;
    this.create(options);
}

/**
 * create
 * Creates a new terminal instance.
 *
 * @name create
 * @function
 * @param {Object} options Creates a new terminal instance:
 *
 *  - `cols` (Number): The number of columns.
 *  - `rows` (Number): The number of rows.
 *  - `cwd` (String): The current working directory (default: the home directory).
 *  - `shell` (String): The shell to start (by default the shell).
 *  - `start` (String): The start program.
 *
 * @return {Terminal} The terminal instance.
 */
WebTerm.prototype.create = function (options, callback) {

    var self = this;

    // Default shell
    options.shell = Deffy(options.shell, process.env.SHELL);

    // Create the terminal
    self.terminal = Pty.fork(options.shell, [], {
        cols: options.cols
      , rows: options.rows
      , cwd: options.cwd || Ul.home()
    });

    // Terminal -> Socket
    self.terminal.on("data", function(data) {
        options.socket.emit("data", data);
    });

    // Close terminal
    self.terminal.on("close", function() {
        options.socket.emit("kill");
        self.kill();
    });

    // Handle the start app
    if (typeof options.start === "string") {
        self.terminal.write(options.start + "\r");
    }

    return self.terminal;
};

/**
 * data
 * Writes data in the `WebTerm` instance.
 *
 * @name data
 * @function
 * @param {Buffer} data The buffer to write.
 */
WebTerm.prototype.data = function (data) {
    if (!this.terminal) { return; }
    this.terminal.write(data);
};

/**
 * kill
 * Destroys the `WebTerm` instance.
 *
 * @name kill
 * @function
 */
WebTerm.prototype.kill = function () {
    if (!this.terminal) { return; }
    this.terminal.destroy();
    this.terminal = null;
};

/**
 * resize
 * Resizes the terminal.
 *
 * @name resize
 * @function
 * @param {Number} cols The number of columns.
 * @param {Number} rows The number of rows.
 */
WebTerm.prototype.resize = function (cols, rows) {
    if (!this.terminal) { return; }
    this.terminal.resize(cols, rows);
};

module.exports = WebTerm;
