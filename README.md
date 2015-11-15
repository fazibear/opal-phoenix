# opal-phoenix

Opal wrapper for [Phoenix Framework](http://phoenixframework.org) javascript library.

## example

```ruby
# setup socket
socket = Phoenix::Socket.new('ws://localhost:4000/ws')
socket.on_error do
  $console.log 'socket error!'
end

socket.on_close do
  $console.log 'socket closed!'
end

# connect to socket
socket.connect

# setup channel
channel = s.channel('lobby', params: {asd: 'xcvxcv'})
channel.on("msg") do |payload|
  $console.log "payload: #{payload}"
end

# join channel
channel.join

# push a message
chan.push("msg", {a: :b})
```
