import { createSignal, onMount, For, Show } from 'solid-js';
import Plus from 'lucide-solid/icons/plus';
import SquarePen from 'lucide-solid/icons/square-pen';
import BookmarkPlus from 'lucide-solid/icons/bookmark-plus';
import Trash from 'lucide-solid/icons/trash';
import styles from '../assets/css/New.module.css';
import Settings from "../settings";
import ShortcutCard from '../components/Shortcut';
import { parse } from "../proxy"
import '../assets/css/Themes.module.css';

let defaultShortcuts: Shortcut[] = [];

const NewPage = () => {
  const [shortcuts, setShortcuts] = createSignal<Shortcut[]>(defaultShortcuts);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [newName, setNewName] = createSignal('');
  const [newUrl, setNewUrl] = createSignal('');
  const [editIndex, setEditIndex] = createSignal<number | null>(null);

  onMount(async () => {
    const saved = await Settings.get("shortcuts")
    setShortcuts(saved);
  });

  const load = async (url: string) => {
    const parsed = await parse(url);
    console.log(parsed);
    location.href = parsed;
  }

  const saveShortcuts = async (list: Shortcut[]) => {
    setShortcuts(list);
    await Settings.set("shortcuts", list);
  };

  const openAddModal = () => {
    setNewName('');
    setNewUrl('');
    setShowAddModal(true);
  };

  const submitNewShortcut = () => {
    if (!newName().trim() || !newUrl().trim()) return;
    saveShortcuts([...shortcuts(), { name: newName(), url: newUrl() }]);
    setShowAddModal(false);
  };

  const openEditModal = (index: number) => {
    const s = shortcuts()[index];
    setNewName(s.name);
    setNewUrl(s.url);
    setEditIndex(index);
    setShowEditModal(true);
  };

  const submitEditShortcut = () => {
    if (editIndex() === null || !newName().trim() || !newUrl().trim()) return;
    const updated = [...shortcuts()];
    updated[editIndex()!] = { name: newName(), url: newUrl() };
    saveShortcuts(updated);
    setShowEditModal(false);
    setEditIndex(null);
  };

  const deleteShortcut = (index: number) => {
    const updated = [...shortcuts()];
    updated.splice(index, 1);
    saveShortcuts(updated);
  };

  const getFaviconUrl = (domain: string): string =>
    `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

  return (
    <main class={styles.mainContent}>
      <h1 class={styles.logoTitle}>Alora</h1>
      <div class={styles.searchContainer}>
        <img src="./icons/shadow.png" class={styles.shadowIcon} />
        <input type="text" class={styles.mainSearch} placeholder="Ask ShadowAI anything..." />
      </div>

      <div class={styles.shortcuts}>
        <For each={shortcuts()}>{(site, i) => (
          <ShortcutCard
            site={site}
            index={i()}
            onEdit={() => openEditModal(i())}
            onDelete={() => deleteShortcut(i())}
            onClick={(e: MouseEvent) => { const tar = e.target as HTMLElement; if (['delete-shortcut', 'edit-shortcut'].includes(tar.parentElement?.dataset['testid'] as string)) return; load(site.url) }} />
        )}
        </For>

        <div
          class={styles.shortcutCard}
          onClick={openAddModal}
          role="button"
          aria-label="Add Shortcut"
        >
          <Plus size={32} color="var(--accent)" />
        </div>

        <Show when={showAddModal()}>
          <div class={styles['modal-overlay']} onClick={() => setShowEditModal(false)}>
            <div class={styles.modal} onClick={e => e.stopPropagation()}>
              <h2>New Shortcut</h2>
              <input
                type="text"
                placeholder="Name"
                value={newName()}
                onInput={e => setNewName(e.currentTarget.value)}
                autofocus
              />
              <input
                type="text"
                placeholder="example.com"
                value={newUrl()}
                onInput={e => setNewUrl(e.currentTarget.value)}
              />
              <div class={styles['modal-actions']}>
                <button onClick={submitNewShortcut}>Save</button>
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </Show>

        <Show when={showEditModal()}>
          <div class={styles['modal-overlay']} onClick={() => setShowEditModal(false)}>
            <div class={styles.modal} onClick={e => e.stopPropagation()}>
              <h2>Edit Shortcut</h2>
              <input
                type="text"
                placeholder="Name"
                value={newName()}
                onInput={e => setNewName(e.currentTarget.value)}
                autofocus
              />
              <input
                type="text"
                placeholder="example.com"
                value={newUrl()}
                onInput={e => setNewUrl(e.currentTarget.value)}
              />
              <div class={styles['modal-actions']}>
                <button onClick={submitEditShortcut}>Save</button>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </main >
  );
};

export default NewPage;
