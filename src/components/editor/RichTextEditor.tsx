import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Mention from '@tiptap/extension-mention';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link2,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content = '', onChange, placeholder }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; username: string; display_name?: string }>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .limit(100);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return users.filter(user => 
              user.username.toLowerCase().includes(query.toLowerCase()) ||
              user.display_name?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
          },
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props: any) => {
                component = document.createElement('div');
                component.className = 'mention-suggestions bg-popover border rounded-lg shadow-lg p-2 z-50';
                
                popup = document.createElement('div');
                popup.style.position = 'absolute';
                popup.style.zIndex = '1000';
                popup.appendChild(component);
                document.body.appendChild(popup);
              },

              onUpdate: (props: any) => {
                component.innerHTML = '';
                
                if (props.items.length === 0) {
                  const noResults = document.createElement('div');
                  noResults.className = 'px-3 py-2 text-sm text-muted-foreground';
                  noResults.textContent = 'No users found';
                  component.appendChild(noResults);
                  return;
                }

                props.items.forEach((item: any, index: number) => {
                  const button = document.createElement('button');
                  button.className = `w-full text-left px-3 py-2 text-sm hover:bg-accent rounded ${index === props.selectedIndex ? 'bg-accent' : ''}`;
                  button.textContent = `@${item.username}${item.display_name ? ` (${item.display_name})` : ''}`;
                  
                  button.addEventListener('click', () => {
                    props.command({ id: item.id, label: item.username });
                  });
                  
                  component.appendChild(button);
                });

                const { selection } = props.editor.state;
                const { from } = selection;
                const node = props.editor.view.nodeDOM(from);
                
                if (node) {
                  const rect = node.getBoundingClientRect();
                  popup.style.left = rect.left + 'px';
                  popup.style.top = (rect.bottom + 8) + 'px';
                }
              },

              onKeyDown: (props: any) => {
                if (props.event.key === 'Escape') {
                  popup.remove();
                  return true;
                }
                return false;
              },

              onExit: () => {
                if (popup) {
                  popup.remove();
                }
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addEmoji = () => {
    const emoji = window.prompt('Enter emoji:');
    if (emoji) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  return (
    <div className="border border-border rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addEmoji}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Link Input */}
      {showLinkInput && (
        <div className="flex gap-2 p-2 border-b border-border bg-muted/20">
          <input
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-2 py-1 border border-border rounded text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <Button size="sm" onClick={addLink}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Cancel</Button>
        </div>
      )}
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]"
      />
    </div>
  );
}