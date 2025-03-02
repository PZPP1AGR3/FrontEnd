import {
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
  type AfterViewInit,
  ElementRef,
  viewChild, forwardRef, signal, DestroyRef, effect, input
} from '@angular/core';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {
  type EditorConfig,
  DecoupledEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  Bookmark,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Minimap,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  TodoList,
  Underline
} from 'ckeditor5';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {fromEvent} from "rxjs";

const LICENSE_KEY = 'GPL';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CKEditorModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    }
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent
  implements AfterViewInit, ControlValueAccessor {
  title = input.required<string>();
  isLayoutReady = signal<boolean>(false);
  public Editor = DecoupledEditor;
  public config: EditorConfig = {};
  formControl = new FormControl();

  private editorToolbar = viewChild<ElementRef<HTMLDivElement>>('editorToolbarElement');
  private editorMenuBar = viewChild<ElementRef<HTMLDivElement>>('editorMenuBarElement');
  private editorMinimap = viewChild<ElementRef<HTMLDivElement>>('editorMinimapElement');
  private printIframe = viewChild<ElementRef<HTMLIFrameElement>>('printIframe');
  _changeRegisterFn!: (v: string) => void;
  _onTouched!: () => void;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private destroyRef: DestroyRef) {
    this.formControl.valueChanges
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(value => {
        this._changeRegisterFn?.(value);
      });
    effect(() => {
      if (!this.printIframe()) return;
      fromEvent(this.printIframe()!.nativeElement, 'load')
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          if (this.printIframe()!.nativeElement.contentWindow?.document.querySelector('.ck-content')) {
            this.printIframe()!.nativeElement.srcdoc = '';
          }
        })
    });
  }

  public ngAfterViewInit(): void {
    this.config = {
      toolbar: {
        items: [
          'showBlocks',
          '|',
          'heading',
          'style',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'link',
          'insertImage',
          'insertTable',
          'highlight',
          'blockQuote',
          'codeBlock',
          '|',
          'alignment',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          'outdent',
          'indent'
        ],
        shouldNotGroupWhenFull: false
      },
      plugins: [
        Alignment,
        Autoformat,
        AutoImage,
        AutoLink,
        Autosave,
        BalloonToolbar,
        Base64UploadAdapter,
        BlockQuote,
        Bold,
        Bookmark,
        Code,
        CodeBlock,
        Essentials,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        GeneralHtmlSupport,
        Heading,
        Highlight,
        HorizontalLine,
        HtmlComment,
        HtmlEmbed,
        ImageBlock,
        ImageCaption,
        ImageInline,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        ListProperties,
        MediaEmbed,
        Mention,
        Minimap,
        PageBreak,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        ShowBlocks,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Style,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TextPartLanguage,
        TextTransformation,
        TodoList,
        Underline
      ],
      balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
      fontFamily: {
        supportAllValues: true
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
      },
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Paragraph',
            class: 'ck-heading_paragraph'
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Heading 1',
            class: 'ck-heading_heading1'
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 2',
            class: 'ck-heading_heading2'
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
            class: 'ck-heading_heading3'
          },
          {
            model: 'heading4',
            view: 'h4',
            title: 'Heading 4',
            class: 'ck-heading_heading4'
          },
          {
            model: 'heading5',
            view: 'h5',
            title: 'Heading 5',
            class: 'ck-heading_heading5'
          },
          {
            model: 'heading6',
            view: 'h6',
            title: 'Heading 6',
            class: 'ck-heading_heading6'
          }
        ]
      },
      htmlSupport: {
        allow: [
          {
            name: /^.*$/,
            styles: true,
            attributes: true,
            classes: true
          }
        ]
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:inline',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'resizeImage'
        ]
      },
      initialData: '',
      licenseKey: LICENSE_KEY,
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: {
              download: 'file'
            }
          }
        }
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true
        }
      },
      mention: {
        feeds: [
          {
            marker: '@',
            feed: [
              /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
            ]
          }
        ]
      },
      menuBar: {
        isVisible: true
      },
      minimap: {
        container: this.editorMinimap()!.nativeElement,
        extraClasses: 'editor-container_include-minimap ck-minimap__iframe-content'
      },
      placeholder: 'Type or paste your content here!',
      style: {
        definitions: [
          {
            name: 'Article category',
            element: 'h3',
            classes: ['category']
          },
          {
            name: 'Title',
            element: 'h2',
            classes: ['document-title']
          },
          {
            name: 'Subtitle',
            element: 'h3',
            classes: ['document-subtitle']
          },
          {
            name: 'Info box',
            element: 'p',
            classes: ['info-box']
          },
          {
            name: 'Side quote',
            element: 'blockquote',
            classes: ['side-quote']
          },
          {
            name: 'Marker',
            element: 'span',
            classes: ['marker']
          },
          {
            name: 'Spoiler',
            element: 'span',
            classes: ['spoiler']
          },
          {
            name: 'Code (dark)',
            element: 'pre',
            classes: ['fancy-code', 'fancy-code-dark']
          },
          {
            name: 'Code (bright)',
            element: 'pre',
            classes: ['fancy-code', 'fancy-code-bright']
          }
        ]
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
      }
    };

    this.isLayoutReady.set(true);
    this.changeDetector.detectChanges();
  }

  public onReady(editor: DecoupledEditor): void {
    Array.from(this.editorToolbar()!.nativeElement.children).forEach(child => child.remove());
    Array.from(this.editorMenuBar()!.nativeElement.children).forEach(child => child.remove());

    this.editorToolbar()!.nativeElement.appendChild(editor.ui.view.toolbar.element!);
    this.editorMenuBar()!.nativeElement.appendChild(editor.ui.view.menuBarView.element!);
  }

  print() {
    this.printIframe()!.nativeElement.srcdoc = `<html>
  <head>
    <title>${this.title()}</title>
    <link rel="stylesheet"
        href="https://ckeditor.com/docs/ckeditor5/latest/snippets/features/page-break/snippet.css"
        type="text/css">
    <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          type="text/css">
    <style>
      .ck-content {
        font-family: 'Lato';
        line-height: 1.6;
        word-break: break-word;
      }
    </style>
  </head>
  <body class="ck-content">
    ${this.formControl.value}
    <script>
    window.addEventListener('DOMContentLoaded', () => {
      window.print();
    });
  </script>
  </body>
</html>`;
  }

  writeValue(value: string) {
    this.formControl.setValue(value);
  }

  registerOnChange(fn: any) {
    this._changeRegisterFn = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl.disable({emitEvent: true});
    } else {
      this.formControl.enable({emitEvent: true});
    }
  }
}
