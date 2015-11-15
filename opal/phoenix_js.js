(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.define({'phoenix': function(exports, require, module){ // Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are mulitplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws", {params: {userToken: "123"}})
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket,
// the authentication params, as well as options that can be found in
// the Socket docs, such as configuring the `LongPoll` transport, and
// heartbeat.
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error/timeout matches:
//
//     let channel = socket.channel("rooms:123", {token: roomToken})
//     channel.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       channel.push("new_msg", {body: e.target.val}, 10000)
//        .receive("ok", (msg) => console.log("created message", msg) )
//        .receive("error", (reasons) => console.log("create failed", reasons) )
//        .receive("timeout", () => console.log("Networking issue...") )
//     })
//     channel.join()
//       .receive("ok", ({messages}) => console.log("catching up", messages) )
//       .receive("error", ({reason}) => console.log("failed join", reason) )
//       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Joining a channel with `channel.join(topic, params)`, binds the params to
// `channel.params`. Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `channel.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `receive("timeout", callback)` to abort waiting for our other `receive` hooks
//  and take action after some period of waiting.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     channel.onError( () => console.log("there was an error!") )
//     channel.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attemtped
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `channel.leave()`
//

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VSN = "1.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

var Push = (function () {

  // Initializes the Push
  //
  // channel - The Channel
  // event - The event, for example `"phx_join"`
  // payload - The payload, for example `{user_id: 123}`
  // timeout - The push timeout in milliseconds
  //

  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  Push.prototype.resend = function resend(timeout) {
    this.timeout = timeout;
    this.cancelRefEvent();
    this.ref = null;
    this.refEvent = null;
    this.receivedResp = null;
    this.sent = false;
    this.send();
  };

  Push.prototype.send = function send() {
    if (this.hasReceived("timeout")) {
      return;
    }
    this.startTimeout();
    this.sent = true;
    this.channel.socket.push({
      topic: this.channel.topic,
      event: this.event,
      payload: this.payload,
      ref: this.ref
    });
  };

  Push.prototype.receive = function receive(status, callback) {
    if (this.hasReceived(status)) {
      callback(this.receivedResp.response);
    }

    this.recHooks.push({ status: status, callback: callback });
    return this;
  };

  // private

  Push.prototype.matchReceive = function matchReceive(_ref) {
    var status = _ref.status;
    var response = _ref.response;
    var ref = _ref.ref;

    this.recHooks.filter(function (h) {
      return h.status === status;
    }).forEach(function (h) {
      return h.callback(response);
    });
  };

  Push.prototype.cancelRefEvent = function cancelRefEvent() {
    if (!this.refEvent) {
      return;
    }
    this.channel.off(this.refEvent);
  };

  Push.prototype.cancelTimeout = function cancelTimeout() {
    clearTimeout(this.timeoutTimer);
    this.timeoutTimer = null;
  };

  Push.prototype.startTimeout = function startTimeout() {
    var _this = this;

    if (this.timeoutTimer) {
      return;
    }
    this.ref = this.channel.socket.makeRef();
    this.refEvent = this.channel.replyEventName(this.ref);

    this.channel.on(this.refEvent, function (payload) {
      _this.cancelRefEvent();
      _this.cancelTimeout();
      _this.receivedResp = payload;
      _this.matchReceive(payload);
    });

    this.timeoutTimer = setTimeout(function () {
      _this.trigger("timeout", {});
    }, this.timeout);
  };

  Push.prototype.hasReceived = function hasReceived(status) {
    return this.receivedResp && this.receivedResp.status === status;
  };

  Push.prototype.trigger = function trigger(status, response) {
    this.channel.trigger(this.refEvent, { status: status, response: response });
  };

  return Push;
})();

var Channel = (function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.socket.log("channel", "close " + _this2.topic);
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.setTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (_this2.state !== CHANNEL_STATES.joining) {
        return;
      }

      _this2.socket.log("channel", "timeout " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.setTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  Channel.prototype.rejoinUntilConnected = function rejoinUntilConnected() {
    this.rejoinTimer.setTimeout();
    if (this.socket.isConnected()) {
      this.rejoin();
    }
  };

  Channel.prototype.join = function join() {
    var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

    if (this.joinedOnce) {
      throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
    } else {
      this.joinedOnce = true;
    }
    this.rejoin(timeout);
    return this.joinPush;
  };

  Channel.prototype.onClose = function onClose(callback) {
    this.on(CHANNEL_EVENTS.close, callback);
  };

  Channel.prototype.onError = function onError(callback) {
    this.on(CHANNEL_EVENTS.error, function (reason) {
      return callback(reason);
    });
  };

  Channel.prototype.on = function on(event, callback) {
    this.bindings.push({ event: event, callback: callback });
  };

  Channel.prototype.off = function off(event) {
    this.bindings = this.bindings.filter(function (bind) {
      return bind.event !== event;
    });
  };

  Channel.prototype.canPush = function canPush() {
    return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
  };

  Channel.prototype.push = function push(event, payload) {
    var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.timeout : arguments[2];

    if (!this.joinedOnce) {
      throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
    }
    var pushEvent = new Push(this, event, payload, timeout);
    if (this.canPush()) {
      pushEvent.send();
    } else {
      pushEvent.startTimeout();
      this.pushBuffer.push(pushEvent);
    }

    return pushEvent;
  };

  // Leaves the channel
  //
  // Unsubscribes from server events, and
  // instructs channel to terminate on server
  //
  // Triggers onClose() hooks
  //
  // To receive leave acknowledgements, use the a `receive`
  // hook to bind to the server ack, ie:
  //
  //     channel.leave().receive("ok", () => alert("left!") )
  //

  Channel.prototype.leave = function leave() {
    var _this3 = this;

    var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

    var onClose = function onClose() {
      _this3.socket.log("channel", "leave " + _this3.topic);
      _this3.trigger(CHANNEL_EVENTS.close, "leave");
    };
    var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
    leavePush.receive("ok", function () {
      return onClose();
    }).receive("timeout", function () {
      return onClose();
    });
    leavePush.send();
    if (!this.canPush()) {
      leavePush.trigger("ok", {});
    }

    return leavePush;
  };

  // Overridable message hook
  //
  // Receives all events for specialized message handling

  Channel.prototype.onMessage = function onMessage(event, payload, ref) {};

  // private

  Channel.prototype.isMember = function isMember(topic) {
    return this.topic === topic;
  };

  Channel.prototype.sendJoin = function sendJoin(timeout) {
    this.state = CHANNEL_STATES.joining;
    this.joinPush.resend(timeout);
  };

  Channel.prototype.rejoin = function rejoin() {
    var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];
    this.sendJoin(timeout);
  };

  Channel.prototype.trigger = function trigger(triggerEvent, payload, ref) {
    this.onMessage(triggerEvent, payload, ref);
    this.bindings.filter(function (bind) {
      return bind.event === triggerEvent;
    }).map(function (bind) {
      return bind.callback(payload, ref);
    });
  };

  Channel.prototype.replyEventName = function replyEventName(ref) {
    return "chan_reply_" + ref;
  };

  return Channel;
})();

exports.Channel = Channel;

var Socket = (function () {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
  //               Defaults to WebSocket with automatic LongPoll fallback.
  //   timeout - The default timeout in milliseconds to trigger push timeouts.
  //             Defaults `DEFAULT_TIMEOUT`
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  //   params - The optional params to pass when connecting
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //

  function Socket(endPoint) {
    var _this4 = this;

    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.reconnectTimer = new Timer(function () {
      _this4.disconnect(function () {
        return _this4.connect();
      });
    }, this.reconnectAfterMs);
  }

  Socket.prototype.protocol = function protocol() {
    return location.protocol.match(/^https/) ? "wss" : "ws";
  };

  Socket.prototype.endPointURL = function endPointURL() {
    var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
    if (uri.charAt(0) !== "/") {
      return uri;
    }
    if (uri.charAt(1) === "/") {
      return this.protocol() + ":" + uri;
    }

    return this.protocol() + "://" + location.host + uri;
  };

  Socket.prototype.disconnect = function disconnect(callback, code, reason) {
    if (this.conn) {
      this.conn.onclose = function () {}; // noop
      if (code) {
        this.conn.close(code, reason || "");
      } else {
        this.conn.close();
      }
      this.conn = null;
    }
    callback && callback();
  };

  // params - The params to send when connecting, for example `{user_id: userToken}`

  Socket.prototype.connect = function connect(params) {
    var _this5 = this;

    if (params) {
      console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
      this.params = params;
    }
    if (this.conn) {
      return;
    }

    this.conn = new this.transport(this.endPointURL());
    this.conn.timeout = this.longpollerTimeout;
    this.conn.onopen = function () {
      return _this5.onConnOpen();
    };
    this.conn.onerror = function (error) {
      return _this5.onConnError(error);
    };
    this.conn.onmessage = function (event) {
      return _this5.onConnMessage(event);
    };
    this.conn.onclose = function (event) {
      return _this5.onConnClose(event);
    };
  };

  // Logs the message. Override `this.logger` for specialized logging. noops by default

  Socket.prototype.log = function log(kind, msg, data) {
    this.logger(kind, msg, data);
  };

  // Registers callbacks for connection state change events
  //
  // Examples
  //
  //    socket.onError(function(error){ alert("An error occurred") })
  //

  Socket.prototype.onOpen = function onOpen(callback) {
    this.stateChangeCallbacks.open.push(callback);
  };

  Socket.prototype.onClose = function onClose(callback) {
    this.stateChangeCallbacks.close.push(callback);
  };

  Socket.prototype.onError = function onError(callback) {
    this.stateChangeCallbacks.error.push(callback);
  };

  Socket.prototype.onMessage = function onMessage(callback) {
    this.stateChangeCallbacks.message.push(callback);
  };

  Socket.prototype.onConnOpen = function onConnOpen() {
    var _this6 = this;

    this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
    this.flushSendBuffer();
    this.reconnectTimer.reset();
    if (!this.conn.skipHeartbeat) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(function () {
        return _this6.sendHeartbeat();
      }, this.heartbeatIntervalMs);
    }
    this.stateChangeCallbacks.open.forEach(function (callback) {
      return callback();
    });
  };

  Socket.prototype.onConnClose = function onConnClose(event) {
    this.log("transport", "close", event);
    this.triggerChanError();
    clearInterval(this.heartbeatTimer);
    this.reconnectTimer.setTimeout();
    this.stateChangeCallbacks.close.forEach(function (callback) {
      return callback(event);
    });
  };

  Socket.prototype.onConnError = function onConnError(error) {
    this.log("transport", error);
    this.triggerChanError();
    this.stateChangeCallbacks.error.forEach(function (callback) {
      return callback(error);
    });
  };

  Socket.prototype.triggerChanError = function triggerChanError() {
    this.channels.forEach(function (channel) {
      return channel.trigger(CHANNEL_EVENTS.error);
    });
  };

  Socket.prototype.connectionState = function connectionState() {
    switch (this.conn && this.conn.readyState) {
      case SOCKET_STATES.connecting:
        return "connecting";
      case SOCKET_STATES.open:
        return "open";
      case SOCKET_STATES.closing:
        return "closing";
      default:
        return "closed";
    }
  };

  Socket.prototype.isConnected = function isConnected() {
    return this.connectionState() === "open";
  };

  Socket.prototype.remove = function remove(channel) {
    this.channels = this.channels.filter(function (c) {
      return !c.isMember(channel.topic);
    });
  };

  Socket.prototype.channel = function channel(topic) {
    var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var chan = new Channel(topic, chanParams, this);
    this.channels.push(chan);
    return chan;
  };

  Socket.prototype.push = function push(data) {
    var _this7 = this;

    var topic = data.topic;
    var event = data.event;
    var payload = data.payload;
    var ref = data.ref;

    var callback = function callback() {
      return _this7.conn.send(JSON.stringify(data));
    };
    this.log("push", topic + " " + event + " (" + ref + ")", payload);
    if (this.isConnected()) {
      callback();
    } else {
      this.sendBuffer.push(callback);
    }
  };

  // Return the next message ref, accounting for overflows

  Socket.prototype.makeRef = function makeRef() {
    var newRef = this.ref + 1;
    if (newRef === this.ref) {
      this.ref = 0;
    } else {
      this.ref = newRef;
    }

    return this.ref.toString();
  };

  Socket.prototype.sendHeartbeat = function sendHeartbeat() {
    if (!this.isConnected()) {
      return;
    }
    this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
  };

  Socket.prototype.flushSendBuffer = function flushSendBuffer() {
    if (this.isConnected() && this.sendBuffer.length > 0) {
      this.sendBuffer.forEach(function (callback) {
        return callback();
      });
      this.sendBuffer = [];
    }
  };

  Socket.prototype.onConnMessage = function onConnMessage(rawMessage) {
    var msg = JSON.parse(rawMessage.data);
    var topic = msg.topic;
    var event = msg.event;
    var payload = msg.payload;
    var ref = msg.ref;

    this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
    this.channels.filter(function (channel) {
      return channel.isMember(topic);
    }).forEach(function (channel) {
      return channel.trigger(event, payload, ref);
    });
    this.stateChangeCallbacks.message.forEach(function (callback) {
      return callback(msg);
    });
  };

  return Socket;
})();

exports.Socket = Socket;

var LongPoll = (function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  LongPoll.prototype.normalizeEndpoint = function normalizeEndpoint(endPoint) {
    return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
  };

  LongPoll.prototype.endpointURL = function endpointURL() {
    return Ajax.appendParams(this.pollEndpoint, { token: this.token });
  };

  LongPoll.prototype.closeAndRetry = function closeAndRetry() {
    this.close();
    this.readyState = SOCKET_STATES.connecting;
  };

  LongPoll.prototype.ontimeout = function ontimeout() {
    this.onerror("timeout");
    this.closeAndRetry();
  };

  LongPoll.prototype.poll = function poll() {
    var _this8 = this;

    if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
      return;
    }

    Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
      if (resp) {
        var status = resp.status;
        var token = resp.token;
        var messages = resp.messages;

        _this8.token = token;
      } else {
        var status = 0;
      }

      switch (status) {
        case 200:
          messages.forEach(function (msg) {
            return _this8.onmessage({ data: JSON.stringify(msg) });
          });
          _this8.poll();
          break;
        case 204:
          _this8.poll();
          break;
        case 410:
          _this8.readyState = SOCKET_STATES.open;
          _this8.onopen();
          _this8.poll();
          break;
        case 0:
        case 500:
          _this8.onerror();
          _this8.closeAndRetry();
          break;
        default:
          throw "unhandled poll status " + status;
      }
    });
  };

  LongPoll.prototype.send = function send(body) {
    var _this9 = this;

    Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
      if (!resp || resp.status !== 200) {
        _this9.onerror(status);
        _this9.closeAndRetry();
      }
    });
  };

  LongPoll.prototype.close = function close(code, reason) {
    this.readyState = SOCKET_STATES.closed;
    this.onclose();
  };

  return LongPoll;
})();

exports.LongPoll = LongPoll;

var Ajax = (function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  Ajax.request = function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
    if (window.XDomainRequest) {
      var req = new XDomainRequest(); // IE8, IE9
      this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
    } else {
      var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
      new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
      this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
    }
  };

  Ajax.xdomainRequest = function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
    var _this10 = this;

    req.timeout = timeout;
    req.open(method, endPoint);
    req.onload = function () {
      var response = _this10.parseJSON(req.responseText);
      callback && callback(response);
    };
    if (ontimeout) {
      req.ontimeout = ontimeout;
    }

    // Work around bug in IE9 that requires an attached onprogress handler
    req.onprogress = function () {};

    req.send(body);
  };

  Ajax.xhrRequest = function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
    var _this11 = this;

    req.timeout = timeout;
    req.open(method, endPoint, true);
    req.setRequestHeader("Content-Type", accept);
    req.onerror = function () {
      callback && callback(null);
    };
    req.onreadystatechange = function () {
      if (req.readyState === _this11.states.complete && callback) {
        var response = _this11.parseJSON(req.responseText);
        callback(response);
      }
    };
    if (ontimeout) {
      req.ontimeout = ontimeout;
    }

    req.send(body);
  };

  Ajax.parseJSON = function parseJSON(resp) {
    return resp && resp !== "" ? JSON.parse(resp) : null;
  };

  Ajax.serialize = function serialize(obj, parentKey) {
    var queryStr = [];
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
      var paramVal = obj[key];
      if (typeof paramVal === "object") {
        queryStr.push(this.serialize(paramVal, paramKey));
      } else {
        queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
      }
    }
    return queryStr.join("&");
  };

  Ajax.appendParams = function appendParams(url, params) {
    if (Object.keys(params).length === 0) {
      return url;
    }

    var prefix = url.match(/\?/) ? "&" : "?";
    return "" + url + prefix + this.serialize(params);
  };

  return Ajax;
})();

exports.Ajax = Ajax;

Ajax.states = { complete: 4 };

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.setTimeout() // fires after 1000
//    reconnectTimer.setTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.setTimeout() // fires after 1000
//

var Timer = (function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  Timer.prototype.reset = function reset() {
    this.tries = 0;
    clearTimeout(this.timer);
  };

  // Cancels any previous setTimeout and schedules callback

  Timer.prototype.setTimeout = (function (_setTimeout) {
    function setTimeout() {
      return _setTimeout.apply(this, arguments);
    }

    setTimeout.toString = function () {
      return _setTimeout.toString();
    };

    return setTimeout;
  })(function () {
    var _this12 = this;

    clearTimeout(this.timer);

    this.timer = setTimeout(function () {
      _this12.tries = _this12.tries + 1;
      _this12.callback();
    }, this.timerCalc(this.tries + 1));
  });

  return Timer;
})();

 }});
if(typeof(window) === 'object' && !window.Phoenix){ window.Phoenix = require('phoenix') };
