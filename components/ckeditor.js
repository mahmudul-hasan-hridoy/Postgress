import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageInsertPlugin from '@ckeditor/ckeditor5-image/src/imageinsert';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import TablePlugin from '@ckeditor/ckeditor5-table/src/table';
import CodeBlockPlugin from '@ckeditor/ckeditor5-code-block/src/codeblock';
import HighlightPlugin from '@ckeditor/ckeditor5-highlight/src/highlight';
import MediaEmbedPlugin from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    EssentialsPlugin,
    ParagraphPlugin,
    BoldPlugin,
    ItalicPlugin,
    HeadingPlugin,
    LinkPlugin,
    ListPlugin,
    ImagePlugin,
    ImageUploadPlugin,
    ImageInsertPlugin, // Add this line
    BlockQuotePlugin,
    TablePlugin,
    CodeBlockPlugin,
    HighlightPlugin,
    MediaEmbedPlugin
];

ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'uploadImage',
            'insertImage', // Add this line
            'mediaEmbed',
            'blockQuote',
            'insertTable',
            'codeBlock',
            'highlight',
            '|',
            'undo',
            'redo'
        ]
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    codeBlock: {
        languages: [
            { language: 'plaintext', label: 'Plain text' },
            { language: 'javascript', label: 'JavaScript' },
            { language: 'python', label: 'Python' },
            { language: 'html', label: 'HTML' },
            { language: 'css', label: 'CSS' }
        ]
    },
    language: 'en'
};