<script setup lang="ts">
import { Signal } from 'signals'

const visibleModal = ref(false)
const doneSignal = new Signal() as unknown as Signal<string>

doneSignal.add(() => {
  visibleModal.value = false
})

const visible = computed(() => visibleModal.value)

const listeners = {
  click: () => {
    visibleModal.value = true
  },
}
</script>

<template>
  <div>
    <div>
      <slot v-bind="{ visible, doneSignal, listeners }" />
    </div>
  </div>
</template>
