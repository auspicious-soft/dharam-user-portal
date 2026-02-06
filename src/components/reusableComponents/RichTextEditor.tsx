import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

const RichTextEditor = ({
  value,
  onChange,
  height = 300,
}: RichTextEditorProps) => {
  return (
    <Editor
      apiKey="ppu54qsqckshmf36k9vivl8gi19f3thatkcvgnkhdw9nmelp"
      value={value}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height,
        menubar: false,
        branding: false,
        statusbar: false,

      plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "help",
          "wordcount",
        ],
 font_size_formats:
      "12px 14px 16px 18px 20px 24px 28px 32px",
        toolbar:
          "undo redo | blocks | " +
          "bold italic underline strikethrough | " +
          "forecolor backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | " +
          "link image media table | " +
          "removeformat | code fullscreen preview help",

          


        // Optional: format dropdown
        block_formats:
          "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6",

        content_style: `
          body {
            font-family: Inter, system-ui, sans-serif;
            font-size: 14px;
            padding: 12px;
          }
        `,
      }}
    />
  );
};

export default RichTextEditor;
