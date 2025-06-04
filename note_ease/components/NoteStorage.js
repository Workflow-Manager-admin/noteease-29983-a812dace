/**
 * NoteStorage utility module for managing note persistence and operations
 * Provides localStorage-based note management functionality
 */

const STORAGE_KEY = 'noteease-notes';

// PUBLIC_INTERFACE
/**
 * Save notes array to localStorage
 * @param {Array} notes - Array of note objects to save
 */
export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes to storage:', error);
    return false;
  }
}

// PUBLIC_INTERFACE
/**
 * Load notes array from localStorage
 * @returns {Array} Array of note objects, empty array if none found
 */
export function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading notes from storage:', error);
    return [];
  }
}

// PUBLIC_INTERFACE
/**
 * Search notes by query string
 * @param {Array} notes - Array of notes to search
 * @param {string} query - Search query
 * @returns {Array} Filtered array of notes matching the query
 */
export function searchNotes(notes, query) {
  if (!query || !query.trim()) {
    return notes;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return notes.filter(note => {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.categories.some(category => 
        category.toLowerCase().includes(searchTerm)
      )
    );
  });
}

// PUBLIC_INTERFACE
/**
 * Filter notes by category
 * @param {Array} notes - Array of notes to filter
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered array of notes in the specified category
 */
export function filterByCategory(notes, category) {
  if (!category) {
    return notes;
  }
  
  return notes.filter(note => 
    note.categories.includes(category)
  );
}

// PUBLIC_INTERFACE
/**
 * Get all unique categories from notes array
 * @param {Array} notes - Array of notes
 * @returns {Array} Sorted array of unique categories
 */
export function getAllCategories(notes) {
  const allCategories = notes.flatMap(note => note.categories);
  return [...new Set(allCategories)].sort();
}

// PUBLIC_INTERFACE
/**
 * Create a new note object with default values
 * @param {Object} noteData - Optional note data to override defaults
 * @returns {Object} New note object
 */
export function createNote(noteData = {}) {
  const now = new Date().toISOString();
  
  return {
    id: noteData.id || Date.now().toString(),
    title: noteData.title || '',
    content: noteData.content || '',
    categories: noteData.categories || [],
    createdAt: noteData.createdAt || now,
    updatedAt: noteData.updatedAt || now,
    ...noteData
  };
}

// PUBLIC_INTERFACE
/**
 * Update an existing note
 * @param {Array} notes - Array of notes
 * @param {string} noteId - ID of note to update
 * @param {Object} updates - Object containing updates to apply
 * @returns {Array} Updated notes array
 */
export function updateNote(notes, noteId, updates) {
  return notes.map(note => {
    if (note.id === noteId) {
      return {
        ...note,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return note;
  });
}

// PUBLIC_INTERFACE
/**
 * Delete a note by ID
 * @param {Array} notes - Array of notes
 * @param {string} noteId - ID of note to delete
 * @returns {Array} Notes array with specified note removed
 */
export function deleteNote(notes, noteId) {
  return notes.filter(note => note.id !== noteId);
}

// PUBLIC_INTERFACE
/**
 * Sort notes by specified criteria
 * @param {Array} notes - Array of notes to sort
 * @param {string} sortBy - Sort criteria ('updatedAt', 'createdAt', 'title')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted notes array
 */
export function sortNotes(notes, sortBy = 'updatedAt', order = 'desc') {
  return [...notes].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'createdAt':
      case 'updatedAt':
        valueA = new Date(a[sortBy]);
        valueB = new Date(b[sortBy]);
        break;
      default:
        valueA = new Date(a.updatedAt);
        valueB = new Date(b.updatedAt);
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
}

// PUBLIC_INTERFACE
/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// PUBLIC_INTERFACE
/**
 * Export notes to JSON
 * @param {Array} notes - Array of notes to export
 * @returns {string} JSON string of notes
 */
export function exportNotes(notes) {
  try {
    return JSON.stringify(notes, null, 2);
  } catch (error) {
    console.error('Error exporting notes:', error);
    return null;
  }
}

// PUBLIC_INTERFACE
/**
 * Import notes from JSON string
 * @param {string} jsonString - JSON string containing notes
 * @returns {Array|null} Array of notes or null if parsing failed
 */
export function importNotes(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    if (Array.isArray(imported)) {
      return imported.map(note => createNote(note));
    }
    return null;
  } catch (error) {
    console.error('Error importing notes:', error);
    return null;
  }
}

// PUBLIC_INTERFACE
/**
 * Get statistics about the notes collection
 * @param {Array} notes - Array of notes
 * @returns {Object} Statistics object
 */
export function getNoteStats(notes) {
  const categories = getAllCategories(notes);
  const totalWords = notes.reduce((total, note) => {
    return total + (note.content.split(/\s+/).length || 0);
  }, 0);

  return {
    totalNotes: notes.length,
    totalCategories: categories.length,
    totalWords,
    oldestNote: notes.length > 0 ? 
      notes.reduce((oldest, note) => 
        new Date(note.createdAt) < new Date(oldest.createdAt) ? note : oldest
      ) : null,
    newestNote: notes.length > 0 ? 
      notes.reduce((newest, note) => 
        new Date(note.createdAt) > new Date(newest.createdAt) ? note : newest
      ) : null
  };
}

export default {
  saveNotes,
  loadNotes,
  searchNotes,
  filterByCategory,
  getAllCategories,
  createNote,
  updateNote,
  deleteNote,
  sortNotes,
  formatDate,
  exportNotes,
  importNotes,
  getNoteStats
};
