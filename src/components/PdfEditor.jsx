import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Rnd } from 'react-rnd';
import 'react-quill/dist/quill.snow.css';
import html2pdf from 'html2pdf.js';

const predefinedFields = [
  { id: 'field-1', name: 'First Name' },
  { id: 'field-2', name: 'Last Name' },
  { id: 'field-3', name: 'Email' },
  { id: 'field-4', name: 'Phone Number' },
  { id: 'field-5', name: 'Address' },
  { id: 'logo', name: 'Logo Image', tag: 'logo_image' },
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
        {
          id: prevImages.length + 1,
          url: '',
          name: field.name,
          x: 0,
          y: 0,
          width: 150,
          height: 150,
          uploadedImage: null,
        },
      ]);
    } else {
      quill.insertText(range.index, ` <[${field.name}]> `, {
        color: '#000',
        background: '#f0f0f0',
        bold: true,
      });
    }
  };

  const generatePDF = () => {
    const contentToPrint = document.getElementById('contentToPrint'); // Use the ID of your view modal or div

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

    html2pdf().from(contentToPrint).set(options).save();
  };

  const handleRemoveImage = (imageId) => {
    // Remove the image from the images array when the "X" is clicked
    setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
  };
  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === id ? { ...img, uploadedImage: reader.result } : img
        )
      );
    };
    reader.readAsDataURL(file); // Convert image to base64 for preview
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
      ['table'],
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

  const generatePayload = () => {
    const content = {
      editorHtml,
      images,
    };

    console.log('Payload:', content); // This will log the complete data to the console

    // You can return this payload to use later or send it to a server if needed
  };

  const onDrop = (event) => {
    event.preventDefault();
    try {
      const dropData = event.dataTransfer.getData('text');
      if (dropData) {
        const parsedData = JSON.parse(dropData);

        if (parsedData.id === 'logo') {
          handleFieldDrop(parsedData);
        } else {
          // Handle predefined fields (non-image)
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertText(range.index, ` <[${parsedData.name}]> `, {
            color: '#000',
            background: '#f0f0f0',
            bold: true,
          });
        }
      } else {
        console.warn('No valid drop data found.');
      }
    } catch (error) {
      console.error('Error handling drop:', error.message);
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
        <button
          onClick={generatePayload}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Generate Payload
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
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
            minHeight: '400px',
            maxWidth: '190mm',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff',
            position: 'relative',
          }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {isEditorMode ? (
            <ReactQuill
              ref={quillRef}
              value={editorHtml}
              style={{ width: '100%', height: '100%' }}
              onChange={setEditorHtml}
              modules={quillModules}
              formats={quillFormats}
              onKeyDown={handleKeyDown}
              placeholder='Type here and drag fields or images.'
            />
          ) : (
            <div
              id='contentToPrint'
              style={{
                padding: '12px 15px',
                overflow: 'auto',
                minHeight: '400px',
              }}
            >
              {editorHtml && (
                <div
                  dangerouslySetInnerHTML={{ __html: editorHtml }}
                  style={{
                    margin: 0,
                    padding: 0,
                    display: 'block',
                    overflow: 'auto',
                    tabSize: 4,
                    // lineHeight: '7.32px',
                    fontSize: '13px',
                  }}
                />
              )}

              {images?.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: 'absolute',
                    left: image.x,
                    top: image.y - 36,
                    width: image.width,
                    height: image.height,
                    border: '2px solid black',
                    textAlign: 'center',
                    lineHeight: `${image.height}px`,
                    backgroundColor: '#f0f0f0',
                    borderRadius: '5px',
                  }}
                >
                  {image.uploadedImage ? (
                    <img
                      src={image.uploadedImage}
                      alt={image.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the image fits within the box
                      }}
                    />
                  ) : (
                    image.name // Display the placeholder text if no image is uploaded
                  )}

                  {/* {image.name} */}
                </div>
              ))}
            </div>
          )}

          {/* {isEditorMode &&
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
                {image.uploadedImage ? (
                  <img
                    src={image.uploadedImage}
                    alt='Uploaded'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover', // Ensures the image fits within the box
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f0f0f0',
                      border: '1px dashed #ccc',
                    }}
                  >
                    <label
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: '#007bff',
                      }}
                    >
                      Upload Image
                      <input
                        type='file'
                        accept='image/*'
                        style={{ display: 'none' }}
                        onChange={(e) =>
                          handleImageUpload(image.id, e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                )}
              </Rnd>
            ))} */}
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
                  }}
                >
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      background: 'none',
                      border: 'none',
                      color: '#ff0000',
                      fontSize: '18px',
                      cursor: 'pointer',
                    }}
                  >
                    X
                  </button>

                  {image.uploadedImage ? (
                    <img
                      src={image.uploadedImage}
                      alt='Uploaded'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the image fits within the box
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        border: '1px dashed #ccc',
                      }}
                    >
                      <label
                        style={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          color: '#007bff',
                        }}
                      >
                        Upload Image
                        <input
                          type='file'
                          accept='image/*'
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleImageUpload(image.id, e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              </Rnd>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;
