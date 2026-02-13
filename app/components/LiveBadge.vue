<script setup lang="ts">
/**
 * LiveBadge — shows a pulsing LIVE dot or "Updated X min ago" timestamp.
 */
const props = defineProps<{
  label?: string
  updatedAt?: string | null
}>()

const timeAgo = computed(() => {
  if (!props.updatedAt) return null
  const diff = Math.round((Date.now() - new Date(props.updatedAt).getTime()) / 60_000)
  if (diff < 1) return 'Just now'
  return `Updated ${diff} min ago`
})
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span v-if="label" class="relative flex size-1.5">
      <span
        class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75"
      />
      <span class="relative inline-flex size-1.5 rounded-full bg-success" />
    </span>
    <span v-if="label" class="text-[10px] font-semibold uppercase tracking-widest text-success">
      {{ label }}
    </span>
    <span v-if="timeAgo" class="text-[10px] text-muted">
      {{ timeAgo }}
    </span>
  </div>
</template>
