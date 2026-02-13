<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="size-16 rounded-2xl bg-primary/12 flex items-center justify-center text-primary mx-auto mb-6">
        <UIcon name="i-lucide-alert-triangle" class="size-8" />
      </div>
      <h1 class="font-display text-4xl font-bold mb-2">{{ error.statusCode }}</h1>
      <p class="text-muted mb-8">{{ error.message || 'Something went wrong' }}</p>
      <UButton size="lg" @click="handleError">
        Back to Home
      </UButton>
    </div>
  </div>
</template>
