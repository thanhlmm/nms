<template>
  <div
    class="editor"
    :style="[!isDetail ? { height: '260px' } : { height: 'auto' }]"
    v-if="editor"
  >
    <MenuBarTipTap class="editor__header" :editor="editor" v-show="!isDetail" />
    <EditorContent class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import MenuBarTipTap from "../components/MenuBarTipTap.vue";

export default {
  components: {
    EditorContent,
    MenuBarTipTap,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
    isDetail: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      editor: null,
    };
  },

  watch: {
    modelValue(value) {
      // HTML
      const isSame = this.editor.getHTML() === value;

      // JSON
      // const isSame = this.editor.getJSON().toString() === value.toString()

      if (isSame) {
        return;
      }

      this.editor.commands.setContent(value, false);
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit],
      content: this.modelValue,
      onUpdate: () => {
        this.$emit("updateModelValue", this.editor.getHTML());
      },
    });
    this.editor.setOptions({ editable: this.isDetail ? false : true });
  },

  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>

<style lang="scss" scoped>
.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0d0d0d;
  background-color: #fff;
  border: none;
  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid var(--color-menu);
  }

  &__content {
    padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0d0d0d;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #faf594;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0d0d0d, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>
