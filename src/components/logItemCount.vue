<script setup lang="ts">
defineProps<{ hours: number }>()
</script>

<template>
  <a-tag color="blue">
    {{ hours }}h
  </a-tag>
</template>
