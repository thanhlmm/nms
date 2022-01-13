<template>
  <div>
    <template v-for="(item, index) in items">
      <div
        class="divider"
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
      />
      <MenuBarItemTipTap v-else :key="index" v-bind="item" />
    </template>
  </div>
</template>

<script>
import MenuBarItemTipTap from "../components/MenuBarItemTipTap.vue";

export default {
  components: {
    MenuBarItemTipTap,
  },

  props: {
    editor: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      items: [
        {
          icon: "bold",
          title: "Bold",
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive("bold"),
        },
        {
          icon: "italic",
          title: "Italic",
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive("italic"),
        },
        {
          icon: "strikethrough",
          title: "Strike",
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive("strike"),
        },
        {
          icon: "underline",
          title: "UnderLine",
          action: () => this.editor.chain().focus().toggleUnderline().run(),
          isActive: () => this.editor.isActive("underline"),
        },
        {
          icon: "superscript",
          title: "Superscript",
          action: () => this.editor.chain().focus().toggleSuperscript().run(),
          isActive: () => this.editor.isActive("superscript"),
        },
        {
          icon: "subscript",
          title: "Subscript",
          action: () => this.editor.chain().focus().toggleSubscript().run(),
          isActive: () => this.editor.isActive("subscript"),
        },
        {
          icon: "separator",
          title: "Horizontal Rule",
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          icon: "mark-pen-line",
          title: "Highlight",
          action: () => this.editor.chain().focus().toggleHighlight().run(),
          isActive: () => this.editor.isActive("highlight"),
        },
        {
          icon: "code-view",
          title: "Code",
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive("code"),
        },
        {
          icon: "code-box-line",
          title: "Code Block",
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive("codeBlock"),
        },
        {
          type: "divider",
        },
        {
          icon: "null",
          title: "Inter",
          action: () =>
            this.editor.chain().focus().setFontFamily("Inter").run(),
          isActive: () =>
            this.editor.isActive("textStyle", { fontFamily: "Inter" }),
        },
        {
          icon: "null",
          title: "Comic Sans",
          action: () =>
            this.editor
              .chain()
              .focus()
              .setFontFamily("Comic Sans MS, Comic Sans")
              .run(),
          isActive: () =>
            this.editor.isActive("textStyle", {
              fontFamily: "Comic Sans MS, Comic Sans",
            }),
        },
        {
          icon: "null",
          title: "Serif",
          action: () =>
            this.editor.chain().focus().setFontFamily("serif").run(),
          isActive: () =>
            this.editor.isActive("textStyle", { fontFamily: "serif" }),
        },
        {
          icon: "null",
          title: "Monospace",
          action: () =>
            this.editor.chain().focus().setFontFamily("monospace").run(),
          isActive: () =>
            this.editor.isActive("textStyle", { fontFamily: "monospace" }),
        },
        {
          icon: "null",
          title: "Cursive",
          action: () =>
            this.editor.chain().focus().setFontFamily("cursive").run(),
          isActive: () =>
            this.editor.isActive("textStyle", { fontFamily: "cursive" }),
        },
        {
          icon: "null",
          title: "Default",
          action: () => this.editor.chain().focus().unsetFontFamily().run(),
        },
        {
          type: "divider",
        },
        {
          icon: "h-1",
          title: "Heading 1",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 1 }),
        },
        {
          icon: "h-2",
          title: "Heading 2",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 2 }),
        },
        {
          icon: "h-3",
          title: "Heading 3",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 3 }),
        },
        {
          icon: "h-4",
          title: "Heading 4",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 4 }),
        },
        {
          icon: "h-5",
          title: "Heading 5",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 5 }),
        },
        {
          icon: "h-6",
          title: "Heading 6",
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
          isActive: () => this.editor.isActive("heading", { level: 6 }),
        },
        {
          icon: "paragraph",
          title: "Paragraph",
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive("paragraph"),
        },
        {
          icon: "list-unordered",
          title: "Bullet List",
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive("bulletList"),
        },
        {
          icon: "list-ordered",
          title: "Ordered List",
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive("orderedList"),
        },
        {
          icon: "list-check-2",
          title: "Task List",
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive("taskList"),
        },
        {
          icon: "link",
          title: "Set Link",
          action: this.setLink,
          isActive: () => this.editor.isActive("link"),
        },
        {
          icon: "link-unlink",
          title: "Unset Link",
          action: () => this.editor.chain().focus().unsetLink().run(),
          isActive: () => !this.editor.isActive("link"),
        },
        {
          type: "divider",
        },
        {
          icon: "arrow-go-back-line",
          title: "Undo",
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: "arrow-go-forward-line",
          title: "Redo",
          action: () => this.editor.chain().focus().redo().run(),
        },
      ],
    };
  },
  methods: {
    setLink() {
      const previousUrl = this.editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === "") {
        this.editor.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      // update link
      this.editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
  },
};
</script>

<style lang="scss">
.divider {
  width: 2px;
  height: 1.25rem;
  background-color: rgba(#000, 0.1);
  margin-left: 0.5rem;
  margin-right: 0.75rem;
}
</style>
