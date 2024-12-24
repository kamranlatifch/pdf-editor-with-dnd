import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import jsPDF from 'jspdf';
import { Rnd } from 'react-rnd';
import 'react-quill/dist/quill.snow.css';
import html2pdf from 'html2pdf.js';
import { after } from 'slate';
const predefinedFields = [
  { id: 'field-1', name: 'First Name' },
  { id: 'field-2', name: 'Last Name' },
  { id: 'field-3', name: 'Email' },
  { id: 'field-4', name: 'Phone Number' },
  { id: 'field-5', name: 'Address' },
  { id: 'logo', name: 'Logo Image' },
];

const PDFEditor = () => {
  const [editorHtml, setEditorHtml] = useState('');
  const [images, setImages] = useState([]);
  const [isEditorMode, setIsEditorMode] = useState(true); // Toggle between Editor and View mode
  const quillRef = useRef();

  const handleFieldDrop = (field) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();

    if (field.id === 'logo') {
      setImages((prevImages) => [
        ...prevImages,
        { id: Date.now(), url: '', x: 0, y: 0, width: 150, height: 150 },
      ]);
    } else {
      quill.insertText(range.index, ` <[${field.name}]> `, {
        color: '#000',
        background: '#f0f0f0',
        bold: true,
      });
    }
  };

  // Generate PDF
  //   const generatePDF = () => {
  //     const doc = new jsPDF('p', 'pt', 'a4');

  //     // Render text from the Quill editor
  //     const quill = quillRef.current.getEditor();
  //     const editorContent = quill.root.innerHTML;

  //     doc.html(editorContent, {
  //       callback: (doc) => {
  //         // After rendering the text, add borders around images/fields
  //         images.forEach((image) => {
  //           // Calculate position for the border (you might need to adjust this)
  //           const borderX = image.x;
  //           const borderY = image.y;
  //           const borderWidth = image.width;
  //           const borderHeight = image.height;

  //           // Draw a border around the image area
  //           doc.setLineWidth(1);
  //           doc.setDrawColor(0, 0, 0); // Black color
  //           doc.rect(borderX, borderY, borderWidth, borderHeight);
  //         });

  //         doc.save('form.pdf');
  //       },
  //       x: 20,
  //       y: 20,
  //     });
  //   };

  const generatePDF = () => {
    // Get the content to be printed (the entire view modal or div containing the content)
    const contentToPrint = document.getElementById('contentToPrint'); // Use the ID of your view modal or div

    // Options for html2pdf.js
    const options = {
      margin: 10,
      filename: 'generated-file.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        letterRendering: true,
        useCORS: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Generate the PDF from the selected HTML content
    html2pdf().from(contentToPrint).set(options).save();
  };

  // Custom function to extract image URLs from the editor content (or a better way to handle your content structure)
  function getImagesFromEditorContent(content) {
    const images = [];

    // Example of extracting images from the content (you may need to adjust based on your HTML structure)
    const imageElements = content.match(/<img [^>]*src="([^"]+)"[^>]*>/g);
    if (imageElements) {
      imageElements.forEach((imgElement) => {
        const src = imgElement.match(/src="([^"]+)"/)[1];
        // Assuming images are inserted with a specific position or known size
        images.push({
          url: src,
          x: 50, // Adjust as needed
          y: 100, // Adjust as needed
          width: 150, // Adjust as needed
          height: 150, // Adjust as needed
        });
      });
    }

    return images;
  }

  const handleImageClick = (imageId) => {
    // Remove the image from the images array when the "X" is clicked
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  };

  const toggleMode = () => {
    setIsEditorMode((prevMode) => !prevMode);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
  ];

  const handleKeyDown = (e) => {
    const quill = quillRef.current.getEditor();
    const selection = quill.getSelection();
    if (!selection) return;

    const cursorPosition = selection.index;
    const text = quill.getText();

    const beforeCursor = text[cursorPosition - 1]; // Character before cursor

    if (e.key === 'Backspace' && beforeCursor === '>') {
      console.log('I AM INSIDE');
      const tagStartIndex = text.lastIndexOf('<', cursorPosition - 1);
      const tagEndIndex = text.lastIndexOf('>', cursorPosition);

      if (tagStartIndex !== -1) {
        const tag = text.substring(tagStartIndex, tagEndIndex + 1);
        const placeholderMatch = tag.match(/<\[[^\]]+\]>/);

        if (placeholderMatch) {
          quill.deleteText(tagStartIndex, tagEndIndex - tagStartIndex + 1);
        }
      }
    }
  };

  return (
    <div>
      <h1>WYSIWYG PDF Editor</h1>

      {/* Mode Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={toggleMode}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isEditorMode ? 'Switch to View Mode' : 'Switch to Editor Mode'}
        </button>
        <button
          onClick={generatePDF}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Generate PDF
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Predefined Fields */}
        <div
          style={{
            width: '200px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          <h3>Drag Fields</h3>
          {predefinedFields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData('text/plain', JSON.stringify(field))
              }
              style={{
                padding: '10px',
                marginBottom: '5px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px',
                cursor: 'grab',
              }}
            >
              {field.name}
            </div>
          ))}
        </div>

        {/* Editor and View Modes */}
        <div
          style={{
            flex: 1,
            height: '400px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff',
            position: 'relative',
          }}
          onDrop={(e) => {
            e.preventDefault();
            const field = JSON.parse(e.dataTransfer.getData('text/plain'));
            handleFieldDrop(field);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {isEditorMode ? (
            <ReactQuill
              ref={quillRef}
              value={editorHtml}
              style={{ position: 'relative', width: '100%', height: '90%' }}
              onChange={setEditorHtml}
              modules={quillModules}
              formats={quillFormats}
              onKeyDown={handleKeyDown}
              placeholder='Type here and drag fields or images.'
            />
          ) : (
            <div id='contentToPrint' style={{ padding: '12px 15px' }}>
              {editorHtml && (
                <div
                  dangerouslySetInnerHTML={{ __html: editorHtml }}
                  style={{
                    margin: 0,
                    padding: 0,
                    display: 'block',
                    overflow: 'auto',
                    tabSize: 4,
                    lineHeight: '7.32px',
                    fontSize: '13px',
                  }}
                />
              )}

              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: 'absolute',
                    left: image.x,
                    top: image.y - 36, // Adjust if needed
                    width: image.width,
                    height: image.height,
                    border: '2px solid black',
                    textAlign: 'center',
                    lineHeight: `${image.height}px`,
                    backgroundColor: '#f0f0f0',
                    borderRadius: '5px',
                  }}
                >
                  {image.x},{image.y}
                </div>
              ))}
            </div>
          )}

          {/* Render draggable and resizable image placeholders in editor mode */}
          {isEditorMode &&
            images.map((image) => (
              <Rnd
                key={image.id}
                bounds='parent'
                size={{ width: image.width, height: image.height }}
                position={{ x: image.x, y: image.y }}
                onDragStop={(e, d) => {
                  setImages((prevImages) =>
                    prevImages.map((img) =>
                      img.id === image.id ? { ...img, x: d.x, y: d.y } : img
                    )
                  );
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setImages((prevImages) =>
                    prevImages.map((img) =>
                      img.id === image.id
                        ? {
                            ...img,
                            width: ref.offsetWidth,
                            height: ref.offsetHeight,
                            x: position.x,
                            y: position.y,
                          }
                        : img
                    )
                  );
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f0f0f0',
                    textAlign: 'center',
                    lineHeight: '150px',
                    borderRadius: '5px',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '10',
                      right: '20px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(image.id)}
                  >
                    X
                  </div>
                  {image.x},{image.y}
                </div>
              </Rnd>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
