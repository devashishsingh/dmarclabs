/**
 * In-memory contact message store. Holds up to MAX_ENTRIES items (rolling).
 */

const MAX_ENTRIES = 500;

const store = [];

/**
 * @param {{ name: string, subject: string, message: string }} entry
 */
function addContact({ name, subject, message }) {
  const entry = {
    id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim().slice(0, 200),
    subject,
    message: message.trim().slice(0, 2000),
    timestamp: new Date().toISOString(),
    read: false,
  };

  store.push(entry);

  if (store.length > MAX_ENTRIES) {
    store.shift();
  }

  return entry;
}

/** Returns all entries, newest first. */
function getAllContacts() {
  return [...store].reverse();
}

/** Returns unread count. */
function getUnreadCount() {
  return store.filter((e) => !e.read).length;
}

/** Marks an entry as read by id. */
function markRead(id) {
  const entry = store.find((e) => e.id === id);
  if (entry) entry.read = true;
  return !!entry;
}

module.exports = { addContact, getAllContacts, getUnreadCount, markRead };
