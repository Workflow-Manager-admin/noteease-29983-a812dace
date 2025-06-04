<template>
  <div class="note-ease-app min-h-screen" :style="{ backgroundColor: colors.secondary }">
    <!-- Header with Search Bar -->
    <div class="sticky top-0 z-40 shadow-sm" :style="{ backgroundColor: colors.secondary }">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold" :style="{ color: colors.primary }">
            📝 NoteEase
          </h1>
          <div class="text-sm" :style="{ color: colors.primary }">
            {{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }}
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            :style="{ 
              borderColor: colors.primary + '40',
              focusRingColor: colors.primary 
            }"
          />
          <div class="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>
    </div>

    <!-- Category Filter Chips -->
    <div class="max-w-4xl mx-auto px-4 py-3">
      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategory = null"
          class="px-3 py-1 text-sm rounded-full transition-colors"
          :class="selectedCategory === null ? 'text-white' : 'text-gray-600 bg-gray-100'"
          :style="selectedCategory === null ? { backgroundColor: colors.primary } : {}"
        >
          All Notes
        </button>
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="px-3 py-1 text-sm rounded-full transition-colors"
          :class="selectedCategory === category ? 'text-white' : 'text-gray-600 bg-gray-100'"
          :style="selectedCategory === category ? { backgroundColor: colors.primary } : {}"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Notes List -->
    <div class="max-w-4xl mx-auto px-4 pb-20">
      <div v-if="filteredNotes.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-medium text-gray-600 mb-2">
          {{ searchQuery || selectedCategory ? 'No notes found' : 'No notes yet' }}
        </h3>
        <p class="text-gray-500">
          {{ searchQuery || selectedCategory ? 'Try adjusting your search or filter' : 'Create your first note to get started' }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          @click="openNote(note)"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-lg text-gray-800 truncate flex-1 mr-2">
              {{ note.title || 'Untitled Note' }}
            </h3>
            <button
              @click.stop="deleteNote(note.id)"
              class="text-red-500 hover:text-red-700 transition-colors p-1"
              title="Delete note"
            >
              🗑️
            </button>
          </div>
          
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">
            {{ note.content || 'No content' }}
          </p>
          
          <div class="flex justify-between items-center">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="category in note.categories"
                :key="category"
                class="px-2 py-1 text-xs rounded-full text-white"
                :style="{ backgroundColor: colors.accent }"
              >
                {{ category }}
              </span>
            </div>
            <span class="text-xs text-gray-400">
              {{ formatDate(note.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button
      @click="createNewNote"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-white text-2xl z-50"
      :style="{ backgroundColor: colors.primary }"
      title="Create new note"
    >
      ➕
    </button>

    <!-- Note Editor Modal -->
    <div
      v-if="isEditing"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditor"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <!-- Editor Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-semibold" :style="{ color: colors.primary }">
            {{ currentNote.id ? 'Edit Note' : 'New Note' }}
          </h2>
          <div class="flex gap-2">
            <button
              @click="saveNote"
              class="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              :style="{ backgroundColor: colors.primary }"
            >
              Save
            </button>
            <button
              @click="closeEditor"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Editor Content -->
        <div class="flex-1 p-4 space-y-4 overflow-y-auto">
          <!-- Title Input -->
          <input
            v-model="currentNote.title"
            type="text"
            placeholder="Note title..."
            class="w-full px-3 py-2 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            :style="{ focusRingColor: colors.primary }"
          />

          <!-- Content Textarea -->
          <textarea
            v-model="currentNote.content"
            placeholder="Write your note here..."
            rows="12"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
            :style="{ focusRingColor: colors.primary }"
          ></textarea>

          <!-- Categories Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categories (separate with commas)
            </label>
            <input
              v-model="categoriesInput"
              type="text"
              placeholder="work, personal, ideas..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              :style="{ focusRingColor: colors.primary }"
            />
            <div v-if="currentNote.categories.length > 0" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="category in currentNote.categories"
                :key="category"
                class="px-2 py-1 text-xs rounded-full text-white"
                :style="{ backgroundColor: colors.accent }"
              >
                {{ category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Colors from requirements
const colors = {
  primary: '#4A90E2',
  secondary: '#FFFFFF',
  accent: '#F5A623'
}

// Reactive state
const notes = ref([])
const searchQuery = ref('')
const selectedCategory = ref(null)
const isEditing = ref(false)
const currentNote = ref({})
const categoriesInput = ref('')

// Computed properties
const categories = computed(() => {
  const allCategories = notes.value.flatMap(note => note.categories)
  return [...new Set(allCategories)].sort()
})

const filteredNotes = computed(() => {
  let filtered = notes.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.categories.some(cat => cat.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(note =>
      note.categories.includes(selectedCategory.value)
    )
  }

  // Sort by updated date (newest first)
  return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

// Watch categories input to update current note
watch(categoriesInput, (newValue) => {
  if (currentNote.value) {
    currentNote.value.categories = newValue
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0)
  }
})

// PUBLIC_INTERFACE
/**
 * Create a new note and open the editor
 */
function createNewNote() {
  currentNote.value = {
    id: null,
    title: '',
    content: '',
    categories: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  categoriesInput.value = ''
  isEditing.value = true
}

// PUBLIC_INTERFACE
/**
 * Open an existing note for editing
 */
function openNote(note) {
  currentNote.value = { ...note }
  categoriesInput.value = note.categories.join(', ')
  isEditing.value = true
}

// PUBLIC_INTERFACE
/**
 * Save the current note
 */
function saveNote() {
  if (!currentNote.value.title && !currentNote.value.content) {
    alert('Please add a title or content to save the note.')
    return
  }

  const now = new Date().toISOString()
  
  if (currentNote.value.id) {
    // Update existing note
    const index = notes.value.findIndex(note => note.id === currentNote.value.id)
    if (index !== -1) {
      notes.value[index] = {
        ...currentNote.value,
        updatedAt: now
      }
    }
  } else {
    // Create new note
    const newNote = {
      ...currentNote.value,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    }
    notes.value.push(newNote)
  }

  saveToStorage()
  closeEditor()
}

// PUBLIC_INTERFACE
/**
 * Delete a note by ID
 */
function deleteNote(noteId) {
  if (confirm('Are you sure you want to delete this note?')) {
    notes.value = notes.value.filter(note => note.id !== noteId)
    saveToStorage()
  }
}

// PUBLIC_INTERFACE
/**
 * Close the note editor
 */
function closeEditor() {
  isEditing.value = false
  currentNote.value = {}
  categoriesInput.value = ''
}

// PUBLIC_INTERFACE
/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

// PUBLIC_INTERFACE
/**
 * Save notes to localStorage
 */
function saveToStorage() {
  localStorage.setItem('noteease-notes', JSON.stringify(notes.value))
}

// PUBLIC_INTERFACE
/**
 * Load notes from localStorage
 */
function loadFromStorage() {
  const stored = localStorage.getItem('noteease-notes')
  if (stored) {
    try {
      notes.value = JSON.parse(stored)
    } catch (error) {
      console.error('Error loading notes from storage:', error)
      notes.value = []
    }
  }
}

// Initialize on mount
onMounted(() => {
  loadFromStorage()
  
  // Add some sample notes if none exist
  if (notes.value.length === 0) {
    const sampleNotes = [
      {
        id: '1',
        title: 'Welcome to NoteEase!',
        content: 'This is your first note. You can edit it, delete it, or create new ones using the + button.',
        categories: ['welcome'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Features',
        content: 'NoteEase supports:\n- Creating and editing notes\n- Searching through your notes\n- Organizing with categories\n- Responsive design\n\nTry creating your own note!',
        categories: ['features', 'help'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    notes.value = sampleNotes
    saveToStorage()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles */
input:focus,
textarea:focus {
  border-color: #4A90E2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

/* Animation for modal */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .note-ease-app {
    padding-bottom: 80px;
  }
  
  .fixed.bottom-6.right-6 {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
