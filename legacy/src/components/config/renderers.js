export const renderers = {
  $btnRadioGroup: {
    renderItemContent(h, renderOpts, params) {
      let { options = [] } = renderOpts
      let { data } = params
      if (options && options.length) {
        return [
          <div class="roy-btn-radio-group">
            {options.map((group) => {
              const { field, defaultValue, isRadio = true, customCallBack, options: inOpt } = group
              if (inOpt && inOpt.length) {
                return inOpt.map((option) => {
                  const value = option.value
                  return (
                    <div
                      class={
                        value === data[field]
                          ? 'roy-btn-radio-group__btn roy-btn-radio-group__btn--active'
                          : 'roy-btn-radio-group__btn'
                      }
                      title={option.label}
                      onClick={() => {
                        if (customCallBack) {
                          customCallBack(params, field, option)
                        } else {
                          if (!isRadio) {
                            value === data[field]
                              ? (data[field] = defaultValue)
                              : (data[field] = value)
                          } else {
                            data[field] = value
                          }
                        }
                      }}
                    >
                      {option.type === 'icon' ? (
                        <i class={option.content} />
                      ) : (
                        <span>{option.content}</span>
                      )}
                    </div>
                  )
                })
              }
              return [<div>None</div>]
            })}
          </div>
        ]
      }
      return [<div>None</div>]
    }
  },
  $colorPicker: {
    renderItemContent(h, renderOpts, params) {
      let { property, data } = params
      return [
        <roy-color-picker
          modelValue={data[property]}
          onChange={(val) => {
            data[property] = val
          }}
        ></roy-color-picker>
      ]
    }
  }
}
