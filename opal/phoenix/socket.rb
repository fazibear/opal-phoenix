module Phoenix
  class Socket
    include Native

    alias_native :connect

    def initialize(url, params = {})
      super(`new Phoenix.Socket(#{url.to_s}, #{params.to_n})`)
    end

    def channel(topic, *params)
      chan = Channel.new(topic, params, @native)
      `#{@native}.channels.push(#{chan.to_n})`
      chan
    end

    def on_error(&block)
      `#{@native}.onError(#{block})`
    end

    def on_close(&block)
      `#{@native}.onClose(#{block})`
    end
  end
end
