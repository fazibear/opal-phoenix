module Phoenix
  class Channel
    include Native

    alias_native :join
    alias_native :push

    def initialize(topic, params, this)
      super(`new Phoenix.Channel(#{topic}, #{params.to_n}, #{this})`)
    end

    def on(msg, &block)
      `#{@native}.on(#{msg}, #{block})`
    end

    def on_error(&block)
      `#{@native}.onError(#{block})`
    end

    def on_close(&block)
      `#{@native}.onClose(#{block})`
    end
  end
end
