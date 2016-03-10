module Phoenix
  class Channel
    include Native

    def initialize(topic, params, this)
      super(`new Phoenix.Channel(#{topic}, #{params.to_n}, #{this})`)
    end

    def on(msg, &block)
      `#{@native}.on(#{msg}, #{callback(block)})`
    end

    def push(msg, payload)
      Push.new `#{@native}.push(#{msg}, #{payload.to_n})`
    end

    def join
      Push.new `#{@native}.join()`
    end

    def leave
      Push.new `#{@native}.leave()`
    end

    def joined?
      `#{@native}.joinedOnce`
    end

    def on_error(&block)
      `#{@native}.onError(#{callback(block)})`
    end

    def on_close(&block)
      `#{@native}.onClose(#{callback(block)})`
    end

    def callback(block)
      proc do |e|
        block.call(Hash.new(e))
      end
    end
  end
end
