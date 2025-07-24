import SquarePen from 'lucide-solid/icons/square-pen';
import Trash from 'lucide-solid/icons/trash';
import styles from '../assets/css/New.module.css';

interface ShortcutCardProps {
    site: Shortcut;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onClick: () => void;
}

const getFaviconUrl = (domain: string): string =>
    `https://www.google.com/s2/favicons?domain=${domain}&sz=48`;

const ShortcutCard = (props: ShortcutCardProps) => {

    return (
        <div onClick={() => props.onClick()} class={styles.shortcutCard} style={{ position: 'relative' }}>
            <a class={styles.shortcutLink}>
                <div class={styles.shortcutIcon}>
                    <img src={getFaviconUrl(props.site.url)} alt={props.site.name} loading="lazy" />
                </div>
                <div class={styles.shortcutTitle}>{props.site.name}</div>
            </a>

            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => props.onEdit(props.index)}
                    aria-label="Edit Shortcut"
                    class={`${styles['icon-btn']} ${styles['edit-btn']}`}
                    title="Edit"
                >
                    <SquarePen size={18} />
                </button>
                <button
                    onClick={() => props.onDelete(props.index)}
                    aria-label="Delete Shortcut"
                    class={`${styles['icon-btn']} ${styles['delete-btn']}`}
                    title="Delete"
                >
                    <Trash size={18} />
                </button>
            </div>
        </div>
    );
};

export default ShortcutCard;