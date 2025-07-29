<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-loading-bar-provider>
      <n-notification-provider>
        <n-modal-provider>
          <n-message-provider>
            <RouterView />
          </n-message-provider>
        </n-modal-provider>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { darkTheme, useThemeVars } from 'naive-ui'

const theme = ref(null)
const themeVars = useThemeVars()

themeVars.value.fontFamily = "Noto Sans KR, sans-serif"
themeVars.value.fontSize = "14px"
themeVars.value.textColor1 = "#334155"
themeVars.value.textColor2 = "#334155"

const themeOverrides = {
  common: {
    fontFamily: "Noto Sans KR, sans-serif"
  }
}
</script>
