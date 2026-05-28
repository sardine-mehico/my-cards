<script setup lang="ts">
import { useApp } from '~/stores/app'
import { matchesQuery } from '~/utils/cards'
import { exportCards, importCardsFromFile } from '~/utils/backup'

const app = useApp()
const router = useRouter()
const { show } = useToast()

const query = ref('')
const menuOpen = ref(false)
const importInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (!app.cards.length) app.loadCards()
})

const filtered = computed(() =>
  app.cards.filter((c) => matchesQuery(c, query.value)),
)

function openCard(id: string) {
  router.push(`/card/${id}`)
}

// ── Import / Export ────────────────────────────────────────────────────────
async function onExport() {
  menuOpen.value = false
  if (!app.cards.length) {
    show('No cards to export yet')
    return
  }
  try {
    const how = await exportCards(app.cards)
    show(how === 'shared' ? 'Backup shared' : 'Backup downloaded')
  } catch (e: any) {
    if (e?.name !== 'AbortError') show('Export failed')
  }
}

function triggerImport() {
  menuOpen.value = false
  importInput.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-importing the same file later
  if (!file) return
  try {
    const { added, skipped } = await importCardsFromFile(file)
    await app.loadCards()
    show(
      added
        ? `Imported ${added} card${added === 1 ? '' : 's'}` +
            (skipped ? `, ${skipped} already present` : '')
        : 'All cards were already present',
    )
  } catch (err: any) {
    show(err?.message ?? 'Import failed')
  }
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1 class="title">My Cards</h1>
      <div class="actions">
        <button class="more" aria-label="More" @click="menuOpen = true">
          •••
        </button>
        <NuxtLink to="/add" class="add">
          <span class="plus">+</span> Add Card
        </NuxtLink>
      </div>
    </div>

    <div class="search-wrap">
      <span class="mag" aria-hidden="true">⌕</span>
      <input
        v-model="query"
        class="search"
        type="search"
        placeholder="Search cards"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    </div>

    <ul v-if="filtered.length" class="list">
      <li
        v-for="card in filtered"
        :key="card.id"
        class="row"
        @click="openCard(card.id)"
      >
        <CardThumb :card="card" />
        <div class="row-body">
          <span class="name">{{ card.name }}</span>
        </div>
      </li>
    </ul>

    <div v-else class="empty">
      <template v-if="query">
        <p class="empty-title">No matches</p>
        <p class="empty-sub">Nothing matches “{{ query }}”.</p>
      </template>
      <template v-else>
        <p class="empty-title">No cards yet</p>
        <p class="empty-sub">Tap “Add Card” to scan or enter your first card.</p>
      </template>
    </div>

    <!-- ⋯ action sheet -->
    <ActionSheet :open="menuOpen" @close="menuOpen = false">
      <button class="sheet-item" @click="triggerImport">Import from file</button>
      <button class="sheet-item" @click="onExport">Export / Back up</button>
    </ActionSheet>

    <input
      ref="importInput"
      type="file"
      accept="application/json,.json"
      hidden
      @change="onImportFile"
    />
  </div>
</template>

<style scoped>
.page {
  padding-bottom: calc(40px + var(--safe-bottom));
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: calc(18px + var(--safe-top)) 20px 12px;
}
.title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.more {
  color: var(--tint);
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1;
  padding: 6px 2px;
}
.add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ink);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  padding: 11px 18px;
  border-radius: 999px;
}
.add:active {
  opacity: 0.85;
}
.plus {
  font-size: 19px;
  line-height: 1;
}
.search-wrap {
  position: relative;
  margin: 4px 16px 8px;
}
.mag {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%) scaleX(-1);
  color: var(--muted);
  font-size: 20px;
  pointer-events: none;
}
.search {
  width: 100%;
  height: 44px;
  background: var(--field);
  border: none;
  border-radius: 12px;
  padding: 0 14px 0 42px;
  font-size: 17px;
  color: var(--ink);
}
.search::placeholder {
  color: var(--muted);
}
.search:focus {
  outline: none;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px 10px 16px;
  position: relative;
  cursor: pointer;
}
.row:active {
  background: var(--tap);
}
.row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  min-height: 60px;
  border-bottom: 1px solid var(--hair);
}
.row:last-child .row-body {
  border-bottom: none;
}
.name {
  font-size: 21px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty {
  text-align: center;
  padding: 80px 32px;
}
.empty-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
}
.empty-sub {
  color: var(--muted);
  margin: 0;
}
</style>
