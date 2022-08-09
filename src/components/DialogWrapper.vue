<script setup lang="ts">
import { Signal } from 'signals'

const visibleModal = ref(false)
const doneSignal = new Signal() as unknown as Signal<string>

doneSignal.add(() => {
  visibleModal.value = false
})

const visible = computed(() => visibleModal.value)

const listeners = {
  ok: () => {
    visibleModal.value = false
  },
}
</script>

<template>
  <div>
    <div @click.stop.prevent="visibleModal = true">
      <slot v-bind="{ visible, doneSignal }" />
    </div>
  </div>
</template>
